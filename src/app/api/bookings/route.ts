import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { SkillLevel } from "@/generated/prisma/enums";

const bookingSchema = z.object({
  userId: z.number(),
  courtId: z.number(),
  equipment: z
    .array(
      z.object({
        equipmentId: z.number(),
        quantity: z.number().positive(),
      })
    )
    .optional(),
  coachId: z.number().nullable().optional(),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log(body)
    const parsed = bookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { userId, courtId, equipment = [], coachId, date, startTime, endTime } =
      parsed.data;

    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);
    const durationHours = (end.getTime() - start.getTime()) / 1000 / 60 / 60;

    // --- 1️⃣ Check court availability ---
    const courtConflict = await prisma.courtReservation.findFirst({
      where: {
        courtId,
        booking: {
          startTime: { lt: end },
          endTime: { gt: start },
          status: "CONFIRMED",
        },
      },
    });
    if (courtConflict)
      return NextResponse.json({ error: "Court not available" }, { status: 400 });

    // --- 2️⃣ Check equipment availability ---
    for (const eq of equipment) {
      const eqItem = await prisma.equipment.findUnique({ where: { id: eq.equipmentId } });
      if (!eqItem || !eqItem.enabled)
        return NextResponse.json({ error: "Equipment not available" }, { status: 400 });

      const reservedQty = await prisma.equipmentReservation.aggregate({
        _sum: { quantity: true },
        where: {
          equipmentId: eq.equipmentId,
          booking: { startTime: { lt: end }, endTime: { gt: start }, status: "CONFIRMED" },
        },
      });
      const availableQty = eqItem.totalQty - (reservedQty._sum.quantity || 0);
      if (availableQty < eq.quantity)
        return NextResponse.json(
          { error: `${eqItem.name} not enough quantity` },
          { status: 400 }
        );
    }

    // --- 3️⃣ Check coach availability ---
    let coachReservationData = undefined;
    if (coachId) {
      const availability = await prisma.availability.findFirst({
        where: {
          coachId,
          date: start,
          startTime: { lte: start },
          endTime: { gte: end },
          isBooked: false,
        },
      });
      if (!availability)
        return NextResponse.json({ error: "Coach not available" }, { status: 400 });

      coachReservationData = {
        coachId,
        availabilityId: availability.id,
        skillLevel: SkillLevel.INTERMEDIATE, // ✅ Use enum here
      };
    }

    // --- 4️⃣ Create booking in a short transaction ---
    const newBooking = await prisma.$transaction(async (tx) => {
      // Mark coach as booked
      if (coachReservationData) {
        await tx.availability.update({
          where: { id: coachReservationData.availabilityId },
          data: { isBooked: true },
        });
      }

      // Get court price
      const courtItem = await tx.court.findUnique({ where: { id: courtId } });
      if (!courtItem) throw new Error("Court not found");
      let totalPrice = courtItem.basePrice;

      // Equipment price
      for (const eq of equipment) {
        const eqItem = await tx.equipment.findUnique({ where: { id: eq.equipmentId } });
        if (eqItem) totalPrice += eqItem.price * eq.quantity;
      }

      // Coach price
      if (coachReservationData) {
        const coach = await tx.coach.findUnique({ where: { id: coachId } });
        if (coach) totalPrice += coach.pricePerHour * durationHours;
      }

      // Create booking
      return await tx.booking.create({
        data: {
          userId,
          courtReservation: { create: { courtId } },
          equipmentReservations: {
            create: equipment.map((eq) => ({
              equipmentId: eq.equipmentId,
              quantity: eq.quantity,
            })),
          },
          coachReservation: coachReservationData ? { create: coachReservationData } : undefined,
          date: start,
          startTime: start,
          endTime: end,
          totalPrice,
          status: "CONFIRMED",
        },
        include: {
          courtReservation: true,
          equipmentReservations: true,
          coachReservation: true,
        },
      });
    });

    return NextResponse.json(newBooking, { status: 201 });
  } catch (error: any) {
    console.error("Booking error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 400 });
  }
}


export async function GET(req: NextRequest) {
    try {
      const bookings = await prisma.booking.findMany({
        include: {
          user: true,
          courtReservation: { include: { court: true } },
          equipmentReservations: true,
          coachReservation: true,
        },
        orderBy: { startTime: "asc" },
      });
  
      return NextResponse.json(bookings);
    } catch (err) {
      console.error(err);
      return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
    }
  }
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

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
  date: z.string(),       // YYYY-MM-DD
  startTime: z.string(),  // HH:mm
  endTime: z.string(),    // HH:mm
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log(body);
    const parsed = bookingSchema.safeParse(body);

    console.log("Booking payload:", parsed);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { userId, courtId, equipment = [], coachId, date, startTime, endTime } =
      parsed.data;

    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);
    const durationHours = (end.getTime() - start.getTime()) / 1000 / 60 / 60;

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ error: "Invalid date/time" }, { status: 400 });
    }

    // 1️⃣ Check court availability
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

    // 2️⃣ Check equipment availability
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
        return NextResponse.json({ error: `${eqItem.name} not enough quantity` }, { status: 400 });
    }

    // 3️⃣ Check coach availability
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

      coachReservationData = { coachId, availabilityId: availability.id };
    }

    // 4️⃣ Create booking in transaction
    const newBooking = await prisma.$transaction(async (tx) => {
      if (coachReservationData) {
        await tx.availability.update({
          where: { id: coachReservationData.availabilityId },
          data: { isBooked: true },
        });
      }

      const courtItem = await tx.court.findUnique({ where: { id: courtId } });
      if (!courtItem) throw new Error("Court not found");

      let totalPrice = courtItem.basePrice;

      for (const eq of equipment) {
        const eqItem = await tx.equipment.findUnique({ where: { id: eq.equipmentId } });
        if (eqItem) totalPrice += eqItem.price * eq.quantity;
      }

      if (coachReservationData) {
        const coach = await tx.coach.findUnique({ where: { id: coachId } });
        if (coach) totalPrice += coach.pricePerHour * durationHours;
      }

      return await tx.booking.create({
        data: {
          userId,
          courtReservation: { create: { courtId } },
          equipmentReservations: { create: equipment.map((eq) => ({ equipmentId: eq.equipmentId, quantity: eq.quantity })) },
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
  } catch (err: any) {
    console.error("Booking error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 400 });
  }
}


export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const clerkId = searchParams.get("clerkId") // <-- use this

    if (!clerkId) {
      return NextResponse.json({ success: false, error: "Missing clerkId" }, { status: 400 })
    }

    // Find the user in your DB
    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    const bookings = await prisma.booking.findMany({
      where: { userId: user.id },
      include: { courtReservation: { include: { court: true } } },
      orderBy: { startTime: "asc" },
    })

    return NextResponse.json({ success: true, data: bookings })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

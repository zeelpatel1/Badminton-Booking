import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const waitlistSchema = z.object({
  userId: z.number(),
  courtId: z.number(),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = waitlistSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { userId, courtId, date, startTime, endTime } = parsed.data;
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);

    // Check if court is already fully booked
    const court = await prisma.court.findUnique({ where: { id: courtId } });
    if (!court || !court.enabled) {
      return NextResponse.json({ error: "Court not found or disabled" }, { status: 404 });
    }

    // Check existing bookings for that slot
    const overlappingBookings = await prisma.booking.findMany({
      where: {
        courtReservation: { courtId },
        startTime: { lt: end },
        endTime: { gt: start },
        status: "CONFIRMED",
      },
    });

    if (overlappingBookings.length < 1) {
      return NextResponse.json({ message: "Court is available, no need to join waitlist" }, { status: 400 });
    }

    // Add user to waitlist
    const waitlistEntry = await prisma.waitlist.create({
      data: {
        userId,
        courtId,
        date: start,
        startTime: start,
        endTime: end,
      },
    });

    return NextResponse.json(waitlistEntry, { status: 201 });
  } catch (error) {
    console.error("Waitlist error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

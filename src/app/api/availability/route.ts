import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const querySchema = z.object({
  date: z.string(),       // YYYY-MM-DD
  startTime: z.string(),  // HH:mm
  endTime: z.string(),    // HH:mm
  courtId: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const parsed = querySchema.safeParse({
      date: searchParams.get("date"),
      startTime: searchParams.get("startTime"),
      endTime: searchParams.get("endTime"),
      courtId: searchParams.get("courtId"),
    });

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid query params" }, { status: 400 });
    }

    const { date, startTime, endTime, courtId } = parsed.data;

    // ✅ Proper Date parsing
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ error: "Invalid date/time format" }, { status: 400 });
    }

    // 1️⃣ Fetch all courts if no specific courtId
    const allCourts = await prisma.court.findMany({
      where: courtId ? { id: parseInt(courtId) } : {},
    });

    // 2️⃣ Get courts that are already booked at this slot
    const bookedCourts = await prisma.courtReservation.findMany({
      where: {
        booking: {
          startTime: { lt: end },
          endTime: { gt: start },
          status: "CONFIRMED",
        },
      },
      select: { courtId: true },
    });

    const bookedCourtIds = bookedCourts.map((b) => b.courtId);

    const availableCourts = allCourts.filter((c) => !bookedCourtIds.includes(c.id));

    return NextResponse.json(availableCourts);
  } catch (err) {
    console.error("Availability error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

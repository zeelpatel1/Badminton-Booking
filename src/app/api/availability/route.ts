import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getAvailableCoaches, getAvailableCourts, getAvailableEquipment } from "@/helper";

const querySchema = z.object({
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const parsed = querySchema.safeParse({
      date: searchParams.get("date"),
      startTime: searchParams.get("startTime"),
      endTime: searchParams.get("endTime"),
    });

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid query params" }, { status: 400 });
    }

    const { date, startTime, endTime } = parsed.data;

    // ✅ Ensure proper date parsing
    const start = new Date(`${date}T${startTime}:00`);
    const end = new Date(`${date}T${endTime}:00`);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ error: "Invalid date or time format" }, { status: 400 });
    }

    const [courts, equipment, coaches] = await Promise.all([
      getAvailableCourts(start, end),
      getAvailableEquipment(start, end),
      getAvailableCoaches(start, end),
    ]);

    return NextResponse.json({ courts, equipment, coaches });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

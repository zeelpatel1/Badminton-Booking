import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    console.log(searchParams);

    const date = searchParams.get("date");          // "YYYY-MM-DD"
    const startTimeStr = searchParams.get("startTime"); // "HH:mm"
    const endTimeStr = searchParams.get("endTime");     // "HH:mm"

    if (!date || !startTimeStr || !endTimeStr) {
      return NextResponse.json(
        { error: "date, startTime, endTime are required" },
        { status: 400 }
      );
    }

    // Convert to Date objects
    const start = new Date(`${date}T${startTimeStr}:00`);
    const end = new Date(`${date}T${endTimeStr}:00`);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: "Invalid date or time format" },
        { status: 400 }
      );
    }

    // Query coaches with available slots
    const coaches = await prisma.coach.findMany({
      where: {
        enabled: true,
        availabilities: {
          some: {
            isBooked: false,
            startTime: { lte: start },
            endTime: { gte: end },
          },
        },
      },
      include: {
        availabilities: {
          where: {
            isBooked: false,
            startTime: { lte: start },
            endTime: { gte: end },
          },
        },
      },
    });

    return NextResponse.json(coaches, { status: 200 });
  } catch (error) {
    console.error("Error fetching available coaches:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}



import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const availabilitySchema = z.object({
  date: z.string(),       // "YYYY-MM-DD"
  startTime: z.string(),  // "HH:mm"
  endTime: z.string(),    // "HH:mm"
});

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ coachId: string }> }
) {
  try {
    const params = await context.params;
    console.log(params.coachId);
    const coachId = parseInt(params.coachId, 10);
    if (isNaN(coachId)) {
      return NextResponse.json({ error: "Invalid coachId" }, { status: 400 });
    }

    const body = await req.json();
    const parsed = availabilitySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { date, startTime, endTime } = parsed.data;

    // Combine date + time correctly
    const start = new Date(`${date}T${startTime}:00`);
    const end = new Date(`${date}T${endTime}:00`);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: "Invalid date or time format" },
        { status: 400 }
      );
    }

    const availability = await prisma.availability.create({
      data: {
        coachId,
        date: start,       // Prisma DateTime
        startTime: start,
        endTime: end,
        isBooked: false,
      },
    });

    return NextResponse.json({ success: true, availability }, { status: 201 });
  } catch (error) {
    console.error("Error creating availability:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// export async function GET(
//   req: NextRequest,
//   context: { params: Promise<{ coachId: string }> }
// ) {
//   const params = await context.params;
//   const coachId = Number(params.coachId);

//   if (Number.isNaN(coachId)) {
//     return NextResponse.json({ error: "Invalid coachId" }, { status: 400 });
//   }

//   const { searchParams } = new URL(req.url);
//   const date = searchParams.get("date");
//   const startTime = searchParams.get("startTime");
//   const endTime = searchParams.get("endTime");

//   if (!date || !startTime || !endTime) {
//     return NextResponse.json(
//       { error: "date, startTime, endTime are required" },
//       { status: 400 }
//     );
//   }

//   const start = new Date(`${date}T${startTime}:00`);
//   const end = new Date(`${date}T${endTime}:00`);

//   if (isNaN(start.getTime()) || isNaN(end.getTime())) {
//     return NextResponse.json({ error: "Invalid date or time" }, { status: 400 });
//   }

//   const coach = await prisma.coach.findFirst({
//     where: { id: coachId, enabled: true },
//   });

//   if (!coach) {
//     return NextResponse.json(
//       { error: "Coach not found or disabled" },
//       { status: 404 }
//     );
//   }

//   const availabilities = await prisma.availability.findMany({
//     where: {
//       coachId,
//       startTime: { lte: start },
//       endTime: { gte: end },
//       isBooked: false,
//     },
//     orderBy: { startTime: "asc" },
//   });

//   return NextResponse.json({
//     coachId,
//     coachName: coach.name,
//     pricePerHour: coach.pricePerHour,
//     availableSlots: availabilities.map((a) => ({
//       id: a.id,
//       startTime: a.startTime,
//       endTime: a.endTime,
//     })),
//   });
// }





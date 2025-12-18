import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const createCoachSchema = z.object({
  name: z.string().min(1),
  pricePerHour: z.number().positive(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createCoachSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const coach = await prisma.coach.create({
      data: {
        name: parsed.data.name,
        pricePerHour: parsed.data.pricePerHour,
      },
    });
    return NextResponse.json(coach, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(){
  try {
    const coaches=await prisma.coach.findMany()
    return NextResponse.json(coaches,{status:201})
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
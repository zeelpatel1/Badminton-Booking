import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

/* ------------------ SCHEMAS ------------------ */

const createCourtSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["INDOOR", "OUTDOOR"]),
  basePrice: z.number().positive(),
  enabled: z.boolean().optional(),
});

const updateCourtSchema = createCourtSchema.partial().extend({
  id: z.number(),
});

/* ------------------ GET: ALL COURTS ------------------ */

export async function GET() {
  try {
    const courts = await prisma.court.findMany({
      orderBy: { id: "asc" },
    });

    return NextResponse.json(courts);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch courts" },
      { status: 500 }
    );
  }
}

/* ------------------ POST: CREATE COURT ------------------ */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createCourtSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, type, basePrice, enabled } = parsed.data;

    const court = await prisma.court.create({
      data: {
        name,
        type,
        basePrice,
        enabled: enabled ?? true,
      },
    });

    return NextResponse.json({ success: true, court });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create court" },
      { status: 500 }
    );
  }
}

/* ------------------ PUT: UPDATE COURT ------------------ */

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = updateCourtSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { id, ...data } = parsed.data;

    const court = await prisma.court.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, court });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update court" },
      { status: 500 }
    );
  }
}

/* ------------------ PATCH: ENABLE / DISABLE ------------------ */

export async function PATCH(req: NextRequest) {
  try {
    const { id, enabled } = await req.json();

    if (typeof id !== "number" || typeof enabled !== "boolean") {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    const court = await prisma.court.update({
      where: { id },
      data: { enabled },
    });

    return NextResponse.json({ success: true, court });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to toggle court" },
      { status: 500 }
    );
  }
}

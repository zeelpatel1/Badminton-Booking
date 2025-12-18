import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const pricingSchema = z.object({
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
    console.log(body);
    const parsed = pricingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { courtId, equipment = [], coachId, date, startTime, endTime } =
      parsed.data;

    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);
    const durationHours =
      (end.getTime() - start.getTime()) / 1000 / 60 / 60;

    // 1️⃣ Base court price
    const court = await prisma.court.findUnique({ where: { id: courtId } });
    if (!court) return NextResponse.json({ error: "Court not found" }, { status: 404 });

    let totalPrice = court.basePrice;
    const breakdown: Record<string, number> = { basePrice: court.basePrice };

    // 2️⃣ Fetch all enabled pricing rules
    const rules = await prisma.pricingRule.findMany({
      where: { enabled: true },
    });

    // 3️⃣ Apply pricing rules
    for (const rule of rules) {
      let fee = 0;

      switch (rule.type) {
        case "PEAK_HOUR":
          if (start.getHours() >= 18 && start.getHours() < 21) {
            fee = rule.isPercent ? (court.basePrice * rule.value) / 100 : rule.value;
            breakdown["peakHourFee"] = fee;
            totalPrice += fee;
          }
          break;

        case "WEEKEND":
          if (start.getDay() === 0 || start.getDay() === 6) {
            fee = rule.isPercent ? (court.basePrice * rule.value) / 100 : rule.value;
            breakdown["weekendFee"] = fee;
            totalPrice += fee;
          }
          break;

        case "INDOOR":
          if (court.type === "INDOOR") {
            fee = rule.isPercent ? (court.basePrice * rule.value) / 100 : rule.value;
            breakdown["indoorFee"] = fee;
            totalPrice += fee;
          }
          break;
      }
    }

    // 4️⃣ Equipment fees
    let equipmentFee = 0;
    for (const eq of equipment) {
      const eqItem = await prisma.equipment.findUnique({ where: { id: eq.equipmentId } });
      if (!eqItem || !eqItem.enabled) continue;
      equipmentFee += eqItem.price * eq.quantity;
    }
    if (equipmentFee) {
      breakdown["equipmentFee"] = equipmentFee;
      totalPrice += equipmentFee;
    }

    // 5️⃣ Coach fee
    if (coachId) {
      const coach = await prisma.coach.findUnique({ where: { id: coachId } });
      if (coach && coach.enabled) {
        const coachFee = coach.pricePerHour * durationHours;
        breakdown["coachFee"] = coachFee;
        totalPrice += coachFee;
      }
    }

    return NextResponse.json({ totalPrice, breakdown });
  } catch (error) {
    console.error("Pricing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

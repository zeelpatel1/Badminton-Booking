import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
  
    const date = searchParams.get("date");
    const startTime = searchParams.get("startTime");
    const endTime = searchParams.get("endTime");
  
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);
  
    const equipment = await prisma.equipment.findMany({
      where: { enabled: true },
      include: {
        reservations: {
          where: {
            booking: {
              startTime: { lt: end },
              endTime: { gt: start },
              status: "CONFIRMED",
            },
          },
        },
      },
    });
  
    return NextResponse.json(
      equipment.map((e) => ({
        id: e.id,
        name: e.name,
        price: e.price,
        availableQty:
          e.totalQty -
          e.reservations.reduce((sum, r) => sum + r.quantity, 0),
      }))
    );
  }
  
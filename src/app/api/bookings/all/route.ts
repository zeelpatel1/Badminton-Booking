import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { date: "desc" },
      include: {
        courtReservation: {
          include: { court: true },
        },
        user: true,
      },
    });

    return NextResponse.json({ success: true, data: bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

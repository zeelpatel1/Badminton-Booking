import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json({ error: "Date is required" }, { status: 400 });
  }

  // ✅ For now: ALL enabled courts are available by default
  const courts = await prisma.court.findMany({
    where:{enabled:true},
    orderBy: { id: "asc" },
  });

  return NextResponse.json(courts);
}

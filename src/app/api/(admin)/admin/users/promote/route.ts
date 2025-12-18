import { auth } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({}, { status: 401 })

  const admin = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  })

  if (admin?.role !== "ADMIN") {
    return NextResponse.json({}, { status: 403 })
  }

  const { targetUserId } = await req.json()

  await prisma.user.update({
    where: { id: targetUserId },
    data: { role: "ADMIN" },
  })

  return NextResponse.json({ success: true })
}

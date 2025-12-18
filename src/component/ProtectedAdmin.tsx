import { ReactNode } from "react"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"

export default async function ProtectedAdmin({
  children,
}: {
  children: ReactNode
}) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/")
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  })

  if (!user || user.role !== "ADMIN") {
    redirect("/")
  }

  return <>{children}</>
}

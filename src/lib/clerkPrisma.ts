// lib/clearkPrisma.ts
import prisma from "./prisma";
import { auth } from "@clerk/nextjs/server";

export async function syncClerkUser() {
  const { userId } = await auth();

  if (!userId) {
    console.warn("No user logged in (auth() returned undefined)");
    return null;
  }

  // Fetch Clerk user data
  const res = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
    },
  });

  if (!res.ok) {
    console.error("Failed to fetch user from Clerk:", await res.text());
    return null;
  }

  const data = await res.json();

  try {
    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {
        name: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim() || null,
        email: data.email_addresses[0]?.email_address || null,
      },
      create: {
        clerkId: userId,
        name: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim() || null,
        email: data.email_addresses[0]?.email_address || null,
      },
    });
    console.log(`User synced manually: ${userId}`);
    return user;
  } catch (err: any) {
    if (err.code === "P2002") {
      console.error("Unique constraint failed during manual sync:", err.meta);
    } else {
      console.error("Error syncing user manually:", err);
    }
    return null;
  }
}

import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const payload = await req.text();
  const headerList = headers();

  const svix_id = headerList.get("svix-id");
  const svix_timestamp = headerList.get("svix-timestamp");
  const svix_signature = headerList.get("svix-signature");

  const wh = new Webhook(WEBHOOK_SECRET);

  let event: any;
  try {
    if (!svix_id || !svix_timestamp || !svix_signature) {
      throw new Error("Missing headers for signature verification");
    }

    event = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new NextResponse("Invalid signature", { status: 400 });
  }

  const { type, data } = event;

  console.log("Webhook event received:", type, "for userId:", data?.id);

  // Only handle user creation or updates
  if (type === "user.created" || type === "user.updated") {
    try {
      await prisma.user.upsert({
        where: { clerkId: data.id },
        update: {
          name: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim() || null,
          email: data.email_addresses[0]?.email_address || null,
        },
        create: {
          clerkId: data.id,
          name: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim() || null,
          email: data.email_addresses[0]?.email_address || null,
        },
      });
      console.log(`User synced successfully: ${data.id}`);
    } catch (err: any) {
      // Handle unique constraint errors (like email conflict)
      if (err.code === "P2002") {
        console.error("Unique constraint failed while syncing user:", err.meta);
      } else {
        console.error("Error syncing user:", err);
      }
    }
  }

  return NextResponse.json({ success: true });
}

import { syncClerkUser } from "@/lib/clerkPrisma";

export async function GET(req: Request) {
  const user = await syncClerkUser(); // syncs logged-in Clerk user to Prisma
  if (!user) return new Response("No user logged in", { status: 401 });
  return new Response(JSON.stringify(user));
}

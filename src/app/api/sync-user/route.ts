import { syncClerkUser } from "@/lib/clerkPrisma";

export async function POST(req: Request) {
  const user = await syncClerkUser();
  if (!user) return new Response("No user logged in", { status: 401 });
  return new Response(JSON.stringify(user));
}

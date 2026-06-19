import { auth } from "@/lib/auth";
import type { Session } from "next-auth";

// Returns null instead of throwing — Next.js route handlers don't catch thrown
// Response objects, so callers must check the result and return their own
// NextResponse on failure, e.g.:
//   const session = await requireAuth();
//   if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
export async function requireAuth(): Promise<Session | null> {
  return auth();
}

export async function requireAdmin(): Promise<Session | null> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
}

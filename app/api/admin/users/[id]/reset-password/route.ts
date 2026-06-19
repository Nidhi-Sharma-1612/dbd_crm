import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-role";
import { logAction } from "@/lib/audit-log";

// Admin-initiated escape hatch: generates a temporary password directly rather than
// emailing a reset link, so it doesn't depend on the target agent's mailbox.
// Share the returned password with the agent out-of-band; they should change it on next login.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing || existing.deletedAt) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const tempPassword = randomBytes(9).toString("base64url");
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  await prisma.user.update({ where: { id }, data: { passwordHash } });

  await logAction({
    actorId: session.user.id,
    action: "user.reset_password",
    targetType: "User",
    targetId: id,
    targetLabel: existing.email,
  });

  return NextResponse.json({ tempPassword });
}

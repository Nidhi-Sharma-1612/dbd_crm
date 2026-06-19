import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-role";
import { logAction } from "@/lib/audit-log";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const existing = await prisma.contact.findUnique({ where: { id } });
  if (!existing || !existing.deletedAt) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const contact = await prisma.contact.update({ where: { id }, data: { deletedAt: null } });

  await logAction({
    actorId: session.user.id,
    action: "contact.restore",
    targetType: "Contact",
    targetId: id,
    targetLabel: contact.name,
  });

  return NextResponse.json({ contact });
}

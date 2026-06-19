import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-role";
import { logAction } from "@/lib/audit-log";

const updateSchema = z.object({
  role: z.enum(["AGENT", "ADMIN"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  name: z.string().min(1).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update" }, { status: 400 });
  }

  if (id === session.user.id && parsed.data.status === "INACTIVE") {
    return NextResponse.json({ error: "You cannot deactivate your own account" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing || existing.deletedAt) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const user = await prisma.user.update({
    where: { id },
    data: parsed.data,
    select: { id: true, email: true, name: true, role: true, status: true },
  });

  if (parsed.data.role && parsed.data.role !== existing.role) {
    await logAction({
      actorId: session.user.id,
      action: "user.role_change",
      targetType: "User",
      targetId: id,
      targetLabel: user.email,
      metadata: { from: existing.role, to: parsed.data.role },
    });
  }
  if (parsed.data.status && parsed.data.status !== existing.status) {
    await logAction({
      actorId: session.user.id,
      action: parsed.data.status === "INACTIVE" ? "user.deactivate" : "user.activate",
      targetType: "User",
      targetId: id,
      targetLabel: user.email,
    });
  }

  return NextResponse.json({ user });
}

// Soft-delete: the user row is kept (with deletedAt set) so existing notes
// and contact assignments stay intact and attributable. Restorable from
// /admin/trash. The deletedAt check in lib/auth.ts blocks login regardless
// of the `status` field.
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  if (id === session.user.id) {
    return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing || existing.deletedAt) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.user.update({ where: { id }, data: { deletedAt: new Date() } });

  await logAction({
    actorId: session.user.id,
    action: "user.delete",
    targetType: "User",
    targetId: id,
    targetLabel: existing.email,
  });

  return NextResponse.json({ ok: true });
}

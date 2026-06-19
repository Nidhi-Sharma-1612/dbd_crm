import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma/client";
import { requireAuth, requireAdmin } from "@/lib/require-role";
import { normalizePhone } from "@/lib/utils/phone";
import { logAction } from "@/lib/audit-log";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const contact = await prisma.contact.findUnique({
    where: { id },
    include: { assignedAgent: { select: { id: true, name: true } } },
  });

  if (!contact || contact.deletedAt) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ contact });
}

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  status: z.enum(["NEW", "INTERESTED", "NOT_INTERESTED", "DO_NOT_CALL", "CALLBACK"]).optional(),
  assignedAgentId: z.string().nullable().optional(),
  callbackDate: z.string().nullable().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update" }, { status: 400 });
  }

  // Reassigning a contact to a different agent is an admin-only action — the
  // UI only exposes it to admins, but enforce it here too rather than relying
  // on the client to behave.
  if (parsed.data.assignedAgentId !== undefined && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Only admins can reassign contacts" }, { status: 403 });
  }

  const existing = await prisma.contact.findUnique({ where: { id } });
  if (!existing || existing.deletedAt) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { callbackDate, ...rest } = parsed.data;
  const data: Prisma.ContactUpdateInput = { ...rest };
  if (data.phone) data.phone = normalizePhone(data.phone as string);
  if (data.email === "") data.email = undefined;
  if (callbackDate !== undefined) {
    data.callbackDate = callbackDate ? new Date(callbackDate) : null;
  }

  const contact = await prisma.contact.update({ where: { id }, data });

  if (
    parsed.data.assignedAgentId !== undefined &&
    parsed.data.assignedAgentId !== existing.assignedAgentId
  ) {
    await logAction({
      actorId: session.user.id,
      action: "contact.reassign",
      targetType: "Contact",
      targetId: id,
      targetLabel: contact.name,
      metadata: { from: existing.assignedAgentId, to: parsed.data.assignedAgentId },
    });
  }

  return NextResponse.json({ contact });
}

// Admin-only, soft-delete: the row is kept (deletedAt set) along with its
// notes, so call history isn't lost and the contact can be restored from
// /admin/trash. A more destructive action than editing, hence admin-only.
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const contact = await prisma.contact.findUnique({ where: { id } });
  if (!contact || contact.deletedAt) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.contact.update({ where: { id }, data: { deletedAt: new Date() } });

  await logAction({
    actorId: session.user.id,
    action: "contact.delete",
    targetType: "Contact",
    targetId: id,
    targetLabel: contact.name,
  });

  return NextResponse.json({ ok: true });
}

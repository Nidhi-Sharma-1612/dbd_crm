import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-role";
import { logAction } from "@/lib/audit-log";

// Admin-only, soft-delete: notes are append-only call history for everyone
// else, so an agent can't delete (or quietly edit) their own entries after
// the fact. Restorable from /admin/trash.
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; noteId: string }> },
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, noteId } = await params;

  const note = await prisma.note.findUnique({ where: { id: noteId } });
  if (!note || note.contactId !== id || note.deletedAt) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  await prisma.note.update({ where: { id: noteId }, data: { deletedAt: new Date() } });

  await logAction({
    actorId: session.user.id,
    action: "note.delete",
    targetType: "Note",
    targetId: noteId,
    targetLabel: note.body.slice(0, 80),
  });

  return NextResponse.json({ ok: true });
}

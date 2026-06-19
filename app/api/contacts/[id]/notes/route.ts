import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/require-role";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const sort = searchParams.get("sort") === "asc" ? "asc" : "desc";

  const notes = await prisma.note.findMany({
    where: { contactId: id, deletedAt: null },
    include: { agent: { select: { name: true } } },
    orderBy: { createdAt: sort },
  });

  return NextResponse.json({ notes });
}

const createSchema = z.object({ body: z.string().min(1) });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Note cannot be empty" }, { status: 400 });
  }

  const contact = await prisma.contact.findUnique({ where: { id } });
  if (!contact || contact.deletedAt) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }

  const note = await prisma.note.create({
    data: {
      contactId: id,
      agentId: session.user.id,
      body: parsed.data.body,
    },
    include: { agent: { select: { name: true } } },
  });

  await prisma.contact.update({ where: { id }, data: { updatedAt: new Date() } });

  return NextResponse.json({ note }, { status: 201 });
}

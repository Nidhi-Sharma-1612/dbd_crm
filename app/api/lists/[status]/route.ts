import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/require-role";
import { slugToStatus } from "@/lib/lead-status";
import type { Prisma } from "@/app/generated/prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ status: string }> }) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { status: slug } = await params;
  const status = slugToStatus(slug);
  if (!status) return NextResponse.json({ error: "Unknown list" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const agent = searchParams.get("agent");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const isAdmin = session.user.role === "ADMIN";

  const where: Prisma.ContactWhereInput = { status, deletedAt: null };
  if (isAdmin) {
    if (agent) where.assignedAgentId = agent;
  } else {
    where.assignedAgentId = session.user.id;
  }
  if (from || to) {
    where.updatedAt = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(`${to}T23:59:59.999Z`) } : {}),
    };
  }

  const contacts = await prisma.contact.findMany({
    where,
    include: { assignedAgent: { select: { name: true } } },
    orderBy:
      status === "CALLBACK" ? [{ callbackDate: { sort: "asc", nulls: "last" } }] : [{ updatedAt: "desc" }],
  });

  return NextResponse.json({ contacts });
}

import { unparse } from "papaparse";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/require-role";
import { slugToStatus, STATUS_LABELS } from "@/lib/lead-status";
import type { Prisma } from "@/app/generated/prisma/client";

export async function GET(req: Request, { params }: { params: Promise<{ status: string }> }) {
  const session = await requireAuth();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { status: slug } = await params;
  const status = slugToStatus(slug);
  if (!status) return new Response("Unknown list", { status: 404 });

  const { searchParams } = new URL(req.url);
  const agent = searchParams.get("agent");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: Prisma.ContactWhereInput = { status, deletedAt: null };
  if (agent) where.assignedAgentId = agent;
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

  const rows = contacts.map((c) => ({
    Name: c.name,
    Phone: c.phone ?? "",
    Email: c.email ?? "",
    Status: STATUS_LABELS[c.status],
    CallbackDate: c.callbackDate ? c.callbackDate.toISOString().slice(0, 10) : "",
    AssignedAgent: c.assignedAgent?.name ?? "",
    CreatedDate: c.createdAt.toISOString(),
    LastUpdated: c.updatedAt.toISOString(),
  }));

  const csv = unparse(rows);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}-leads-${Date.now()}.csv"`,
    },
  });
}

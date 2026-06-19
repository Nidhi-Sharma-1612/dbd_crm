import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, Inbox } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { slugToStatus, STATUS_LABELS } from "@/lib/lead-status";
import { Card } from "@/components/ui/card";
import { buttonClassName } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { Prisma } from "@/app/generated/prisma/client";

export const dynamic = "force-dynamic";

function callbackBadge(date: Date | null) {
  if (!date) return <span className="text-zinc-400">Not scheduled</span>;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(date);
  due.setHours(0, 0, 0, 0);

  const formatted = date.toLocaleDateString();
  if (due < today) return <span className="font-medium text-red-600">{formatted} (overdue)</span>;
  if (due.getTime() === today.getTime()) return <span className="font-medium text-amber-600">{formatted} (today)</span>;
  return <span className="text-zinc-600">{formatted}</span>;
}

export default async function LeadListPage({
  params,
  searchParams,
}: {
  params: Promise<{ status: string }>;
  searchParams: Promise<{ agent?: string; from?: string; to?: string }>;
}) {
  const { status: slug } = await params;
  const { agent, from, to } = await searchParams;
  const status = slugToStatus(slug);
  if (!status) notFound();

  const where: Prisma.ContactWhereInput = { status, deletedAt: null };
  if (agent) where.assignedAgentId = agent;
  if (from || to) {
    where.updatedAt = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(`${to}T23:59:59.999Z`) } : {}),
    };
  }

  const [contacts, agents] = await Promise.all([
    prisma.contact.findMany({
      where,
      include: { assignedAgent: { select: { name: true } } },
      orderBy:
        status === "CALLBACK"
          ? [{ callbackDate: { sort: "asc", nulls: "last" } }]
          : [{ updatedAt: "desc" }],
    }),
    prisma.user.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const exportQuery = new URLSearchParams();
  if (agent) exportQuery.set("agent", agent);
  if (from) exportQuery.set("from", from);
  if (to) exportQuery.set("to", to);
  const exportHref = `/api/lists/${slug}/export${exportQuery.size ? `?${exportQuery}` : ""}`;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">{STATUS_LABELS[status]} leads</h1>
          <p className="text-sm text-zinc-500">{contacts.length} contact{contacts.length === 1 ? "" : "s"}</p>
        </div>
        <a href={exportHref} className={buttonClassName("outline", "sm")}>
          <Download size={14} />
          Export CSV
        </a>
      </div>

      <form method="get" className="mb-4 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="agent" className="text-xs font-medium text-zinc-500">
            Agent
          </label>
          <Select id="agent" name="agent" defaultValue={agent ?? ""} className="w-44">
            <option value="">All agents</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="from" className="text-xs font-medium text-zinc-500">
            Updated from
          </label>
          <Input id="from" name="from" type="date" defaultValue={from ?? ""} className="w-auto" />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="to" className="text-xs font-medium text-zinc-500">
            Updated to
          </label>
          <Input id="to" name="to" type="date" defaultValue={to ?? ""} className="w-auto" />
        </div>
        <button type="submit" className={buttonClassName("outline", "sm")}>
          Apply filters
        </button>
        {(agent || from || to) && (
          <Link href={`/lists/${slug}`} className="text-sm text-zinc-500 hover:underline">
            Clear
          </Link>
        )}
      </form>

      {contacts.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 py-16 text-zinc-400">
          <Inbox size={24} />
          <p className="text-sm">No contacts match these filters.</p>
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-160 text-sm">
            <thead className="bg-zinc-50 text-left text-zinc-500">
              <tr>
                <th className="px-4 py-2.5 font-medium">Name</th>
                <th className="px-4 py-2.5 font-medium">Phone</th>
                <th className="px-4 py-2.5 font-medium">Email</th>
                <th className="px-4 py-2.5 font-medium">Agent</th>
                {status === "CALLBACK" ? (
                  <th className="px-4 py-2.5 font-medium">Callback date</th>
                ) : (
                  <th className="px-4 py-2.5 font-medium">Updated</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {contacts.map((c) => (
                <tr key={c.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-2.5">
                    <Link href={`/contacts/${c.id}`} className="font-medium text-zinc-900 hover:text-indigo-600 hover:underline">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-zinc-600">{c.phone}</td>
                  <td className="px-4 py-2.5 text-zinc-600">{c.email}</td>
                  <td className="px-4 py-2.5 text-zinc-600">{c.assignedAgent?.name ?? "—"}</td>
                  {status === "CALLBACK" ? (
                    <td className="px-4 py-2.5">{callbackBadge(c.callbackDate)}</td>
                  ) : (
                    <td className="px-4 py-2.5 text-zinc-600">{c.updatedAt.toLocaleDateString()}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

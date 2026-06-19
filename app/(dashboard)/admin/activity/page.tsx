import { History } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { describeAction } from "@/lib/audit-labels";

export const dynamic = "force-dynamic";

function metadataSummary(metadata: unknown): string | null {
  if (!metadata || typeof metadata !== "object") return null;
  const m = metadata as Record<string, unknown>;
  if ("from" in m && "to" in m) return `${m.from ?? "none"} → ${m.to ?? "none"}`;
  return null;
}

export default async function ActivityLogPage() {
  const logs = await prisma.auditLog.findMany({
    include: { actor: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-zinc-900">Activity</h1>
        <p className="text-sm text-zinc-500">Most recent admin actions, newest first (last 200).</p>
      </div>

      <Card className="overflow-hidden">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-zinc-400">
            <History size={24} />
            <p className="text-sm">No activity recorded yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {logs.map((log) => {
              const detail = metadataSummary(log.metadata);
              return (
                <li key={log.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <p className="text-zinc-700">
                    <span className="font-medium text-zinc-900">{log.actor.name}</span>{" "}
                    {describeAction(log.action)}{" "}
                    <span className="font-medium text-zinc-900">{log.targetLabel}</span>
                    {detail && <span className="text-zinc-500"> ({detail})</span>}
                  </p>
                  <span className="shrink-0 text-xs text-zinc-400">
                    {log.createdAt.toLocaleString()}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}

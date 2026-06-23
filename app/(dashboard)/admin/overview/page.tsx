import { LayoutDashboard, Users, Sparkles, ThumbsUp, ThumbsDown, PhoneOff, CalendarClock, PhoneCall } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export const dynamic = "force-dynamic";

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function PipelineStat({
  icon,
  label,
  value,
  subtext,
  iconClassName = "bg-indigo-50 text-indigo-600",
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  subtext?: string;
  iconClassName?: string;
}) {
  return (
    <Card className="flex items-center gap-3 p-4 transition-shadow hover:shadow-md">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}>
        {icon}
      </span>
      <div>
        <p className="text-xl font-semibold text-zinc-900">{value}</p>
        <p className="text-xs text-zinc-500">{label}</p>
        {subtext && <p className="text-xs font-medium text-red-600">{subtext}</p>}
      </div>
    </Card>
  );
}

export default async function OverviewPage() {
  const today = startOfToday();

  const [
    totalContacts,
    newUntriaged,
    interested,
    notInterested,
    doNotCall,
    callback,
    overdueCallbacks,
    notesToday,
    notesByAgentRaw,
  ] = await Promise.all([
    prisma.contact.count({ where: { deletedAt: null } }),
    prisma.contact.count({ where: { deletedAt: null, status: "NEW" } }),
    prisma.contact.count({ where: { deletedAt: null, status: "INTERESTED" } }),
    prisma.contact.count({ where: { deletedAt: null, status: "NOT_INTERESTED" } }),
    prisma.contact.count({ where: { deletedAt: null, status: "DO_NOT_CALL" } }),
    prisma.contact.count({ where: { deletedAt: null, status: "CALLBACK" } }),
    prisma.contact.count({
      where: { deletedAt: null, status: "CALLBACK", callbackDate: { lt: today } },
    }),
    prisma.note.count({ where: { deletedAt: null, createdAt: { gte: today } } }),
    prisma.note.groupBy({
      by: ["agentId"],
      where: { deletedAt: null, createdAt: { gte: today } },
      _count: { _all: true },
    }),
  ]);

  const agentIds = notesByAgentRaw.map((r) => r.agentId);
  const agents = agentIds.length
    ? await prisma.user.findMany({ where: { id: { in: agentIds } }, select: { id: true, name: true } })
    : [];
  const agentNames = new Map(agents.map((a) => [a.id, a.name]));
  const notesByAgent = notesByAgentRaw
    .map((r) => ({ name: agentNames.get(r.agentId) ?? "Unknown", count: r._count._all }))
    .sort((a, b) => b.count - a.count);
  const maxCount = notesByAgent[0]?.count ?? 0;

  return (
    <div>
      <PageHeader
        icon={<LayoutDashboard size={18} />}
        title="Overview"
        subtitle={today.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
      />

      <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">Pipeline</h2>
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <PipelineStat icon={<Users size={16} />} label="Total contacts" value={totalContacts} />
        <PipelineStat
          icon={<Sparkles size={16} />}
          label="New"
          value={newUntriaged}
          iconClassName="bg-zinc-100 text-zinc-600"
        />
        <PipelineStat
          icon={<ThumbsUp size={16} />}
          label="Interested"
          value={interested}
          iconClassName="bg-green-50 text-green-600"
        />
        <PipelineStat
          icon={<ThumbsDown size={16} />}
          label="Not interested"
          value={notInterested}
          iconClassName="bg-zinc-100 text-zinc-500"
        />
        <PipelineStat
          icon={<PhoneOff size={16} />}
          label="Do not call"
          value={doNotCall}
          iconClassName="bg-red-50 text-red-600"
        />
        <PipelineStat
          icon={<CalendarClock size={16} />}
          label="Callback"
          value={callback}
          subtext={overdueCallbacks > 0 ? `${overdueCallbacks} overdue` : undefined}
          iconClassName="bg-amber-50 text-amber-600"
        />
      </div>

      <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">Today</h2>
      <Card className="p-5">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <PhoneCall size={16} />
          </span>
          <div>
            <p className="text-xl font-semibold text-zinc-900">{notesToday}</p>
            <p className="text-xs text-zinc-500">Calls logged today</p>
          </div>
        </div>

        {notesByAgent.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {notesByAgent.map((a) => (
              <div key={a.name} className="flex items-center gap-2 sm:gap-3">
                <span className="w-20 shrink-0 truncate text-sm text-zinc-700 sm:w-32">{a.name}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100">
                  <div
                    className="h-full rounded-full bg-indigo-500"
                    style={{ width: `${maxCount ? (a.count / maxCount) * 100 : 0}%` }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right text-sm text-zinc-500 sm:w-14">
                  {a.count} call{a.count === 1 ? "" : "s"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-400">No calls logged yet today.</p>
        )}
      </Card>
    </div>
  );
}

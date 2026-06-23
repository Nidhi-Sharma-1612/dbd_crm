import Link from "next/link";
import { Phone, Mail, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/lead-status";
import { getInitials } from "@/lib/initials";

export async function RecentContacts() {
  const contacts = await prisma.contact.findMany({
    where: { deletedAt: null },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });

  return (
    <div className="mt-10 w-full max-w-xl">
      <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">
        Recently updated
      </h2>
      {contacts.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 py-10 text-zinc-400">
          <Users size={20} />
          <p className="text-sm">No contacts yet — search above or import a CSV to get started.</p>
        </Card>
      ) : (
        <Card className="divide-y divide-zinc-100 overflow-hidden">
          {contacts.map((c) => (
            <Link
              key={c.id}
              href={`/contacts/${c.id}`}
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-zinc-50"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600">
                {getInitials(c.name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-zinc-900">{c.name}</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-sm text-zinc-500">
                  {c.phone ? <Phone size={13} /> : <Mail size={13} />}
                  {c.phone || c.email}
                </p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[c.status]}`}>
                {STATUS_LABELS[c.status]}
              </span>
            </Link>
          ))}
        </Card>
      )}
    </div>
  );
}

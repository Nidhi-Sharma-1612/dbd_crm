import Link from "next/link";
import { Phone, Mail } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/lead-status";

export async function RecentContacts() {
  const contacts = await prisma.contact.findMany({
    where: { deletedAt: null },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });

  if (contacts.length === 0) return null;

  return (
    <div className="mt-10 w-full max-w-xl">
      <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">
        Recently updated
      </h2>
      <Card className="divide-y divide-zinc-100 overflow-hidden">
        {contacts.map((c) => (
          <Link
            key={c.id}
            href={`/contacts/${c.id}`}
            className="flex items-center justify-between px-4 py-3 hover:bg-zinc-50"
          >
            <div>
              <p className="font-medium text-zinc-900">{c.name}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-zinc-500">
                {c.phone ? <Phone size={13} /> : <Mail size={13} />}
                {c.phone || c.email}
              </p>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[c.status]}`}>
              {STATUS_LABELS[c.status]}
            </span>
          </Link>
        ))}
      </Card>
    </div>
  );
}

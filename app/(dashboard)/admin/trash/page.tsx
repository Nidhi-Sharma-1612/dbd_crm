import Link from "next/link";
import { Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { RestoreButton } from "./restore-button";

export const dynamic = "force-dynamic";

function EmptySection({ label }: { label: string }) {
  return <p className="px-4 py-6 text-sm text-zinc-400">No {label} in trash.</p>;
}

export default async function TrashPage() {
  const [trashedUsers, trashedContacts, trashedNotes] = await Promise.all([
    prisma.user.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
    }),
    prisma.contact.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
    }),
    prisma.note.findMany({
      where: { deletedAt: { not: null } },
      include: { contact: { select: { id: true, name: true } }, agent: { select: { name: true } } },
      orderBy: { deletedAt: "desc" },
    }),
  ]);

  return (
    <div>
      <PageHeader
        icon={<Trash2 size={18} />}
        iconClassName="bg-red-50 text-red-600"
        title="Trash"
        subtitle="Deleted users, contacts, and notes are kept here until restored."
      />

      <h2 className="mb-2 text-sm font-medium text-zinc-700">Users ({trashedUsers.length})</h2>
      <Card className="mb-6 overflow-hidden">
        {trashedUsers.length === 0 ? (
          <EmptySection label="users" />
        ) : (
          <ul className="divide-y divide-zinc-100">
            {trashedUsers.map((u) => (
              <li key={u.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="font-medium text-zinc-900">{u.name}</p>
                  <p className="text-xs text-zinc-500">
                    {u.email} · deleted {u.deletedAt?.toLocaleString()}
                  </p>
                </div>
                <RestoreButton endpoint={`/api/admin/users/${u.id}/restore`} />
              </li>
            ))}
          </ul>
        )}
      </Card>

      <h2 className="mb-2 text-sm font-medium text-zinc-700">Contacts ({trashedContacts.length})</h2>
      <Card className="mb-6 overflow-hidden">
        {trashedContacts.length === 0 ? (
          <EmptySection label="contacts" />
        ) : (
          <ul className="divide-y divide-zinc-100">
            {trashedContacts.map((c) => (
              <li key={c.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="font-medium text-zinc-900">{c.name}</p>
                  <p className="text-xs text-zinc-500">
                    {c.phone || c.email} · deleted {c.deletedAt?.toLocaleString()}
                  </p>
                </div>
                <RestoreButton endpoint={`/api/contacts/${c.id}/restore`} />
              </li>
            ))}
          </ul>
        )}
      </Card>

      <h2 className="mb-2 text-sm font-medium text-zinc-700">Notes ({trashedNotes.length})</h2>
      <Card className="overflow-hidden">
        {trashedNotes.length === 0 ? (
          <EmptySection label="notes" />
        ) : (
          <ul className="divide-y divide-zinc-100">
            {trashedNotes.map((n) => (
              <li key={n.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm text-zinc-800">{n.body}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {n.agent.name} on{" "}
                    <Link href={`/contacts/${n.contact.id}`} className="hover:underline">
                      {n.contact.name}
                    </Link>{" "}
                    · deleted {n.deletedAt?.toLocaleString()}
                  </p>
                </div>
                <RestoreButton endpoint={`/api/contacts/${n.contactId}/notes/${n.id}/restore`} />
              </li>
            ))}
          </ul>
        )}
      </Card>

      {trashedUsers.length === 0 && trashedContacts.length === 0 && trashedNotes.length === 0 && (
        <div className="mt-2 flex items-center gap-2 text-sm text-zinc-400">
          <Trash2 size={14} />
          Trash is empty.
        </div>
      )}
    </div>
  );
}

import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { ContactHeaderCard } from "./contact-header-card";
import { StatusSelector } from "./status-selector";
import { NotesSection } from "./notes-section";

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [session, contact, agents] = await Promise.all([
    auth(),
    prisma.contact.findUnique({
      where: { id },
      include: { assignedAgent: { select: { name: true } } },
    }),
    prisma.user.findMany({
      where: { status: "ACTIVE", deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!contact || contact.deletedAt) notFound();

  const isAdmin = session?.user.role === "ADMIN";

  return (
    <div className="mx-auto max-w-2xl">
      <ContactHeaderCard
        contact={{
          id: contact.id,
          name: contact.name,
          phone: contact.phone,
          email: contact.email,
          assignedAgentId: contact.assignedAgentId,
          assignedAgentName: contact.assignedAgent?.name ?? null,
        }}
        agents={agents}
        isAdmin={isAdmin}
      />

      <Card className="mb-6 p-4 sm:p-6">
        <h2 className="mb-3 text-sm font-medium text-zinc-700">Status</h2>
        <StatusSelector
          contactId={contact.id}
          status={contact.status}
          callbackDate={contact.callbackDate?.toISOString() ?? null}
        />
      </Card>

      <Card className="p-4 sm:p-6">
        <NotesSection contactId={contact.id} isAdmin={isAdmin} />
      </Card>
    </div>
  );
}

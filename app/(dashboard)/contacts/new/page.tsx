"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Phone, Mail, UserPlus } from "lucide-react";
import { STATUS_LABELS, STATUS_COLORS, type LeadStatus } from "@/lib/lead-status";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

type Duplicate = { id: string; name: string; phone: string | null; email: string | null; status: LeadStatus };

function NewContactForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState(searchParams.get("phone") ?? "");
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [error, setError] = useState<string | null>(null);
  const [duplicates, setDuplicates] = useState<Duplicate[] | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(force: boolean) {
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, email, force }),
    });

    setSubmitting(false);

    if (res.status === 409) {
      const data = await res.json();
      setDuplicates(data.duplicates);
      return;
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not create contact.");
      return;
    }

    const data = await res.json();
    router.push(`/contacts/${data.contact.id}`);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setDuplicates(null);
    submit(false);
  }

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader icon={<UserPlus size={18} />} title="New contact" subtitle="Add a new lead to the system." />

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={submitting} className="mt-1">
            {submitting ? "Creating…" : "Create contact"}
          </Button>
        </form>
      </Card>

      {duplicates && duplicates.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="mb-3 text-sm font-medium text-amber-800">A similar contact already exists:</p>
          <ul className="mb-3 flex flex-col gap-2">
            {duplicates.map((d) => (
              <li key={d.id}>
                <button
                  onClick={() => router.push(`/contacts/${d.id}`)}
                  className="flex w-full items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-left transition-colors hover:bg-zinc-50"
                >
                  <div>
                    <p className="font-medium text-zinc-900">{d.name}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm text-zinc-500">
                      {d.phone ? <Phone size={13} /> : <Mail size={13} />}
                      {d.phone || d.email}
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[d.status]}`}>
                    {STATUS_LABELS[d.status]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <Button onClick={() => submit(true)} disabled={submitting} variant="outline" size="sm">
            Create anyway
          </Button>
        </div>
      )}
    </div>
  );
}

export default function NewContactPage() {
  return (
    <Suspense>
      <NewContactForm />
    </Suspense>
  );
}

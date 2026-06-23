"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, Mail, User, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/initials";

type Contact = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  assignedAgentId: string | null;
  assignedAgentName: string | null;
};

type Agent = { id: string; name: string };

export function ContactHeaderCard({
  contact,
  agents,
  isAdmin,
}: {
  contact: Contact;
  agents: Agent[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [name, setName] = useState(contact.name);
  const [phone, setPhone] = useState(contact.phone ?? "");
  const [email, setEmail] = useState(contact.email ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reassigning, setReassigning] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const res = await fetch(`/api/contacts/${contact.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, email }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not save changes.");
      return;
    }

    setEditing(false);
    router.refresh();
  }

  async function handleDelete() {
    setDeleting(true);
    const res = await fetch(`/api/contacts/${contact.id}`, { method: "DELETE" });
    setDeleting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not delete contact.");
      setConfirmingDelete(false);
      return;
    }

    router.push("/dashboard");
  }

  async function handleReassign(agentId: string) {
    setReassigning(true);
    setError(null);

    const res = await fetch(`/api/contacts/${contact.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignedAgentId: agentId || null }),
    });

    setReassigning(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not reassign contact.");
      return;
    }

    router.refresh();
  }

  if (editing) {
    return (
      <Card className="mb-6 p-4 sm:p-6">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-name">Name</Label>
            <Input id="edit-name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-phone">Phone</Label>
            <Input id="edit-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-email">Email</Label>
            <Input id="edit-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" disabled={saving} size="sm">
              {saving ? "Saving…" : "Save changes"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={saving}
              onClick={() => {
                setEditing(false);
                setName(contact.name);
                setPhone(contact.phone ?? "");
                setEmail(contact.email ?? "");
                setError(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    );
  }

  return (
    <Card className="mb-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-base font-semibold text-indigo-700">
            {getInitials(contact.name)}
          </span>
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">{contact.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-zinc-500">
              {contact.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone size={14} /> {contact.phone}
                </span>
              )}
              {contact.email && (
                <span className="flex items-center gap-1.5">
                  <Mail size={14} /> {contact.email}
                </span>
              )}
              {isAdmin ? (
                <span className="flex items-center gap-1.5">
                  <User size={14} />
                  <Select
                    value={contact.assignedAgentId ?? ""}
                    disabled={reassigning}
                    onChange={(e) => handleReassign(e.target.value)}
                    className="w-auto py-1 text-sm"
                  >
                    <option value="">Unassigned</option>
                    {agents.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </Select>
                </span>
              ) : (
                contact.assignedAgentName && (
                  <span className="flex items-center gap-1.5">
                    <User size={14} /> {contact.assignedAgentName}
                  </span>
                )
              )}
            </div>
          </div>
        </div>

        {!confirmingDelete && (
          <div className="flex shrink-0 gap-1.5">
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
              <Pencil size={13} />
              Edit
            </Button>
            {isAdmin && (
              <Button variant="danger" size="sm" onClick={() => setConfirmingDelete(true)}>
                <Trash2 size={13} />
                Delete
              </Button>
            )}
          </div>
        )}
      </div>

      {confirmingDelete && (
        <div className="mt-4 flex items-center gap-2 border-t border-zinc-200 pt-4">
          <span className="text-sm text-zinc-600">
            Move this contact to trash? It can be restored later from Trash.
          </span>
          <Button variant="ghost" size="sm" disabled={deleting} onClick={() => setConfirmingDelete(false)}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" disabled={deleting} onClick={handleDelete}>
            {deleting ? "Deleting…" : "Confirm delete"}
          </Button>
        </div>
      )}
      {error && !editing && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </Card>
  );
}

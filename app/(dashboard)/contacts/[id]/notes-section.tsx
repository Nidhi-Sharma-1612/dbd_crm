"use client";

import { useEffect, useState } from "react";
import { ArrowUpDown, MessageSquare } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { NoteItem } from "./note-item";

type Note = {
  id: string;
  body: string;
  createdAt: string;
  agent: { name: string };
};

export function NotesSection({ contactId, isAdmin = false }: { contactId: string; isAdmin?: boolean }) {
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [sort, setSort] = useState<"desc" | "asc">("desc");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadNotes(order: "desc" | "asc") {
    const res = await fetch(`/api/contacts/${contactId}/notes?sort=${order}`);
    const data = await res.json();
    setNotes(data.notes ?? []);
  }

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const res = await fetch(`/api/contacts/${contactId}/notes?sort=${sort}`);
      const data = await res.json();
      if (!cancelled) setNotes(data.notes ?? []);
    })();

    return () => {
      cancelled = true;
    };
  }, [contactId, sort]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);

    const res = await fetch(`/api/contacts/${contactId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });

    setSubmitting(false);
    if (res.ok) {
      setBody("");
      loadNotes(sort);
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-zinc-900">Notes</h2>
        <button
          onClick={() => setSort(sort === "desc" ? "asc" : "desc")}
          className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-indigo-600"
        >
          <ArrowUpDown size={13} />
          {sort === "desc" ? "Newest first" : "Oldest first"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-2">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What did you discuss?"
          rows={3}
        />
        <Button type="submit" disabled={submitting} size="sm" className="self-start">
          {submitting ? "Saving…" : "Add note"}
        </Button>
      </form>

      {notes === null && <p className="text-sm text-zinc-400">Loading notes…</p>}
      {notes?.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-zinc-200 py-8 text-zinc-400">
          <MessageSquare size={20} />
          <p className="text-sm">No notes yet.</p>
        </div>
      )}

      <ul className="flex flex-col gap-3">
        {notes?.map((note) => (
          <NoteItem
            key={note.id}
            contactId={contactId}
            note={note}
            isAdmin={isAdmin}
            onDeleted={() => loadNotes(sort)}
          />
        ))}
      </ul>
    </div>
  );
}

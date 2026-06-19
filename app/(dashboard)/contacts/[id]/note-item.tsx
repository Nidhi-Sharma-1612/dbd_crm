"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Note = {
  id: string;
  body: string;
  createdAt: string;
  agent: { name: string };
};

export function NoteItem({
  contactId,
  note,
  isAdmin,
  onDeleted,
}: {
  contactId: string;
  note: Note;
  isAdmin: boolean;
  onDeleted: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    const res = await fetch(`/api/contacts/${contactId}/notes/${note.id}`, { method: "DELETE" });
    setDeleting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not delete note.");
      setConfirming(false);
      return;
    }

    onDeleted();
  }

  return (
    <li className="rounded-lg border border-zinc-200 bg-zinc-50 p-3.5">
      <div className="mb-1.5 flex items-center justify-between text-xs text-zinc-500">
        <span className="font-medium text-zinc-700">{note.agent.name}</span>
        <div className="flex items-center gap-3">
          <span>{new Date(note.createdAt).toLocaleString()}</span>
          {isAdmin && !confirming && (
            <button
              onClick={() => setConfirming(true)}
              aria-label="Delete note"
              className="text-zinc-400 hover:text-red-600"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      <p className="whitespace-pre-wrap text-sm text-zinc-800">{note.body}</p>

      {confirming && (
        <div className="mt-2 flex items-center gap-2 border-t border-zinc-200 pt-2">
          <span className="text-xs text-zinc-500">Delete this note? It can be restored later from Trash.</span>
          <Button onClick={() => setConfirming(false)} disabled={deleting} variant="ghost" size="sm">
            Cancel
          </Button>
          <Button onClick={handleDelete} disabled={deleting} variant="danger" size="sm">
            {deleting ? "Deleting…" : "Confirm"}
          </Button>
        </div>
      )}
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </li>
  );
}

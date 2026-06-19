"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, ShieldCheck, UserX, UserCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type User = {
  id: string;
  name: string;
  email: string;
  role: "AGENT" | "ADMIN";
  status: "ACTIVE" | "INACTIVE";
};

export function UserRow({ user, isSelf }: { user: User; isSelf: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function toggleStatus() {
    setBusy(true);
    const nextStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    setBusy(false);
    router.refresh();
  }

  async function toggleRole() {
    setBusy(true);
    const nextRole = user.role === "ADMIN" ? "AGENT" : "ADMIN";
    await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: nextRole }),
    });
    setBusy(false);
    router.refresh();
  }

  async function resetPassword() {
    setBusy(true);
    const res = await fetch(`/api/admin/users/${user.id}/reset-password`, { method: "POST" });
    const data = await res.json();
    setBusy(false);
    setTempPassword(data.tempPassword);
  }

  async function handleDelete() {
    setBusy(true);
    setDeleteError(null);
    const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
    setBusy(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setDeleteError(data.error ?? "Could not delete user.");
      setConfirmingDelete(false);
      return;
    }

    router.refresh();
  }

  return (
    <tr className="hover:bg-zinc-50">
      <td className="px-4 py-3">
        <p className="font-medium text-zinc-900">{user.name}</p>
        <p className="text-xs text-zinc-500">{user.email}</p>
        {tempPassword && (
          <p className="mt-1 text-xs text-amber-700">
            Temp password: <code className="rounded bg-amber-50 px-1 py-0.5 font-mono">{tempPassword}</code>
          </p>
        )}
        {deleteError && <p className="mt-1 text-xs text-red-600">{deleteError}</p>}
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
            user.role === "ADMIN" ? "bg-indigo-50 text-indigo-700" : "bg-zinc-100 text-zinc-600"
          }`}
        >
          {user.role === "ADMIN" && <ShieldCheck size={12} />}
          {user.role}
        </span>
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
            user.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-zinc-200 text-zinc-600"
          }`}
        >
          {user.status}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        {confirmingDelete ? (
          <div className="flex items-center justify-end gap-1.5">
            <span className="text-xs text-zinc-500">Move to trash?</span>
            <Button onClick={() => setConfirmingDelete(false)} disabled={busy} variant="ghost" size="sm">
              Cancel
            </Button>
            <Button onClick={handleDelete} disabled={busy} variant="danger" size="sm">
              {busy ? "Deleting…" : "Confirm"}
            </Button>
          </div>
        ) : (
          <div className="flex justify-end gap-1.5">
            <Button onClick={toggleRole} disabled={busy} variant="ghost" size="sm">
              Make {user.role === "ADMIN" ? "Agent" : "Admin"}
            </Button>
            <Button onClick={resetPassword} disabled={busy} variant="ghost" size="sm">
              <KeyRound size={13} />
              Reset
            </Button>
            {!isSelf && (
              <>
                <Button onClick={toggleStatus} disabled={busy} variant="danger" size="sm">
                  {user.status === "ACTIVE" ? <UserX size={13} /> : <UserCheck size={13} />}
                  {user.status === "ACTIVE" ? "Deactivate" : "Activate"}
                </Button>
                <Button onClick={() => setConfirmingDelete(true)} disabled={busy} variant="danger" size="sm">
                  <Trash2 size={13} />
                  Delete
                </Button>
              </>
            )}
          </div>
        )}
      </td>
    </tr>
  );
}

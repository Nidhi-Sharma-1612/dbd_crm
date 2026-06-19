"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock } from "lucide-react";
import { LEAD_STATUSES, STATUS_LABELS, STATUS_COLORS, type LeadStatus } from "@/lib/lead-status";
import { Input } from "@/components/ui/input";

function toDateInputValue(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export function StatusSelector({
  contactId,
  status,
  callbackDate,
}: {
  contactId: string;
  status: LeadStatus;
  callbackDate: string | null;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState(status);
  const [date, setDate] = useState(toDateInputValue(callbackDate));
  const [saving, setSaving] = useState(false);

  async function patch(body: Record<string, unknown>) {
    setSaving(true);
    const res = await fetch(`/api/contacts/${contactId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    return res.ok;
  }

  async function setStatus(next: LeadStatus) {
    if (next === current) return;
    const prev = current;
    setCurrent(next);
    const ok = await patch({ status: next });
    if (!ok) {
      setCurrent(prev);
      return;
    }
    router.refresh();
  }

  async function handleDateChange(next: string) {
    setDate(next);
    const ok = await patch({ callbackDate: next || null });
    if (ok) router.refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {LEAD_STATUSES.filter((s) => s !== "NEW").map((s) => {
          const isActive = current === s;
          return (
            <button
              key={s}
              disabled={saving}
              onClick={() => setStatus(s)}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                isActive
                  ? `border-transparent ${STATUS_COLORS[s]} ring-1 ring-inset ring-black/5`
                  : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50"
              }`}
            >
              {STATUS_LABELS[s]}
            </button>
          );
        })}
      </div>

      {current === "CALLBACK" && (
        <div className="mt-3 flex items-center gap-2">
          <CalendarClock size={15} className="text-zinc-400" />
          <label htmlFor="callback-date" className="text-sm text-zinc-600">
            Call back on
          </label>
          <Input
            id="callback-date"
            type="date"
            value={date}
            onChange={(e) => handleDateChange(e.target.value)}
            disabled={saving}
            className="w-auto"
          />
        </div>
      )}
    </div>
  );
}

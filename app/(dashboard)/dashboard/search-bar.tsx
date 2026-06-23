"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, UserPlus, Phone, Mail } from "lucide-react";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { STATUS_LABELS, STATUS_COLORS, type LeadStatus } from "@/lib/lead-status";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Contact = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  status: LeadStatus;
};

function looksLikeEmail(value: string) {
  return value.includes("@");
}

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Contact[] | null>(null);
  const [loading, setLoading] = useState(false);
  const debounced = useDebounce(query, 300);

  useEffect(() => {
    let cancelled = false;
    const term = debounced.trim();

    (async () => {
      if (!term) {
        if (!cancelled) setResults(null);
        return;
      }

      if (!cancelled) setLoading(true);
      const res = await fetch(`/api/contacts?q=${encodeURIComponent(term)}`);
      const data = await res.json();
      if (!cancelled) {
        setResults(data.contacts ?? []);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [debounced]);

  const trimmed = query.trim();
  const showNoMatch = trimmed.length > 0 && !loading && results !== null && results.length === 0;

  function goToCreate() {
    const field = looksLikeEmail(trimmed) ? "email" : "phone";
    router.push(`/contacts/new?${field}=${encodeURIComponent(trimmed)}`);
  }

  return (
    <div className="w-full max-w-xl">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by phone or email…"
          className="w-full rounded-lg border border-zinc-300 bg-white py-3.5 pl-11 pr-4 text-base text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        />
      </div>

      {loading && <p className="mt-3 text-sm text-zinc-400">Searching…</p>}

      {results && results.length > 0 && (
        <Card className="mt-3 divide-y divide-zinc-100 overflow-hidden">
          {results.map((c) => (
            <button
              key={c.id}
              onClick={() => router.push(`/contacts/${c.id}`)}
              className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-zinc-50"
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
            </button>
          ))}
        </Card>
      )}

      {showNoMatch && (
        <div className="mt-3 flex items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <p className="text-sm text-amber-800">No contact found for &quot;{trimmed}&quot;.</p>
          <Button onClick={goToCreate} size="sm">
            <UserPlus size={14} />
            Create new contact
          </Button>
        </div>
      )}
    </div>
  );
}

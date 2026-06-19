"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Papa from "papaparse";
import { UploadCloud } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type ParsedRow = { name?: string; phone?: string; email?: string };
type ImportResult = { created: number; skipped: { row: number; reason: string }[] };

function normalizeHeader(header: string) {
  return header.trim().toLowerCase();
}

export default function ImportContactsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<ParsedRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [importing, setImporting] = useState(false);

  function handleFile(file: File) {
    setError(null);
    setResult(null);
    setFileName(file.name);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: normalizeHeader,
      complete: (results) => {
        const parsed: ParsedRow[] = results.data.map((r) => ({
          name: r.name,
          phone: r.phone,
          email: r.email,
        }));
        if (parsed.length === 0) {
          setError("No rows found in this file.");
          setRows(null);
          return;
        }
        setRows(parsed);
      },
      error: (err) => setError(err.message),
    });
  }

  async function handleImport() {
    if (!rows) return;
    setImporting(true);
    setError(null);

    const res = await fetch("/api/contacts/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows }),
    });

    setImporting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Import failed.");
      return;
    }

    setResult(await res.json());
    setRows(null);
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-1 text-xl font-semibold text-zinc-900">Import contacts</h1>
      <p className="mb-6 text-sm text-zinc-500">
        Upload a CSV with <code className="rounded bg-zinc-100 px-1 py-0.5">Name</code>,{" "}
        <code className="rounded bg-zinc-100 px-1 py-0.5">Phone</code>, and{" "}
        <code className="rounded bg-zinc-100 px-1 py-0.5">Email</code> columns — the same format
        the lead-list export uses.
      </p>

      <Card className="p-6">
        <label
          htmlFor="csv-file"
          className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-zinc-300 py-8 text-center hover:border-indigo-400 hover:bg-indigo-50/30"
        >
          <UploadCloud size={22} className="text-zinc-400" />
          <span className="text-sm text-zinc-600">
            {fileName ?? "Click to choose a CSV file"}
          </span>
          <input
            ref={fileInputRef}
            id="csv-file"
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </label>

        {rows && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-zinc-600">{rows.length} row{rows.length === 1 ? "" : "s"} parsed</p>
            <Button onClick={handleImport} disabled={importing} size="sm">
              {importing ? "Importing…" : "Import"}
            </Button>
          </div>
        )}

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        {result && (
          <div className="mt-4 rounded-md border border-zinc-200 bg-zinc-50 p-4 text-sm">
            <p className="font-medium text-zinc-900">
              Imported {result.created} contact{result.created === 1 ? "" : "s"}.
            </p>
            {result.skipped.length > 0 && (
              <>
                <p className="mt-2 text-zinc-600">{result.skipped.length} row(s) skipped:</p>
                <ul className="mt-1 max-h-48 list-disc overflow-y-auto pl-5 text-zinc-500">
                  {result.skipped.map((s, i) => (
                    <li key={i}>
                      Row {s.row}: {s.reason}
                    </li>
                  ))}
                </ul>
              </>
            )}
            <Link href="/dashboard" className="mt-3 inline-block text-indigo-600 hover:underline">
              Back to search
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}

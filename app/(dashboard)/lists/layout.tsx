"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LIST_SLUGS, STATUS_LABELS } from "@/lib/lead-status";

export default function ListsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div>
      <nav className="mb-6 flex gap-1 overflow-x-auto border-b border-zinc-200">
        {Object.entries(LIST_SLUGS).map(([slug, status]) => {
          const isActive = pathname === `/lists/${slug}`;
          return (
            <Link
              key={slug}
              href={`/lists/${slug}`}
              className={`shrink-0 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "border-indigo-600 text-indigo-700"
                  : "border-transparent text-zinc-500 hover:text-zinc-900"
              }`}
            >
              {STATUS_LABELS[status]}
            </Link>
          );
        })}
      </nav>
      {children}
    </div>
  );
}

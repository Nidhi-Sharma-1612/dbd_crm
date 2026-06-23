import Link from "next/link";
import { UploadCloud, Search } from "lucide-react";
import { SearchBar } from "./search-bar";
import { RecentContacts } from "./recent-contacts";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return (
    <div className="flex flex-col items-center gap-2 pt-6 sm:pt-12 md:pt-16">
      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
        <Search size={22} />
      </span>
      <h1 className="mb-1 text-2xl font-semibold text-zinc-900">Find a contact</h1>
      <p className="mb-5 text-sm text-zinc-500">
        Search by phone number or email before reaching out — partial matches work too.
      </p>
      <SearchBar />
      <Link
        href="/contacts/import"
        className="mt-4 flex items-center gap-1.5 text-sm text-zinc-500 hover:text-indigo-600"
      >
        <UploadCloud size={14} />
        Import contacts from CSV
      </Link>

      <RecentContacts />
    </div>
  );
}

import { PhoneCall } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-zinc-50 to-zinc-100 px-4 py-16">
      <div className="mb-6 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
          <PhoneCall size={18} />
        </span>
        <span className="text-lg font-semibold text-zinc-900">Designbydial CRM</span>
      </div>
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-8 shadow-md">
        {children}
      </div>
    </div>
  );
}

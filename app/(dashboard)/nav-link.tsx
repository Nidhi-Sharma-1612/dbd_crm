"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({
  href,
  icon,
  children,
  activeMatch,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  activeMatch?: string;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || (activeMatch && pathname.startsWith(activeMatch));

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition ${
        isActive
          ? "bg-indigo-50 text-indigo-700"
          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}

"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { PhoneCall, Search, ListChecks, LayoutDashboard, Users, Trash2, History, LogOut, Settings, Menu, X } from "lucide-react";
import { NavLink } from "./nav-link";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Sidebar({
  userName,
  userRole,
  isAdmin,
  signOutForm,
}: {
  userName: string | null | undefined;
  userRole: string | null | undefined;
  isAdmin: boolean;
  signOutForm: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <PhoneCall size={16} />
          </span>
          <span className="font-semibold text-zinc-900">Designbydial CRM</span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="flex h-9 w-9 items-center justify-center rounded-md text-zinc-600 hover:bg-zinc-100"
        >
          <Menu size={20} />
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col border-r border-zinc-200 bg-white transition-transform duration-200 md:static md:z-auto md:w-60 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-2 px-5 py-5">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <PhoneCall size={16} />
            </span>
            <span className="font-semibold text-zinc-900">Designbydial CRM</span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 md:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex flex-col gap-1 px-3">
          <NavLink href="/dashboard" icon={<Search size={16} />}>
            Search
          </NavLink>
          <NavLink href="/lists/interested" icon={<ListChecks size={16} />} activeMatch="/lists">
            Lists
          </NavLink>
          <NavLink href="/account" icon={<Settings size={16} />} activeMatch="/account">
            Account
          </NavLink>
          {isAdmin && (
            <>
              <p className="mb-1 mt-4 px-3 text-xs font-medium uppercase tracking-wide text-zinc-400">
                Admin
              </p>
              <NavLink href="/admin/overview" icon={<LayoutDashboard size={16} />} activeMatch="/admin/overview">
                Overview
              </NavLink>
              <NavLink href="/admin/users" icon={<Users size={16} />} activeMatch="/admin/users">
                Users
              </NavLink>
              <NavLink href="/admin/trash" icon={<Trash2 size={16} />} activeMatch="/admin/trash">
                Trash
              </NavLink>
              <NavLink href="/admin/activity" icon={<History size={16} />} activeMatch="/admin/activity">
                Activity
              </NavLink>
            </>
          )}
        </nav>

        <div className="mt-auto border-t border-zinc-200 p-3">
          <div className="flex items-center gap-2.5 rounded-md px-2 py-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-xs font-semibold text-zinc-600">
              {userName ? initials(userName) : "?"}
            </span>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-zinc-900">{userName}</p>
              <p className="truncate text-xs text-zinc-500">{userRole === "ADMIN" ? "Admin" : "Agent"}</p>
            </div>
            {signOutForm}
          </div>
        </div>
      </aside>
    </>
  );
}

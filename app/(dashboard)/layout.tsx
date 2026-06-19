import { LogOut } from "lucide-react";
import { auth, signOut } from "@/lib/auth";
import { Sidebar } from "./sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 md:flex-row">
      <Sidebar
        userName={session?.user.name}
        userRole={session?.user.role}
        isAdmin={session?.user.role === "ADMIN"}
        signOutForm={
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              title="Sign out"
              aria-label="Sign out"
              className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
            >
              <LogOut size={15} />
            </button>
          </form>
        }
      />

      <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-8">{children}</main>
    </div>
  );
}

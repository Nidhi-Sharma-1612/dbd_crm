import { KeyRound } from "lucide-react";
import { auth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { getInitials } from "@/lib/initials";
import { ChangePasswordForm } from "./change-password-form";

export default async function AccountPage() {
  const session = await auth();

  return (
    <div className="mx-auto max-w-md">
      <PageHeader
        icon={<span className="text-sm font-semibold">{session?.user.name ? getInitials(session.user.name) : "?"}</span>}
        iconClassName="bg-indigo-600 text-white"
        title={session?.user.name ?? "Account"}
        subtitle={
          <>
            {session?.user.email}
            <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
              {session?.user.role === "ADMIN" ? "Admin" : "Agent"}
            </span>
          </>
        }
      />

      <Card className="p-5">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-medium text-zinc-900">
          <KeyRound size={15} className="text-zinc-400" />
          Change password
        </h2>
        <ChangePasswordForm />
      </Card>
    </div>
  );
}

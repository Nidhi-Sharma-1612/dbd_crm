import { auth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { ChangePasswordForm } from "./change-password-form";

export default async function AccountPage() {
  const session = await auth();

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-zinc-900">Account</h1>
        <p className="text-sm text-zinc-500">{session?.user.email}</p>
      </div>

      <Card className="p-5">
        <h2 className="mb-4 text-sm font-medium text-zinc-900">Change password</h2>
        <ChangePasswordForm />
      </Card>
    </div>
  );
}

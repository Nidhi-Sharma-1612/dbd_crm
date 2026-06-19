import Link from "next/link";
import { UserPlus } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { buttonClassName } from "@/components/ui/button";
import { UserRow } from "./user-row";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await auth();

  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true, email: true, role: true, status: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Users</h1>
          <p className="text-sm text-zinc-500">{users.length} account{users.length === 1 ? "" : "s"}</p>
        </div>
        <Link href="/admin/users/new" className={buttonClassName("primary", "sm")}>
          <UserPlus size={14} />
          New user
        </Link>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full min-w-160 text-sm">
          <thead className="bg-zinc-50 text-left text-zinc-500">
            <tr>
              <th className="px-4 py-2.5 font-medium">User</th>
              <th className="px-4 py-2.5 font-medium">Role</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {users.map((user) => (
              <UserRow key={user.id} user={user} isSelf={user.id === session?.user.id} />
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

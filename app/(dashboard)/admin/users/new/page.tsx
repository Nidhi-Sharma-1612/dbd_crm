"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, User, Mail, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export default function NewUserPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"AGENT" | "ADMIN">("AGENT");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not create user.");
      return;
    }

    router.push("/admin/users");
  }

  return (
    <div className="mx-auto max-w-md">
      <PageHeader icon={<UserPlus size={18} />} title="New user" subtitle="Create a login for a new agent or admin." />

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <div className="relative">
              <User size={16} className="pointer-events-none absolute inset-y-0 left-3 my-auto text-zinc-400" />
              <Input id="name" required className="pl-10" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail size={16} className="pointer-events-none absolute inset-y-0 left-3 my-auto text-zinc-400" />
              <Input
                id="email"
                type="email"
                required
                className="pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Temporary password</Label>
            <PasswordInput
              id="password"
              required
              minLength={8}
              leftIcon={<Lock size={16} />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="role">Role</Label>
            <Select id="role" value={role} onChange={(e) => setRole(e.target.value as "AGENT" | "ADMIN")}>
              <option value="AGENT">Agent</option>
              <option value="ADMIN">Admin</option>
            </Select>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={submitting} className="mt-1">
            {submitting ? "Creating…" : "Create user"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

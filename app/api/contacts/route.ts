import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/require-role";
import { searchContacts } from "@/lib/contacts";
import { normalizePhone } from "@/lib/utils/phone";

export async function GET(req: Request) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  if (!q) return NextResponse.json({ contacts: [] });

  const contacts = await searchContacts(q, 10);
  return NextResponse.json({ contacts });
}

const createSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  force: z.boolean().optional(),
});

export async function POST(req: Request) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid contact data" }, { status: 400 });
  }

  const { name, force } = parsed.data;
  const phone = parsed.data.phone ? normalizePhone(parsed.data.phone) : undefined;
  const email = parsed.data.email || undefined;

  if (!phone && !email) {
    return NextResponse.json({ error: "Provide a phone number or email" }, { status: 400 });
  }

  if (!force) {
    const term = phone || email!;
    const candidates = await searchContacts(term, 5);
    if (candidates.length > 0) {
      return NextResponse.json({ duplicates: candidates }, { status: 409 });
    }
  }

  const contact = await prisma.contact.create({
    data: {
      name,
      phone,
      email,
      assignedAgentId: session.user.id,
    },
  });

  return NextResponse.json({ contact }, { status: 201 });
}

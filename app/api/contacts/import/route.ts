import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/require-role";
import { normalizePhone } from "@/lib/utils/phone";

const rowSchema = z.object({
  name: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  email: z.string().optional().default(""),
});

const importSchema = z.object({
  rows: z.array(rowSchema).min(1).max(5000),
});

export async function POST(req: Request) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = importSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid import payload" }, { status: 400 });
  }

  const skipped: { row: number; reason: string }[] = [];
  type Candidate = { row: number; name: string; phone: string | undefined; email: string | undefined };
  const candidates: Candidate[] = [];
  const seenPhones = new Set<string>();
  const seenEmails = new Set<string>();

  parsed.data.rows.forEach((raw, idx) => {
    const rowNum = idx + 1;
    const name = raw.name.trim();
    const phone = raw.phone.trim() ? normalizePhone(raw.phone) : undefined;
    const email = raw.email.trim() ? raw.email.trim().toLowerCase() : undefined;

    if (!name) {
      skipped.push({ row: rowNum, reason: "Missing name" });
      return;
    }
    if (!phone && !email) {
      skipped.push({ row: rowNum, reason: "Missing phone and email" });
      return;
    }
    if (email && !z.string().email().safeParse(email).success) {
      skipped.push({ row: rowNum, reason: "Invalid email" });
      return;
    }
    if ((phone && seenPhones.has(phone)) || (email && seenEmails.has(email))) {
      skipped.push({ row: rowNum, reason: "Duplicate within the uploaded file" });
      return;
    }

    if (phone) seenPhones.add(phone);
    if (email) seenEmails.add(email);
    candidates.push({ row: rowNum, name, phone, email });
  });

  const existing = await prisma.contact.findMany({
    where: {
      deletedAt: null,
      OR: [
        ...(seenPhones.size ? [{ phone: { in: Array.from(seenPhones) } }] : []),
        ...(seenEmails.size ? [{ email: { in: Array.from(seenEmails) } }] : []),
      ],
    },
    select: { phone: true, email: true },
  });
  const existingPhones = new Set(existing.map((c) => c.phone).filter(Boolean));
  const existingEmails = new Set(existing.map((c) => c.email?.toLowerCase()).filter(Boolean));

  const toCreate: Candidate[] = [];
  candidates.forEach((c) => {
    if ((c.phone && existingPhones.has(c.phone)) || (c.email && existingEmails.has(c.email))) {
      skipped.push({ row: c.row, reason: "Already exists in the database" });
      return;
    }
    toCreate.push(c);
  });

  if (toCreate.length > 0) {
    await prisma.contact.createMany({
      data: toCreate.map((c) => ({
        name: c.name,
        phone: c.phone,
        email: c.email,
        assignedAgentId: session.user.id,
      })),
    });
  }

  skipped.sort((a, b) => a.row - b.row);

  return NextResponse.json({ created: toCreate.length, skipped });
}

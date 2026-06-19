import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";

export type AuditTargetType = "User" | "Contact" | "Note";

export async function logAction(params: {
  actorId: string;
  action: string;
  targetType: AuditTargetType;
  targetId: string;
  targetLabel: string;
  metadata?: Record<string, unknown>;
}) {
  await prisma.auditLog.create({
    data: {
      actorId: params.actorId,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      targetLabel: params.targetLabel,
      metadata: params.metadata as Prisma.InputJsonValue | undefined,
    },
  });
}

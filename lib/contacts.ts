import { prisma } from "@/lib/prisma";

export function searchContacts(query: string, limit = 10) {
  return prisma.contact.findMany({
    where: {
      deletedAt: null,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { phone: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ],
    },
    include: { assignedAgent: { select: { name: true } } },
    orderBy: { updatedAt: "desc" },
    take: limit,
  });
}

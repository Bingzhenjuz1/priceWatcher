import { prisma } from "@/lib/db";

export async function listPlatformStatuses() {
  return prisma.platformStatus.findMany({
    orderBy: { platform: "asc" }
  });
}

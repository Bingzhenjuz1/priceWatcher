import { prisma } from "@/lib/db";
import { createSearchSession } from "@/lib/search/searchService";

export type CreateWatchInput = {
  sourceCandidateId?: string;
  query: string;
  targetPrice: number;
};

export type UpdateWatchInput = {
  targetPrice?: number;
  enabled?: boolean;
  checkInterval?: number;
};

export async function createWatch(input: CreateWatchInput) {
  return prisma.watchItem.create({
    data: {
      sourceCandidateId: input.sourceCandidateId,
      query: input.query,
      targetPrice: input.targetPrice
    }
  });
}

export async function listWatches() {
  return prisma.watchItem.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      snapshots: { orderBy: { collectedAt: "desc" }, take: 1 },
      alerts: { where: { readAt: null } }
    }
  });
}

export async function getWatch(id: string) {
  return prisma.watchItem.findUnique({
    where: { id },
    include: {
      snapshots: { orderBy: { collectedAt: "asc" } },
      alerts: { orderBy: { triggeredAt: "desc" } }
    }
  });
}

export async function updateWatch(id: string, input: UpdateWatchInput) {
  return prisma.watchItem.update({
    where: { id },
    data: {
      targetPrice: input.targetPrice,
      enabled: input.enabled,
      checkInterval: input.checkInterval
    }
  });
}

export async function refreshWatch(id: string) {
  const watch = await prisma.watchItem.findUnique({ where: { id } });
  if (!watch || !watch.enabled) {
    throw new Error("监控不存在或未启用");
  }

  const session = await createSearchSession(watch.query);
  const best = [...session.candidates].sort((a, b) => a.price - b.price)[0];

  await prisma.priceSnapshot.create({
    data: {
      watchItemId: watch.id,
      platform: best.platform,
      candidateTitle: best.title,
      price: best.price,
      currency: best.currency,
      productUrl: best.productUrl,
      trustScore: best.trustScore
    }
  });

  const existingUnreadAlert = await prisma.alertEvent.findFirst({
    where: { watchItemId: watch.id, readAt: null, targetPrice: watch.targetPrice }
  });

  if (best.price <= watch.targetPrice && !existingUnreadAlert) {
    await prisma.alertEvent.create({
      data: {
        watchItemId: watch.id,
        platform: best.platform,
        triggerPrice: best.price,
        targetPrice: watch.targetPrice,
        productUrl: best.productUrl
      }
    });
  }

  await prisma.watchItem.update({
    where: { id: watch.id },
    data: { lastCheckedAt: new Date() }
  });

  return prisma.watchItem.findUniqueOrThrow({
    where: { id: watch.id },
    include: {
      snapshots: { orderBy: { collectedAt: "desc" } },
      alerts: { orderBy: { triggeredAt: "desc" } }
    }
  });
}

export async function listAlerts() {
  return prisma.alertEvent.findMany({
    orderBy: { triggeredAt: "desc" },
    include: { watchItem: true }
  });
}

export async function markAlertRead(id: string) {
  return prisma.alertEvent.update({
    where: { id },
    data: { readAt: new Date() }
  });
}

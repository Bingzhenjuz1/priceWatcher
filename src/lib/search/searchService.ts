import { enabledAdapters } from "@/lib/adapters";
import type { PlatformAdapter } from "@/lib/adapters/platformAdapter";
import { prisma } from "@/lib/db";
import { calculateMatchScore } from "@/lib/scoring/matchScore";
import { rankCandidates } from "@/lib/scoring/rankCandidates";
import { calculateTrustScore } from "@/lib/scoring/trustScore";
import type {
  PlatformAdapterStatus,
  PlatformCandidate,
  QueryType,
  ScoredCandidate
} from "@/lib/types";

function detectQueryType(query: string): QueryType {
  return /^https?:\/\//i.test(query) ? "URL" : "KEYWORD";
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    : sorted[mid];
}

function parseJsonArray(value: string): unknown[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseJsonObject(value: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

function scoreCandidates(query: string, candidates: PlatformCandidate[]): ScoredCandidate[] {
  if (candidates.length === 0) {
    return [];
  }

  const medianPrice = median(candidates.map((candidate) => candidate.price));
  return rankCandidates(
    candidates.map((candidate) => {
      const trust = calculateTrustScore(candidate, medianPrice);
      return {
        ...candidate,
        matchScore: calculateMatchScore(query, candidate.title),
        trustScore: trust.score,
        trustReasons: trust.reasons,
        recommendedScore: 0
      };
    })
  );
}

type AdapterRunResult = {
  adapter: PlatformAdapter;
  result: Awaited<ReturnType<PlatformAdapter["search"]>>;
};

export async function createSearchSession(
  query: string,
  adapters: PlatformAdapter[] = enabledAdapters
) {
  const settledResults = await Promise.allSettled(
    adapters.map(async (adapter) => ({
      adapter,
      result: await adapter.search(query)
    }))
  );
  const adapterResults = settledResults
    .filter((settled): settled is PromiseFulfilledResult<AdapterRunResult> => settled.status === "fulfilled")
    .map((settled) => settled.value.result);
  const failedStatuses = settledResults.flatMap((settled, index) => {
    if (settled.status === "fulfilled") {
      return [];
    }

    return [
      {
        platform: adapters[index].platform,
        ok: false,
        latencyMs: 0,
        errorCode: "ADAPTER_ERROR",
        errorMessage: settled.reason instanceof Error ? settled.reason.message : "平台获取失败"
      } satisfies PlatformAdapterStatus
    ];
  });
  const platformStatuses = [
    ...adapterResults.map((result) => result.status),
    ...failedStatuses
  ];

  await Promise.all(
    platformStatuses.map((status) =>
      prisma.platformStatus.upsert({
        where: { platform: status.platform },
        create: {
          platform: status.platform,
          enabled: true,
          lastSuccessAt: status.ok ? new Date() : undefined,
          lastFailureAt: status.ok ? undefined : new Date(),
          lastErrorCode: status.errorCode,
          lastErrorMessage: status.errorMessage,
          averageLatencyMs: status.latencyMs
        },
        update: {
          lastSuccessAt: status.ok ? new Date() : undefined,
          lastFailureAt: status.ok ? undefined : new Date(),
          lastErrorCode: status.errorCode,
          lastErrorMessage: status.errorMessage,
          averageLatencyMs: status.latencyMs
        }
      })
    )
  );
  const candidates = scoreCandidates(
    query,
    adapterResults.flatMap((result) => result.candidates)
  );

  const session = await prisma.searchSession.create({
    data: {
      query,
      queryType: detectQueryType(query),
      resultCount: candidates.length,
      platformStatuses: JSON.stringify(platformStatuses),
      candidates: {
        create: candidates.map((candidate) => ({
          platform: candidate.platform,
          externalId: candidate.externalId,
          title: candidate.title,
          price: candidate.price,
          currency: candidate.currency,
          shopName: candidate.shopName,
          shopType: candidate.shopType,
          salesCount: candidate.salesCount,
          rating: candidate.rating,
          reviewCount: candidate.reviewCount,
          productUrl: candidate.productUrl,
          imageUrl: candidate.imageUrl,
          matchScore: candidate.matchScore,
          trustScore: candidate.trustScore,
          trustReasons: JSON.stringify(candidate.trustReasons),
          rawMetadata: JSON.stringify(candidate.rawMetadata),
          collectedAt: candidate.collectedAt
        }))
      }
    },
    include: { candidates: true }
  });

  return {
    ...session,
    queryType: session.queryType as QueryType,
    platformStatuses,
    candidates: session.candidates.map((candidate) => ({
      ...candidate,
      shopType: candidate.shopType as PlatformCandidate["shopType"],
      trustReasons: parseJsonArray(candidate.trustReasons).map(String),
      rawMetadata: parseJsonObject(candidate.rawMetadata),
      recommendedScore:
        candidates.find((item) => item.externalId === candidate.externalId)?.recommendedScore ?? 0
    }))
  };
}

export async function getSearchSession(id: string) {
  const session = await prisma.searchSession.findUnique({
    where: { id },
    include: {
      candidates: {
        orderBy: [{ trustScore: "desc" }, { price: "asc" }]
      }
    }
  });

  if (!session) {
    return null;
  }

  return {
    ...session,
    queryType: session.queryType as QueryType,
    platformStatuses: parseJsonArray(session.platformStatuses) as PlatformAdapterStatus[],
    candidates: session.candidates.map((candidate) => ({
      ...candidate,
      shopType: candidate.shopType as PlatformCandidate["shopType"],
      trustReasons: parseJsonArray(candidate.trustReasons).map(String),
      rawMetadata: parseJsonObject(candidate.rawMetadata),
      recommendedScore: 0
    }))
  };
}

import { describe, expect, it } from "vitest";
import { rankCandidates } from "@/lib/scoring/rankCandidates";
import type { ScoredCandidate } from "@/lib/types";

function candidate(
  title: string,
  price: number,
  trustScore: number,
  matchScore: number
): ScoredCandidate {
  return {
    platform: title,
    externalId: title,
    title,
    price,
    currency: "CNY",
    shopName: title,
    shopType: "UNKNOWN",
    productUrl: `https://example.com/${title}`,
    rawMetadata: {},
    collectedAt: new Date("2026-05-23T00:00:00.000Z"),
    trustScore,
    matchScore,
    trustReasons: [],
    recommendedScore: 0
  };
}

describe("rankCandidates", () => {
  it("does not rank a suspicious cheap result first by recommendation", () => {
    const ranked = rankCandidates([
      candidate("trusted", 580000, 92, 90),
      candidate("suspicious", 300000, 35, 90)
    ]);

    expect(ranked[0].title).toBe("trusted");
    expect(ranked[0].recommendedScore).toBeGreaterThan(ranked[1].recommendedScore);
  });
});

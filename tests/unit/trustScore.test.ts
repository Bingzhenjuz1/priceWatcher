import { describe, expect, it } from "vitest";
import { calculateTrustScore } from "@/lib/scoring/trustScore";
import type { PlatformCandidate } from "@/lib/types";

const baseCandidate: PlatformCandidate = {
  platform: "JD",
  externalId: "jd-1",
  title: "iPhone 16 256G 黑色",
  price: 599900,
  currency: "CNY",
  shopName: "Apple 京东自营旗舰店",
  shopType: "SELF_OPERATED",
  salesCount: 50000,
  rating: 4.9,
  reviewCount: 20000,
  productUrl: "https://example.com/jd-1",
  imageUrl: "https://example.com/jd-1.jpg",
  rawMetadata: {},
  collectedAt: new Date("2026-05-23T00:00:00.000Z")
};

describe("calculateTrustScore", () => {
  it("scores complete self-operated products highly", () => {
    const result = calculateTrustScore(baseCandidate, 610000);
    expect(result.score).toBeGreaterThanOrEqual(85);
    expect(result.reasons).toContain("自营或旗舰店");
  });

  it("downgrades very low prices compared with median", () => {
    const result = calculateTrustScore({ ...baseCandidate, price: 299900 }, 610000);
    expect(result.score).toBeLessThan(85);
    expect(result.reasons).toContain("价格显著低于同类中位价");
  });

  it("downgrades sparse review information", () => {
    const result = calculateTrustScore(
      {
        ...baseCandidate,
        shopType: "UNKNOWN",
        rating: undefined,
        reviewCount: undefined,
        salesCount: undefined
      },
      610000
    );
    expect(result.score).toBeLessThan(70);
    expect(result.reasons).toContain("评价信息不足");
  });
});

import { describe, expect, it } from "vitest";
import { createSearchSession, getSearchSession } from "@/lib/search/searchService";
import type { PlatformAdapter } from "@/lib/adapters/platformAdapter";
import type { PlatformCandidate } from "@/lib/types";

const sampleCandidate: PlatformCandidate = {
  platform: "OK",
  externalId: "ok-1",
  title: "Apple iPhone 16 256G 黑色",
  price: 599900,
  currency: "CNY",
  shopName: "OK 自营店",
  shopType: "SELF_OPERATED",
  salesCount: 1000,
  rating: 4.9,
  reviewCount: 1000,
  productUrl: "https://example.com/ok-1",
  imageUrl: "https://example.com/ok-1.jpg",
  rawMetadata: { source: "test" },
  collectedAt: new Date("2026-05-31T00:00:00.000Z")
};

describe("search service", () => {
  it("creates a search session with ranked candidates", async () => {
    const session = await createSearchSession("iPhone 16 256G");

    expect(session.query).toBe("iPhone 16 256G");
    expect(session.candidates.length).toBe(3);
    expect(session.candidates[0].recommendedScore).toBeGreaterThan(0);
    expect(session.candidates[0].rawMetadata).toEqual({ source: "sample" });
    expect(session.platformStatuses.length).toBe(3);

    const fetched = await getSearchSession(session.id);
    expect(fetched?.id).toBe(session.id);
    expect(fetched?.candidates.length).toBe(3);
  });

  it("keeps successful platform results when one adapter fails", async () => {
    const okAdapter: PlatformAdapter = {
      platform: "OK",
      async search() {
        return {
          platform: "OK",
          candidates: [sampleCandidate],
          status: { platform: "OK", ok: true, latencyMs: 1 }
        };
      }
    };
    const failingAdapter: PlatformAdapter = {
      platform: "Broken",
      async search() {
        throw new Error("platform unavailable");
      }
    };

    const session = await createSearchSession("iPhone 16 256G", [okAdapter, failingAdapter]);

    expect(session.candidates).toHaveLength(1);
    expect(session.platformStatuses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ platform: "OK", ok: true }),
        expect.objectContaining({
          platform: "Broken",
          ok: false,
          errorCode: "ADAPTER_ERROR",
          errorMessage: "platform unavailable"
        })
      ])
    );

    const fetched = await getSearchSession(session.id);
    expect(fetched?.candidates).toHaveLength(1);
    expect(fetched?.platformStatuses).toEqual(
      expect.arrayContaining([expect.objectContaining({ platform: "Broken", ok: false })])
    );
  });
});

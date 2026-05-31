import { describe, expect, it } from "vitest";
import { createSearchSession, getSearchSession } from "@/lib/search/searchService";

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
});

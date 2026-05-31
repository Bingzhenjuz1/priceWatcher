import { describe, expect, it } from "vitest";
import { createSearchSession } from "@/lib/search/searchService";
import { createWatch, refreshWatch, updateWatch } from "@/lib/watch/watchService";

describe("watch service", () => {
  it("creates snapshots and alert when refreshed price is below target", async () => {
    const session = await createSearchSession("iPhone 16 256G");
    const candidate = session.candidates[0];
    const watch = await createWatch({
      sourceCandidateId: candidate.id,
      query: session.query,
      targetPrice: candidate.price + 10000
    });

    const refreshed = await refreshWatch(watch.id);
    expect(refreshed.snapshots.length).toBeGreaterThan(0);
    expect(refreshed.alerts.length).toBe(1);
    expect(refreshed.alerts[0].triggerPrice).toBeLessThanOrEqual(watch.targetPrice);
  });

  it("updates target price and enabled state", async () => {
    const session = await createSearchSession("iPhone 16 256G");
    const candidate = session.candidates[0];
    const watch = await createWatch({
      sourceCandidateId: candidate.id,
      query: session.query,
      targetPrice: candidate.price + 10000
    });

    const updated = await updateWatch(watch.id, {
      targetPrice: candidate.price - 10000,
      enabled: false
    });

    expect(updated.targetPrice).toBe(candidate.price - 10000);
    expect(updated.enabled).toBe(false);
    await expect(refreshWatch(watch.id)).rejects.toThrow("监控不存在或未启用");
  });
});

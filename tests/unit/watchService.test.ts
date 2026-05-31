import { describe, expect, it } from "vitest";
import { createSearchSession } from "@/lib/search/searchService";
import {
  createWatch,
  refreshDueWatches,
  refreshWatch,
  updateWatch
} from "@/lib/watch/watchService";

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

  it("refreshes only enabled watches that are due", async () => {
    const session = await createSearchSession("iPhone 16 256G");
    const candidate = session.candidates[0];
    const dueWatch = await createWatch({
      sourceCandidateId: candidate.id,
      query: session.query,
      targetPrice: candidate.price + 10000
    });
    const freshWatch = await createWatch({
      sourceCandidateId: candidate.id,
      query: session.query,
      targetPrice: candidate.price + 10000
    });
    const disabledWatch = await createWatch({
      sourceCandidateId: candidate.id,
      query: session.query,
      targetPrice: candidate.price + 10000
    });

    await updateWatch(freshWatch.id, { checkInterval: 3600 });
    await updateWatch(disabledWatch.id, { enabled: false });
    await refreshWatch(freshWatch.id);

    const result = await refreshDueWatches({ now: new Date() });

    expect(result.refreshedIds).toContain(dueWatch.id);
    expect(result.refreshedIds).not.toContain(freshWatch.id);
    expect(result.refreshedIds).not.toContain(disabledWatch.id);
    expect(result.failed).toEqual([]);
  });
});

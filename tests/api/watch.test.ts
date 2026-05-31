import { describe, expect, it } from "vitest";
import { createSearchSession } from "@/lib/search/searchService";
import {
  createWatch,
  listAlerts,
  markAlertRead,
  refreshWatch
} from "@/lib/watch/watchService";

describe("watch api service functions", () => {
  it("creates alert and marks it read", async () => {
    const session = await createSearchSession("iPhone 16 256G");
    const candidate = session.candidates[0];
    const watch = await createWatch({
      sourceCandidateId: candidate.id,
      query: session.query,
      targetPrice: candidate.price + 5000
    });

    await refreshWatch(watch.id);
    const alerts = await listAlerts();
    const alert = alerts.find((item) => item.watchItemId === watch.id);
    expect(alert).toBeDefined();

    const read = await markAlertRead(alert!.id);
    expect(read.readAt).toBeTruthy();
  });
});

import { describe, expect, it } from "vitest";
import type { PlatformAdapter } from "@/lib/adapters/platformAdapter";
import { createSearchSession } from "@/lib/search/searchService";
import { listPlatformStatuses } from "@/lib/platform/platformStatusService";

describe("platform status service", () => {
  it("lists successful platform status records after search", async () => {
    await createSearchSession("iPhone 16 256G");

    const statuses = await listPlatformStatuses();

    expect(statuses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ platform: "JD", enabled: true }),
        expect.objectContaining({ platform: "PDD", enabled: true }),
        expect.objectContaining({ platform: "Taobao", enabled: true })
      ])
    );
    expect(statuses.find((status) => status.platform === "JD")?.lastSuccessAt).toBeInstanceOf(
      Date
    );
  });

  it("lists failed platform status records with error details", async () => {
    const failingAdapter: PlatformAdapter = {
      platform: "Broken",
      async search() {
        throw new Error("platform unavailable");
      }
    };

    await createSearchSession("iPhone 16 256G", [failingAdapter]);

    const statuses = await listPlatformStatuses();

    expect(statuses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          platform: "Broken",
          enabled: true,
          lastFailureAt: expect.any(Date),
          lastErrorCode: "ADAPTER_ERROR",
          lastErrorMessage: "platform unavailable"
        })
      ])
    );
  });
});

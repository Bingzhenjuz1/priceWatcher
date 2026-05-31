import { sampleCatalog } from "@/lib/adapters/sampleData";
import type { PlatformAdapter } from "@/lib/adapters/platformAdapter";

export const jdAdapter: PlatformAdapter = {
  platform: "JD",
  async search() {
    const startedAt = Date.now();
    return {
      platform: "JD",
      candidates: sampleCatalog.JD.map((item) => ({ ...item, collectedAt: new Date() })),
      status: { platform: "JD", ok: true, latencyMs: Date.now() - startedAt }
    };
  }
};

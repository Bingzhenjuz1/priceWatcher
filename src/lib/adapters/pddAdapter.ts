import { sampleCatalog } from "@/lib/adapters/sampleData";
import type { PlatformAdapter } from "@/lib/adapters/platformAdapter";

export const pddAdapter: PlatformAdapter = {
  platform: "PDD",
  async search() {
    const startedAt = Date.now();
    return {
      platform: "PDD",
      candidates: sampleCatalog.PDD.map((item) => ({ ...item, collectedAt: new Date() })),
      status: { platform: "PDD", ok: true, latencyMs: Date.now() - startedAt }
    };
  }
};

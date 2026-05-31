import { sampleCatalog } from "@/lib/adapters/sampleData";
import type { PlatformAdapter } from "@/lib/adapters/platformAdapter";

export const taobaoAdapter: PlatformAdapter = {
  platform: "Taobao",
  async search() {
    const startedAt = Date.now();
    return {
      platform: "Taobao",
      candidates: sampleCatalog.Taobao.map((item) => ({
        ...item,
        collectedAt: new Date()
      })),
      status: { platform: "Taobao", ok: true, latencyMs: Date.now() - startedAt }
    };
  }
};

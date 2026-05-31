import type { AdapterResult } from "@/lib/types";

export type PlatformAdapter = {
  platform: string;
  search(query: string): Promise<AdapterResult>;
};

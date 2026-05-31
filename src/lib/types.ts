export type QueryType = "KEYWORD" | "URL";

export type ShopType =
  | "SELF_OPERATED"
  | "FLAGSHIP"
  | "BRAND"
  | "MARKETPLACE"
  | "UNKNOWN";

export type PlatformCandidate = {
  platform: string;
  externalId: string;
  title: string;
  price: number;
  currency: "CNY";
  shopName: string;
  shopType: ShopType;
  salesCount?: number;
  rating?: number;
  reviewCount?: number;
  productUrl: string;
  imageUrl?: string;
  rawMetadata: Record<string, unknown>;
  collectedAt: Date;
};

export type AdapterResult = {
  platform: string;
  candidates: PlatformCandidate[];
  status: PlatformAdapterStatus;
};

export type PlatformAdapterStatus = {
  platform: string;
  ok: boolean;
  latencyMs: number;
  errorCode?: string;
  errorMessage?: string;
};

export type ScoredCandidate = PlatformCandidate & {
  matchScore: number;
  trustScore: number;
  trustReasons: string[];
  recommendedScore: number;
};

import type { PlatformCandidate } from "@/lib/types";

type SampleItem = Omit<PlatformCandidate, "collectedAt">;

export const sampleCatalog: Record<string, SampleItem[]> = {
  JD: [
    {
      platform: "JD",
      externalId: "jd-iphone-16-256-black",
      title: "Apple iPhone 16 256G 黑色 京东自营",
      price: 599900,
      currency: "CNY",
      shopName: "Apple 京东自营旗舰店",
      shopType: "SELF_OPERATED",
      salesCount: 50000,
      rating: 4.9,
      reviewCount: 23000,
      productUrl: "https://example.com/jd/iphone-16-256-black",
      imageUrl: "https://placehold.co/320x240?text=JD+iPhone",
      rawMetadata: { source: "sample" }
    }
  ],
  PDD: [
    {
      platform: "PDD",
      externalId: "pdd-iphone-16-256-black",
      title: "Apple iPhone16 256G 黑色 百亿补贴",
      price: 569900,
      currency: "CNY",
      shopName: "品牌好货店",
      shopType: "MARKETPLACE",
      salesCount: 18000,
      rating: 4.6,
      reviewCount: 7200,
      productUrl: "https://example.com/pdd/iphone-16-256-black",
      imageUrl: "https://placehold.co/320x240?text=PDD+iPhone",
      rawMetadata: { source: "sample" }
    }
  ],
  Taobao: [
    {
      platform: "Taobao",
      externalId: "tb-iphone-16-256-black",
      title: "Apple iPhone 16 256GB 黑色 天猫旗舰店",
      price: 609900,
      currency: "CNY",
      shopName: "Apple Store 官方旗舰店",
      shopType: "FLAGSHIP",
      salesCount: 32000,
      rating: 4.9,
      reviewCount: 15000,
      productUrl: "https://example.com/taobao/iphone-16-256-black",
      imageUrl: "https://placehold.co/320x240?text=Taobao+iPhone",
      rawMetadata: { source: "sample" }
    }
  ]
};

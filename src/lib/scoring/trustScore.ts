import type { PlatformCandidate } from "@/lib/types";

export function calculateTrustScore(
  candidate: PlatformCandidate,
  medianPrice: number
): { score: number; reasons: string[] } {
  let score = 45;
  const reasons: string[] = [];

  if (candidate.shopType === "SELF_OPERATED" || candidate.shopType === "FLAGSHIP") {
    score += 20;
    reasons.push("自营或旗舰店");
  } else if (candidate.shopType === "BRAND") {
    score += 14;
    reasons.push("品牌店铺");
  }

  if ((candidate.reviewCount ?? 0) >= 1000 && (candidate.rating ?? 0) >= 4.7) {
    score += 15;
    reasons.push("评价数量和评分较好");
  } else if (candidate.reviewCount == null || candidate.rating == null) {
    score -= 12;
    reasons.push("评价信息不足");
  }

  if ((candidate.salesCount ?? 0) >= 10000) {
    score += 10;
    reasons.push("销量较高");
  } else if (candidate.salesCount == null) {
    score -= 6;
    reasons.push("销量信息不足");
  }

  if (candidate.price < medianPrice * 0.65) {
    score -= 25;
    reasons.push("价格显著低于同类中位价");
  } else if (candidate.price <= medianPrice) {
    score += 5;
    reasons.push("价格不高于同类中位价");
  }

  if (candidate.imageUrl && candidate.shopName && candidate.productUrl) {
    score += 5;
    reasons.push("商品信息完整");
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    reasons
  };
}

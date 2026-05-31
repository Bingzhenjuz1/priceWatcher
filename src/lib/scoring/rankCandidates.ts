import type { ScoredCandidate } from "@/lib/types";

export function rankCandidates(candidates: ScoredCandidate[]): ScoredCandidate[] {
  if (candidates.length === 0) {
    return [];
  }

  const lowestPrice = Math.min(...candidates.map((candidate) => candidate.price));

  return candidates
    .map((candidate) => {
      const priceAdvantage = Math.min(100, Math.round((lowestPrice / candidate.price) * 100));
      const recommendedScore = Math.round(
        candidate.trustScore * 0.45 + candidate.matchScore * 0.35 + priceAdvantage * 0.2
      );

      return { ...candidate, recommendedScore };
    })
    .sort((a, b) => b.recommendedScore - a.recommendedScore);
}

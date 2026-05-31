"use client";

import { useMemo, useState } from "react";
import { ResultCard, type CandidateView } from "@/components/ResultCard";
import { SortControl, type SortMode } from "@/components/SortControl";

export function SearchResults({
  query,
  candidates
}: {
  query: string;
  candidates: CandidateView[];
}) {
  const [sort, setSort] = useState<SortMode>("recommended");
  const sorted = useMemo(() => {
    return [...candidates].sort((a, b) => {
      if (sort === "price") return a.price - b.price;
      if (sort === "trust") return b.trustScore - a.trustScore;
      if (sort === "sales") return (b.salesCount ?? 0) - (a.salesCount ?? 0);
      return b.trustScore + b.matchScore - (a.trustScore + a.matchScore);
    });
  }, [candidates, sort]);

  return (
    <div className="space-y-4">
      <SortControl value={sort} onChange={setSort} />
      {sorted.map((candidate) => (
        <ResultCard key={candidate.id} candidate={candidate} query={query} />
      ))}
    </div>
  );
}

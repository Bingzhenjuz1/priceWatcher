"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function WatchForm({
  candidateId,
  query,
  defaultPrice
}: {
  candidateId: string;
  query: string;
  defaultPrice: number;
}) {
  const router = useRouter();
  const [targetPrice, setTargetPrice] = useState(Math.floor(defaultPrice / 100));

  async function createWatch() {
    const response = await fetch("/api/watches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sourceCandidateId: candidateId,
        query,
        targetPrice: targetPrice * 100
      })
    });
    const watch = await response.json();
    router.push(`/watch/${watch.id}`);
  }

  return (
    <div className="space-y-2">
      <input
        aria-label="目标价"
        type="number"
        value={targetPrice}
        onChange={(event) => setTargetPrice(Number(event.target.value))}
        className="h-10 w-full rounded-md border border-line px-3"
      />
      <button
        type="button"
        onClick={createWatch}
        className="h-10 w-full rounded-md bg-ink px-3 text-sm font-medium text-white"
      >
        监控目标价
      </button>
    </div>
  );
}

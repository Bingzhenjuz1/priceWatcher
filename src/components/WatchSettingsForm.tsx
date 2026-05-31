"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";

export function WatchSettingsForm({
  watchId,
  targetPrice,
  enabled
}: {
  watchId: string;
  targetPrice: number;
  enabled: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [price, setPrice] = useState(Math.floor(targetPrice / 100));
  const [isEnabled, setIsEnabled] = useState(enabled);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      await fetch(`/api/watches/${watchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetPrice: price * 100,
          enabled: isEnabled
        })
      });
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="grid gap-3 rounded-md border border-line bg-white p-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
      <label className="grid gap-1 text-sm text-muted">
        目标价
        <input
          type="number"
          min="1"
          value={price}
          onChange={(event) => setPrice(Number(event.target.value))}
          className="h-10 rounded-md border border-line px-3 text-ink"
        />
      </label>
      <label className="flex h-10 items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={isEnabled}
          onChange={(event) => setIsEnabled(event.target.checked)}
          className="h-4 w-4"
        />
        启用监控
      </label>
      <button
        type="submit"
        disabled={pending}
        className="h-10 rounded-md bg-ink px-4 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "保存中" : "保存设置"}
      </button>
    </form>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function RefreshWatchButton({ watchId }: { watchId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function refresh() {
    startTransition(async () => {
      await fetch(`/api/watches/${watchId}/refresh`, { method: "POST" });
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={refresh}
      disabled={pending}
      className="rounded-md bg-accent px-4 py-2 text-white disabled:opacity-60"
    >
      {pending ? "刷新中" : "刷新价格"}
    </button>
  );
}

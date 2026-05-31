"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { formatCny } from "@/lib/money";

type AlertView = {
  id: string;
  platform: string;
  triggerPrice: number;
  targetPrice: number;
  productUrl: string;
  triggeredAt: string;
  readAt: string | null;
  watchItem: { query: string };
};

export function AlertList({ alerts }: { alerts: AlertView[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function markRead(id: string) {
    startTransition(async () => {
      await fetch(`/api/alerts/${id}/read`, { method: "POST" });
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <article key={alert.id} className="rounded-md border border-line bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-ink">{alert.watchItem.query}</h2>
              <p className="mt-1 text-sm text-muted">
                {alert.platform} 价格 {formatCny(alert.triggerPrice)}，目标价{" "}
                {formatCny(alert.targetPrice)}
              </p>
              <p className="mt-1 text-xs text-muted">
                {new Date(alert.triggeredAt).toLocaleString("zh-CN")}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted">{alert.readAt ? "已读" : "未读"}</span>
              {!alert.readAt && (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => markRead(alert.id)}
                  className="rounded-md border border-line px-3 py-2 text-sm text-ink disabled:opacity-60"
                >
                  标记已读
                </button>
              )}
            </div>
          </div>
        </article>
      ))}
      {alerts.length === 0 && (
        <p className="rounded-md border border-line bg-white p-4 text-sm text-muted">暂无提醒</p>
      )}
    </div>
  );
}

import { formatCny } from "@/lib/money";

type AlertView = {
  id: string;
  platform: string;
  triggerPrice: number;
  targetPrice: number;
  productUrl: string;
  triggeredAt: Date;
  readAt: Date | null;
  watchItem: { query: string };
};

export function AlertList({ alerts }: { alerts: AlertView[] }) {
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
            </div>
            <span className="text-sm text-muted">{alert.readAt ? "已读" : "未读"}</span>
          </div>
        </article>
      ))}
    </div>
  );
}

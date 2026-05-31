import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { PriceHistoryChart } from "@/components/PriceHistoryChart";
import { formatCny } from "@/lib/money";
import { getWatch, refreshWatch } from "@/lib/watch/watchService";

export const dynamic = "force-dynamic";

export default async function WatchPage({ params }: { params: { id: string } }) {
  const watch = await getWatch(params.id);
  if (!watch) notFound();

  async function refresh() {
    "use server";
    await refreshWatch(params.id);
    revalidatePath(`/watch/${params.id}`);
  }

  const latest = watch.snapshots[watch.snapshots.length - 1];

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">{watch.query}</h1>
          <p className="mt-1 text-sm text-muted">目标价 {formatCny(watch.targetPrice)}</p>
          {latest && <p className="mt-1 text-sm text-muted">当前最优价 {formatCny(latest.price)}</p>}
        </div>
        <form action={refresh}>
          <button className="rounded-md bg-accent px-4 py-2 text-white">刷新价格</button>
        </form>
      </div>
      <PriceHistoryChart data={watch.snapshots} />
      <section className="rounded-md border border-line bg-white p-4">
        <h2 className="font-semibold">提醒记录</h2>
        <div className="mt-3 space-y-2">
          {watch.alerts.map((alert) => (
            <div key={alert.id} className="text-sm text-muted">
              {alert.platform} 在 {new Date(alert.triggeredAt).toLocaleString("zh-CN")} 触发，价格{" "}
              {formatCny(alert.triggerPrice)}
            </div>
          ))}
          {watch.alerts.length === 0 && <div className="text-sm text-muted">暂无提醒</div>}
        </div>
      </section>
    </div>
  );
}

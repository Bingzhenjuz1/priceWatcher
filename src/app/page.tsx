import Link from "next/link";
import { SearchBox } from "@/components/SearchBox";
import { formatCny } from "@/lib/money";
import { listWatches } from "@/lib/watch/watchService";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const watches = await listWatches();

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold text-ink">搜索商品，全网比价</h1>
        <SearchBox />
      </section>
      <section>
        <h2 className="mb-3 text-lg font-semibold text-ink">正在监控</h2>
        <div className="grid gap-3">
          {watches.map((watch) => (
            <Link
              key={watch.id}
              href={`/watch/${watch.id}`}
              className="rounded-md border border-line bg-white p-4"
            >
              <div className="font-medium">{watch.query}</div>
              <div className="mt-1 text-sm text-muted">目标价 {formatCny(watch.targetPrice)}</div>
            </Link>
          ))}
          {watches.length === 0 && (
            <p className="rounded-md border border-line bg-white p-4 text-sm text-muted">
              暂无监控商品
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

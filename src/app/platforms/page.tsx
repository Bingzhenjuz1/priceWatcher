import { PlatformStatusList } from "@/components/PlatformStatusList";
import { listPlatformStatuses } from "@/lib/platform/platformStatusService";

export const dynamic = "force-dynamic";

export default async function PlatformsPage() {
  const statuses = await listPlatformStatuses();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-ink">平台状态</h1>
        <p className="mt-2 text-sm text-muted">
          查看各平台最近一次搜索是否成功、响应耗时和失败原因。
        </p>
      </div>
      <PlatformStatusList statuses={statuses} />
    </div>
  );
}

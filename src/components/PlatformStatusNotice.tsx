import type { PlatformAdapterStatus } from "@/lib/types";

export function PlatformStatusNotice({ statuses }: { statuses: PlatformAdapterStatus[] }) {
  const failed = statuses.filter((status) => !status.ok);

  if (failed.length === 0) {
    return null;
  }

  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
      <div className="font-semibold">部分平台暂时获取失败</div>
      <ul className="mt-2 space-y-1">
        {failed.map((status) => (
          <li key={status.platform}>
            {status.platform}：{status.errorMessage ?? "稍后重试"}
          </li>
        ))}
      </ul>
    </div>
  );
}

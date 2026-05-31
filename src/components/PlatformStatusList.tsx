import type { PlatformStatus } from "@prisma/client";

function formatDate(value: Date | null) {
  if (!value) {
    return "暂无";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(value);
}

function getStatusTone(status: PlatformStatus) {
  if (!status.enabled) {
    return "bg-slate-100 text-muted";
  }

  if (status.lastFailureAt && (!status.lastSuccessAt || status.lastFailureAt > status.lastSuccessAt)) {
    return "bg-red-50 text-red-700";
  }

  return "bg-emerald-50 text-emerald-700";
}

function getStatusLabel(status: PlatformStatus) {
  if (!status.enabled) {
    return "已停用";
  }

  if (status.lastFailureAt && (!status.lastSuccessAt || status.lastFailureAt > status.lastSuccessAt)) {
    return "异常";
  }

  return "正常";
}

export function PlatformStatusList({ statuses }: { statuses: PlatformStatus[] }) {
  if (statuses.length === 0) {
    return (
      <p className="rounded-md border border-line bg-white p-4 text-sm text-muted">
        暂无平台状态，完成一次搜索后会显示各平台连接情况。
      </p>
    );
  }

  return (
    <div className="grid gap-3">
      {statuses.map((status) => (
        <article key={status.platform} className="rounded-md border border-line bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-ink">{status.platform}</h2>
              <p className="mt-1 text-sm text-muted">
                最近成功 {formatDate(status.lastSuccessAt)} · 最近失败 {formatDate(status.lastFailureAt)}
              </p>
            </div>
            <span className={`rounded px-2 py-1 text-sm font-medium ${getStatusTone(status)}`}>
              {getStatusLabel(status)}
            </span>
          </div>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-muted">平均耗时</dt>
              <dd className="mt-1 font-medium text-ink">
                {status.averageLatencyMs === null ? "暂无" : `${status.averageLatencyMs} ms`}
              </dd>
            </div>
            <div>
              <dt className="text-muted">错误代码</dt>
              <dd className="mt-1 font-medium text-ink">{status.lastErrorCode ?? "无"}</dd>
            </div>
            <div>
              <dt className="text-muted">错误信息</dt>
              <dd className="mt-1 font-medium text-ink">{status.lastErrorMessage ?? "无"}</dd>
            </div>
          </dl>
        </article>
      ))}
    </div>
  );
}

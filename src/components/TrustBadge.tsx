export function TrustBadge({ score, reasons }: { score: number; reasons: string[] }) {
  const tone =
    score >= 80
      ? "bg-emerald-50 text-emerald-700"
      : score >= 60
        ? "bg-amber-50 text-amber-700"
        : "bg-red-50 text-red-700";

  return (
    <div className={`rounded-md px-3 py-2 text-sm ${tone}`}>
      <div className="font-semibold">可信度 {score}</div>
      <div className="mt-1 text-xs">{reasons.slice(0, 2).join(" / ") || "信息较少"}</div>
    </div>
  );
}

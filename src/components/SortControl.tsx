"use client";

export type SortMode = "recommended" | "price" | "trust" | "sales";

export function SortControl({
  value,
  onChange
}: {
  value: SortMode;
  onChange: (value: SortMode) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {[
        ["recommended", "综合推荐"],
        ["price", "最低价"],
        ["trust", "可信度"],
        ["sales", "销量"]
      ].map(([mode, label]) => (
        <button
          key={mode}
          onClick={() => onChange(mode as SortMode)}
          className={`rounded-md border px-3 py-2 text-sm ${
            value === mode
              ? "border-accent bg-accent text-white"
              : "border-line bg-white text-ink"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

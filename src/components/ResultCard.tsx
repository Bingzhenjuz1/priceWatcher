import { formatCny } from "@/lib/money";
import { TrustBadge } from "@/components/TrustBadge";
import { WatchForm } from "@/components/WatchForm";
import Image from "next/image";

export type CandidateView = {
  id: string;
  platform: string;
  title: string;
  price: number;
  shopName: string;
  salesCount: number | null;
  rating: number | null;
  reviewCount: number | null;
  productUrl: string;
  imageUrl: string | null;
  trustScore: number;
  matchScore: number;
  trustReasons: unknown;
};

export function ResultCard({ candidate, query }: { candidate: CandidateView; query: string }) {
  const reasons = Array.isArray(candidate.trustReasons) ? candidate.trustReasons.map(String) : [];

  return (
    <article className="grid gap-4 rounded-md border border-line bg-white p-4 md:grid-cols-[160px_1fr_220px]">
      <Image
        src={candidate.imageUrl ?? "https://placehold.co/320x240?text=Product"}
        alt=""
        width={320}
        height={240}
        unoptimized
        className="h-36 w-full rounded-md object-cover"
      />
      <div>
        <div className="text-sm font-medium text-accent">{candidate.platform}</div>
        <h2 className="mt-1 text-lg font-semibold text-ink">{candidate.title}</h2>
        <p className="mt-2 text-sm text-muted">{candidate.shopName}</p>
        <p className="mt-2 text-sm text-muted">
          销量 {candidate.salesCount ?? "未知"} · 评分 {candidate.rating ?? "未知"} · 评价{" "}
          {candidate.reviewCount ?? "未知"} · 匹配 {candidate.matchScore}
        </p>
        <a
          href={candidate.productUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block text-sm text-accent"
        >
          打开商品
        </a>
      </div>
      <div className="space-y-3">
        <div className="text-2xl font-bold text-ink">{formatCny(candidate.price)}</div>
        <TrustBadge score={candidate.trustScore} reasons={reasons} />
        <WatchForm candidateId={candidate.id} query={query} defaultPrice={candidate.price} />
      </div>
    </article>
  );
}

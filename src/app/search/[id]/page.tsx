import { SearchResults } from "@/components/SearchResults";
import { getSearchSession } from "@/lib/search/searchService";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SearchResultsPage({ params }: { params: { id: string } }) {
  const session = await getSearchSession(params.id);
  if (!session) notFound();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-ink">比价结果</h1>
        <p className="mt-1 text-sm text-muted">搜索：{session.query}</p>
      </div>
      <SearchResults query={session.query} candidates={session.candidates} />
    </div>
  );
}

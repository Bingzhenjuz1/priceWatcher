import { NextResponse } from "next/server";
import { getSearchSession } from "@/lib/search/searchService";

export async function GET(_request: Request, context: { params: { id: string } }) {
  const session = await getSearchSession(context.params.id);
  if (!session) {
    return NextResponse.json({ error: "搜索记录不存在" }, { status: 404 });
  }

  return NextResponse.json(session);
}

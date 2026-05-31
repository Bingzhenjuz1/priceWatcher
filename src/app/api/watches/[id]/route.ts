import { NextResponse } from "next/server";
import { getWatch } from "@/lib/watch/watchService";

export async function GET(_request: Request, context: { params: { id: string } }) {
  const watch = await getWatch(context.params.id);
  if (!watch) {
    return NextResponse.json({ error: "监控不存在" }, { status: 404 });
  }

  return NextResponse.json(watch);
}

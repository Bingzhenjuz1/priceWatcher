import { NextResponse } from "next/server";
import { refreshWatch } from "@/lib/watch/watchService";

export async function POST(_request: Request, context: { params: { id: string } }) {
  try {
    return NextResponse.json(await refreshWatch(context.params.id));
  } catch {
    return NextResponse.json({ error: "刷新监控失败" }, { status: 400 });
  }
}

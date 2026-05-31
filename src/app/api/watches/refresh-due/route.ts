import { NextResponse } from "next/server";
import { refreshDueWatches } from "@/lib/watch/watchService";

export async function POST() {
  return NextResponse.json(await refreshDueWatches());
}

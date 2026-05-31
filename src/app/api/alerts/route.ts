import { NextResponse } from "next/server";
import { listAlerts } from "@/lib/watch/watchService";

export async function GET() {
  return NextResponse.json(await listAlerts());
}

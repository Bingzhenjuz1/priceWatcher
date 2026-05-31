import { NextResponse } from "next/server";
import { listPlatformStatuses } from "@/lib/platform/platformStatusService";

export async function GET() {
  return NextResponse.json(await listPlatformStatuses());
}

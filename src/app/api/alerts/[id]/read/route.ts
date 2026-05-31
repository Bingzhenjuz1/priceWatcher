import { NextResponse } from "next/server";
import { markAlertRead } from "@/lib/watch/watchService";

export async function POST(_request: Request, context: { params: { id: string } }) {
  return NextResponse.json(await markAlertRead(context.params.id));
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { createWatch, listWatches } from "@/lib/watch/watchService";

const createWatchSchema = z.object({
  sourceCandidateId: z.string().optional(),
  query: z.string().min(1),
  targetPrice: z.number().int().positive()
});

export async function GET() {
  return NextResponse.json(await listWatches());
}

export async function POST(request: Request) {
  const body = createWatchSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "监控参数无效" }, { status: 400 });
  }

  return NextResponse.json(await createWatch(body.data), { status: 201 });
}

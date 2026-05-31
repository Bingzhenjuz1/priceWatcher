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
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "监控参数无效" }, { status: 400 });
  }

  const body = createWatchSchema.safeParse(json);
  if (!body.success) {
    return NextResponse.json({ error: "监控参数无效" }, { status: 400 });
  }

  return NextResponse.json(await createWatch(body.data), { status: 201 });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { getWatch, updateWatch } from "@/lib/watch/watchService";

const updateWatchSchema = z.object({
  targetPrice: z.number().int().positive().optional(),
  enabled: z.boolean().optional(),
  checkInterval: z.number().int().positive().optional()
});

export async function GET(_request: Request, context: { params: { id: string } }) {
  const watch = await getWatch(context.params.id);
  if (!watch) {
    return NextResponse.json({ error: "监控不存在" }, { status: 404 });
  }

  return NextResponse.json(watch);
}

export async function PATCH(request: Request, context: { params: { id: string } }) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "监控参数无效" }, { status: 400 });
  }

  const body = updateWatchSchema.safeParse(json);
  if (!body.success) {
    return NextResponse.json({ error: "监控参数无效" }, { status: 400 });
  }

  try {
    return NextResponse.json(await updateWatch(context.params.id, body.data));
  } catch {
    return NextResponse.json({ error: "监控不存在" }, { status: 404 });
  }
}

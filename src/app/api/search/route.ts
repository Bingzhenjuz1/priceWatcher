import { NextResponse } from "next/server";
import { z } from "zod";
import { createSearchSession } from "@/lib/search/searchService";

const requestSchema = z.object({
  query: z.string().trim().min(1)
});

export async function POST(request: Request) {
  const body = requestSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "请输入商品关键词或链接" }, { status: 400 });
  }

  const session = await createSearchSession(body.data.query);
  return NextResponse.json(session);
}

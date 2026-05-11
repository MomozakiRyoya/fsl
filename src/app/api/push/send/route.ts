import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 },
    );
  }

  const body = await request.json();

  if (body.secret !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // TODO: 購読者リストから送信（Vercel KV実装後）
  return NextResponse.json({ success: true, sent: 0 });
}

import { NextRequest, NextResponse } from "next/server";

// 購読情報の保存先は後でVercel KVに変更予定
// 現時点はメモリ保持（開発用）
const subscriptions: unknown[] = [];

const MAX_SUBSCRIPTIONS = 1000;

function isValidSubscription(data: unknown): boolean {
  if (!data || typeof data !== "object") return false;
  const sub = data as Record<string, unknown>;
  if (typeof sub.endpoint !== "string" || !sub.endpoint.startsWith("https://"))
    return false;
  if (!sub.keys || typeof sub.keys !== "object") return false;
  const keys = sub.keys as Record<string, unknown>;
  if (typeof keys.p256dh !== "string" || typeof keys.auth !== "string")
    return false;
  return true;
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!isValidSubscription(body)) {
    return NextResponse.json(
      { error: "Invalid subscription" },
      { status: 400 },
    );
  }

  if (subscriptions.length >= MAX_SUBSCRIPTIONS) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  subscriptions.push(body);
  return NextResponse.json({ success: true });
}

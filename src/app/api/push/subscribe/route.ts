import { NextRequest, NextResponse } from 'next/server'

// 購読情報の保存先は後でVercel KVに変更予定
// 現時点はメモリ保持（開発用）
const subscriptions: PushSubscription[] = []

export async function POST(request: NextRequest) {
  const subscription = await request.json()
  subscriptions.push(subscription)
  return NextResponse.json({ success: true })
}

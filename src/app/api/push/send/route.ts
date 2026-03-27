import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()

  if (body.secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  // TODO: 購読者リストから送信（Vercel KV実装後）
  return NextResponse.json({ success: true, sent: 0 })
}

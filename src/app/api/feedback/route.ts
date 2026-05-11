import { NextResponse } from "next/server";
import { filterContent } from "@/lib/content-filter";
import { Resend } from "resend";
import { createClient as createServerClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const { content } = await request.json();

  const check = filterContent(content);
  if (!check.ok) {
    return NextResponse.json({ error: check.reason }, { status: 400 });
  }

  // DBに保存
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  await supabase.from("feedback").insert({ content });

  // メール送信
  if (
    process.env.RESEND_API_KEY &&
    process.env.RESEND_API_KEY !== "re_placeholder"
  ) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "FSL <onboarding@resend.dev>",
        to: process.env.FEEDBACK_EMAIL!.trim(),
        subject: "【FSL】新しい意見箱への投稿",
        text: `新しい匿名フィードバックが届きました：\n\n${content}\n\n---\nFSL 匿名意見箱`,
      });
    } catch {
      // メール失敗してもDBに保存されているので続行
    }
  }

  return NextResponse.json({ ok: true });
}

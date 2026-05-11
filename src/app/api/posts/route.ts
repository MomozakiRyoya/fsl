import { NextResponse } from "next/server";
import { filterContent } from "@/lib/content-filter";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });

  const { content } = await request.json();
  const check = filterContent(content);
  if (!check.ok) return NextResponse.json({ error: check.reason }, { status: 400 });

  const { data, error } = await supabase
    .from("posts")
    .insert({ content, user_id: user.id })
    .select("id, content, created_at")
    .single();

  if (error) return NextResponse.json({ error: "投稿に失敗しました" }, { status: 500 });
  return NextResponse.json({ post: data });
}

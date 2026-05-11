import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function isAdmin(email: string) {
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim());
  return admins.includes(email);
}

async function checkAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email ?? "")) return null;
  return user;
}

export async function POST(request: Request) {
  const user = await checkAdmin();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { title, category, body: articleBody, isPublished } = body;

  if (!title)
    return NextResponse.json({ error: "タイトルは必須です" }, { status: 400 });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("news")
    .insert({
      title,
      category: category ?? "お知らせ",
      slug: `news-${Date.now()}`,
      body: articleBody ?? "",
      is_published: !!isPublished,
      published_at: new Date().toISOString().slice(0, 10),
    })
    .select()
    .single();

  if (error || !data)
    return NextResponse.json({ error: "作成に失敗しました" }, { status: 500 });

  revalidatePath("/news");
  revalidatePath("/");
  return NextResponse.json({
    id: data.id,
    title: data.title,
    slug: data.slug,
    category: data.category,
    publishedAt: data.published_at,
    body: data.body,
    isPublished: data.is_published,
    thumbnailUrl: null,
    seasonId: "",
  });
}

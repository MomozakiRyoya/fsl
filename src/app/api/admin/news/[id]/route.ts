import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";

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

function getAdmin() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await checkAdmin();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const admin = getAdmin();
  const updates: Record<string, unknown> = {};
  if (body.title !== undefined) updates.title = body.title;
  if (body.category !== undefined) updates.category = body.category;
  if (body.body !== undefined) updates.body = body.body;
  if (body.isPublished !== undefined) updates.is_published = body.isPublished;

  const { data, error } = await admin
    .from("news")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error || !data)
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });

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

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await checkAdmin();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const admin = getAdmin();

  const { error } = await admin.from("news").delete().eq("id", id);
  if (error)
    return NextResponse.json({ error: "削除に失敗しました" }, { status: 500 });

  revalidatePath("/news");
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}

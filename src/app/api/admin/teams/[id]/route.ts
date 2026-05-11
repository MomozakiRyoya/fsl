import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function isAdmin(email: string) {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .includes(email);
}
async function checkAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email ?? "")) return null;
  return user;
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
  const supabase = await createClient();

  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.slug !== undefined) updates.slug = body.slug;
  if (body.homeColor !== undefined) updates.home_color = body.homeColor;
  if (body.captain !== undefined) updates.captain = body.captain;
  if (body.description !== undefined) updates.description = body.description;
  if (body.twitterUrl !== undefined) updates.twitter_url = body.twitterUrl;
  if (body.instagramUrl !== undefined)
    updates.instagram_url = body.instagramUrl;
  if (body.isActive !== undefined) updates.is_active = body.isActive;
  if ("logoUrl" in body) updates.logo_url = body.logoUrl;

  const { data, error } = await supabase
    .from("teams")
    .update(updates)
    .eq("team_id", id)
    .select()
    .single();

  if (error || !data)
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  revalidatePath("/teams");
  revalidatePath("/");
  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await checkAdmin();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = await createClient();

  const { error } = await supabase.from("teams").delete().eq("team_id", id);
  if (error)
    return NextResponse.json({ error: "削除に失敗しました" }, { status: 500 });
  revalidatePath("/teams");
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}

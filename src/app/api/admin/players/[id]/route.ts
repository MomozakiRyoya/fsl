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
  if (body.teamId !== undefined) updates.team_id = body.teamId;
  if (body.leagueId !== undefined) updates.league_id = body.leagueId;
  if (body.number !== undefined) updates.number = body.number;
  if (body.position !== undefined) updates.position = body.position;
  if ("photoUrl" in body) updates.photo_url = body.photoUrl;
  if ("imageUrl" in body) updates.image_url = body.imageUrl || null;
  if ("isCaptain" in body) updates.is_captain = body.isCaptain;
  if ("userEmail" in body) updates.user_email = body.userEmail || null;

  const { data, error } = await supabase
    .from("players")
    .update(updates)
    .eq("player_id", id)
    .select()
    .single();

  if (error || !data)
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  revalidatePath("/players");
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

  const { error } = await supabase.from("players").delete().eq("player_id", id);
  if (error)
    return NextResponse.json({ error: "削除に失敗しました" }, { status: 500 });
  revalidatePath("/players");
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}

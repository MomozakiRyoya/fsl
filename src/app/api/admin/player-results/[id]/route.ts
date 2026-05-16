import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";

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
  if (body.playerName !== undefined) updates.player_name = body.playerName;
  if (body.teamName !== undefined) updates.team_name = body.teamName;
  if (body.rank !== undefined) updates.rank = body.rank;
  if (body.points !== undefined) updates.points = body.points;

  const { data, error } = await admin
    .from("player_results")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error || !data)
    return NextResponse.json(
      { error: `更新に失敗しました: ${error?.message}` },
      { status: 500 },
    );

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
  const admin = getAdmin();
  const { error } = await admin.from("player_results").delete().eq("id", id);

  if (error)
    return NextResponse.json(
      { error: `削除に失敗しました: ${error?.message}` },
      { status: 500 },
    );

  revalidatePath("/");
  return NextResponse.json({ ok: true });
}

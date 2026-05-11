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

export async function POST(request: Request) {
  const user = await checkAdmin();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("players")
    .insert({
      player_id: body.playerId || `${body.teamId}-${Date.now()}`,
      name: body.name ?? "",
      team_id: body.teamId ?? "",
      league_id: body.leagueId ?? "",
      position: body.position ?? "FP",
      number: body.number ?? 0,
      photo_url: body.photoUrl ?? null,
      user_email: body.userEmail ?? null,
    })
    .select()
    .single();

  if (error || !data)
    return NextResponse.json(
      { error: error?.message ?? "作成に失敗しました" },
      { status: 500 },
    );
  revalidatePath("/players");
  revalidatePath("/");
  return NextResponse.json(data);
}

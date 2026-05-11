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

  const teamId = body.teamId || body.slug || `team-${Date.now()}`;
  const id = `${body.leagueId}-${teamId}`;

  const { data, error } = await supabase
    .from("teams")
    .insert({
      id,
      team_id: teamId,
      name: body.name ?? "",
      slug: body.slug ?? teamId,
      league_id: body.leagueId ?? "premier",
      league_name: body.leagueName ?? "",
      home_color: body.homeColor ?? "#000000",
      captain: body.captain ?? "",
      description: body.description ?? "",
      twitter_url: body.twitterUrl ?? null,
      instagram_url: body.instagramUrl ?? null,
      is_active: body.isActive ?? true,
    })
    .select()
    .single();

  if (error || !data)
    return NextResponse.json(
      { error: error?.message ?? "作成に失敗しました" },
      { status: 500 },
    );
  revalidatePath("/teams");
  revalidatePath("/");
  return NextResponse.json(data);
}

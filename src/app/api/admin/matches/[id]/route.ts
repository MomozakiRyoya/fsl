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
  if (body.homeTeamId !== undefined) updates.home_team_id = body.homeTeamId;
  if (body.homeTeamName !== undefined)
    updates.home_team_name = body.homeTeamName;
  if (body.awayTeamId !== undefined) updates.away_team_id = body.awayTeamId;
  if (body.awayTeamName !== undefined)
    updates.away_team_name = body.awayTeamName;
  if ("homeScore" in body) updates.home_score = body.homeScore;
  if ("awayScore" in body) updates.away_score = body.awayScore;
  if ("homeRoundPt" in body) updates.home_round_pt = body.homeRoundPt;
  if ("awayRoundPt" in body) updates.away_round_pt = body.awayRoundPt;
  if (body.status !== undefined) updates.status = body.status;

  const { data, error } = await supabase
    .from("matches")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error || !data)
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  revalidatePath("/schedule");
  revalidatePath("/standings");
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
  const { error } = await supabase.from("matches").delete().eq("id", id);
  if (error)
    return NextResponse.json({ error: "削除に失敗しました" }, { status: 500 });
  revalidatePath("/schedule");
  revalidatePath("/standings");
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}

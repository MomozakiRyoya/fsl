import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roundId = searchParams.get("roundId");

  const admin = getAdmin();
  let query = admin.from("matches").select("*").order("id");
  if (roundId) query = query.eq("round_id", roundId);

  const { data, error } = await query;
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const user = await checkAdmin();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const admin = getAdmin();

  const roundId = body.roundId ?? "";
  const homeTeamId = body.homeTeamId ?? "";

  // 同じ round+team が既にあれば削除して上書き（重複防止）
  await admin
    .from("matches")
    .delete()
    .eq("round_id", roundId)
    .eq("home_team_id", homeTeamId);

  const { data, error } = await admin
    .from("matches")
    .insert({
      round_id: roundId,
      home_team_id: homeTeamId,
      home_team_name: body.homeTeamName ?? "",
      away_team_id: body.awayTeamId ?? "",
      away_team_name: body.awayTeamName ?? "",
      home_score: body.homeScore ?? null,
      away_score: body.awayScore ?? null,
      home_round_pt: body.homeRoundPt ?? null,
      away_round_pt: body.awayRoundPt ?? null,
      status: body.status ?? "scheduled",
    })
    .select()
    .single();

  if (error || !data)
    return NextResponse.json(
      { error: `作成に失敗しました: ${error?.message}` },
      { status: 500 },
    );
  revalidatePath("/schedule");
  revalidatePath("/standings");
  revalidatePath("/");
  return NextResponse.json(data);
}

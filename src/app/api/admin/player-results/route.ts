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

export async function POST(request: Request) {
  const user = await checkAdmin();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { roundId, players } = body as {
    roundId: string;
    players: {
      playerId: string | null;
      playerName: string;
      teamId: string;
      teamName: string;
      rank: number | null;
      points: number;
    }[];
  };

  if (!roundId || !Array.isArray(players) || players.length === 0)
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const admin = getAdmin();

  // 保存対象チーム分の既存データだけ削除して再登録（他チームは保護）
  const teamIds = Array.from(
    new Set(players.map((p) => p.teamId).filter(Boolean)),
  );
  if (teamIds.length > 0) {
    const { error: delError } = await admin
      .from("player_results")
      .delete()
      .eq("round_id", roundId)
      .in("team_id", teamIds);
    if (delError)
      return NextResponse.json({ error: delError.message }, { status: 500 });
  }

  const rows = players.map((p) => ({
    round_id: roundId,
    player_id: p.playerId ?? "",
    player_name: p.playerName,
    team_id: p.teamId,
    team_name: p.teamName,
    rank: p.rank ?? null,
    points: p.points,
  }));

  const { error } = await admin.from("player_results").insert(rows);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath("/");
  return NextResponse.json({ ok: true });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roundId = searchParams.get("roundId");

  const admin = getAdmin();
  let query = admin.from("player_results").select("*").order("rank");
  if (roundId) query = query.eq("round_id", roundId);

  const { data, error } = await query;
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

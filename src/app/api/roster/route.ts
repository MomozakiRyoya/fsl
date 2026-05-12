import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function isAdmin(email: string): boolean {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean)
    .includes(email);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 未ログイン → 401
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 管理者以外 → 403
  if (!isAdmin(user.email ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // 型バリデーション
  if (typeof body !== "object" || body === null) {
    return NextResponse.json(
      { error: "Request body must be an object" },
      { status: 400 },
    );
  }

  const { teamId, leagueId, roundId, players } = body as Record<
    string,
    unknown
  >;

  if (typeof teamId !== "string" || !teamId) {
    return NextResponse.json(
      { error: "teamId must be a non-empty string" },
      { status: 400 },
    );
  }
  if (typeof leagueId !== "string" || !leagueId) {
    return NextResponse.json(
      { error: "leagueId must be a non-empty string" },
      { status: 400 },
    );
  }
  if (typeof roundId !== "string" || !roundId) {
    return NextResponse.json(
      { error: "roundId must be a non-empty string" },
      { status: 400 },
    );
  }
  const normalizedPlayers = Array.isArray(players)
    ? players
    : typeof players === "string"
      ? players
      : null;
  if (normalizedPlayers === null) {
    return NextResponse.json(
      { error: "players must be a string or array" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("rosters")
    .upsert(
      {
        team_id: teamId,
        league_id: leagueId,
        round_id: roundId,
        players: normalizedPlayers,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "team_id,round_id" },
    )
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get("teamId");
  const leagueId = searchParams.get("leagueId");

  const supabase = await createClient();
  let query = supabase.from("rosters").select("*");
  if (teamId) query = query.eq("team_id", teamId);
  if (leagueId) query = query.eq("league_id", leagueId);

  const { data, error } = await query;
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

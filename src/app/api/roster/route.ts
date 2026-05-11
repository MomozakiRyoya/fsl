import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { teamId, leagueId, roundId, players } = body;

  const { data, error } = await supabase
    .from("rosters")
    .upsert(
      { team_id: teamId, league_id: leagueId, round_id: roundId, players, updated_at: new Date().toISOString() },
      { onConflict: "team_id,round_id" },
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
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
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

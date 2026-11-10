import { createClient } from "./server";
import type { PlayerResultRow } from "../player-season";

/** チームの個人ポイントの記録（全節分）。選手ページで、その選手の行をまとめるのに使う */
export async function fetchTeamPlayerResults(
  teamId: string,
): Promise<PlayerResultRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("player_results")
    .select("round_id, player_name, team_id, rank, points")
    .eq("team_id", teamId);
  if (error) throw error;
  return (data ?? []) as PlayerResultRow[];
}

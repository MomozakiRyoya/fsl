import { createClient as createAdmin } from "@supabase/supabase-js";
import type { PlayerResultRow } from "../player-season";

/**
 * チームの個人ポイントの記録（全節分）。選手ページで、その選手の行をまとめるのに使う。
 * ホームの個人ランキングと同じく service role で読む。一般の接続だと読み取り許可（RLS）で
 * 行が欠け、ホームと合計が食い違う。サーバーでだけ呼び、公開してよい列だけを選ぶ
 */
export async function fetchTeamPlayerResults(
  teamId: string,
): Promise<PlayerResultRow[]> {
  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const { data, error } = await admin
    .from("player_results")
    .select("round_id, player_name, team_id, rank, points")
    .eq("team_id", teamId);
  if (error) throw error;
  return (data ?? []) as PlayerResultRow[];
}

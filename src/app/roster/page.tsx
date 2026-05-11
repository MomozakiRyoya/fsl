import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getLeagues, getTeams, getRounds, getPlayers } from "@/lib/data";
import RosterClient from "./RosterClient";

export default async function RosterPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirect=/roster");

  const playerId = user.user_metadata?.player_id ?? null;

  const [leagues, teams, rounds, players] = await Promise.all([
    getLeagues(),
    getTeams(),
    getRounds(),
    getPlayers(),
  ]);

  // キャプテン判定
  const myPlayer = players.find((p) => p.id === playerId);
  const isCaptain = myPlayer?.isCaptain === true;

  if (!isCaptain) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-4">🔒</div>
        <p className="text-lg font-bold text-slate-900 mb-2">キャプテン専用ページ</p>
        <p className="text-sm text-slate-500 mb-6">このページはキャプテンのみアクセスできます。</p>
        <p className="text-xs text-slate-400">
          マイページで選手プロフィールを設定し、管理者にキャプテン権限の付与を依頼してください。
        </p>
      </div>
    );
  }

  // キャプテンのチームを特定
  const captainTeam = teams.find((t) => t.id === myPlayer?.teamId);

  return (
    <RosterClient
      myTeam={captainTeam ?? null}
      leagues={leagues}
      teams={teams}
      rounds={rounds}
    />
  );
}

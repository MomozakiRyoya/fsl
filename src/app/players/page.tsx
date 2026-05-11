import { getPlayers, getPlayerStats } from "@/lib/data";
import PositionFilter from "@/components/players/PositionFilter";

export const revalidate = 300;

export default async function PlayersPage() {
  const [allPlayers, allStats] = await Promise.all([
    getPlayers(),
    getPlayerStats(),
  ]);
  const premierPlayers = allPlayers.filter((p) => p.leagueId === "premier");
  const premierStats = allStats.filter((s) => s.leagueId === "premier");

  // 得点王（最多得点者）を特定
  const topScorer = premierStats.reduce(
    (top, s) => (s.goals > (top?.goals ?? -1) ? s : top),
    null as (typeof premierStats)[0] | null,
  );

  return (
    <div className="max-w-lg lg:max-w-4xl mx-auto">
      {/* ヘッダー */}
      <div className="relative px-4 pt-6 pb-8 overflow-hidden bg-slate-900">
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-amber-400/10 -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <p className="text-xs font-semibold text-amber-400 tracking-widest uppercase mb-1">
            FSL Season 1
          </p>
          <h1 className="text-3xl font-black text-white tracking-tight">
            PLAYERS
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Premier League · {premierPlayers.length}名登録
          </p>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="px-4 py-5">
        <PositionFilter
          players={premierPlayers}
          stats={premierStats}
          topScorerPlayerId={topScorer?.playerId ?? ""}
        />
      </div>
    </div>
  );
}

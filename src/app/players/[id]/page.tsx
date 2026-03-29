import { notFound } from "next/navigation";
import Link from "next/link";
import { getPlayers, getPlayerStats, getTeams } from "@/lib/data";

type Props = {
  params: Promise<{ id: string }>;
};

function getInitials(name: string): string {
  const stripped = name.replace(/\s+/g, "");
  return stripped.slice(0, 2).toUpperCase();
}

export default async function PlayerDetailPage({ params }: Props) {
  const { id } = await params;
  const [players, allStats, teams] = await Promise.all([
    getPlayers(),
    getPlayerStats(),
    getTeams(),
  ]);
  const player = players.find((p) => p.id === id);

  if (!player) notFound();

  const stat = allStats.find((s) => s.playerId === id);
  const team = teams.find((t) => t.id === player.teamId);

  return (
    <div className="max-w-lg mx-auto">
      {/* ヘッダー */}
      <div
        className="relative px-4 pt-6 pb-10 overflow-hidden"
        style={{
          background: `linear-gradient(160deg, ${team?.homeColor ?? "#F59E0B"}25 0%, ${team?.homeColor ?? "#F59E0B"}08 50%, #ffffff 100%)`,
          borderBottom: `1px solid ${team?.homeColor ?? "#F59E0B"}35`,
        }}
      >
        <div
          className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 -translate-y-1/2 translate-x-1/2"
          style={{ backgroundColor: team?.homeColor ?? "#F59E0B" }}
        />

        <div className="relative">
          {/* 戻るリンク */}
          <div className="flex items-center justify-between mb-5">
            <Link
              href="/players"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white/70 backdrop-blur-sm rounded-full px-3 py-1.5 border border-slate-200/70 transition-colors"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              選手一覧
            </Link>
          </div>

          {/* アバター + 名前 */}
          <div className="flex items-center gap-5">
            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center text-3xl font-black text-white shadow-lg flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, #F59E0B 0%, #D97706 100%)`,
                boxShadow: `0 8px 24px #F59E0B50`,
              }}
              role="img"
              aria-label={player.name}
            >
              {getInitials(player.name)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  {player.name}
                </h1>
                <span
                  className="text-sm font-bold text-white px-2.5 py-0.5 rounded-full"
                  style={{ backgroundColor: team?.homeColor ?? "#F59E0B" }}
                >
                  #{player.number}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="px-4 py-6 space-y-5">
        {/* 所属情報 */}
        <section>
          <h2 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">
            所属情報
          </h2>
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-slate-500">チーム</span>
              <span className="text-sm font-medium text-slate-900">
                {player.teamName}
              </span>
            </div>
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-slate-500">ディビジョン</span>
              <span className="text-sm font-medium text-slate-900">
                Division 1
              </span>
            </div>
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-slate-500">背番号</span>
              <span className="text-sm font-medium text-slate-900">
                #{player.number}
              </span>
            </div>
          </div>
        </section>

        {/* スタッツ */}
        {stat && (
          <section>
            <h2 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">
              今シーズンの成績
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl border border-slate-100 p-4 text-center shadow-sm">
                <p className="text-3xl font-black tabular-nums text-amber-500">
                  {stat.goals}
                </p>
                <p className="text-xs text-slate-400 font-medium mt-1">得点</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 p-4 text-center shadow-sm">
                <p className="text-3xl font-black tabular-nums text-slate-700">
                  {stat.assists}
                </p>
                <p className="text-xs text-slate-400 font-medium mt-1">
                  アシスト
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 p-4 text-center shadow-sm">
                <p className="text-3xl font-black tabular-nums text-slate-700">
                  {stat.games}
                </p>
                <p className="text-xs text-slate-400 font-medium mt-1">
                  出場試合数
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 p-4 text-center shadow-sm">
                <div className="flex items-center justify-center gap-1.5">
                  <p className="text-3xl font-black tabular-nums text-slate-700">
                    {stat.mvpCount}
                  </p>
                  {stat.mvpCount > 0 && <span className="text-lg">🏆</span>}
                </div>
                <p className="text-xs text-slate-400 font-medium mt-1">
                  MVPバッジ
                </p>
              </div>
            </div>
          </section>
        )}

        {/* チームを見るリンク */}
        {team && (
          <section>
            <Link
              href={`/teams/${team.slug}`}
              className="flex items-center justify-between bg-white rounded-xl border border-slate-200 px-4 py-3.5 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                  style={{ backgroundColor: team.homeColor }}
                >
                  {getInitials(team.name)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {team.name}
                  </p>
                  <p className="text-xs text-slate-500">{team.leagueName}</p>
                </div>
              </div>
              <svg
                className="w-4 h-4 text-slate-400 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </section>
        )}
      </div>
    </div>
  );
}

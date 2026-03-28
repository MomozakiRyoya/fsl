import Link from "next/link";
import { notFound } from "next/navigation";
import { MOCK_TEAMS, MOCK_LEAGUES, MOCK_STANDINGS } from "@/lib/mock-data";
import FollowButton from "@/components/teams/FollowButton";
import RankChart from "@/components/standings/RankChart";
import CheerComments from "@/components/teams/CheerComments";

// const team = await getTeamBySlug(slug)

type Props = {
  params: Promise<{ slug: string }>;
};

function getInitials(name: string): string {
  const stripped = name.replace(/\s+/g, "");
  return stripped.slice(0, 2).toUpperCase();
}

export default async function TeamDetailPage({ params }: Props) {
  const { slug } = await params;
  const team = MOCK_TEAMS.find((t) => t.slug === slug);

  if (!team) notFound();

  const league = MOCK_LEAGUES.find((l) => l.id === team.leagueId);
  const standings = MOCK_STANDINGS[team.leagueId] ?? [];
  const standing = standings.find((s) => s.teamId === team.id);

  const COMPLETED_ROUNDS = [1, 2, 3, 4];

  const leagueStandings = MOCK_STANDINGS[team.leagueId] ?? [];
  const rankHistory = leagueStandings.map((s) => {
    const ranks = COMPLETED_ROUNDS.map((r) => {
      const roundPoints = leagueStandings.map((t) => ({
        id: t.teamId,
        pts: t.roundPoints[r] ?? 0,
      }));
      roundPoints.sort((a, b) => b.pts - a.pts);
      return roundPoints.findIndex((t) => t.id === s.teamId) + 1;
    });
    return {
      teamId: s.teamId,
      teamName: s.teamName,
      color: s.teamId === team.id ? team.homeColor : "#cbd5e1",
      ranks,
    };
  });
  // 対象チームを最後に移動（前面に表示）
  const sortedRankHistory = [
    ...rankHistory.filter((r) => r.teamId !== team.id),
    ...rankHistory.filter((r) => r.teamId === team.id),
  ];

  return (
    <div className="max-w-lg mx-auto">
      {/* ヘッダー */}
      <div
        className="relative px-4 pt-6 pb-10 animate-fade-in overflow-hidden"
        style={{
          background: `linear-gradient(160deg, ${team.homeColor}30 0%, ${team.homeColor}10 50%, #ffffff 100%)`,
          borderBottom: `1px solid ${team.homeColor}40`,
        }}
      >
        {/* 背景装飾 */}
        <div
          className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 -translate-y-1/2 translate-x-1/2"
          style={{ backgroundColor: team.homeColor }}
        />
        <div className="relative">
          <div className="flex items-center justify-between mb-5">
            <Link
              href="/teams"
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
              チーム一覧
            </Link>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${team.name} | FSL Season 1`)}&url=${encodeURIComponent(`https://fsl-gilt.vercel.app/teams/${team.slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
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
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              シェア
            </a>
          </div>
          <div className="flex items-center gap-5">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center text-2xl font-black text-white shadow-lg flex-shrink-0"
              style={{
                backgroundColor: team.homeColor,
                boxShadow: `0 8px 24px ${team.homeColor}60`,
              }}
              role="img"
              aria-label={team.name}
            >
              {getInitials(team.name)}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {team.name}
              </h1>
              <div className="flex items-center gap-2 mt-1.5">
                {league && (
                  <span
                    className="text-xs px-2.5 py-1 rounded-xl font-semibold text-white"
                    style={{ backgroundColor: league.color }}
                  >
                    {league.name}
                  </span>
                )}
              </div>
              {team.captainName && (
                <p className="text-xs text-slate-500 mt-1.5 font-medium">
                  Cap: {team.captainName}
                </p>
              )}
              {/* フォローボタン */}
              <div className="mt-2.5">
                <FollowButton teamId={team.id} teamName={team.name} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* 今シーズン成績 */}
        {standing && (
          <section className="animate-fade-in animate-delay-100">
            <h2 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">
              今シーズン成績
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-2xl border border-slate-100 p-4 text-center shadow-sm">
                <div className="flex items-center justify-center mb-1">
                  {standing.rank <= 3 ? (
                    <span
                      className={`text-3xl font-black tabular-nums ${
                        standing.rank === 1
                          ? "text-amber-500"
                          : standing.rank === 2
                            ? "text-slate-400"
                            : "text-amber-600"
                      }`}
                    >
                      #{standing.rank}
                    </span>
                  ) : (
                    <span className="text-3xl font-black tabular-nums text-slate-700">
                      #{standing.rank}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                  リーグ順位
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 p-4 text-center shadow-sm">
                <p
                  className="text-3xl font-black tabular-nums"
                  style={{ color: team.homeColor }}
                >
                  {standing.totalPoints}
                </p>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mt-1">
                  総ポイント
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 p-4 text-center shadow-sm">
                <p className="text-3xl font-black tabular-nums text-slate-700">
                  {COMPLETED_ROUNDS.length}
                </p>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mt-1">
                  試合数
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ラウンド別ポイント */}
        {standing && (
          <section className="animate-fade-in animate-delay-200">
            <h2 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">
              ラウンド別ポイント
            </h2>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {COMPLETED_ROUNDS.map((r, i) => {
                const pt = standing.roundPoints[r] ?? 0;
                const maxPt = 14;
                const pct = Math.round((pt / maxPt) * 100);
                return (
                  <div
                    key={r}
                    className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 last:border-0 animate-slide-up"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <span className="text-xs font-medium text-slate-500 w-6">
                      R{r}
                    </span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: team.homeColor,
                        }}
                      />
                    </div>
                    <span className="text-sm font-bold text-slate-900 w-8 text-right">
                      {pt}pt
                    </span>
                  </div>
                );
              })}
              <div className="px-4 py-3 bg-slate-50 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">
                  合計
                </span>
                <span
                  className="text-base font-bold"
                  style={{ color: team.homeColor }}
                >
                  {standing.totalPoints}pt
                </span>
              </div>
            </div>
          </section>
        )}

        {/* ディビジョン順位推移 */}
        <section className="animate-fade-in animate-delay-300">
          <h2 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">
            ディビジョン順位推移
          </h2>
          <RankChart
            leagueId={team.leagueId}
            teams={sortedRankHistory}
            rounds={COMPLETED_ROUNDS}
          />
        </section>

        {/* チーム情報 */}
        <section className="animate-fade-in animate-delay-300">
          <h2 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">
            チーム情報
          </h2>
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-slate-500">所属ディビジョン</span>
              <span className="text-sm font-medium text-slate-900">
                {team.leagueName}
              </span>
            </div>
            {team.captainName && (
              <div className="px-4 py-3 flex items-center justify-between">
                <span className="text-xs text-slate-500">キャプテン</span>
                <span className="text-sm font-medium text-slate-900">
                  {team.captainName}
                </span>
              </div>
            )}
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-slate-500">参加シーズン</span>
              <span className="text-sm font-medium text-slate-900">
                FSL Season 1
              </span>
            </div>
          </div>
        </section>

        {/* 応援コメント */}
        <section className="animate-fade-in animate-delay-400">
          <CheerComments teamId={team.id} teamName={team.name} />
        </section>
      </div>
    </div>
  );
}

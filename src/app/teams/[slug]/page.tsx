import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getTeams,
  getLeagues,
  getStandings,
  getPlayers,
  getHeadToHead,
} from "@/lib/data";
import FollowButton from "@/components/teams/FollowButton";
import RankChart from "@/components/standings/RankChart";
import CheerComments from "@/components/teams/CheerComments";
import { teamAccent } from "@/components/teams/team-color";
import { roundRank } from "@/components/teams/round-rank";
import ArrowIcon from "@/components/ui/ArrowIcon";
import BreakableName from "@/components/ui/BreakableName";
import CountUp from "@/components/ui/CountUp";

type Props = {
  params: Promise<{ slug: string }>;
};

function getInitials(name: string): string {
  const stripped = name.replace(/\s+/g, "");
  return stripped.slice(0, 2).toUpperCase();
}

/** 1〜3 位の面の色。順位表の RankBadge と同じ（文字は text-on-block） */
const RANK_BLOCK: Record<number, string> = {
  1: "bg-butter",
  2: "bg-silver",
  3: "bg-sand",
};

/** 順位の札の色。1〜3 位は面の色、4 位以下は rest */
function rankBlock(rank: number, rest: string): string {
  const block = RANK_BLOCK[rank];
  return block ? `${block} text-on-block` : rest;
}

/** 帯の上の小さなボタン（一覧へ戻る・シェア） */
const HERO_BUTTON =
  "touch-active inline-flex h-9 items-center gap-1.5 rounded-lg bg-white/10 px-3 text-xs font-bold text-white ring-1 ring-inset ring-white/15";

export const revalidate = 300;

export default async function TeamDetailPage({ params }: Props) {
  const { slug } = await params;
  const [teams, leagues, allStandings, players, headToHead] = await Promise.all(
    [getTeams(), getLeagues(), getStandings(), getPlayers(), getHeadToHead()],
  );

  const team = teams.find((t) => t.slug === slug);

  if (!team) notFound();

  const league = leagues.find((l) => l.id === team.leagueId);
  const standings = allStandings[team.leagueId] ?? [];
  const standing = standings.find((s) => s.teamId === team.id);
  // 棒とグラフの線の色。ダークのカードの上で沈む色は灰色に寄せる
  const accent = teamAccent(team.homeColor);

  // 選手データ
  const teamPlayers = players.filter((p) => p.teamId === team.id);

  // 対戦成績（このチームが teamA または teamB のもの）
  const headToHeadData = headToHead
    .filter((h) => h.teamAId === team.id || h.teamBId === team.id)
    .map((h) => {
      const isTeamA = h.teamAId === team.id;
      return {
        opponentName: isTeamA ? h.teamBName : h.teamAName,
        wins: isTeamA ? h.wins : h.losses,
        draws: h.draws,
        losses: isTeamA ? h.losses : h.wins,
        goalsFor: isTeamA ? h.teamAGoals : h.teamBGoals,
        goalsAgainst: isTeamA ? h.teamBGoals : h.teamAGoals,
      };
    });

  const COMPLETED_ROUNDS = [
    ...new Set(
      standings.flatMap((s) => Object.keys(s.roundPoints).map(Number)),
    ),
  ].sort((a, b) => a - b);
  // 節ごとの順位。直近の結果と同じ数え方（同点は同じ順位）
  const rankHistory = standings.map((s) => ({
    teamId: s.teamId,
    teamName: s.teamName,
    color: s.teamId === team.id ? accent : "#cbd5e1",
    ranks: COMPLETED_ROUNDS.map((r) => roundRank(standings, r, s.teamId)),
  }));
  const recentRounds = standing
    ? Object.keys(standing.roundPoints)
        .map(Number)
        .sort((a, b) => a - b)
        .slice(-4)
    : [];
  // 棒の長さはリーグの 1 節の最高点で割る（点が無いときの 0 除算を避けて最低 1）
  const roundMax = Math.max(
    1,
    ...standings.flatMap((s) => Object.values(s.roundPoints)),
  );
  const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${team.name} | FSL Season 7`)}&url=${encodeURIComponent(`https://fsl-gilt.vercel.app/teams/${team.slug}`)}`;

  return (
    <div className="max-w-lg lg:max-w-4xl mx-auto">
      {/* 見出しの帯: ホームと同じ紺の面。ダークでも色を替えないので、チーム名は白のまま読める */}
      <section className="bg-[#0c1e42] px-5 pt-4 pb-6 text-white animate-fade-in lg:px-10">
        <div className="flex items-center justify-between gap-3">
          <Link href="/teams" className={HERO_BUTTON}>
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
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
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={HERO_BUTTON}
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
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

        <div className="mt-6">
          {/* チーム名はすぐ下の h1 で読み上げるので、ロゴは飾りとして扱う */}
          {team.logoUrl ? (
            <img
              src={team.logoUrl}
              alt=""
              className="h-16 w-16 rounded-xl bg-white object-cover ring-1 ring-white/15"
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex h-16 w-16 items-center justify-center rounded-xl bg-white text-xl font-black text-[#0c1e42]"
            >
              {getInitials(team.name)}
            </div>
          )}
          <p className="mt-5 flex items-center gap-1.5 text-[11px] font-bold tracking-[0.04em] text-white/60">
            {league && (
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 flex-shrink-0 border border-white/40"
                style={{ backgroundColor: league.color }}
              />
            )}
            {team.leagueName}
          </p>
          <h1 className="mt-2 text-[clamp(30px,9vw,48px)] font-black leading-[1.05] tracking-[-0.01em] text-white text-balance break-words">
            <BreakableName name={team.name} />
          </h1>
          {team.captainName && (
            <p className="mt-3 text-xs text-white/70">
              キャプテン{" "}
              <span className="font-bold text-white">{team.captainName}</span>
            </p>
          )}
        </div>

        <div className="mt-6 lg:max-w-xs">
          <FollowButton teamId={team.id} teamName={team.name} />
        </div>
      </section>

      <div className="px-5 pt-8 pb-10 space-y-10 lg:px-10">
        {/* 今シーズンの成績 */}
        {standing && (
          <section className="section-rule animate-fade-in animate-delay-100">
            <div className="section-head">
              <h2 className="section-title">今シーズンの成績</h2>
              <Link
                href={`/standings?league=${team.leagueId}`}
                className="section-link"
              >
                順位表
                <ArrowIcon />
              </Link>
            </div>
            <div className="card-native p-4">
              <div className="flex items-center gap-4">
                <span
                  aria-hidden="true"
                  className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl text-2xl font-extrabold tabular-nums ${rankBlock(standing.rank, "bg-slate-100 text-slate-900")}`}
                >
                  {standing.rank}
                </span>
                <div>
                  <p className="text-xl font-black text-slate-900">
                    {standing.rank}位
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {standings.length}チーム中
                  </p>
                </div>
              </div>
              <dl className="mt-4 grid grid-cols-2 border-t border-slate-100 pt-4">
                <div>
                  <dt className="text-[11px] font-bold tracking-[0.04em] text-slate-500">
                    総ポイント
                  </dt>
                  <dd className="mt-1.5 flex items-baseline gap-1 text-slate-900">
                    <CountUp
                      value={standing.totalPoints}
                      className="stat-number"
                    />
                    <span className="text-xs font-bold text-slate-500">pt</span>
                  </dd>
                </div>
                <div className="border-l border-slate-100 pl-4">
                  <dt className="text-[11px] font-bold tracking-[0.04em] text-slate-500">
                    試合数
                  </dt>
                  <dd className="mt-1.5 flex items-baseline gap-1 text-slate-900">
                    <span className="stat-number">
                      {Object.keys(standing.roundPoints).length}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      試合
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </section>
        )}

        {/* 直近の結果 */}
        {standing && recentRounds.length > 0 && (
          <section className="section-rule animate-fade-in animate-delay-200">
            <div className="section-head">
              <h2 className="section-title">直近の結果</h2>
            </div>
            <ol className="grid grid-cols-4 gap-2">
              {recentRounds.map((r) => {
                const rank = roundRank(standings, r, team.id);
                return (
                  <li key={r} className="card-native px-2 py-3 text-center">
                    <p className="text-[11px] font-bold text-slate-500">R{r}</p>
                    <p className="mt-1 text-xl font-black leading-none tabular-nums text-slate-900">
                      {standing.roundPoints[r] ?? 0}
                      <span className="ml-0.5 text-[10px] font-bold text-slate-500">
                        pt
                      </span>
                    </p>
                    <p
                      className={`mt-2 inline-block rounded-md px-1.5 py-0.5 text-[11px] font-bold ${rankBlock(rank, "bg-slate-100 text-slate-700")}`}
                    >
                      {rank}位
                    </p>
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        {/* ラウンド別ポイント */}
        {standing && COMPLETED_ROUNDS.length > 0 && (
          <section className="section-rule animate-fade-in animate-delay-300">
            <div className="section-head">
              <h2 className="section-title">ラウンド別ポイント</h2>
            </div>
            <ul className="card-native overflow-hidden">
              {COMPLETED_ROUNDS.map((r, i) => {
                const pt = standing.roundPoints[r] ?? 0;
                const pct = Math.min(100, Math.round((pt / roundMax) * 100));
                return (
                  <li
                    key={r}
                    className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? "border-t border-slate-100" : ""}`}
                  >
                    <span className="w-8 flex-shrink-0 text-xs font-bold text-slate-500">
                      R{r}
                    </span>
                    <span
                      aria-hidden="true"
                      className="h-2 flex-1 overflow-hidden rounded-sm bg-slate-100"
                    >
                      <span
                        className="block h-full rounded-sm"
                        style={{ width: `${pct}%`, backgroundColor: accent }}
                      />
                    </span>
                    <span className="w-12 flex-shrink-0 text-right text-sm font-bold tabular-nums text-slate-900">
                      {pt}pt
                    </span>
                  </li>
                );
              })}
              <li className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-3">
                <span className="text-xs font-bold text-slate-700">合計</span>
                <span className="text-base font-black tabular-nums text-slate-900">
                  {standing.totalPoints}pt
                </span>
              </li>
            </ul>
          </section>
        )}

        {/* 順位推移 */}
        {COMPLETED_ROUNDS.length > 0 && (
          <section className="section-rule animate-fade-in animate-delay-300">
            <div className="section-head">
              <h2 className="section-title">順位推移</h2>
            </div>
            <RankChart
              leagueId={team.leagueId}
              teams={rankHistory}
              rounds={COMPLETED_ROUNDS}
              focusTeamId={team.id}
            />
          </section>
        )}

        {/* 選手 */}
        {teamPlayers.length > 0 && (
          <section className="section-rule animate-fade-in animate-delay-400">
            <div className="section-head">
              <h2 className="section-title">選手</h2>
              {/* カードではなく地の色の上に載るので、slate-500 では薄すぎる（4.5 に届かない） */}
              <span className="text-xs tabular-nums text-slate-700">
                {teamPlayers.length}人
              </span>
            </div>
            <ul className="card-native overflow-hidden">
              {teamPlayers.map((player, i) => (
                <li
                  key={player.id}
                  className={i > 0 ? "border-t border-slate-100" : undefined}
                >
                  <Link
                    href={`/players/${player.id}`}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    {player.photoUrl ? (
                      <img
                        src={player.photoUrl}
                        alt=""
                        className="h-9 w-9 flex-shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <span
                        aria-hidden="true"
                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-silver text-xs font-black tabular-nums text-on-block"
                      >
                        {player.number}
                      </span>
                    )}
                    <span className="min-w-0 flex-1 truncate text-sm font-bold text-slate-900">
                      {player.name}
                    </span>
                    <svg
                      className="h-3.5 w-3.5 flex-shrink-0 text-slate-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 主な対戦成績 */}
        {headToHeadData.length > 0 && (
          <section className="section-rule animate-fade-in animate-delay-500">
            <div className="section-head">
              <h2 className="section-title">主な対戦成績</h2>
            </div>
            <ul className="space-y-2">
              {headToHeadData.map((h2h) => {
                const totalGames = h2h.wins + h2h.draws + h2h.losses;
                const winRate =
                  totalGames > 0
                    ? Math.round((h2h.wins / totalGames) * 100)
                    : 0;
                return (
                  <li key={h2h.opponentName} className="card-native p-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="min-w-0 text-sm font-bold text-slate-900 [word-break:keep-all] break-words">
                        <span className="mr-1.5 text-xs font-bold text-slate-500">
                          vs
                        </span>
                        <BreakableName name={h2h.opponentName} />
                      </p>
                      <p className="flex-shrink-0 text-sm font-bold tabular-nums text-slate-900">
                        {h2h.wins}勝 {h2h.draws}分 {h2h.losses}敗
                      </p>
                    </div>
                    <span
                      aria-hidden="true"
                      className="mt-3 block h-1.5 overflow-hidden rounded-sm bg-slate-100"
                    >
                      <span
                        className="block h-full rounded-sm"
                        style={{
                          width: `${winRate}%`,
                          backgroundColor: accent,
                        }}
                      />
                    </span>
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                      <span>
                        勝率{" "}
                        <span className="font-bold text-slate-700">
                          {winRate}%
                        </span>
                      </span>
                      <span>
                        得点{" "}
                        <span className="font-bold text-slate-700">
                          {h2h.goalsFor} - {h2h.goalsAgainst}
                        </span>
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* 応援メッセージ。読み込み前は中身が空なので section-rule:empty で罫も出さない */}
        <section className="section-rule animate-fade-in animate-delay-500">
          <CheerComments teamId={team.id} teamName={team.name} />
        </section>
      </div>
    </div>
  );
}

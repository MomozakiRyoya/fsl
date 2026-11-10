import { notFound } from "next/navigation";
import Link from "next/link";
import { getPlayers, getRounds, getTeams } from "@/lib/data";
import { fetchTeamPlayerResults } from "@/lib/supabase/player-results";
import {
  summarizePlayerSeason,
  type PlayerResultRow,
} from "@/lib/player-season";

type Props = {
  params: Promise<{ id: string }>;
};

function getInitials(name: string): string {
  const stripped = name.replace(/\s+/g, "");
  return stripped.slice(0, 2).toUpperCase();
}

/** 1〜3 位の面の色。チーム詳細・順位表と同じ（文字は text-on-block） */
const RANK_BLOCK: Record<number, string> = {
  1: "bg-butter",
  2: "bg-silver",
  3: "bg-sand",
};

function rankBlock(rank: number | null, rest: string): string {
  const block = rank ? RANK_BLOCK[rank] : undefined;
  return block ? `${block} text-on-block` : rest;
}

const HERO_BUTTON =
  "touch-active inline-flex h-9 items-center gap-1.5 rounded-lg bg-white/10 px-3 text-xs font-bold text-white ring-1 ring-inset ring-white/15";

/** 個人ポイントの記録が読めなくても、選手ページ自体は出す */
async function loadTeamResults(teamId: string): Promise<PlayerResultRow[]> {
  try {
    return await fetchTeamPlayerResults(teamId);
  } catch (e) {
    console.error("[players/[id]] player_results の取得に失敗:", e);
    return [];
  }
}

function formatDate(date: string): string {
  if (!date) return "";
  const [, m, d] = date.split("-");
  return m && d ? `${Number(m)}/${Number(d)}` : date;
}

export default async function PlayerDetailPage({ params }: Props) {
  const { id } = await params;
  const [players, teams, rounds] = await Promise.all([
    getPlayers(),
    getTeams(),
    getRounds(),
  ]);
  const player = players.find((p) => p.id === id);

  if (!player) notFound();

  const team = teams.find((t) => t.id === player.teamId);
  const rows = await loadTeamResults(player.teamId);
  const season = summarizePlayerSeason(rows, rounds, player);

  const stats = [
    { label: "合計ポイント", value: season.totalPoints, unit: "pt" },
    { label: "出場節数", value: season.roundsPlayed, unit: "節" },
    { label: "平均ポイント", value: season.averagePoints ?? "—", unit: "pt" },
    { label: "最高ポイント", value: season.bestPoints ?? "—", unit: "pt" },
  ];

  return (
    <div className="max-w-lg lg:max-w-4xl mx-auto">
      {/* 見出しの帯: チーム詳細と同じ紺の面 */}
      <section className="bg-[#0c1e42] px-5 pt-4 pb-6 text-white animate-fade-in lg:px-10">
        <Link
          href={team ? `/teams/${team.slug}` : "/players"}
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {team ? team.name : "選手一覧"}
        </Link>

        <div className="mt-6">
          {player.photoUrl ? (
            <img
              src={player.photoUrl}
              alt=""
              className="h-16 w-16 rounded-xl bg-white object-cover ring-1 ring-white/15"
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex h-16 w-16 items-center justify-center rounded-xl bg-white text-xl font-black text-[#0c1e42]"
            >
              {getInitials(player.name)}
            </div>
          )}
          <p className="mt-5 text-[11px] font-bold tracking-[0.04em] text-white/60">
            {player.teamName}
            {team?.leagueName ? ` ・ ${team.leagueName}` : ""}
          </p>
          <h1 className="mt-2 text-[clamp(30px,9vw,48px)] font-black leading-[1.05] tracking-[-0.01em] text-white text-balance break-words">
            {player.name}
          </h1>
          {player.isCaptain && (
            <p className="mt-3 inline-block rounded-md bg-white/10 px-2 py-0.5 text-xs font-bold text-white ring-1 ring-inset ring-white/15">
              キャプテン
            </p>
          )}
        </div>
      </section>

      <div className="px-5 pt-8 pb-10 space-y-10 lg:px-10">
        {/* 今シーズンの成績（個人ポイント） */}
        <section className="section-rule animate-fade-in animate-delay-100">
          <div className="section-head">
            <h2 className="section-title">今シーズンの成績</h2>
          </div>
          <dl className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="card-native p-4">
                <dt className="text-[11px] font-bold tracking-[0.04em] text-slate-500">
                  {s.label}
                </dt>
                <dd className="mt-1.5 flex items-baseline gap-1 text-slate-900">
                  <span className="stat-number">{s.value}</span>
                  {s.value !== "—" && (
                    <span className="text-xs font-bold text-slate-500">
                      {s.unit}
                    </span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* 節ごとの成績 */}
        <section className="section-rule animate-fade-in animate-delay-200">
          <div className="section-head">
            <h2 className="section-title">節ごとの成績</h2>
          </div>
          {season.history.length === 0 ? (
            <p className="card-native px-4 py-6 text-center text-sm text-slate-500">
              まだ個人ポイントの記録がありません
            </p>
          ) : (
            <ul className="card-native overflow-hidden">
              {season.history.map((h, i) => (
                <li
                  key={h.roundId}
                  className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? "border-t border-slate-100" : ""}`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {h.roundName || "節"}
                    </p>
                    {h.date && (
                      <p className="mt-0.5 text-[11px] tabular-nums text-slate-500">
                        {formatDate(h.date)}
                      </p>
                    )}
                  </div>
                  {h.teamRank != null && (
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[11px] font-bold ${rankBlock(h.teamRank, "bg-slate-100 text-slate-700")}`}
                    >
                      チーム{h.teamRank}位
                    </span>
                  )}
                  <span className="w-16 flex-shrink-0 text-right text-base font-black tabular-nums text-slate-900">
                    {h.points}
                    <span className="ml-0.5 text-[10px] font-bold text-slate-500">
                      pt
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 所属 */}
        {team && (
          <section className="section-rule animate-fade-in animate-delay-300">
            <div className="section-head">
              <h2 className="section-title">所属</h2>
            </div>
            <Link
              href={`/teams/${team.slug}`}
              className="card-native flex items-center gap-3 px-4 py-3"
            >
              {team.logoUrl ? (
                <img
                  src={team.logoUrl}
                  alt=""
                  className="h-9 w-9 flex-shrink-0 rounded-lg object-cover"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-silver text-xs font-black text-on-block"
                >
                  {getInitials(team.name)}
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-slate-900">
                  {team.name}
                </span>
                <span className="block text-xs text-slate-500">
                  {team.leagueName}
                </span>
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
          </section>
        )}
      </div>
    </div>
  );
}

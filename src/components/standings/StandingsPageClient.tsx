"use client";

import { useState } from "react";
import Link from "next/link";
import type { League, TeamStanding } from "@/lib/types/app";
import RankChart from "@/components/standings/RankChart";
import StandingsSimulator from "@/components/standings/StandingsSimulator";
import PlayoffBracket from "@/components/standings/PlayoffBracket";
import AiAnalysis from "@/components/standings/AiAnalysis";
import GlideTabs from "@/components/ui/GlideTabs";
import BreakableName from "@/components/ui/BreakableName";

const SUB_TABS = ["順位表", "シミュレーター"] as const;
type SubTab = (typeof SUB_TABS)[number];
const SUB_TAB_OPTIONS = SUB_TABS.map((tab) => ({ key: tab, label: tab }));

const LEAGUE_SHORT: Record<string, string> = {
  premier: "プレミア",
  spade: "スペード",
  heart: "ハート",
  diamond: "ダイヤ",
  club: "クローバー",
};

// 上位 3 つは色の面の札（金・銀・銅）。数字は札の中にそのまま出す
const RANK_BLOCK: Record<number, string> = {
  1: "bg-butter",
  2: "bg-silver",
  3: "bg-sand",
};

function RankBadge({ rank }: { rank: number }) {
  const block = RANK_BLOCK[rank];
  if (block) {
    return (
      <span
        className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-extrabold tabular-nums text-on-block ${block}`}
      >
        {rank}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center w-7 h-7 text-slate-500 text-sm font-medium tabular-nums">
      {rank}
    </span>
  );
}

function getInitials(name: string): string {
  const stripped = name.replace(/\s+/g, "");
  return stripped.slice(0, 2).toUpperCase();
}

function StandingsTable({
  standings,
  leagueColor,
  leagueId,
}: {
  standings: TeamStanding[];
  leagueColor: string;
  leagueId?: string;
}) {
  // 直近3節を動的に算出
  const allRoundNums = new Set<number>();
  for (const team of standings) {
    for (const r of Object.keys(team.roundPoints)) {
      allRoundNums.add(Number(r));
    }
  }
  const lastRounds = [...allRoundNums]
    .sort((a, b) => b - a)
    .slice(0, 3)
    .reverse();
  const hasRounds = lastRounds.length > 0;

  // 名前に幅を渡すため、順位・節・合計の列は中身が収まるぎりぎりまで詰める
  // （順位の札 28px・節 28px・合計 40px。375px で名前の列が 63px から 111px になる）
  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: hasRounds
      ? `1.75rem minmax(0,1fr) ${lastRounds.map(() => "1.75rem").join(" ")} 2.5rem`
      : "1.75rem minmax(0,1fr) 2.5rem",
    gap: "0.25rem",
  };

  return (
    <div className="card-native overflow-hidden animate-spring-in">
      <div
        className="px-3 pt-3.5 pb-2 border-b border-slate-100 text-[10px] font-bold tracking-[0.08em] text-slate-500"
        style={gridStyle}
      >
        <span className="text-center">#</span>
        <span>チーム</span>
        {hasRounds &&
          lastRounds.map((r) => (
            <span key={r} className="text-center">
              {r}節
            </span>
          ))}
        <span className="text-right">合計</span>
      </div>
      {standings.map((team, i) => {
        const isPremier = leagueId === "premier";

        const rowStyle: React.CSSProperties = {
          animationDelay: `${i * 35}ms`,
          background: isPremier
            ? team.rank === 1
              ? "rgba(201,146,30,0.12)"
              : team.rank <= 3
                ? "rgba(34,197,94,0.08)"
                : team.rank === 6
                  ? "rgba(239,68,68,0.07)"
                  : undefined
            : team.rank === 1
              ? "rgba(201,146,30,0.12)"
              : undefined,
          borderBottom:
            isPremier && team.rank === 3
              ? "2px solid rgba(239,68,68,0.5)"
              : undefined,
        };

        const rowClass =
          "px-3 py-3 items-center border-b border-slate-100 last:border-0 hover:bg-amber-50/40 transition-colors animate-spring-in";

        const rowContent = (
          <>
            <div className="flex justify-center">
              <RankBadge rank={team.rank} />
            </div>
            {/* 360px 未満はロゴを畳んで名前に幅を渡す（残すと 320px で「BARTENDER」が語の途中で割れる） */}
            <div className="flex items-center gap-2 min-w-0">
              {team.teamLogoUrl ? (
                <img
                  src={team.teamLogoUrl}
                  alt={team.teamName}
                  className="hidden min-[360px]:block w-7 h-7 rounded-full object-cover flex-shrink-0 shadow-sm"
                />
              ) : (
                <div
                  className="hidden min-[360px]:flex w-7 h-7 rounded-full items-center justify-center text-[9px] font-black text-white flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: leagueColor }}
                >
                  {getInitials(team.teamName)}
                </div>
              )}
              <span className="text-sm font-semibold leading-tight text-slate-900 line-clamp-2 break-words text-balance">
                <BreakableName name={team.teamName} />
              </span>
            </div>
            {hasRounds &&
              lastRounds.map((r) => {
                const pts = team.roundPoints[r];
                return (
                  <span
                    key={r}
                    className={`text-xs tabular-nums text-center font-medium ${pts != null ? "text-slate-700" : "text-slate-400"}`}
                  >
                    {pts != null ? pts : "—"}
                  </span>
                );
              })}
            <span className="text-lg font-light leading-none tabular-nums tracking-[-0.02em] text-right text-slate-900">
              {team.totalPoints}
            </span>
          </>
        );

        const mergedStyle = { ...gridStyle, ...rowStyle };

        if (team.teamSlug) {
          return (
            <Link
              key={team.teamId}
              href={`/teams/${team.teamSlug}`}
              className={rowClass}
              style={mergedStyle}
            >
              {rowContent}
            </Link>
          );
        }
        return (
          <div key={team.teamId} className={rowClass} style={mergedStyle}>
            {rowContent}
          </div>
        );
      })}
    </div>
  );
}

const COMPLETED_ROUNDS = [1, 2, 3, 4];

interface Props {
  leagues: League[];
  standings: Record<string, TeamStanding[]>;
}

export default function StandingsPageClient({ leagues, standings }: Props) {
  const [activeLeague, setActiveLeague] = useState<string>("premier");
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("順位表");

  const currentLeague = leagues.find((l) => l.id === activeLeague);
  const currentStandings = standings[activeLeague] ?? [];

  const rankHistory = currentStandings.map((team) => {
    const ranks = COMPLETED_ROUNDS.map((r) => {
      const roundPoints = currentStandings.map((s) => ({
        id: s.teamId,
        pts: s.roundPoints[r] ?? 0,
      }));
      roundPoints.sort((a, b) => b.pts - a.pts);
      return roundPoints.findIndex((s) => s.id === team.teamId) + 1;
    });
    return {
      teamId: team.teamId,
      teamName: team.teamName,
      color: currentLeague?.color ?? "#2b70ef",
      ranks,
    };
  });
  const topTeams = rankHistory.slice(0, 5);

  return (
    <div className="max-w-lg lg:max-w-4xl mx-auto">
      <div
        className="px-4 pt-6 pb-5 animate-fade-in"
        style={{
          background:
            "linear-gradient(160deg, #0c1e42 0%, #1a3268 60%, #0c1e42 100%)",
        }}
      >
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-1">
          Season 7
        </p>
        <h1 className="text-2xl font-black text-white tracking-tight">
          LEAGUE STANDINGS
        </h1>
      </div>

      <div className="px-4 py-4">
        <GlideTabs
          ariaLabel="表示の切り替え"
          options={SUB_TAB_OPTIONS}
          value={activeSubTab}
          onChange={(key) => setActiveSubTab(key as SubTab)}
          className="mb-4"
        />

        {activeSubTab === "順位表" && (
          <>
            <GlideTabs
              variant="rail"
              ariaLabel="ディビジョン"
              options={leagues.map((league) => ({
                key: league.id,
                label: LEAGUE_SHORT[league.id] ?? league.name,
              }))}
              value={activeLeague}
              onChange={setActiveLeague}
              className="-mx-4 px-4 mb-4"
            />

            <StandingsTable
              standings={currentStandings}
              leagueColor={currentLeague?.color ?? "#2b70ef"}
              leagueId={activeLeague}
            />
          </>
        )}

        {activeSubTab === "シミュレーター" && (
          <StandingsSimulator standings={currentStandings} />
        )}
      </div>
    </div>
  );
}

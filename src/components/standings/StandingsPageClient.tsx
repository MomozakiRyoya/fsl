"use client";

import { useState } from "react";
import Link from "next/link";
import type { League, TeamStanding } from "@/lib/types/app";
import RankChart from "@/components/standings/RankChart";
import StandingsSimulator from "@/components/standings/StandingsSimulator";
import PlayoffBracket from "@/components/standings/PlayoffBracket";
import AiAnalysis from "@/components/standings/AiAnalysis";

const SUB_TABS = ["順位表", "シミュレーター"] as const;
type SubTab = (typeof SUB_TABS)[number];

const LEAGUE_SHORT: Record<string, string> = {
  premier: "プレミア",
  spade: "スペード",
  heart: "ハート",
  diamond: "ダイヤ",
  club: "クローバー",
};

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span
        className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shadow-sm"
        style={{
          background: "linear-gradient(135deg, #c9921e, #e3c060)",
          color: "#0c1e42",
        }}
      >
        1
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-400 text-white text-xs font-bold shadow-sm">
        2
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-600 text-white text-xs font-bold shadow-sm">
        3
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center w-7 h-7 text-slate-500 text-sm font-medium">
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
}: {
  standings: TeamStanding[];
  leagueColor: string;
}) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-native animate-spring-in">
      <div
        className="grid grid-cols-[2rem_1fr_3rem] gap-1 px-3 py-2.5 border-b border-white/10"
        style={{ background: "#0c1e42" }}
      >
        <span className="text-[11px] font-bold text-white/50 text-center">
          #
        </span>
        <span className="text-[11px] font-bold text-white/50">チーム</span>
        <span className="text-[11px] font-bold text-white/50 text-right">
          合計
        </span>
      </div>
      {standings.map((team, i) => {
        const rowContent = (
          <>
            <div className="flex justify-center">
              <RankBadge rank={team.rank} />
            </div>
            <div className="flex items-center gap-2 min-w-0">
              {team.teamLogoUrl ? (
                <img
                  src={team.teamLogoUrl}
                  alt={team.teamName}
                  className="w-7 h-7 rounded-full object-cover flex-shrink-0 shadow-sm"
                />
              ) : (
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black text-white flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: leagueColor }}
                >
                  {getInitials(team.teamName)}
                </div>
              )}
              <span className="text-sm font-semibold text-slate-900 truncate">
                {team.teamName}
              </span>
            </div>
            <span
              className="text-sm font-black tabular-nums text-right"
              style={{ color: team.rank <= 3 ? leagueColor : "#334155" }}
            >
              {team.totalPoints}
            </span>
          </>
        );

        const rowStyle = {
          animationDelay: `${i * 35}ms`,
          background:
            team.rank <= 4
              ? "rgba(201,146,30,0.05)"
              : team.rank >= 7
                ? "rgba(239,68,68,0.04)"
                : undefined,
          borderLeft:
            team.rank <= 4
              ? "3px solid rgba(201,146,30,0.35)"
              : team.rank >= 7
                ? "3px solid rgba(239,68,68,0.4)"
                : "3px solid transparent",
        };

        const rowClass =
          "grid grid-cols-[2rem_1fr_3rem] gap-1 px-3 py-3 items-center border-b border-slate-100 last:border-0 hover:bg-amber-50/40 transition-colors animate-spring-in";

        if (team.teamSlug) {
          return (
            <Link
              key={team.teamId}
              href={`/teams/${team.teamSlug}`}
              className={rowClass}
              style={rowStyle}
            >
              {rowContent}
            </Link>
          );
        }
        return (
          <div key={team.teamId} className={rowClass} style={rowStyle}>
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
          Season 1
        </p>
        <h1 className="text-2xl font-black text-white tracking-tight">
          LEAGUE STANDINGS
        </h1>
        <p className="text-xs text-white/50 mt-1">
          福岡スーパーリーグ 第1シーズン
        </p>
      </div>

      <div className="px-4 py-4">
        <p className="text-[11px] text-slate-400 mb-3">
          プレーオフ進出圏: 上位4チーム
        </p>

        <div className="flex border-b border-slate-200 bg-white -mx-4 px-4 mb-4">
          {SUB_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`flex-1 py-3 text-sm font-semibold transition-colors duration-150 ${activeSubTab === tab ? "text-amber-600 border-b-2 border-amber-500" : "text-slate-400 hover:text-slate-600"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeSubTab === "順位表" && (
          <>
            <div className="flex gap-1.5 mb-4 p-1.5 bg-slate-100 rounded-2xl overflow-x-auto">
              {leagues.map((league) => (
                <button
                  key={league.id}
                  onClick={() => setActiveLeague(league.id)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95 whitespace-nowrap"
                  style={
                    activeLeague === league.id
                      ? {
                          background: "#0c1e42",
                          color: "white",
                          boxShadow: "0 2px 6px rgba(12,30,66,0.2)",
                        }
                      : { color: "#64748b" }
                  }
                >
                  {LEAGUE_SHORT[league.id] ?? league.name}
                </button>
              ))}
            </div>

            <StandingsTable
              standings={currentStandings}
              leagueColor={currentLeague?.color ?? "#2b70ef"}
            />

            <div className="mt-3 flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-sm flex-shrink-0 border-l-2"
                  style={{
                    borderColor: "#c9921e",
                    background: "rgba(201,146,30,0.12)",
                  }}
                />
                <span className="text-xs text-slate-500">プレーオフ進出</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm flex-shrink-0 border-l-2 border-red-400 bg-red-50" />
                <span className="text-xs text-slate-500">降格圏</span>
              </div>
            </div>

            <div className="mt-4 animate-fade-in">
              <RankChart
                leagueId={activeLeague}
                teams={topTeams}
                rounds={COMPLETED_ROUNDS}
              />
            </div>

            <div className="mt-4 flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <svg
                className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fillRule="evenodd"
                  d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-xs text-amber-800">
                上位4チームがプレーオフ（WILD CARD）に進出。SEMI FINAL → THE
                FINAL で優勝を争います。
              </p>
            </div>
          </>
        )}

        {activeSubTab === "シミュレーター" && (
          <StandingsSimulator standings={currentStandings} />
        )}
      </div>
    </div>
  );
}

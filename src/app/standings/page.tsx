"use client";

import { useState } from "react";
import { MOCK_LEAGUES, MOCK_STANDINGS } from "@/lib/mock-data";
import type { TeamStanding } from "@/lib/types/app";
import RankChart from "@/components/standings/RankChart";

// const standings = await getStandings(leagueId)

const ROUND_FILTERS = [
  { key: "all", label: "総合" },
  { key: "1", label: "R1" },
  { key: "2", label: "R2" },
  { key: "3", label: "R3" },
  { key: "4", label: "R4" },
];

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
  roundFilter,
  leagueColor,
}: {
  standings: TeamStanding[];
  roundFilter: string;
  leagueColor: string;
}) {
  const getSortedStandings = (): TeamStanding[] => {
    if (roundFilter === "all") return standings;

    const roundNum = parseInt(roundFilter);
    return [...standings]
      .map((s) => ({ ...s, totalPoints: s.roundPoints[roundNum] ?? 0 }))
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((s, i) => ({ ...s, rank: i + 1 }));
  };

  const sorted = getSortedStandings();

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-native animate-spring-in">
      {/* ヘッダー */}
      <div
        className="grid grid-cols-[2rem_1fr_2rem_2rem_2rem_2rem_2.5rem] gap-1 px-3 py-2.5 border-b border-white/10"
        style={{ background: "#0c1e42" }}
      >
        <span className="text-[11px] font-bold text-white/50 text-center">
          #
        </span>
        <span className="text-[11px] font-bold text-white/50">チーム</span>
        <span className="text-[11px] font-bold text-white/50 text-center">
          R1
        </span>
        <span className="text-[11px] font-bold text-white/50 text-center">
          R2
        </span>
        <span className="text-[11px] font-bold text-white/50 text-center">
          R3
        </span>
        <span className="text-[11px] font-bold text-white/50 text-center">
          R4
        </span>
        <span className="text-[11px] font-bold text-white/50 text-right">
          合計
        </span>
      </div>
      {/* 行 */}
      {sorted.map((team, i) => (
        <div
          key={team.teamId}
          className="grid grid-cols-[2rem_1fr_2rem_2rem_2rem_2rem_2.5rem] gap-1 px-3 py-3 items-center border-b border-slate-100 last:border-0 hover:bg-amber-50/40 transition-colors animate-spring-in"
          style={{
            animationDelay: `${i * 35}ms`,
            background:
              team.rank <= 2
                ? "rgba(201,146,30,0.06)"
                : team.rank >= 7
                  ? "rgba(239,68,68,0.04)"
                  : undefined,
          }}
        >
          <div className="flex justify-center">
            <RankBadge rank={team.rank} />
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black text-white flex-shrink-0 shadow-sm"
              style={{ backgroundColor: leagueColor }}
            >
              {getInitials(team.teamName)}
            </div>
            <span className="text-sm font-semibold text-slate-900 truncate">
              {team.teamName}
            </span>
          </div>
          {[1, 2, 3, 4].map((r) => (
            <span
              key={r}
              className={`text-sm tabular-nums text-center ${
                roundFilter === String(r)
                  ? "font-bold text-primary-600"
                  : "text-slate-500"
              }`}
            >
              {team.roundPoints[r] ?? "—"}
            </span>
          ))}
          <span
            className="text-sm font-black tabular-nums text-right"
            style={{ color: team.rank <= 3 ? leagueColor : "#334155" }}
          >
            {roundFilter === "all"
              ? team.totalPoints
              : (team.roundPoints[parseInt(roundFilter)] ?? "—")}
          </span>
        </div>
      ))}
    </div>
  );
}

const COMPLETED_ROUNDS = [1, 2, 3, 4];

export default function StandingsPage() {
  const [activeLeague, setActiveLeague] = useState<string>("div1");
  const [activeRound, setActiveRound] = useState<string>("all");

  const currentLeague = MOCK_LEAGUES.find((l) => l.id === activeLeague);
  const standings = MOCK_STANDINGS[activeLeague] ?? [];

  // ラウンドごとの順位を計算（totalPoints降順でランク付け）
  const rankHistory = standings.map((team) => {
    const ranks = COMPLETED_ROUNDS.map((r) => {
      const roundPoints = standings.map((s) => ({
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
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">
        順位表
      </h1>

      {/* リーグタブ（横スクロール） */}
      <div className="flex gap-2 overflow-x-auto scroll-x-hidden pb-2 mb-4 -mx-4 px-4">
        {MOCK_LEAGUES.map((league) => {
          const isActive = activeLeague === league.id;
          return (
            <button
              key={league.id}
              onClick={() => setActiveLeague(league.id)}
              className={`flex-none flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 active:scale-95 ${
                isActive
                  ? "text-white shadow-native-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
              style={isActive ? { backgroundColor: league.color } : {}}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isActive ? "bg-white/70" : ""}`}
                style={!isActive ? { backgroundColor: league.color } : {}}
              />
              {league.name}
            </button>
          );
        })}
      </div>

      {/* ラウンドフィルター */}
      <div className="flex gap-1.5 mb-4 p-1.5 bg-slate-100 rounded-2xl">
        {ROUND_FILTERS.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveRound(filter.key)}
            className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95"
            style={
              activeRound === filter.key
                ? {
                    background: "#0c1e42",
                    color: "white",
                    boxShadow: "0 2px 6px rgba(12,30,66,0.2)",
                  }
                : { color: "#64748b" }
            }
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* 順位表 */}
      <StandingsTable
        standings={standings}
        roundFilter={activeRound}
        leagueColor={currentLeague?.color ?? "#2b70ef"}
      />

      {/* 順位推移グラフ */}
      <div className="mt-4 animate-fade-in">
        <RankChart
          leagueId={activeLeague}
          teams={topTeams}
          rounds={COMPLETED_ROUNDS}
        />
      </div>

      {/* 凡例 */}
      <div className="mt-3 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span
            className="w-3 h-3 rounded-sm flex-shrink-0"
            style={{ background: "rgba(201,146,30,0.25)" }}
          />
          <span className="text-xs text-slate-500">プレーオフ進出</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm flex-shrink-0 bg-red-100" />
          <span className="text-xs text-slate-500">降格圏</span>
        </div>
      </div>

      {/* プレーオフ進出説明 */}
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
          上位4チームがプレーオフ（WILD CARD）に進出。SEMI FINAL → THE FINAL
          で優勝を争います。
        </p>
      </div>
    </div>
  );
}

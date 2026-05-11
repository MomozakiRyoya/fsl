"use client";

import { useState } from "react";
import type { League, TeamStanding } from "@/lib/types/app";

const RANK_COLORS: Record<number, { bg: string; text: string }> = {
  1: { bg: "linear-gradient(135deg, #c9921e, #e3c060)", text: "#0c1e42" },
  2: { bg: "linear-gradient(135deg, #94a3b8, #cbd5e1)", text: "#1e293b" },
  3: { bg: "linear-gradient(135deg, #92400e, #d97706)", text: "#fff" },
};

function StandingsList({ items }: { items: TeamStanding[] }) {
  if (items.length === 0) {
    return (
      <p className="text-center text-sm text-slate-400 py-12">チームデータなし</p>
    );
  }
  return (
    <div className="space-y-2">
      {items.map((entry) => {
        const medal = RANK_COLORS[entry.rank];
        const isTop3 = entry.rank <= 3;
        return (
          <div
            key={entry.teamId}
            className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center gap-3 shadow-sm"
            style={
              isTop3
                ? {
                    borderColor: "transparent",
                    boxShadow:
                      "0 0 0 1.5px rgba(201,146,30,0.3), 0 1px 4px rgba(0,0,0,0.06)",
                  }
                : undefined
            }
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
              style={
                medal
                  ? { background: medal.bg, color: medal.text }
                  : { background: "#f1f5f9", color: "#64748b" }
              }
            >
              {entry.rank}
            </div>
            {entry.teamLogoUrl ? (
              <img
                src={entry.teamLogoUrl}
                alt={entry.teamName}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-slate-100"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400 flex-shrink-0">
                {entry.teamName.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">
                {entry.teamName}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p
                className="text-base font-black tabular-nums"
                style={{ color: isTop3 ? "#c9921e" : "#334155" }}
              >
                {entry.totalPoints}
              </p>
              <p className="text-[10px] text-slate-400">pt</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function RankingPageClient({
  leagues,
  standings,
}: {
  leagues: League[];
  standings: Record<string, TeamStanding[]>;
}) {
  const [activeLeague, setActiveLeague] = useState(leagues[0]?.id ?? "premier");

  const premierLeagues = leagues.filter((l) => l.id === "premier");
  const regularLeagues = leagues.filter((l) => l.id !== "premier");

  const activeItems = standings[activeLeague] ?? [];

  return (
    <div className="max-w-lg mx-auto">
      {/* ヘッダー */}
      <div
        className="relative overflow-hidden px-5 pt-10 pb-6"
        style={{
          background:
            "linear-gradient(135deg, #0c1e42 0%, #1a3a7a 60%, #0c1e42 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 100%, #c9921e 0%, transparent 60%)",
          }}
        />
        <div className="relative">
          <p className="text-white/50 text-xs tracking-[0.25em] uppercase mb-1">
            FSL Season 7
          </p>
          <h1 className="text-2xl font-black text-white tracking-widest">
            RANKING
          </h1>
          <p className="text-white/40 text-xs mt-1">各リーグの現在の順位</p>
        </div>
      </div>

      <div className="px-4 pt-5 pb-8 space-y-4">
        {/* タブ: プレミアリーグ */}
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            Premier League
          </p>
          <div className="flex gap-1.5 flex-wrap">
            {premierLeagues.map((l) => (
              <button
                key={l.id}
                onClick={() => setActiveLeague(l.id)}
                className="px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap"
                style={
                  activeLeague === l.id
                    ? {
                        background: "linear-gradient(135deg, #c9921e, #e3c060)",
                        color: "#0c1e42",
                      }
                    : {
                        background: "#f1f5f9",
                        color: "#64748b",
                      }
                }
              >
                {l.name}
              </button>
            ))}
          </div>
        </div>

        {/* タブ: レギュラーリーグ */}
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            Regular League
          </p>
          <div className="flex gap-1.5 flex-wrap">
            {regularLeagues.map((l) => (
              <button
                key={l.id}
                onClick={() => setActiveLeague(l.id)}
                className="px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap"
                style={
                  activeLeague === l.id
                    ? {
                        background: "linear-gradient(135deg, #c9921e, #e3c060)",
                        color: "#0c1e42",
                      }
                    : {
                        background: "#f1f5f9",
                        color: "#64748b",
                      }
                }
              >
                {l.name}
              </button>
            ))}
          </div>
        </div>

        {/* 選択リーグのランキング */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            {leagues.find((l) => l.id === activeLeague)?.name} 順位表
          </p>
          <StandingsList items={activeItems} />
        </div>
      </div>
    </div>
  );
}

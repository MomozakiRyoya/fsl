"use client";

import { useState } from "react";
import type { PlayerStats } from "@/lib/types/app";
import CountUp from "@/components/ui/CountUp";

const RANK_STYLES: Record<number, { bg: string; text: string; border: string }> = {
  1: { bg: "bg-amber-50", text: "#c9921e", border: "border-amber-200" },
  2: { bg: "bg-slate-100", text: "#64748b", border: "border-slate-200" },
  3: { bg: "bg-orange-50", text: "#b45309", border: "border-orange-200" },
};

function RankingList({ players }: { players: PlayerStats[] }) {
  const [expanded, setExpanded] = useState(false);
  const sorted = [...players].sort((a, b) => b.goals - a.goals);
  const visible = expanded ? sorted : sorted.slice(0, 5);

  if (sorted.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 py-10 text-center shadow-sm">
        <p className="text-sm text-slate-400">データなし</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
      {visible.map((player, i) => {
        const rank = i + 1;
        const rankStyle = RANK_STYLES[rank];
        return (
          <div key={player.playerId} className="px-4 py-3 flex items-center gap-3 border-b border-slate-50 last:border-0">
            {rankStyle ? (
              <span
                className={`w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-full text-[11px] font-black border ${rankStyle.bg} ${rankStyle.border}`}
                style={{ color: rankStyle.text }}
              >
                {rank}
              </span>
            ) : (
              <span className="w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-full text-[11px] font-bold bg-slate-50 text-slate-400">
                {rank}
              </span>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-tight truncate" style={rankStyle ? { color: rankStyle.text } : { color: "#334155" }}>
                {player.playerName}
              </p>
              <p className="text-[11px] text-slate-400 truncate">{player.teamName}</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold" style={{ color: "#c9921e" }}>Pt</span>
                <CountUp value={player.goals} duration={3500} className="text-sm font-black tabular-nums" />
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <span className="text-[10px] font-medium">ITM</span>
                <span className="text-xs font-semibold tabular-nums">
                  <CountUp value={player.assists} duration={3800} />%
                </span>
              </div>
            </div>
          </div>
        );
      })}
      {sorted.length > 5 && (
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="w-full px-4 py-3 text-xs font-semibold text-slate-400 text-center border-t border-slate-50 hover:bg-slate-50 active:bg-slate-100 transition-colors"
        >
          {expanded ? "折りたたむ" : `もっと見る（${sorted.length - 5}人）`}
        </button>
      )}
    </div>
  );
}

export default function TopScorers({ playerStats }: { playerStats: PlayerStats[] }) {
  const [tab, setTab] = useState<"premier" | "regular">("premier");

  const premierStats = playerStats.filter((p) => p.leagueId === "premier");
  const regularStats = playerStats.filter((p) => p.leagueId !== "premier");

  return (
    <section className="animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ color: "#c9921e" }}>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a10 10 0 0 1 6.5 2.5M12 2a10 10 0 0 0-6.5 2.5M12 22a10 10 0 0 0 6.5-2.5M12 22a10 10 0 0 1-6.5-2.5M12 2v4m0 16v-4M2 12h4m16 0h-4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83" />
          </svg>
          プレイヤー獲得ポイントランキング
        </h2>
      </div>

      {/* タブ */}
      <div className="flex gap-1 mb-3 p-1 rounded-xl border border-slate-200 w-fit" style={{ background: "#f8fafc" }}>
        {(["premier", "regular"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap"
            style={
              tab === t
                ? { background: "linear-gradient(135deg, #c9921e, #e3c060)", color: "#0c1e42" }
                : { color: "#94a3b8" }
            }
          >
            {t === "premier" ? "プレミア" : "レギュラー"}
          </button>
        ))}
      </div>

      <RankingList players={tab === "premier" ? premierStats : regularStats} />
    </section>
  );
}

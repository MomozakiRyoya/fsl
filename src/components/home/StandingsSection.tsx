"use client";

import { useState } from "react";
import Link from "next/link";
import type { League, TeamStanding } from "@/lib/types/app";

function getInitials(name: string) {
  const chars = name.replace(/[aeiou\s]/gi, "");
  return chars.slice(0, 2).toUpperCase();
}

interface Props {
  leagues: League[];
  standings: Record<string, TeamStanding[]>;
}

export default function StandingsSection({ leagues, standings }: Props) {
  // プレミア以外はデフォルト閉じ
  const [openLeagues, setOpenLeagues] = useState<Set<string>>(new Set(["premier"]));

  const toggle = (leagueId: string) => {
    setOpenLeagues((prev) => {
      const next = new Set(prev);
      if (next.has(leagueId)) next.delete(leagueId);
      else next.add(leagueId);
      return next;
    });
  };

  return (
    <div className="space-y-2">
      {leagues.map((league) => {
        const leagueStandings = standings[league.id] ?? [];
        const isPremier = league.id === "premier";
        const isOpen = openLeagues.has(league.id);

        return (
          <div key={league.id} className="card-native overflow-hidden">
            {/* ヘッダー（タップで開閉） */}
            <button
              onClick={() => toggle(league.id)}
              className="w-full flex items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-slate-50 active:bg-slate-100"
              style={{ borderLeftWidth: 3, borderLeftColor: league.color }}
            >
              <span className="text-xs font-bold text-slate-700 flex-1">
                {league.name}
              </span>
              <span className="text-[10px] text-slate-400 mr-2">
                {leagueStandings.length}チーム
              </span>
              {/* 開閉インジケーター */}
              <svg
                className="w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200"
                style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* コンテンツ */}
            {isOpen && (
              <Link
                href={`/standings?league=${league.id}`}
                className="block border-t border-slate-100"
              >
                {leagueStandings.length === 0 ? (
                  <div className="px-4 py-3 text-xs text-slate-400">データなし</div>
                ) : (
                  leagueStandings.map((team, idx) => (
                    <div
                      key={team.teamId}
                      className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-50 last:border-0"
                    >
                      <span
                        className="text-xs font-black tabular-nums w-5 text-center flex-shrink-0"
                        style={{
                          color: idx === 0 ? "#c9921e" : idx === 1 ? "#64748b" : idx === 2 ? "#b45309" : "#94a3b8",
                        }}
                      >
                        {team.rank}
                      </span>
                      {team.teamLogoUrl ? (
                        <img src={team.teamLogoUrl} alt={team.teamName} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black text-white flex-shrink-0"
                          style={{ backgroundColor: league.color }}
                        >
                          {getInitials(team.teamName)}
                        </div>
                      )}
                      <span className="flex-1 text-sm font-semibold text-slate-800 truncate">
                        {team.teamName}
                      </span>
                      <span className="text-sm font-black tabular-nums flex-shrink-0" style={{ color: "#c9921e" }}>
                        {team.totalPoints}
                        <span className="text-xs font-normal text-slate-400 ml-0.5">pt</span>
                      </span>
                    </div>
                  ))
                )}
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}

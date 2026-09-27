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
  const [openLeagues, setOpenLeagues] = useState<Set<string>>(
    new Set(["premier"]),
  );

  const toggle = (leagueId: string) => {
    setOpenLeagues((prev) => {
      const next = new Set(prev);
      if (next.has(leagueId)) next.delete(leagueId);
      else next.add(leagueId);
      return next;
    });
  };

  return (
    <div className="border-t border-ink/15">
      {leagues.map((league) => {
        const leagueStandings = standings[league.id] ?? [];
        const isOpen = openLeagues.has(league.id);

        return (
          <div key={league.id} className="border-b border-ink/15">
            {/* ヘッダー（タップで開閉） */}
            <button
              type="button"
              onClick={() => toggle(league.id)}
              aria-expanded={isOpen}
              className="group touch-active w-full flex items-center gap-2.5 py-3 text-left"
            >
              <span
                className="w-2.5 h-2.5 flex-shrink-0 border border-ink/20"
                style={{ backgroundColor: league.color }}
                aria-hidden="true"
              />
              <span className="flex-1 text-sm font-bold text-ink underline-offset-4 group-hover:underline">
                {league.name}
              </span>
              <span className="text-[11px] text-ink/70 tabular-nums">
                {leagueStandings.length}チーム
              </span>
              {/* 開閉インジケーター */}
              <svg
                className="w-4 h-4 text-ink/70 flex-shrink-0 transition-transform duration-200"
                style={{
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="square" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* コンテンツ */}
            {isOpen && (
              <Link
                href={`/standings?league=${league.id}`}
                className="block border-t border-ink/10"
              >
                {leagueStandings.length === 0 ? (
                  <div className="py-3 text-xs text-ink/70">データなし</div>
                ) : (
                  leagueStandings.map((team) => (
                    <div
                      key={team.teamId}
                      className="flex items-center gap-3 py-2.5 border-b border-ink/10 last:border-0"
                    >
                      <span className="text-xs font-black tabular-nums w-5 flex-shrink-0 text-ink">
                        {team.rank}
                      </span>
                      {team.teamLogoUrl ? (
                        <img
                          src={team.teamLogoUrl}
                          alt={team.teamName}
                          className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black text-white flex-shrink-0"
                          style={{ backgroundColor: league.color }}
                        >
                          {getInitials(team.teamName)}
                        </div>
                      )}
                      <span className="flex-1 text-sm font-bold text-ink truncate">
                        {team.teamName}
                      </span>
                      <span className="text-sm font-black tabular-nums flex-shrink-0 text-ink">
                        {team.totalPoints}
                        <span className="text-xs font-normal text-ink/70 ml-0.5">
                          pt
                        </span>
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

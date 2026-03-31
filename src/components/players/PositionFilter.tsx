"use client";

import { useState } from "react";
import type { Player, PlayerStats } from "@/lib/types/app";

/** 誕生日（MM/DD または YYYY/MM/DD）が過去7日以内か判定 */
function isRecentBirthday(birthday: string | null): boolean {
  if (!birthday) return false;
  const parts = birthday.split("/");
  if (parts.length < 2) return false;
  const month = parseInt(parts[parts.length - 2], 10);
  const day = parseInt(parts[parts.length - 1], 10);
  if (isNaN(month) || isNaN(day)) return false;
  const today = new Date();
  const bdThisYear = new Date(today.getFullYear(), month - 1, day);
  const diffMs = today.getTime() - bdThisYear.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays < 7;
}

/** 誕生日を MM/DD 形式で表示 */
function formatBirthday(birthday: string): string {
  const parts = birthday.split("/");
  if (parts.length >= 2) {
    const month = parts[parts.length - 2].padStart(2, "0");
    const day = parts[parts.length - 1].padStart(2, "0");
    return `${month}/${day}`;
  }
  return birthday;
}

type TeamFilter = "ALL" | string;

interface Props {
  players: Player[];
  stats: PlayerStats[];
  topScorerPlayerId: string;
}

function getInitials(name: string): string {
  const stripped = name.replace(/\s+/g, "");
  return stripped.slice(0, 2).toUpperCase();
}

export default function PositionFilter({
  players,
  stats,
  topScorerPlayerId,
}: Props) {
  const [teamFilter, setTeamFilter] = useState<TeamFilter>("ALL");

  const filtered =
    teamFilter === "ALL"
      ? players
      : players.filter((p) => p.teamName === teamFilter);

  const statsMap = new Map(stats.map((s) => [s.playerId, s]));

  const teams = Array.from(new Set(players.map((p) => p.teamName)));
  const tabs: TeamFilter[] = ["ALL", ...teams];

  return (
    <>
      {/* チームフィルタータブ */}
      <div className="flex flex-wrap gap-2 mb-5">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setTeamFilter(tab)}
            className={`inline-flex items-center justify-center h-9 px-4 rounded-full text-sm font-medium transition-colors cursor-pointer ${
              teamFilter === tab
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
            aria-pressed={teamFilter === tab}
          >
            {tab === "ALL" ? "すべて" : tab}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-400 self-center">
          {filtered.length}人
        </span>
      </div>

      {/* 選手グリッド */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map((player) => {
          const stat = statsMap.get(player.id);
          const isTopScorer = player.id === topScorerPlayerId;
          const recentBirthday = isRecentBirthday(player.birthday ?? null);
          return (
            <a
              key={player.id}
              href={`/players/${player.id}`}
              className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 block"
            >
              {/* アバター + バッジ */}
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                  {getInitials(player.name)}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs font-medium text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">
                    #{player.number}
                  </span>
                </div>
              </div>

              {/* 名前 */}
              <div className="mb-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-sm font-bold text-slate-900 leading-tight">
                    {player.name}
                  </p>
                  {isTopScorer && (
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-300 rounded-full px-1.5 py-0.5">
                      得点王
                    </span>
                  )}
                  {recentBirthday && (
                    <span className="text-[10px] font-bold bg-pink-100 text-pink-600 border border-pink-300 rounded-full px-1.5 py-0.5">
                      Birthday
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {player.teamName}
                </p>
                {player.birthday && (
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {recentBirthday ? "🎂 " : ""}
                    {formatBirthday(player.birthday)}
                  </p>
                )}
              </div>

              {/* 出場回数 */}
              {stat ? (
                <div className="flex gap-3 pt-2 border-t border-slate-100">
                  <div className="text-center">
                    <p className="text-base font-black text-slate-900 tabular-nums">
                      {stat.games}
                    </p>
                    <p className="text-[10px] text-slate-400">出場</p>
                  </div>
                  {stat.mvpCount > 0 && (
                    <div className="text-center">
                      <p className="text-base font-black text-amber-600 tabular-nums">
                        {stat.mvpCount}
                      </p>
                      <p className="text-[10px] text-slate-400">MVP</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs text-slate-400">データなし</p>
                </div>
              )}
            </a>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-sm text-slate-400">選手が見つかりません</p>
        </div>
      )}
    </>
  );
}

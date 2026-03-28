"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { MOCK_TEAMS, MOCK_LEAGUES, MOCK_STANDINGS } from "@/lib/mock-data";
import type { Team } from "@/lib/types/app";

// const teams = await getTeams(leagueId)

function getInitials(name: string): string {
  const stripped = name.replace(/\s+/g, "");
  return stripped.slice(0, 2).toUpperCase();
}

function TeamCard({
  team,
}: {
  team: Team & { rank?: number; points?: number };
}) {
  const league = MOCK_LEAGUES.find((l) => l.id === team.leagueId);
  return (
    <Link
      href={`/teams/${team.slug}`}
      className="flex items-center gap-4 bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-200"
    >
      {/* 大きなアバター */}
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow-sm"
        style={{ backgroundColor: team.homeColor }}
        role="img"
        aria-label={team.name}
      >
        {getInitials(team.name)}
      </div>
      {/* テキスト */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-slate-900 text-base truncate">
          {team.name}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          {team.captainName ? `Cap: ${team.captainName}` : team.leagueName}
        </p>
      </div>
      {/* 順位・ディビジョンバッジ */}
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        {team.rank !== undefined && (
          <p className="text-xs font-bold text-slate-700">{team.points}pt</p>
        )}
        {league && (
          <span
            className="text-xs px-2.5 py-1 rounded-xl font-semibold text-white"
            style={{ backgroundColor: league.color }}
          >
            {team.leagueName.replace("Division ", "D")}
          </span>
        )}
      </div>
      <svg
        className="w-4 h-4 text-slate-300 flex-shrink-0 ml-1"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

function LeagueSection({
  leagueId,
  leagueName,
  leagueColor,
  teams,
}: {
  leagueId: string;
  leagueName: string;
  leagueColor: string;
  teams: Team[];
}) {
  const [isOpen, setIsOpen] = useState(leagueId === "div1");
  const standings = MOCK_STANDINGS[leagueId] ?? [];

  const teamsWithRank = teams.map((t) => {
    const standing = standings.find((s) => s.teamId === t.id);
    return { ...t, rank: standing?.rank, points: standing?.totalPoints };
  });

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between py-3 text-left cursor-pointer"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: leagueColor }}
          />
          <span className="text-sm font-bold" style={{ color: "#0c1e42" }}>
            {leagueName}
          </span>
          <span className="text-xs text-slate-400">{teams.length}チーム</span>
        </div>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="space-y-2 animate-fade-in">
          {teamsWithRank.map((team, i) => (
            <div
              key={team.id}
              className="animate-slide-up"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <TeamCard team={team} />
            </div>
          ))}
        </div>
      )}
      <div className="border-b border-slate-100 mt-3" />
    </div>
  );
}

export default function TeamsPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.toLowerCase();
    return MOCK_TEAMS.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.leagueName.toLowerCase().includes(q) ||
        t.slug.includes(q),
    );
  }, [query]);

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-2xl font-black text-slate-900 mb-5 tracking-tight">
        チーム
      </h1>

      {/* 検索 */}
      <div className="relative mb-5">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="チーム名で検索..."
          className="w-full pl-10 pr-4 py-3 text-sm bg-white text-slate-900 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-[#c9921e] focus:ring-4 focus:ring-[#c9921e20] caret-[#c9921e] placeholder:text-slate-400 transition-all shadow-sm"
          aria-label="チーム検索"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="検索をクリア"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* 検索結果 */}
      {filtered !== null ? (
        <div>
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-8 h-8 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <p className="text-slate-500 text-sm font-medium">
                チームが見つかりません
              </p>
              <p className="text-slate-400 text-xs mt-1">
                別のキーワードで検索してください
              </p>
            </div>
          ) : (
            <div>
              <p className="text-xs text-slate-500 mb-3">
                {filtered.length}件のチーム
              </p>
              <div className="space-y-2">
                {filtered.map((team) => {
                  const standing = MOCK_STANDINGS[team.leagueId]?.find(
                    (s) => s.teamId === team.id,
                  );
                  return (
                    <TeamCard
                      key={team.id}
                      team={{
                        ...team,
                        rank: standing?.rank,
                        points: standing?.totalPoints,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* リーグ別グループ表示 */
        <div className="animate-fade-in">
          {MOCK_LEAGUES.map((league) => {
            const leagueTeams = MOCK_TEAMS.filter(
              (t) => t.leagueId === league.id,
            );
            return (
              <LeagueSection
                key={league.id}
                leagueId={league.id}
                leagueName={league.name}
                leagueColor={league.color}
                teams={leagueTeams}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

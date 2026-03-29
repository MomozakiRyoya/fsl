"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useFollowedTeams } from "@/hooks/useFollowedTeams";
import type { Team, League, TeamStanding } from "@/lib/types/app";

function getInitials(name: string): string {
  const stripped = name.replace(/\s+/g, "");
  return stripped.slice(0, 2).toUpperCase();
}

function TeamCard({
  team,
  league,
  isFollowing,
}: {
  team: Team & { rank?: number; points?: number };
  league?: League;
  isFollowing?: boolean;
}) {
  return (
    <Link
      href={`/teams/${team.slug}`}
      className="flex items-center gap-3 bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-200"
      style={{ borderLeft: league ? `3px solid ${league.color}60` : undefined }}
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow-sm"
        style={{ backgroundColor: team.homeColor }}
        role="img"
        aria-label={team.name}
      >
        {getInitials(team.name)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-slate-900 text-base truncate leading-tight">
          {team.name}
        </p>
        <p className="text-xs text-slate-500 mt-0.5 truncate">
          {team.leagueName}
        </p>
        {team.captainName && (
          <p className="text-xs text-slate-400 mt-0.5 truncate">
            Cap: {team.captainName}
          </p>
        )}
      </div>
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        {isFollowing && (
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
            style={{
              background: "rgba(201,146,30,0.15)",
              color: "#c9921e",
              border: "1px solid rgba(201,146,30,0.3)",
            }}
          >
            ★ フォロー中
          </span>
        )}
        {team.rank !== undefined && (
          <p className="text-xs font-bold text-slate-600">{team.points}pt</p>
        )}
        {league && (
          <span
            className="text-[10px] px-2 py-0.5 rounded-lg font-semibold text-white"
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
  league,
  teams,
  standings,
  followedTeams,
  defaultOpen,
}: {
  league: League;
  teams: Team[];
  standings: TeamStanding[];
  followedTeams: string[];
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen ?? league.id === "premier");

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
            style={{ backgroundColor: league.color }}
          />
          <span className="text-sm font-bold" style={{ color: "#0c1e42" }}>
            {league.name}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 animate-fade-in">
          {teamsWithRank.map((team, i) => (
            <div
              key={team.id}
              className="animate-slide-up"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <TeamCard
                team={team}
                league={league}
                isFollowing={followedTeams.includes(team.id)}
              />
            </div>
          ))}
        </div>
      )}
      <div className="border-b border-slate-100 mt-3" />
    </div>
  );
}

const ALL_DIVISIONS = [
  { key: "all", label: "すべて" },
  { key: "premier", label: "PL" },
  { key: "spade", label: "♠" },
  { key: "diamond", label: "♦" },
  { key: "club", label: "♣" },
  { key: "heart", label: "♥" },
];

interface Props {
  teams: Team[];
  leagues: League[];
  standings: Record<string, TeamStanding[]>;
}

export default function TeamsPageClient({ teams, leagues, standings }: Props) {
  const [query, setQuery] = useState("");
  const [activeDiv, setActiveDiv] = useState<string>("all");
  const { followedTeams, mounted } = useFollowedTeams();

  const filtered = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.toLowerCase();
    return teams.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.leagueName.toLowerCase().includes(q) ||
        t.slug.includes(q),
    );
  }, [query, teams]);

  const visibleLeagues = useMemo(() => {
    if (activeDiv === "all") return leagues;
    return leagues.filter((l) => l.id === activeDiv);
  }, [activeDiv, leagues]);

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
        <h1 className="text-2xl font-black text-white tracking-tight">TEAMS</h1>
        <div className="flex items-center gap-3 mt-1.5">
          <span className="text-xs text-white/50">
            {teams.length}チーム参加
          </span>
          <span className="text-white/20 text-xs">|</span>
          <span className="text-xs text-white/50">
            {leagues.length}ディビジョン
          </span>
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="relative mb-4">
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

        {filtered === null && (
          <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 -mx-4 px-4 scroll-x-hidden">
            {ALL_DIVISIONS.map((div) => {
              const isActive = activeDiv === div.key;
              return (
                <button
                  key={div.key}
                  onClick={() => setActiveDiv(div.key)}
                  className="flex-none px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 active:scale-95"
                  style={
                    isActive
                      ? {
                          background: "#0c1e42",
                          color: "white",
                          boxShadow: "0 2px 8px rgba(12,30,66,0.25)",
                        }
                      : {
                          background: "white",
                          color: "#64748b",
                          border: "1px solid #e2e8f0",
                        }
                  }
                >
                  {div.label}
                </button>
              );
            })}
          </div>
        )}

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
                    const league = leagues.find((l) => l.id === team.leagueId);
                    const standing = standings[team.leagueId]?.find(
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
                        league={league}
                        isFollowing={mounted && followedTeams.includes(team.id)}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="animate-fade-in">
            {visibleLeagues.map((league) => {
              const leagueTeams = teams.filter((t) => t.leagueId === league.id);
              return (
                <LeagueSection
                  key={`${league.id}-${activeDiv}`}
                  league={league}
                  teams={leagueTeams}
                  standings={standings[league.id] ?? []}
                  followedTeams={mounted ? followedTeams : []}
                  defaultOpen={activeDiv !== "all" || league.id === "premier"}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

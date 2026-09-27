"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useFollowedTeams } from "@/hooks/useFollowedTeams";
import type { Team, League, TeamStanding } from "@/lib/types/app";
import GlideTabs from "@/components/ui/GlideTabs";
import BreakableName from "@/components/ui/BreakableName";
import { sortTeamsByPoints } from "./team-order";

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
      className="group card-native touch-active flex items-center gap-3 p-4"
    >
      {team.logoUrl ? (
        <img
          src={team.logoUrl}
          alt={team.name}
          className="w-12 h-12 rounded-xl object-cover flex-shrink-0 ring-1 ring-black/5"
        />
      ) : (
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
          style={{ backgroundColor: team.homeColor }}
          role="img"
          aria-label={team.name}
        >
          {getInitials(team.name)}
        </div>
      )}
      <div className="flex-1 min-w-0">
        {/* 札は名前の上に置く（右端だと 320px で名前の列が縮み、ディビジョン名が切れる） */}
        {isFollowing && (
          <div className="flex mb-1">
            <span className="pill gap-1 bg-butter text-on-block">
              <svg
                className="w-3 h-3"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
              フォロー中
            </span>
          </div>
        )}
        <p className="font-bold text-slate-900 text-base line-clamp-2 break-words leading-tight underline-offset-2 group-hover:underline">
          <BreakableName name={team.name} />
        </p>
        {/* ディビジョンは色の点と名前で示す（右端の色札は名前と同じ文字の重複だったので畳んだ） */}
        <p className="flex items-center gap-1.5 min-w-0 text-xs text-slate-500 mt-1">
          {league && (
            <span
              aria-hidden="true"
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: league.color }}
            />
          )}
          <span className="truncate">{team.leagueName}</span>
        </p>
        {team.captainName && (
          <p className="text-xs text-slate-400 mt-0.5 truncate">
            Cap: {team.captainName}
          </p>
        )}
      </div>
      {team.rank !== undefined && (
        <p className="flex-shrink-0 text-slate-900 tabular-nums leading-none">
          <span className="text-xl font-light tracking-[-0.02em]">
            {team.points}
          </span>
          <span className="ml-0.5 text-[10px] font-bold text-slate-500">
            pt
          </span>
        </p>
      )}
      <svg
        className="w-4 h-4 text-slate-400 flex-shrink-0 ml-1"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
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

  const teamsWithRank = sortTeamsByPoints(teams, standings).map((t) => {
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
            aria-hidden="true"
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: league.color }}
          />
          <span className="text-sm font-bold text-slate-900">
            {league.name}
          </span>
          <span className="text-xs text-slate-400 tabular-nums">
            {teams.length}チーム
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {/* 器は lg まで 512px なので段は割らない。lg の 3 列でも名前の列が 82px しか無く、語の途中で割れていた */}
      {isOpen && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 animate-fade-in">
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

// 記号だけのチップは、読み上げ用の名前を別に持つ
const ALL_DIVISIONS = [
  { key: "all", label: "すべて" },
  { key: "premier", label: "PL", ariaLabel: "プレミア" },
  { key: "spade", label: "♠", ariaLabel: "スペード" },
  { key: "diamond", label: "♦", ariaLabel: "ダイヤ" },
  { key: "club", label: "♣", ariaLabel: "クローバー" },
  { key: "heart", label: "♥", ariaLabel: "ハート" },
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
          Season 7
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
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
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
            className="w-full pl-11 pr-11 py-3 text-sm bg-white text-slate-900 border border-slate-200 rounded-full focus:outline-none focus:border-gold-500 focus:ring-3 focus:ring-gold-500/20 caret-gold-500 placeholder:text-slate-400 transition-[border-color,box-shadow] duration-150"
            aria-label="チーム検索"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="touch-active absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              aria-label="検索をクリア"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
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
          <GlideTabs
            variant="rail"
            ariaLabel="ディビジョンで絞り込み"
            options={ALL_DIVISIONS}
            value={activeDiv}
            onChange={setActiveDiv}
            className="-mx-4 px-4 mb-4"
          />
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

"use client";

import Link from "next/link";
import { useFollowedTeams } from "@/hooks/useFollowedTeams";
import type { Team, TeamStanding, NewsItem } from "@/lib/types/app";
import ArrowIcon from "@/components/ui/ArrowIcon";

interface Props {
  teams: Team[];
  standings: Record<string, TeamStanding[]>;
  news: NewsItem[];
}

export default function MyTeamsSection({ teams, standings, news }: Props) {
  const { followedTeams, mounted } = useFollowedTeams();

  if (!mounted) return null;
  if (followedTeams.length === 0) return null;

  const myTeams = followedTeams
    .map((id) => teams.find((t) => t.id === id))
    .filter(Boolean) as Team[];

  // フォロー中チームに関連するニュース件数
  const followedTeamNames = myTeams.map((t) => t.name);
  const myNewsCount = news.filter((item) =>
    followedTeamNames.some(
      (teamName) =>
        item.title.includes(teamName) || item.body.includes(teamName),
    ),
  ).length;

  return (
    <section className="section-rule animate-fade-in">
      <div className="section-head">
        <h2 className="section-title">マイチーム</h2>
        {myNewsCount > 0 && (
          <Link href="/my-news" className="section-link">
            チームニュース
            <span className="border border-ink px-1 py-0.5 text-[10px] leading-none tabular-nums">
              {myNewsCount}
            </span>
            <ArrowIcon />
          </Link>
        )}
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-5 px-5 lg:-mx-10 lg:px-10">
        {myTeams.map((team) => {
          const teamStandings = standings[team.leagueId] ?? [];
          const standing = teamStandings.find((s) => s.teamId === team.id);
          return (
            <Link
              key={team.id}
              href={`/teams/${team.slug}`}
              className="group touch-active flex-none w-40 border border-ink/15 p-3.5 transition-colors hover:border-ink"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: team.homeColor }}
                >
                  {team.name.slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-ink truncate underline-offset-4 group-hover:underline">
                    {team.name}
                  </p>
                  <p className="text-[10px] text-ink/70 mt-0.5 truncate">
                    {team.leagueName}
                  </p>
                </div>
                {/* フォロー中ハートアイコン */}
                <svg
                  className="w-3.5 h-3.5 flex-shrink-0 text-ink"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                </svg>
              </div>
              {standing && (
                <div className="mt-2.5 flex items-baseline justify-between border-t border-ink/10 pt-2">
                  <span className="text-xs font-bold text-ink tabular-nums">
                    {standing.rank}位
                  </span>
                  <span className="text-sm font-black text-ink tabular-nums">
                    {standing.totalPoints}
                    <span className="text-[10px] font-normal text-ink/70 ml-0.5">
                      pt
                    </span>
                  </span>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

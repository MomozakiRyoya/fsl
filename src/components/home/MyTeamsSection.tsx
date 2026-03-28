"use client";

import Link from "next/link";
import { useFollowedTeams } from "@/hooks/useFollowedTeams";
import { MOCK_TEAMS, MOCK_STANDINGS } from "@/lib/mock-data";

export default function MyTeamsSection() {
  const { followedTeams, mounted } = useFollowedTeams();

  if (!mounted) return null;
  if (followedTeams.length === 0) return null;

  const myTeams = followedTeams
    .map((id) => MOCK_TEAMS.find((t) => t.id === id))
    .filter(Boolean) as typeof MOCK_TEAMS;

  return (
    <section className="mb-5 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <span
            className="w-1 h-4 rounded-full inline-block"
            style={{ background: "linear-gradient(180deg, #c9921e, #e3c060)" }}
          />
          マイチーム
        </h2>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4">
        {myTeams.map((team) => {
          const standings = MOCK_STANDINGS[team.leagueId] ?? [];
          const standing = standings.find((s) => s.teamId === team.id);
          return (
            <Link
              key={team.id}
              href={`/teams/${team.slug}`}
              className="flex-none bg-white rounded-2xl border border-slate-100 p-3.5 w-40 hover:shadow-md transition-all active:scale-[0.97] shadow-sm"
            >
              <div className="flex items-center gap-2 mb-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: team.homeColor }}
                >
                  {team.name.slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {team.name}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {team.leagueName}
                  </p>
                </div>
                {/* フォロー中ハートアイコン */}
                <svg
                  className="w-3.5 h-3.5 flex-shrink-0"
                  style={{ color: "#c9921e" }}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                </svg>
              </div>
              {standing && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-medium">
                    #{standing.rank}位
                  </span>
                  <span
                    className="text-sm font-black tabular-nums"
                    style={{ color: "#c9921e" }}
                  >
                    {standing.totalPoints}
                    <span className="text-[10px] font-medium ml-0.5">pt</span>
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

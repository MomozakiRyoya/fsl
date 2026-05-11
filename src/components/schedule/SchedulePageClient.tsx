"use client";

import { useState } from "react";
import Link from "next/link";
import type { League, Round } from "@/lib/types/app";

const STATUS_STYLES: Record<string, string> = {
  finished: "bg-slate-100 text-slate-500",
  next: "",
  scheduled: "bg-white border border-[#e8dfc0] text-slate-600",
};

const STATUS_LABELS: Record<string, string> = {
  finished: "終了",
  next: "次節",
  scheduled: "予定",
};

function RoundCard({ round }: { round: Round }) {
  const isNext = round.status === "next";
  const isPlayoff = round.isPlayoff;

  return (
    <Link
      href={`/schedule/${round.id}`}
      className={`block bg-white rounded-xl border p-4 transition-all duration-200 hover:shadow-md active:scale-[0.99] ${isPlayoff ? "border-amber-200" : "border-[#e8dfc0]"}`}
      style={isNext ? { borderLeft: "3px solid #c9921e" } : {}}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            {isPlayoff && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                PLAYOFF
              </span>
            )}
            {round.status === "next" ? (
              <span
                className="text-xs px-2 py-0.5 rounded-full font-bold"
                style={{
                  background: "linear-gradient(135deg, #c9921e, #e3c060)",
                  color: "#0c1e42",
                }}
              >
                {STATUS_LABELS[round.status]}
              </span>
            ) : (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[round.status]}`}
              >
                {STATUS_LABELS[round.status]}
              </span>
            )}
          </div>
          <p
            className={`font-semibold ${isNext ? "" : isPlayoff ? "text-amber-700" : "text-slate-900"} text-sm`}
            style={isNext ? { color: "#0c1e42" } : {}}
          >
            {round.name}
          </p>
          {round.format && (
            <p
              className="text-[11px] font-medium mt-0.5"
              style={{ color: isNext ? "rgba(201,146,30,0.9)" : "#94a3b8" }}
            >
              🃏 {round.format}
            </p>
          )}
          <div className="flex flex-col gap-1 mt-2">
            <div className="flex items-center gap-1.5 text-xs text-body">
              <svg
                className="w-3.5 h-3.5 text-slate-400 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {round.date}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-body">
              <svg
                className="w-3.5 h-3.5 text-slate-400 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {round.venue}
            </div>
          </div>
        </div>
        {isNext && (
          <div
            className="flex-shrink-0 w-2 h-2 rounded-full mt-1.5 animate-pulse"
            style={{ background: "#c9921e" }}
          />
        )}
      </div>
    </Link>
  );
}

interface Props {
  leagues: League[];
  rounds: Round[];
}

export default function SchedulePageClient({ leagues, rounds }: Props) {
  const [activeLeague, setActiveLeague] = useState<string>("premier");

  const allRoundsForLeague = rounds.filter((r) => r.leagueId === activeLeague);
  const regularRounds = allRoundsForLeague.filter((r) => !r.isPlayoff);
  const playoffRounds = allRoundsForLeague.filter((r) => r.isPlayoff);

  const upcomingRounds = regularRounds.filter((r) => r.status !== "finished");
  const finishedRounds = regularRounds.filter((r) => r.status === "finished");

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-slate-900 mb-4">日程</h1>

      <div className="flex gap-2 overflow-x-auto scroll-x-hidden pb-2 mb-5 -mx-4 px-4">
        {leagues.map((league) => {
          const isActive = activeLeague === league.id;
          return (
            <button
              key={league.id}
              onClick={() => setActiveLeague(league.id)}
              className={`flex-none flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 active:scale-95 ${isActive ? "text-white shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"}`}
              style={isActive ? { backgroundColor: league.color } : {}}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-white/70" : ""}`}
                style={!isActive ? { backgroundColor: league.color } : {}}
              />
              {league.name}
            </button>
          );
        })}
      </div>

      <section className="mb-6 animate-fade-in">
        {/* これからの試合 */}
        {upcomingRounds.length > 0 && (
          <>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <h2 className="text-sm font-bold text-slate-700">
                これからの試合
              </h2>
              <span className="text-xs text-slate-400">
                {upcomingRounds.length}節
              </span>
            </div>
            <div className="space-y-2 mb-5">
              {upcomingRounds.map((round, i) => (
                <div
                  key={round.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
                >
                  <RoundCard round={round} />
                </div>
              ))}
            </div>
          </>
        )}
        {/* 終了した試合 */}
        {finishedRounds.length > 0 && (
          <>
            <div className="flex items-center gap-2 mb-3 mt-4">
              <h2 className="text-sm font-bold text-slate-400">終了した試合</h2>
              <span className="text-xs text-slate-300">
                {finishedRounds.length}節
              </span>
            </div>
            <div className="space-y-2">
              {finishedRounds.map((round, i) => (
                <div
                  key={round.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
                >
                  <RoundCard round={round} />
                </div>
              ))}
            </div>
          </>
        )}
        {regularRounds.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-8">
            日程データなし
          </p>
        )}
      </section>

      {playoffRounds.length > 0 && (
        <section className="animate-fade-in animate-delay-300">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-bold text-amber-700 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 0 0-.584.859 6.753 6.753 0 0 0 6.138 5.6 6.73 6.73 0 0 0 2.743 1.346A6.707 6.707 0 0 1 9.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 0 0-2.25 2.25c0 .414.336.75.75.75h15a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-2.25-2.25h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 0 1-1.112-3.173 6.73 6.73 0 0 0 2.743-1.347 6.753 6.753 0 0 0 6.139-5.6.75.75 0 0 0-.585-.858 47.077 47.077 0 0 0-3.07-.543V2.62a.75.75 0 0 0-.658-.744 49.798 49.798 0 0 0-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 0 0-.657.744Zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 0 1 3.16 5.337a45.6 45.6 0 0 1 2.006-.343v.256Zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 0 1-2.863 3.207 6.72 6.72 0 0 0 .857-3.294Z"
                  clipRule="evenodd"
                />
              </svg>
              プレーオフ
            </h2>
          </div>
          <div className="space-y-2">
            {playoffRounds.map((round, i) => (
              <div
                key={round.id}
                className="animate-slide-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <RoundCard round={round} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

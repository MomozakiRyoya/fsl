"use client";

import { useState } from "react";
import Link from "next/link";
import type { League, Round, RoundStatus } from "@/lib/types/app";
import { getEffectiveStatus } from "@/lib/round-status";
import { formatRoundDateTime } from "@/lib/start-time";
import GlideTabs from "@/components/ui/GlideTabs";

const STATUS_LABELS: Record<RoundStatus, string> = {
  finished: "終了",
  next: "次節",
  scheduled: "予定",
};

/** 節の丸（SwiftPieces の StatusTimeline）。終わった節はチェック、次節は呼吸する輪、先の節は線の輪に節番号 */
function StatusNode({
  status,
  roundNumber,
}: {
  status: RoundStatus;
  roundNumber: number;
}) {
  const base =
    "relative flex items-center justify-center w-[30px] h-[30px] rounded-full text-xs font-extrabold tabular-nums";
  if (status === "finished") {
    return (
      <span aria-hidden="true" className={`${base} bg-sage text-on-block`}>
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </span>
    );
  }
  if (status === "next") {
    return (
      <span aria-hidden="true" className={`${base} bg-butter text-on-block`}>
        <span className="timeline-breathe" />
        <span className="relative">{roundNumber}</span>
      </span>
    );
  }
  return (
    <span
      aria-hidden="true"
      className={`${base} shadow-[inset_0_0_0_2px_var(--color-silver)] text-slate-500`}
    >
      {roundNumber}
    </span>
  );
}

function RoundRow({
  round,
  isLast,
  delay,
}: {
  round: Round;
  isLast: boolean;
  delay: number;
}) {
  const status = getEffectiveStatus(round);
  const isNext = status === "next";

  return (
    <li
      className="relative grid grid-cols-[30px_1fr] gap-x-3 pb-3 animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {!isLast && (
        <span
          aria-hidden="true"
          className={`absolute left-[13.5px] top-[34px] bottom-1 w-[3px] rounded-full ${status === "finished" ? "bg-sage" : "bg-silver"}`}
        />
      )}
      <StatusNode status={status} roundNumber={round.roundNumber} />
      <Link
        href={`/schedule/${round.id}`}
        className={`group touch-active flex items-center gap-3 min-w-0 rounded-2xl ${isNext ? "bg-butter text-on-block p-4" : "py-1"}`}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span
              className={`text-[10px] font-bold tracking-[0.08em] ${isNext ? "" : "text-slate-500"}`}
            >
              {STATUS_LABELS[status]}
            </span>
            {round.isPlayoff && (
              <span className="pill bg-sand text-on-block">PLAYOFF</span>
            )}
          </div>
          {/* 字の間では折らず、空白と括弧の前で折る。320px で「（合同エースマッ／チ）」と 2 字だけ落ちていた */}
          <p
            className={`text-sm font-bold [word-break:keep-all] break-words underline-offset-2 group-hover:underline ${isNext ? "" : "text-slate-900"}`}
          >
            {round.name}
          </p>
          <div
            className={`flex flex-col gap-0.5 mt-1 text-xs ${isNext ? "text-on-block/70" : "text-slate-500"}`}
          >
            <span className="inline-flex items-center gap-1">
              <svg
                className="w-3.5 h-3.5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {formatRoundDateTime(round)}
            </span>
            <span className="inline-flex items-center gap-1">
              <svg
                className="w-3.5 h-3.5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
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
            </span>
            {round.format && (
              <span className="inline-flex items-center gap-1">
                <svg
                  className="w-3.5 h-3.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <rect x="8" y="3" width="12" height="16" rx="2" />
                  <path strokeLinecap="round" d="M5 7v11a3 3 0 003 3h7" />
                </svg>
                {round.format}
              </span>
            )}
          </div>
        </div>
        <svg
          className={`w-4 h-4 flex-shrink-0 ${isNext ? "text-on-block/50" : "text-slate-400"}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </li>
  );
}

/** 節を上から順に丸と線でつなぐ。線は終わった節から伸びるものだけ色が付く */
function RoundTimeline({
  rounds,
  step,
  className = "",
}: {
  rounds: Round[];
  step: number;
  className?: string;
}) {
  return (
    <ol className={className}>
      {rounds.map((round, i) => (
        <RoundRow
          key={round.id}
          round={round}
          isLast={i === rounds.length - 1}
          delay={Math.min(i * step, 300)}
        />
      ))}
    </ol>
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

  const upcomingRounds = regularRounds.filter(
    (r) => getEffectiveStatus(r) !== "finished",
  );
  const finishedRounds = regularRounds.filter(
    (r) => getEffectiveStatus(r) === "finished",
  );

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-slate-900 mb-4">日程</h1>

      <GlideTabs
        variant="rail"
        ariaLabel="ディビジョン"
        options={leagues.map((league) => ({
          key: league.id,
          label: (
            <>
              <span
                aria-hidden="true"
                className={`w-1.5 h-1.5 rounded-full ${activeLeague === league.id ? "ring-1 ring-white/70" : ""}`}
                style={{ backgroundColor: league.color }}
              />
              {league.name}
            </>
          ),
        }))}
        value={activeLeague}
        onChange={setActiveLeague}
        className="-mx-4 px-4 mb-5"
      />

      <section className="mb-6 animate-fade-in">
        {/* これからの試合 */}
        {upcomingRounds.length > 0 && (
          <>
            <div className="flex items-baseline gap-2 mb-3">
              <h2 className="text-sm font-bold text-slate-700">
                これからの試合
              </h2>
              <span className="text-xs text-slate-400 tabular-nums">
                {upcomingRounds.length}節
              </span>
            </div>
            <RoundTimeline rounds={upcomingRounds} step={30} className="mb-4" />
          </>
        )}
        {/* 終了した試合 */}
        {finishedRounds.length > 0 && (
          <>
            <div className="flex items-baseline gap-2 mb-3 mt-4">
              <h2 className="text-sm font-bold text-slate-500">終了した試合</h2>
              <span className="text-xs text-slate-400 tabular-nums">
                {finishedRounds.length}節
              </span>
            </div>
            <RoundTimeline rounds={finishedRounds} step={30} />
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
            <h2 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
              <svg
                className="w-4 h-4 text-gold-500"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 0 0-.584.859 6.753 6.753 0 0 0 6.138 5.6 6.73 6.73 0 0 0 2.743 1.346A6.707 6.707 0 0 1 9.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 0 0-2.25 2.25c0 .414.336.75.75.75h15a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-2.25-2.25h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 0 1-1.112-3.173 6.73 6.73 0 0 0 2.743-1.347 6.753 6.753 0 0 0 6.139-5.6.75.75 0 0 0-.585-.858 47.077 47.077 0 0 0-3.07-.543V2.62a.75.75 0 0 0-.658-.744 49.798 49.798 0 0 0-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 0 0-.657.744Zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 0 1 3.16 5.337a45.6 45.6 0 0 1 2.006-.343v.256Zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 0 1-2.863 3.207 6.72 6.72 0 0 0 .857-3.294Z"
                  clipRule="evenodd"
                />
              </svg>
              プレーオフ
            </h2>
          </div>
          <RoundTimeline rounds={playoffRounds} step={60} />
        </section>
      )}
    </div>
  );
}

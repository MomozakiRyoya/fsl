"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Round, League } from "@/lib/types/app";
import AutoScroll from "@/components/ui/AutoScroll";
import { getRoundStartTime, formatRoundDateTime } from "@/lib/start-time";

const TARGET_LEAGUES = ["premier", "spade", "diamond", "club", "heart"];

function getMatchTime(r: Round): number {
  const time = getRoundStartTime(r);
  return new Date(`${r.date}T${time}:00+09:00`).getTime();
}

function calcTimeLeft(matchTime: number) {
  const diff = matchTime - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function CalendarIcon() {
  return (
    <svg
      className="h-3.5 w-3.5 flex-shrink-0 text-white/70"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path d="M2.5 3.5h11v10h-11zM2.5 6.5h11M5.5 2v3M10.5 2v3" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg
      className="h-3.5 w-3.5 flex-shrink-0"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path d="M8 14.5s4.5-4.2 4.5-7.75a4.5 4.5 0 0 0-9 0C3.5 10.3 8 14.5 8 14.5z" />
      <circle cx="8" cy="6.75" r="1.5" />
    </svg>
  );
}

function MatchCard({
  round,
  league,
  tick,
}: {
  round: Round;
  league?: League;
  tick: number;
}) {
  const matchTime = getMatchTime(round);
  const timeLeft = calcTimeLeft(matchTime);
  // tick is used to trigger re-render every second
  void tick;

  return (
    <Link
      href={`/schedule/${round.id}`}
      className="block flex-none w-[272px] select-none bg-[#0c1e42] text-white"
      draggable={false}
    >
      {/* ヘッダー: ディビジョンの色見本・名前・節 */}
      <div className="flex items-center gap-2 border-b border-white/20 px-4 py-2.5">
        <span
          className="h-2.5 w-2.5 flex-shrink-0 border border-white/40"
          style={{ backgroundColor: league?.color ?? "#1a3a7a" }}
          aria-hidden="true"
        />
        <span className="min-w-0 flex-1 truncate text-xs font-bold">
          {round.leagueName}
        </span>
        <span className="max-w-[112px] flex-shrink-0 truncate text-[11px] font-bold text-[#e3c060]">
          {round.name}
        </span>
      </div>

      <div className="px-4 pt-3 pb-4">
        {/* 日付・時刻 */}
        <p className="flex items-center gap-1.5 text-sm font-bold">
          <CalendarIcon />
          {formatRoundDateTime(round)}
        </p>

        {/* カウントダウン */}
        {timeLeft ? (
          <div className="mt-3 grid grid-cols-4 border-y border-white/20">
            {[
              { v: timeLeft.days, l: "日" },
              { v: timeLeft.hours, l: "時" },
              { v: timeLeft.minutes, l: "分" },
              { v: timeLeft.seconds, l: "秒" },
            ].map(({ v, l }, i) => (
              <div
                key={l}
                className={
                  i === 0
                    ? "py-2 pr-2"
                    : "border-l border-white/20 py-2 pl-2.5 pr-2"
                }
              >
                <span className="block text-2xl font-black leading-none tabular-nums">
                  {pad(v)}
                </span>
                <span className="mt-1 block text-[10px] font-bold text-white/60">
                  {l}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 border-y border-white/20 py-2 text-sm font-bold text-[#e3c060]">
            試合開始！
          </p>
        )}

        {/* 会場・フォーマット */}
        <div className="mt-3 flex items-center justify-between gap-3 text-[11px] text-white/70">
          <span className="flex min-w-0 items-center gap-1">
            <PinIcon />
            <span className="truncate">{round.venue}</span>
          </span>
          {round.format && (
            <span className="max-w-[45%] flex-shrink-0 truncate">
              {round.format}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

interface Props {
  rounds: Round[];
  leagues: League[];
}

export default function MatchCountdown({ rounds, leagues }: Props) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const now = Date.now();

  const upcoming = TARGET_LEAGUES.flatMap((lid) => {
    const next = rounds
      .filter((r) => r.leagueId === lid && getMatchTime(r) > now)
      .sort((a, b) => getMatchTime(a) - getMatchTime(b))[0];
    if (!next) return [];
    const league = leagues.find((l) => l.id === lid);
    return [{ round: next, league }];
  }).sort((a, b) => getMatchTime(a.round) - getMatchTime(b.round));

  // 見出しだけが残らないよう、無いことを書く
  if (upcoming.length === 0) {
    return (
      <p className="border-y border-ink/15 py-4 text-sm text-ink/70">
        予定されている試合はありません
      </p>
    );
  }

  return (
    <div className="-mx-5 lg:-mx-10">
      <AutoScroll speed={30} className="px-5 lg:px-10">
        {upcoming.map(({ round, league }) => (
          <MatchCard key={round.id} round={round} league={league} tick={tick} />
        ))}
      </AutoScroll>
    </div>
  );
}

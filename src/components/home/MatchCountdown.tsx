"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Round, League } from "@/lib/types/app";
import AutoScroll from "@/components/ui/AutoScroll";

const TARGET_LEAGUES = ["premier", "spade", "diamond", "club", "heart"];

function getMatchTime(r: Round): number {
  const time =
    r.startTime && /^\d{2}:\d{2}$/.test(r.startTime) ? r.startTime : "18:00";
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
      className="block rounded-2xl overflow-hidden flex-none w-[272px] select-none"
      style={{
        background: `linear-gradient(135deg, #0c1e42, ${league?.color ?? "#1a3a7a"})`,
      }}
      draggable={false}
    >
      <div className="px-4 pt-3.5 pb-4">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
            <span
              className="text-[9px] font-bold tracking-widest uppercase"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              NEXT MATCH
            </span>
          </div>
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full truncate max-w-[120px]"
            style={{
              background: "linear-gradient(135deg, #c9921e, #e3c060)",
              color: "#0c1e42",
            }}
          >
            {round.name}
          </span>
        </div>

        {/* 節名・リーグ */}
        <p
          className="text-xs font-semibold mb-0.5 truncate"
          style={{ color: "rgba(255,255,255,0.6)" }}
        >
          {round.leagueName}
        </p>

        {/* 日付・時刻 */}
        <p className="text-sm font-black text-white mb-1">
          📅 {round.date}
          {round.startTime && (
            <span
              className="ml-1.5 text-xs font-semibold"
              style={{ color: "rgba(201,146,30,0.85)" }}
            >
              🕒 {round.startTime}
            </span>
          )}
        </p>

        {/* カウントダウン */}
        {timeLeft ? (
          <div className="flex items-end gap-1.5 mb-2.5">
            {[
              { v: timeLeft.days, l: "日" },
              { v: timeLeft.hours, l: "時" },
              { v: timeLeft.minutes, l: "分" },
              { v: timeLeft.seconds, l: "秒" },
            ].map(({ v, l }, i) => (
              <div key={l} className="flex items-end gap-0.5">
                {i > 0 && (
                  <span
                    className="text-base font-black mb-0.5"
                    style={{ color: "rgba(255,255,255,0.25)" }}
                  >
                    :
                  </span>
                )}
                <span className="text-2xl font-black tabular-nums text-white leading-none">
                  {pad(v)}
                </span>
                <span
                  className="text-[9px] mb-0.5"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  {l}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p
            className="text-sm font-bold mb-2.5"
            style={{ color: "#e3c060" }}
          >
            試合開始！
          </p>
        )}

        {/* フォーマット・会場 */}
        <div
          className="pt-2.5 flex items-center justify-between"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
        >
          <span
            className="text-[10px] truncate"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            📍 {round.venue}
          </span>
          {round.format && (
            <span
              className="text-[10px] ml-2 truncate"
              style={{ color: "rgba(201,146,30,0.7)" }}
            >
              🃏 {round.format}
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

  if (upcoming.length === 0) return null;

  return (
    <div className="-mx-4">
      <AutoScroll speed={30} className="px-4">
        {upcoming.map(({ round, league }) => (
          <MatchCard
            key={round.id}
            round={round}
            league={league}
            tick={tick}
          />
        ))}
      </AutoScroll>
    </div>
  );
}

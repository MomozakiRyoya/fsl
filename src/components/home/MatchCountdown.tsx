"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Round, League } from "@/lib/types/app";

const TARGET_LEAGUES = ["premier", "spade", "diamond", "club", "heart"];

function calcTimeLeft(dateStr: string) {
  const diff = new Date(dateStr + "T10:00:00+09:00").getTime() - Date.now();
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

  // 全リーグの直近1試合ずつ取得
  const upcoming = TARGET_LEAGUES.flatMap((lid) => {
    const next = rounds
      .filter((r) => r.leagueId === lid && new Date(r.date + "T10:00:00+09:00").getTime() > now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
    if (!next) return [];
    const league = leagues.find((l) => l.id === lid);
    return [{ round: next, league }];
  }).sort((a, b) => new Date(a.round.date).getTime() - new Date(b.round.date).getTime());

  if (upcoming.length === 0) return null;

  const [main, ...others] = upcoming;
  const timeLeft = calcTimeLeft(main.round.date);

  return (
    <div className="space-y-3">
      {/* メイン: 最も近い試合 */}
      <Link
        href={`/schedule/${main.round.id}`}
        className="block rounded-2xl overflow-hidden"
        style={{ background: `linear-gradient(135deg, #0c1e42, ${main.league?.color ?? "#1a3a7a"})` }}
      >
        <div className="px-4 pt-4 pb-4">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.5)" }}>
                NEXT MATCH
              </span>
            </div>
            <span
              className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
              style={{ background: "linear-gradient(135deg, #c9921e, #e3c060)", color: "#0c1e42" }}
            >
              {main.round.leagueName} {main.round.name}
            </span>
          </div>

          {/* 日付・フォーマット */}
          <div className="mb-3">
            <p className="text-xl font-black text-white">📅 {main.round.date}</p>
            {main.round.format && (
              <p className="text-xs mt-1 font-semibold" style={{ color: "rgba(201,146,30,0.8)" }}>
                🃏 {main.round.format}
              </p>
            )}
          </div>

          {/* カウントダウン */}
          {timeLeft ? (
            <div className="flex items-end gap-2 mb-4">
              {[
                { value: timeLeft.days, label: "日" },
                { value: timeLeft.hours, label: "時" },
                { value: timeLeft.minutes, label: "分" },
                { value: timeLeft.seconds, label: "秒" },
              ].map(({ value, label }, i) => (
                <div key={label} className="flex items-end gap-1">
                  {i > 0 && <span className="text-xl font-black mb-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>:</span>}
                  <div className="flex flex-col items-center">
                    <span className="text-3xl font-black tabular-nums text-white leading-none">{pad(value)}</span>
                    <span className="text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-white font-bold text-base py-2 mb-3">試合開始！</p>
          )}

          {/* 会場・CTA */}
          <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "rgba(255,255,255,0.4)" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{main.round.venue}</span>
            </div>
            <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.8)" }}>
              詳細・ストラクチャー →
            </span>
          </div>
        </div>
      </Link>

      {/* その他の直近試合（コンパクト一覧） */}
      {others.length > 0 && (
        <div className="card-native overflow-hidden">
          <div className="px-4 py-2.5 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">他リーグの直近日程</p>
          </div>
          {others.map(({ round, league }) => (
            <Link
              key={round.id}
              href={`/schedule/${round.id}`}
              className="flex items-center gap-3 px-4 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 active:bg-slate-100 transition-colors"
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: league?.color ?? "#94a3b8" }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-700 truncate">{round.leagueName} {round.name}</p>
                {round.format && <p className="text-[10px] text-slate-400 truncate">{round.format}</p>}
              </div>
              <span className="text-xs text-slate-500 whitespace-nowrap flex-shrink-0">{round.date}</span>
              <svg className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

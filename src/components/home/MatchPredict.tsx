"use client";

import { useState, useEffect } from "react";
import type { TeamStanding } from "@/lib/types/app";
import { useFanPoints } from "@/hooks/useFanPoints";

const STORAGE_KEY = "fsl-predict-r5";

const INITIAL_VOTES = { home: 34, away: 28 };

function loadVotes(): { home: number; away: number } {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as { home: number; away: number };
  } catch {
    /* ignore */
  }
  return { ...INITIAL_VOTES };
}

function saveVotes(votes: { home: number; away: number }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(votes));
  } catch {
    /* ignore */
  }
}

export default function MatchPredict({
  standings,
}: {
  standings: TeamStanding[];
}) {
  const [myVote, setMyVote] = useState<"home" | "away" | null>(null);
  const [votes, setVotes] = useState<{ home: number; away: number }>(
    INITIAL_VOTES,
  );
  const [mounted, setMounted] = useState(false);
  const { addPoints } = useFanPoints();

  const homeTeam = standings[0];
  const awayTeam = standings[1];

  useEffect(() => {
    setMounted(true);
    setVotes(loadVotes());
  }, []);

  const handleVote = (side: "home" | "away") => {
    if (myVote) return;
    const updated = { ...votes, [side]: votes[side] + 1 };
    setVotes(updated);
    setMyVote(side);
    saveVotes(updated);
    addPoints("match_predict", 5);
  };

  if (!mounted || !homeTeam || !awayTeam) return null;

  const total = votes.home + votes.away;
  const homePct = total > 0 ? Math.round((votes.home / total) * 100) : 50;
  const awayPct = 100 - homePct;
  const showResults = !!myVote;

  return (
    <section className="mb-5 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <span className="text-base leading-none">🔮</span>
          第5節 勝者予想
        </h2>
        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
          {total}票
        </span>
      </div>

      <div
        className="rounded-2xl overflow-hidden shadow-lg text-white"
        style={{
          background: "linear-gradient(to right, #0c1e42, #1a3a7a)",
        }}
      >
        {/* 対戦カードヘッダー */}
        <div className="px-4 pt-4 pb-2 text-center">
          <p className="text-xs text-white/50 font-medium tracking-widest uppercase mb-1">
            Division 1 — Round 5
          </p>
          <p className="text-xs text-white/40">どちらが勝つ？</p>
        </div>

        {!showResults ? (
          /* 投票前: ボタン */
          <div className="flex items-stretch gap-3 px-4 pb-4">
            <button
              onClick={() => handleVote("home")}
              className="flex-1 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-xl p-4 border border-white/20 transition-all text-center"
            >
              <div
                className="text-xs font-semibold mb-1"
                style={{ color: "#e3c060" }}
              >
                1位
              </div>
              <div className="text-base font-black leading-snug">
                {homeTeam.teamName}
              </div>
              <div className="text-xs text-white/50 mt-1">
                {homeTeam.totalPoints}pt
              </div>
            </button>

            <div className="flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-black" style={{ color: "#e3c060" }}>
                VS
              </span>
            </div>

            <button
              onClick={() => handleVote("away")}
              className="flex-1 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-xl p-4 border border-white/20 transition-all text-center"
            >
              <div
                className="text-xs font-semibold mb-1"
                style={{ color: "#e3c060" }}
              >
                2位
              </div>
              <div className="text-base font-black leading-snug">
                {awayTeam.teamName}
              </div>
              <div className="text-xs text-white/50 mt-1">
                {awayTeam.totalPoints}pt
              </div>
            </button>
          </div>
        ) : (
          /* 投票後: 勝率バー */
          <div className="px-4 pb-4">
            {/* 完了メッセージ */}
            <div className="flex items-center gap-2 mb-3 p-2 bg-white/10 rounded-lg">
              <span className="text-sm">✅</span>
              <p className="text-xs text-white/80 font-medium">
                +5pt 獲得！予想を登録しました
              </p>
            </div>

            {/* 勝率バー */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-white/90 w-16 text-right truncate">
                {homeTeam.teamName.length > 5
                  ? homeTeam.teamName.slice(0, 5) + "…"
                  : homeTeam.teamName}
              </span>
              <div className="flex-1 h-5 bg-white/10 rounded-full overflow-hidden flex">
                <div
                  className="h-full rounded-l-full transition-all duration-700 flex items-center justify-end pr-1"
                  style={{
                    width: `${homePct}%`,
                    background:
                      myVote === "home"
                        ? "linear-gradient(90deg, #c9921e, #e3c060)"
                        : "rgba(255,255,255,0.35)",
                  }}
                >
                  <span className="text-[10px] font-black text-white/90">
                    {homePct}%
                  </span>
                </div>
                <div
                  className="h-full rounded-r-full transition-all duration-700 flex items-center justify-start pl-1"
                  style={{
                    width: `${awayPct}%`,
                    background:
                      myVote === "away"
                        ? "linear-gradient(90deg, #c9921e, #e3c060)"
                        : "rgba(255,255,255,0.35)",
                  }}
                >
                  <span className="text-[10px] font-black text-white/90">
                    {awayPct}%
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold text-white/90 w-16 truncate">
                {awayTeam.teamName.length > 5
                  ? awayTeam.teamName.slice(0, 5) + "…"
                  : awayTeam.teamName}
              </span>
            </div>

            {/* 選択チーム表示 */}
            <p className="text-xs text-white/50 text-center mt-1">
              あなたの予想:{" "}
              <span className="font-bold" style={{ color: "#e3c060" }}>
                {myVote === "home" ? homeTeam.teamName : awayTeam.teamName}
              </span>
            </p>
          </div>
        )}

        {!showResults && (
          <div className="border-t border-white/10 px-4 py-2">
            <p className="text-[11px] text-white/30 text-center">
              タップして予想（+5pt）
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

"use client";

import { useState, useEffect } from "react";
import type { MvpVoteOption } from "@/lib/types/app";

const STORAGE_KEY = "fsl-mvp-vote-r4";
const STORAGE_KEY_COUNTS = "fsl-mvp-vote-r4-counts";

function loadVotes(candidates: MvpVoteOption[]): Record<string, number> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_COUNTS);
    if (stored) return JSON.parse(stored);
  } catch {
    /* ignore */
  }
  // デモ用初期票数
  const initial: Record<string, number> = {};
  const defaults = [28, 19, 11];
  candidates.forEach((c, i) => {
    initial[c.playerId] = defaults[i] ?? 5;
  });
  return initial;
}

function saveVotes(votes: Record<string, number>) {
  try {
    localStorage.setItem(STORAGE_KEY_COUNTS, JSON.stringify(votes));
  } catch {
    /* ignore */
  }
}

function loadMyVote(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function saveMyVote(playerId: string) {
  try {
    localStorage.setItem(STORAGE_KEY, playerId);
  } catch {
    /* ignore */
  }
}

export default function MvpVote({
  candidates,
}: {
  candidates: MvpVoteOption[];
}) {
  const [myVote, setMyVote] = useState<string | null>(null);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [mounted, setMounted] = useState(false);
  const [justVoted, setJustVoted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setVotes(loadVotes(candidates));
    setMyVote(loadMyVote());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleVote = (playerId: string) => {
    if (myVote) return;

    const updated = { ...votes, [playerId]: (votes[playerId] ?? 0) + 1 };
    setVotes(updated);
    setMyVote(playerId);
    saveVotes(updated);
    saveMyVote(playerId);
    setJustVoted(true);
  };

  if (!mounted) return null;

  const totalVotes = Object.values(votes).reduce((sum, v) => sum + v, 0);
  const showResults = !!myVote;

  return (
    <section className="mb-5 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
          {/* ⚡ アイコン */}
          <svg
            className="w-4 h-4 flex-shrink-0"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ color: "#c9921e" }}
          >
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          第4節 MVP投票
        </h2>
        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
          {totalVotes}票
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        {!showResults && (
          <div className="px-4 pt-4 pb-1">
            <p className="text-xs text-slate-500 font-medium">
              第4節のMVPだと思う選手は？
            </p>
          </div>
        )}

        {justVoted && (
          <div className="mx-4 mt-3 mb-1 flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
            <svg
              className="w-4 h-4 text-emerald-600 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-xs text-emerald-700 font-medium">
              投票ありがとうございます！
            </p>
          </div>
        )}

        <div className="divide-y divide-slate-50">
          {candidates.map((candidate) => {
            const voteCount = votes[candidate.playerId] ?? 0;
            const pct =
              totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
            const isMyVote = myVote === candidate.playerId;

            return (
              <button
                key={candidate.playerId}
                onClick={() => handleVote(candidate.playerId)}
                disabled={showResults}
                className={`w-full px-4 py-3.5 text-left transition-all ${
                  showResults
                    ? "cursor-default"
                    : "hover:bg-slate-50 active:bg-slate-100 active:scale-[0.99]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="min-w-0">
                        <span
                          className={`text-sm ${isMyVote ? "font-black" : "font-semibold text-slate-800"}`}
                          style={isMyVote ? { color: "#c9921e" } : {}}
                        >
                          {candidate.playerName}
                          {isMyVote && (
                            <span className="ml-1.5 text-[10px] font-normal text-slate-400">
                              あなたの投票
                            </span>
                          )}
                        </span>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {candidate.teamName}
                        </p>
                      </div>
                      {showResults && (
                        <span
                          className="text-sm font-black ml-2 flex-shrink-0 tabular-nums"
                          style={{ color: isMyVote ? "#c9921e" : "#94a3b8" }}
                        >
                          {pct}%
                        </span>
                      )}
                    </div>
                    {showResults && (
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${pct}%`,
                            background: isMyVote
                              ? "linear-gradient(90deg, #c9921e, #e3c060)"
                              : "#e2e8f0",
                          }}
                        />
                      </div>
                    )}
                  </div>
                  {!showResults && (
                    <div className="flex items-center text-slate-300 flex-shrink-0">
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
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {!showResults && (
          <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
            <p className="text-xs text-slate-400 text-center font-medium">
              タップして投票（1回のみ）
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

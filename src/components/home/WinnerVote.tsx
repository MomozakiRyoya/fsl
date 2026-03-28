"use client";

import { useState, useEffect } from "react";
import { MOCK_STANDINGS_DIV1, MOCK_LEAGUES } from "@/lib/mock-data";

const STORAGE_KEY_VOTE = "fsl-winner-vote";
const STORAGE_KEY_VOTES = "fsl-winner-votes-count";

function loadVotes(): Record<string, number> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_VOTES);
    if (stored) return JSON.parse(stored);
  } catch {
    /* ignore */
  }
  // デモ用初期票数
  return {
    "t1-1": 42,
    "t1-2": 31,
    "t1-3": 18,
    "t1-4": 14,
    "t1-5": 8,
    "t1-6": 5,
    "t1-7": 3,
    "t1-8": 2,
  };
}

function saveVotes(votes: Record<string, number>) {
  try {
    localStorage.setItem(STORAGE_KEY_VOTES, JSON.stringify(votes));
  } catch {
    /* ignore */
  }
}

export default function WinnerVote() {
  const [myVote, setMyVote] = useState<string | null>(null);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [mounted, setMounted] = useState(false);
  const [justVoted, setJustVoted] = useState(false);

  const div1League = MOCK_LEAGUES.find((l) => l.id === "div1");

  useEffect(() => {
    setMounted(true);
    try {
      void STORAGE_KEY_VOTE; // 投票状態はページロードごとにリセット（myVoteは永続化しない）
    } catch {
      /* ignore */
    }
    setVotes(loadVotes());
  }, []);

  const handleVote = (teamId: string) => {
    if (myVote) return; // 投票済み

    const updated = { ...votes, [teamId]: (votes[teamId] ?? 0) + 1 };
    setVotes(updated);
    setMyVote(teamId);
    saveVotes(updated); // 票数の累積は保存、投票済み状態は保存しない
    setJustVoted(true);
  };

  if (!mounted) return null;

  const totalVotes = Object.values(votes).reduce((sum, v) => sum + v, 0);
  const showResults = !!myVote;
  const topTeams = MOCK_STANDINGS_DIV1.slice(0, 5); // 上位5チームのみ表示

  return (
    <section className="mb-5 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
          {/* トロフィーアイコン */}
          <svg
            className="w-4 h-4 flex-shrink-0"
            style={{ color: "#c9921e" }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          Season 1 優勝予想
        </h2>
        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
          {totalVotes}票
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        {!showResults && (
          <div className="px-4 pt-4 pb-1">
            <p className="text-xs text-slate-500 font-medium">
              Division 1 で優勝すると思うチームは？
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
          {topTeams.map((team, i) => {
            const pct =
              totalVotes > 0
                ? Math.round(((votes[team.teamId] ?? 0) / totalVotes) * 100)
                : 0;
            const isMyVote = myVote === team.teamId;
            // div1Leagueのcolorは未使用になるため参照のみ保持
            void div1League;

            return (
              <button
                key={team.teamId}
                onClick={() => handleVote(team.teamId)}
                disabled={showResults}
                className={`w-full px-4 py-3.5 text-left transition-all ${showResults ? "cursor-default" : "hover:bg-slate-50 active:bg-slate-100 active:scale-[0.99]"}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-slate-300 w-4 flex-shrink-0 tabular-nums">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`text-sm ${isMyVote ? "font-black" : "font-semibold text-slate-800"}`}
                        style={isMyVote ? { color: "#c9921e" } : {}}
                      >
                        {team.teamName}
                        {isMyVote && (
                          <span className="ml-1.5 text-[10px] font-normal text-slate-400">
                            あなたの投票
                          </span>
                        )}
                      </span>
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
                    <div className="flex items-center gap-1.5 text-slate-300 flex-shrink-0">
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

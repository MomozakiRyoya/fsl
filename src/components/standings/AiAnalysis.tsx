"use client";

import { useState } from "react";
import type { TeamStanding } from "@/lib/types/app";

const AI_ANALYSIS: Record<string, string> = {
  "t1-1":
    "博多キングスは今シーズン圧倒的な得点力を誇ります。加藤蓮を中心とした攻撃陣は平均得点リーグ1位。守備の安定感も高く、このままのペースで行けば優勝最有力候補です。課題は接戦での精神力、僅差の試合を制する経験がさらなる成長の鍵になるでしょう。",
  "t1-2":
    "天神エースはバランスの取れたチーム構成が強みです。得点・失点ともにリーグ平均以上のパフォーマンスを維持。木村遼のプレーメイクが攻撃の起点となっており、中盤の支配力は全チーム中トップクラス。逆転優勝の可能性は十分にあります。",
  "t1-3":
    "中洲レジェンズは第3節以降に急成長を見せています。西村聡の爆発的な得点力が最大の武器。ただし守備の脆弱性が露呈するシーンもあり、守備改善が順位上昇の鍵となります。上位進出に必要な要素は揃っています。",
};

export default function AiAnalysis({
  standings,
}: {
  standings: TeamStanding[];
}) {
  const TOP_TEAMS = standings.slice(0, 5);
  const [selectedTeamId, setSelectedTeamId] = useState<string>(
    TOP_TEAMS[0]?.teamId ?? "",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisText, setAnalysisText] = useState<string | null>(null);

  const handleAnalyze = () => {
    setIsLoading(true);
    setShowAnalysis(false);
    setAnalysisText(null);

    setTimeout(() => {
      const text =
        AI_ANALYSIS[selectedTeamId] ??
        "このチームの詳細な分析データを収集中です。次回更新時に公開予定です。";
      setAnalysisText(text);
      setIsLoading(false);
      setShowAnalysis(true);
    }, 1500);
  };

  const handleTeamChange = (teamId: string) => {
    setSelectedTeamId(teamId);
    setShowAnalysis(false);
    setAnalysisText(null);
  };

  const selectedTeam = TOP_TEAMS.find((t) => t.teamId === selectedTeamId);

  return (
    <div
      className="rounded-2xl p-5 text-white mt-4"
      style={{
        background: "linear-gradient(135deg, #0c1e42 0%, #1a3a7a 100%)",
      }}
    >
      {/* ヘッダー */}
      <div className="flex items-center gap-2 mb-4">
        <svg
          className="w-4 h-4 text-amber-400 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74L12 2zm0 0" />
        </svg>
        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
          AI 戦力分析
        </span>
        <span className="ml-auto text-[10px] text-white/40 font-medium">
          powered by FSL AI
        </span>
      </div>

      {/* チーム選択 */}
      <div className="mb-4">
        <label className="block text-[11px] text-white/50 font-medium mb-1.5">
          分析するチームを選択
        </label>
        <div className="relative">
          <select
            value={selectedTeamId}
            onChange={(e) => handleTeamChange(e.target.value)}
            className="w-full appearance-none bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-amber-400/60 focus:bg-white/15 transition-all pr-8"
          >
            {TOP_TEAMS.map((team) => (
              <option
                key={team.teamId}
                value={team.teamId}
                style={{ background: "#0c1e42", color: "white" }}
              >
                {team.rank}位 {team.teamName}（{team.totalPoints}pt）
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg
              className="w-4 h-4 text-white/50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* 分析ボタン */}
      {!showAnalysis && !isLoading && (
        <button
          onClick={handleAnalyze}
          className="w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #c9921e, #e3c060)",
            color: "#0c1e42",
          }}
        >
          {selectedTeam?.teamName} を分析する
        </button>
      )}

      {/* ローディング */}
      {isLoading && (
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full animate-bounce"
              style={{
                backgroundColor: "#e3c060",
                animationDelay: "0ms",
              }}
            />
            <div
              className="w-2 h-2 rounded-full animate-bounce"
              style={{
                backgroundColor: "#e3c060",
                animationDelay: "150ms",
              }}
            />
            <div
              className="w-2 h-2 rounded-full animate-bounce"
              style={{
                backgroundColor: "#e3c060",
                animationDelay: "300ms",
              }}
            />
          </div>
          <p className="text-xs text-white/50 font-medium">AI分析中...</p>
        </div>
      )}

      {/* 分析結果 */}
      {showAnalysis && analysisText && (
        <div className="animate-fade-in">
          <div className="bg-white/10 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black"
                style={{
                  background: "linear-gradient(135deg, #c9921e, #e3c060)",
                  color: "#0c1e42",
                }}
              >
                AI
              </div>
              <span className="text-xs font-bold text-amber-400">
                {selectedTeam?.teamName} 分析レポート
              </span>
            </div>
            <p className="text-sm text-white/85 leading-relaxed">
              {analysisText}
            </p>
          </div>

          <button
            onClick={handleAnalyze}
            className="mt-3 w-full py-2 rounded-xl text-xs font-semibold text-white/50 border border-white/15 hover:border-white/30 hover:text-white/70 transition-all"
          >
            再分析する
          </button>
        </div>
      )}
    </div>
  );
}

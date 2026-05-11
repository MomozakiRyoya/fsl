"use client";

import { useState, useMemo } from "react";
import type { TeamStanding } from "@/lib/types/app";

const MAX_ADD = 99;

function getInitials(name: string): string {
  const stripped = name.replace(/\s+/g, "");
  return stripped.slice(0, 2).toUpperCase();
}

export default function StandingsSimulator({
  standings,
}: {
  standings: TeamStanding[];
}) {
  // 各チームの次節予想加算ポイント（teamId -> 加算pt）
  const [additions, setAdditions] = useState<Record<string, number>>(() =>
    Object.fromEntries(standings.map((t) => [t.teamId, 0])),
  );

  // 仮想順位を計算
  const simulated = useMemo((): (TeamStanding & {
    simRank: number;
    rankDelta: number;
  })[] => {
    const withSim = standings.map((team) => ({
      ...team,
      simTotal: team.totalPoints + (additions[team.teamId] ?? 0),
    }));

    // ポイント降順でソート
    withSim.sort((a, b) => b.simTotal - a.simTotal);

    return withSim.map((team, idx) => ({
      ...team,
      totalPoints: team.simTotal,
      simRank: idx + 1,
      rankDelta: team.rank - (idx + 1), // 正 = 上昇、負 = 下降
    }));
  }, [additions]);

  const handleReset = () => {
    setAdditions(Object.fromEntries(standings.map((t) => [t.teamId, 0])));
  };

  // 現在の首位チームID
  const currentLeaderId = standings[0]?.teamId ?? "";
  // 仮想首位チームID
  const simLeaderId = simulated[0]?.teamId ?? "";
  const leaderChanged = currentLeaderId !== simLeaderId;

  return (
    <div className="flex flex-col gap-4 animate-spring-in overflow-hidden">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Standings Simulator
          </p>
          <h2 className="text-lg font-black text-slate-900 mt-0.5">
            順位シミュレーター
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            次節の獲得予想ポイントを設定してください
          </p>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-full bg-white hover:bg-slate-50 active:scale-95 transition-all"
        >
          <svg
            className="w-3.5 h-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          リセット
        </button>
      </div>

      {/* 首位変動アラート */}
      {leaderChanged && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl animate-spring-in">
          <span className="text-lg">👑</span>
          <p className="text-xs text-amber-800 font-semibold">
            <span className="font-black">{simulated[0]?.teamName}</span>
            が首位に浮上します！
          </p>
        </div>
      )}

      {/* 入力テーブル */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-native w-full max-w-full">
        {/* ヘッダー行 */}
        <div
          className="grid grid-cols-[2rem_1fr_auto] gap-2 px-3 py-2.5 border-b border-white/10"
          style={{ background: "#0c1e42" }}
        >
          <span className="text-[11px] font-bold text-white/50 text-center">
            仮
          </span>
          <span className="text-[11px] font-bold text-white/50">チーム</span>
          <span className="text-[11px] font-bold text-white/50 text-right">
            +pt設定
          </span>
        </div>

        {simulated.map((team, i) => {
          const isTopFour = team.simRank <= 4;
          const isLeader = team.simRank === 1;
          const addition = additions[team.teamId] ?? 0;

          return (
            <div
              key={team.teamId}
              className="border-b border-slate-100 last:border-0 transition-all duration-300"
              style={{
                background:
                  isLeader && leaderChanged
                    ? "rgba(201,146,30,0.08)"
                    : isTopFour
                      ? "rgba(201,146,30,0.04)"
                      : undefined,
                borderLeft: isTopFour
                  ? "3px solid rgba(201,146,30,0.35)"
                  : "3px solid transparent",
                animationDelay: `${i * 30}ms`,
              }}
            >
              {/* メイン行 */}
              <div className="grid grid-cols-[2rem_1fr_auto] gap-2 px-3 py-2.5 items-center">
                {/* 仮想順位 */}
                <div className="flex flex-col items-center">
                  <span
                    className="text-base font-black"
                    style={{
                      color: isLeader
                        ? "#c9921e"
                        : isTopFour
                          ? "#c9921e"
                          : "#94a3b8",
                    }}
                  >
                    {team.simRank}
                  </span>
                </div>

                {/* チーム名 + 変動 */}
                <div className="flex items-center gap-2 min-w-0">
                  {team.teamLogoUrl ? (
                    <img
                      src={team.teamLogoUrl}
                      alt={team.teamName}
                      className="w-7 h-7 rounded-full object-cover flex-shrink-0 shadow-sm"
                    />
                  ) : (
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black text-white flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: "#2b70ef" }}
                    >
                      {getInitials(team.teamName)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <span className="text-sm font-semibold text-slate-900 truncate block">
                      {team.teamName}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-400 tabular-nums">
                        {standings.find((t) => t.teamId === team.teamId)
                          ?.totalPoints ?? 0}
                        {addition > 0 && (
                          <span className="text-emerald-600 font-bold">
                            {" "}
                            +{addition}
                          </span>
                        )}{" "}
                        ={" "}
                        <span className="font-black text-slate-700">
                          {team.totalPoints}pt
                        </span>
                      </span>
                      {/* 順位変動 */}
                      {team.rankDelta > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600">
                          <svg
                            className="w-3 h-3"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 4l8 10H4l8-10z" />
                          </svg>
                          {team.rankDelta}
                        </span>
                      )}
                      {team.rankDelta < 0 && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-red-500">
                          <svg
                            className="w-3 h-3"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 20l-8-10h16l-8 10z" />
                          </svg>
                          {Math.abs(team.rankDelta)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* ポイント設定 ステッパー */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      setAdditions((prev) => ({
                        ...prev,
                        [team.teamId]: Math.max(
                          0,
                          (prev[team.teamId] ?? 0) - 1,
                        ),
                      }))
                    }
                    className="w-7 h-7 rounded-full flex items-center justify-center text-base font-bold active:scale-90 transition-all"
                    style={{ background: "#f1f5f9", color: "#64748b" }}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={0}
                    max={MAX_ADD}
                    value={addition}
                    onChange={(e) => {
                      const v = Math.max(
                        0,
                        Math.min(MAX_ADD, Number(e.target.value) || 0),
                      );
                      setAdditions((prev) => ({ ...prev, [team.teamId]: v }));
                    }}
                    className="w-10 h-7 text-center text-sm font-black tabular-nums rounded-lg border outline-none"
                    style={{
                      background: addition > 0 ? "#0c1e42" : "#f1f5f9",
                      color: addition > 0 ? "white" : "#64748b",
                      border: "none",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setAdditions((prev) => ({
                        ...prev,
                        [team.teamId]: Math.min(
                          MAX_ADD,
                          (prev[team.teamId] ?? 0) + 1,
                        ),
                      }))
                    }
                    className="w-7 h-7 rounded-full flex items-center justify-center text-base font-bold active:scale-90 transition-all"
                    style={{
                      background: addition > 0 ? "#0c1e42" : "#f1f5f9",
                      color: addition > 0 ? "white" : "#64748b",
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 凡例 */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span
            className="w-3 h-3 rounded-sm flex-shrink-0 border-l-2"
            style={{
              borderColor: "#c9921e",
              background: "rgba(201,146,30,0.12)",
            }}
          />
          <span className="text-xs text-slate-500">プレーオフ進出圏</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-600">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4l8 10H4l8-10z" />
            </svg>
            上昇
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-red-500">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 20l-8-10h16l-8 10z" />
            </svg>
            下降
          </span>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import type { PlayerStats, TeamStanding } from "@/lib/types/app";

type TabType = "player" | "team";

function Bar({
  value,
  max,
  highlight,
}: {
  value: number;
  max: number;
  highlight: boolean;
}) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
      <div
        className="h-2 rounded-full transition-all duration-500"
        style={{
          width: `${pct}%`,
          background: highlight
            ? "linear-gradient(90deg, #c9921e, #e3c060)"
            : "#94a3b8",
        }}
      />
    </div>
  );
}

interface PlayerRowProps {
  label: string;
  leftVal: number;
  rightVal: number;
  unit?: string;
}

function PlayerRow({ label, leftVal, rightVal, unit = "" }: PlayerRowProps) {
  const max = Math.max(leftVal, rightVal, 1);
  const leftWins = leftVal > rightVal;
  const rightWins = rightVal > leftVal;

  return (
    <div className="mb-4">
      <p className="text-[11px] text-slate-400 text-center mb-1.5 font-medium uppercase tracking-wide">
        {label}
      </p>
      <div className="flex items-center gap-2">
        <span
          className="w-10 text-right text-sm font-black tabular-nums"
          style={{ color: leftWins ? "#c9921e" : "#94a3b8" }}
        >
          {leftVal}
          {unit}
        </span>
        <Bar value={leftVal} max={max} highlight={leftWins} />
        <span className="text-[10px] text-slate-300 font-medium w-3 text-center">
          vs
        </span>
        <Bar value={rightVal} max={max} highlight={rightWins} />
        <span
          className="w-10 text-left text-sm font-black tabular-nums"
          style={{ color: rightWins ? "#c9921e" : "#94a3b8" }}
        >
          {rightVal}
          {unit}
        </span>
      </div>
    </div>
  );
}

interface Props {
  playerStats: PlayerStats[];
  standings: Record<string, TeamStanding[]>;
}

export default function ComparePageClient({ playerStats, standings }: Props) {
  const [tab, setTab] = useState<TabType>("player");

  // 全ディビジョンのチームを flatten
  const allTeams: (TeamStanding & { division: string })[] = Object.entries(
    standings,
  ).flatMap(([divId, divStandings]) =>
    divStandings.map((s) => ({
      ...s,
      division: divId
        .replace("div1", "Division 1")
        .replace("div2", "Division 2")
        .replace("div3", "Division 3")
        .replace("div4", "Division 4")
        .replace("div5", "Division 5")
        .replace("div6", "Division 6"),
    })),
  );

  // 選手比較
  const [leftPlayerId, setLeftPlayerId] = useState<string>(
    playerStats[0]?.playerId ?? "",
  );
  const [rightPlayerId, setRightPlayerId] = useState<string>(
    playerStats[1]?.playerId ?? "",
  );

  const leftPlayer: PlayerStats | undefined = playerStats.find(
    (p) => p.playerId === leftPlayerId,
  );
  const rightPlayer: PlayerStats | undefined = playerStats.find(
    (p) => p.playerId === rightPlayerId,
  );

  // チーム比較
  const [leftTeamId, setLeftTeamId] = useState<string>(
    allTeams[0]?.teamId ?? "",
  );
  const [rightTeamId, setRightTeamId] = useState<string>(
    allTeams[1]?.teamId ?? "",
  );

  const leftTeam = allTeams.find((t) => t.teamId === leftTeamId);
  const rightTeam = allTeams.find((t) => t.teamId === rightTeamId);

  const selectClass =
    "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 outline-none appearance-none";

  return (
    <div className="max-w-lg mx-auto">
      {/* ヘッダー */}
      <div
        className="relative overflow-hidden px-5 pt-10 pb-6"
        style={{
          background:
            "linear-gradient(135deg, #0c1e42 0%, #1a3a7a 60%, #0c1e42 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 80%, #c9921e 0%, transparent 50%)",
          }}
        />
        <div className="relative">
          <p className="text-white/50 text-xs tracking-[0.25em] uppercase mb-1">
            FSL Season 1
          </p>
          <h1 className="text-2xl font-black text-white tracking-widest">
            COMPARE
          </h1>
        </div>
      </div>

      {/* タブ */}
      <div className="flex border-b border-slate-200 bg-white">
        {(["player", "team"] as TabType[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-3 text-sm font-semibold transition-colors relative"
            style={{ color: tab === t ? "#0c1e42" : "#94a3b8" }}
          >
            {t === "player" ? "選手比較" : "チーム比較"}
            {tab === t && (
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                style={{ background: "#c9921e" }}
              />
            )}
          </button>
        ))}
      </div>

      <div className="px-4 py-5">
        {tab === "player" && (
          <>
            {/* 選手セレクト */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div>
                <p className="text-[11px] text-slate-400 font-medium mb-1.5">
                  選手A
                </p>
                <div className="relative">
                  <select
                    value={leftPlayerId}
                    onChange={(e) => setLeftPlayerId(e.target.value)}
                    className={selectClass}
                  >
                    {playerStats.map((p) => (
                      <option key={p.playerId} value={p.playerId}>
                        {p.playerName}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
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
                {leftPlayer && (
                  <p className="text-[10px] text-slate-400 mt-1 truncate">
                    {leftPlayer.teamName}
                  </p>
                )}
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium mb-1.5">
                  選手B
                </p>
                <div className="relative">
                  <select
                    value={rightPlayerId}
                    onChange={(e) => setRightPlayerId(e.target.value)}
                    className={selectClass}
                  >
                    {playerStats.map((p) => (
                      <option key={p.playerId} value={p.playerId}>
                        {p.playerName}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
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
                {rightPlayer && (
                  <p className="text-[10px] text-slate-400 mt-1 truncate">
                    {rightPlayer.teamName}
                  </p>
                )}
              </div>
            </div>

            {/* 比較カード */}
            {leftPlayer && rightPlayer && (
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                {/* 選手名ヘッダー */}
                <div className="flex items-center justify-between mb-5">
                  <div className="text-center flex-1">
                    <p className="text-sm font-black text-slate-900">
                      {leftPlayer.playerName}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {leftPlayer.teamName}
                    </p>
                  </div>
                  <div className="w-8 text-center">
                    <span className="text-slate-300 font-bold text-sm">VS</span>
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-sm font-black text-slate-900">
                      {rightPlayer.playerName}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {rightPlayer.teamName}
                    </p>
                  </div>
                </div>

                <PlayerRow
                  label="得点"
                  leftVal={leftPlayer.goals}
                  rightVal={rightPlayer.goals}
                />
                <PlayerRow
                  label="アシスト"
                  leftVal={leftPlayer.assists}
                  rightVal={rightPlayer.assists}
                />
                <PlayerRow
                  label="出場試合"
                  leftVal={leftPlayer.games}
                  rightVal={rightPlayer.games}
                />
                <PlayerRow
                  label="MVPバッジ数"
                  leftVal={leftPlayer.mvpCount}
                  rightVal={rightPlayer.mvpCount}
                />
              </div>
            )}
          </>
        )}

        {tab === "team" && (
          <>
            {/* チームセレクト */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div>
                <p className="text-[11px] text-slate-400 font-medium mb-1.5">
                  チームA
                </p>
                <div className="relative">
                  <select
                    value={leftTeamId}
                    onChange={(e) => setLeftTeamId(e.target.value)}
                    className={selectClass}
                  >
                    {allTeams.map((t) => (
                      <option key={t.teamId} value={t.teamId}>
                        {t.teamName}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
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
                {leftTeam && (
                  <p className="text-[10px] text-slate-400 mt-1">
                    {leftTeam.division}
                  </p>
                )}
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium mb-1.5">
                  チームB
                </p>
                <div className="relative">
                  <select
                    value={rightTeamId}
                    onChange={(e) => setRightTeamId(e.target.value)}
                    className={selectClass}
                  >
                    {allTeams.map((t) => (
                      <option key={t.teamId} value={t.teamId}>
                        {t.teamName}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
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
                {rightTeam && (
                  <p className="text-[10px] text-slate-400 mt-1">
                    {rightTeam.division}
                  </p>
                )}
              </div>
            </div>

            {/* 比較カード */}
            {leftTeam && rightTeam && (
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                {/* チーム名ヘッダー */}
                <div className="flex items-center justify-between mb-5">
                  <div className="text-center flex-1">
                    <p className="text-sm font-black text-slate-900 leading-snug">
                      {leftTeam.teamName}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {leftTeam.division}
                    </p>
                  </div>
                  <div className="w-8 text-center">
                    <span className="text-slate-300 font-bold text-sm">VS</span>
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-sm font-black text-slate-900 leading-snug">
                      {rightTeam.teamName}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {rightTeam.division}
                    </p>
                  </div>
                </div>

                <PlayerRow
                  label="総合ポイント"
                  leftVal={leftTeam.totalPoints}
                  rightVal={rightTeam.totalPoints}
                  unit="pt"
                />
                <PlayerRow
                  label="勝利数（概算）"
                  leftVal={Math.round(leftTeam.totalPoints / 15)}
                  rightVal={Math.round(rightTeam.totalPoints / 15)}
                  unit="勝"
                />
                {/* 順位バー */}
                <div className="mb-4">
                  <p className="text-[11px] text-slate-400 text-center mb-1.5 font-medium uppercase tracking-wide">
                    順位
                  </p>
                  <div className="flex items-center justify-around">
                    <span
                      className="text-2xl font-black tabular-nums"
                      style={{
                        color: leftTeam.rank <= 3 ? "#c9921e" : "#94a3b8",
                      }}
                    >
                      {leftTeam.rank}位
                    </span>
                    <span className="text-slate-200 font-bold">—</span>
                    <span
                      className="text-2xl font-black tabular-nums"
                      style={{
                        color: rightTeam.rank <= 3 ? "#c9921e" : "#94a3b8",
                      }}
                    >
                      {rightTeam.rank}位
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import type { Player, TeamStanding, League } from "@/lib/types/app";
import CountUp from "@/components/ui/CountUp";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Props {
  player: Player | null;
  allPlayers: Player[];
  standings: Record<string, TeamStanding[]>;
  leagues: League[];
}

function getInitials(name: string) {
  return name.replace(/\s+/g, "").slice(0, 2).toUpperCase();
}

function PlayerSelector({ allPlayers }: { allPlayers: Player[] }) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const filtered = query.trim()
    ? allPlayers.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.teamName.toLowerCase().includes(query.toLowerCase()),
      )
    : [];

  const selectedPlayer = allPlayers.find((p) => p.id === selectedId);

  const handleSave = async () => {
    if (!selectedId) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.auth.updateUser({ data: { player_id: selectedId } });
    setSaving(false);
    setDone(true);
    setTimeout(() => window.location.reload(), 800);
  };

  return (
    <div className="max-w-lg mx-auto px-4 pb-8">
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
          戦績
        </p>
        <p className="text-sm text-slate-600 mb-4">
          選手名またはチーム名で検索して設定してください
        </p>
        <div className="relative mb-2">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedId("");
            }}
            placeholder="選手名・チーム名を入力..."
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-900 outline-none focus:border-primary-400"
          />
        </div>
        {filtered.length > 0 && !selectedId && (
          <div className="border border-slate-200 rounded-xl overflow-hidden mb-3 max-h-48 overflow-y-auto">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedId(p.id);
                  setQuery(`${p.name}（${p.teamName}）`);
                }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors"
              >
                <span className="font-semibold text-slate-900">{p.name}</span>
                <span className="text-slate-400 ml-2 text-xs">
                  {p.teamName}
                </span>
              </button>
            ))}
          </div>
        )}
        {selectedPlayer && (
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-xl mb-3">
            <svg
              className="w-4 h-4 text-amber-600 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-sm font-semibold text-amber-800">
              {selectedPlayer.name}
            </span>
            <span className="text-xs text-amber-600">
              {selectedPlayer.teamName}
            </span>
          </div>
        )}
        <button
          onClick={handleSave}
          disabled={!selectedId || saving || done}
          className="w-full py-2.5 rounded-xl text-sm font-bold disabled:opacity-50"
          style={{
            background: "linear-gradient(135deg, #c9921e, #e3c060)",
            color: "#0c1e42",
          }}
        >
          {done ? "✓ 設定しました" : saving ? "保存中..." : "設定する"}
        </button>
      </div>
    </div>
  );
}

export default function PlayerStatsSection({
  player,
  allPlayers,
  standings,
  leagues,
}: Props) {
  if (!player) {
    return <PlayerSelector allPlayers={allPlayers} />;
  }

  const leagueStandings = standings[player.leagueId] ?? [];
  const myStanding = leagueStandings.find((s) => s.teamId === player.teamId);
  const leagueName = leagues.find((l) => l.id === player.leagueId)?.name ?? "";
  const leagueColor =
    leagues.find((l) => l.id === player.leagueId)?.color ?? "#0c1e42";

  const allRounds = myStanding
    ? Object.keys(myStanding.roundPoints)
        .map(Number)
        .sort((a, b) => a - b)
    : [];

  const roundRanks = allRounds.map((r) => {
    const sorted = [...leagueStandings]
      .map((s) => ({ teamId: s.teamId, pts: s.roundPoints[r] ?? 0 }))
      .sort((a, b) => b.pts - a.pts);
    const rank = sorted.findIndex((s) => s.teamId === player.teamId) + 1;
    return { round: r, rank, pts: myStanding?.roundPoints[r] ?? 0 };
  });

  const totalPoints = myStanding?.totalPoints ?? 0;
  const overallRank = myStanding?.rank ?? null;
  const avgRank =
    roundRanks.length > 0
      ? Math.round(
          (roundRanks.reduce((s, r) => s + r.rank, 0) / roundRanks.length) * 10,
        ) / 10
      : null;
  const maxPts = Math.max(...roundRanks.map((r) => r.pts), 1);

  return (
    <div className="max-w-lg mx-auto px-4 pb-8 space-y-4">
      {/* 選手カード */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">
          選手プロフィール
        </p>
        <div className="flex items-center gap-4 mb-5">
          {player.photoUrl ? (
            <img
              src={player.photoUrl}
              alt={player.name}
              className="w-16 h-16 rounded-2xl object-cover flex-shrink-0 border border-slate-100"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-black text-lg flex-shrink-0">
              {getInitials(player.name)}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <p className="text-lg font-black text-slate-900 leading-tight">
                {player.name}
              </p>
              {player.isCaptain && (
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                  style={{ background: "#fef3c7", color: "#92400e" }}
                >
                  Captain
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-0.5">{player.teamName}</p>
            <span
              className="inline-block text-xs px-2.5 py-0.5 rounded-full font-semibold text-white mt-1"
              style={{ background: leagueColor }}
            >
              {leagueName}
            </span>
          </div>
        </div>

        {/* 統計3ボックス */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <p
              className="text-xl font-black tabular-nums"
              style={{ color: "#c9921e" }}
            >
              <CountUp value={totalPoints} duration={2000} />
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5 leading-tight">
              総合
              <br />
              ポイント
            </p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <p className="text-xl font-black tabular-nums text-slate-700">
              {overallRank ? `#${overallRank}` : "—"}
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5 leading-tight">
              リーグ
              <br />
              順位
            </p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <p className="text-xl font-black tabular-nums text-slate-700">
              {avgRank ?? "—"}
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5 leading-tight">
              平均
              <br />
              順位
            </p>
          </div>
        </div>
      </div>

      {/* 各節成績 */}
      {roundRanks.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
            各節の成績
          </p>
          <div className="space-y-2.5">
            {roundRanks.map(({ round, rank, pts }) => (
              <div key={round} className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400 w-7 flex-shrink-0">
                  R{round}
                </span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${(pts / maxPts) * 100}%`,
                      background:
                        rank === 1
                          ? "linear-gradient(90deg, #c9921e, #e3c060)"
                          : rank <= 3
                            ? "#2b70ef"
                            : "#cbd5e1",
                    }}
                  />
                </div>
                <span
                  className="text-sm font-black tabular-nums w-12 text-right flex-shrink-0"
                  style={{ color: "#c9921e" }}
                >
                  {pts}pt
                </span>
                <span className="text-xs font-semibold text-slate-400 w-7 text-right flex-shrink-0">
                  {rank}位
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 py-8 text-center shadow-sm">
          <p className="text-sm text-slate-400">まだ試合結果がありません</p>
        </div>
      )}

      {/* 順位表へのリンク */}
      <Link
        href={`/standings?league=${player.leagueId}`}
        className="block w-full py-3 rounded-2xl text-sm font-semibold text-center border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors"
      >
        {leagueName} 全順位を見る →
      </Link>
    </div>
  );
}

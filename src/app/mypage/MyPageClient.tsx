"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Player, TeamStanding, League } from "@/lib/types/app";

interface Props {
  email: string;
  displayName: string;
  avatarUrl: string | null;
  avatarColor: string;
  savedPlayerId: string | null;
  players: Player[];
  standings: Record<string, TeamStanding[]>;
  leagues: League[];
}

function getInitials(name: string) {
  return name.replace(/\s+/g, "").slice(0, 2).toUpperCase();
}

export default function MyPageClient({
  email,
  displayName,
  avatarUrl,
  avatarColor,
  savedPlayerId,
  players,
  standings,
  leagues,
}: Props) {
  const [selectedPlayerId, setSelectedPlayerId] = useState(savedPlayerId ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const selectedPlayer = players.find((p) => p.id === selectedPlayerId);

  // 選手のリーグ standings を取得
  const leagueStandings = selectedPlayer
    ? (standings[selectedPlayer.leagueId] ?? [])
    : [];
  const myStanding = leagueStandings.find(
    (s) => s.teamId === selectedPlayer?.teamId,
  );

  // 全ラウンド一覧（このリーグ）
  const allRounds = myStanding
    ? Object.keys(myStanding.roundPoints)
        .map(Number)
        .sort((a, b) => a - b)
    : [];

  // ラウンドごとの順位計算
  const roundRanks = allRounds.map((r) => {
    const sorted = [...leagueStandings]
      .map((s) => ({ teamId: s.teamId, pts: s.roundPoints[r] ?? 0 }))
      .sort((a, b) => b.pts - a.pts);
    const rank = sorted.findIndex((s) => s.teamId === selectedPlayer?.teamId) + 1;
    const pts = myStanding?.roundPoints[r] ?? 0;
    return { round: r, rank, pts };
  });

  const totalPoints = myStanding?.totalPoints ?? 0;
  const avgRank =
    roundRanks.length > 0
      ? Math.round((roundRanks.reduce((s, r) => s + r.rank, 0) / roundRanks.length) * 10) / 10
      : null;

  const leagueName =
    leagues.find((l) => l.id === selectedPlayer?.leagueId)?.name ?? "";

  const handleSavePlayer = async () => {
    setSaving(true);
    const supabase = createClient();
    await supabase.auth.updateUser({
      data: { player_id: selectedPlayerId || null },
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-lg mx-auto pb-32">
      {/* ヘッダー */}
      <div
        className="relative px-5 pt-10 pb-6"
        style={{
          background:
            "linear-gradient(135deg, #0c1e42 0%, #1a3a7a 60%, #0c1e42 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 100%, #c9921e 0%, transparent 60%)",
          }}
        />
        <div className="relative flex items-center gap-4">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-16 h-16 rounded-full object-cover border-2 border-white/20 flex-shrink-0"
            />
          ) : (
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black text-white flex-shrink-0"
              style={{ background: avatarColor }}
            >
              {getInitials(displayName || email)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-white font-black text-lg leading-tight truncate">
              {displayName || "（未設定）"}
            </p>
            <p className="text-white/40 text-xs mt-0.5 truncate">{email}</p>
          </div>
          <Link
            href="/account"
            className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-colors"
          >
            設定
          </Link>
        </div>
      </div>

      <div className="px-4 py-5 space-y-5">
        {/* 選手プロフィール選択 */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
            選手プロフィール連携
          </p>
          <select
            value={selectedPlayerId}
            onChange={(e) => setSelectedPlayerId(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-900 outline-none focus:border-primary-400 mb-3"
          >
            <option value="">選手を選択...</option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}（{p.teamName}）
              </option>
            ))}
          </select>
          <button
            onClick={handleSavePlayer}
            disabled={saving}
            className="w-full py-2.5 rounded-xl text-sm font-bold disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #c9921e, #e3c060)",
              color: "#0c1e42",
            }}
          >
            {saving ? "保存中..." : saved ? "✓ 保存しました" : "保存する"}
          </button>
        </div>

        {/* 選手情報 + 戦績 */}
        {selectedPlayer && (
          <>
            {/* 選手プロフィール */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">
                選手プロフィール
              </p>
              <div className="flex items-center gap-4 mb-4">
                {selectedPlayer.photoUrl ? (
                  <img
                    src={selectedPlayer.photoUrl}
                    alt={selectedPlayer.name}
                    className="w-16 h-16 rounded-2xl object-cover flex-shrink-0 border border-slate-100"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                    {getInitials(selectedPlayer.name)}
                  </div>
                )}
                <div>
                  <p className="text-lg font-black text-slate-900 leading-tight">
                    {selectedPlayer.name}
                  </p>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {selectedPlayer.teamName}
                  </p>
                  <span
                    className="inline-block text-xs px-2.5 py-0.5 rounded-full font-semibold text-white mt-1"
                    style={{ background: "#0c1e42" }}
                  >
                    {leagueName}
                  </span>
                </div>
              </div>

              {/* 総合統計 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <p
                    className="text-2xl font-black tabular-nums"
                    style={{ color: "#c9921e" }}
                  >
                    {totalPoints}
                  </p>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    総合獲得ポイント
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-black tabular-nums text-slate-700">
                    {avgRank !== null ? avgRank : "—"}
                  </p>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    平均順位
                  </p>
                </div>
              </div>
            </div>

            {/* 各節の順位 */}
            {roundRanks.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                  各節の成績
                </p>
                <div className="space-y-2">
                  {roundRanks.map(({ round, rank, pts }) => (
                    <div
                      key={round}
                      className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0"
                    >
                      <span className="text-xs font-bold text-slate-400 w-8 flex-shrink-0">
                        R{round}
                      </span>
                      <div className="flex-1">
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(100, (pts / Math.max(...roundRanks.map((r) => r.pts), 1)) * 100)}%`,
                              background:
                                rank === 1
                                  ? "linear-gradient(90deg, #c9921e, #e3c060)"
                                  : rank <= 3
                                    ? "#2b70ef"
                                    : "#cbd5e1",
                            }}
                          />
                        </div>
                      </div>
                      <span
                        className="text-sm font-bold tabular-nums w-12 text-right flex-shrink-0"
                        style={{ color: "#c9921e" }}
                      >
                        {pts}pt
                      </span>
                      <span className="text-xs font-semibold text-slate-400 w-8 text-right flex-shrink-0">
                        {rank}位
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {allRounds.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 py-10 text-center shadow-sm">
                <p className="text-sm text-slate-400">まだ試合結果がありません</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

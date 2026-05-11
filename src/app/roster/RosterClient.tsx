"use client";

import { useState, useEffect } from "react";
import type { League, Team, Round } from "@/lib/types/app";

interface Roster {
  round_id: string;
  players: string;
}

interface Props {
  myTeam: Team | null;
  leagues: League[];
  teams: Team[];
  rounds: Round[];
}

export default function RosterClient({ myTeam, leagues, teams, rounds }: Props) {
  const [selectedLeagueId, setSelectedLeagueId] = useState(myTeam?.leagueId ?? "");
  const [selectedTeamId, setSelectedTeamId] = useState(myTeam?.id ?? "");
  const [playerInputs, setPlayerInputs] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [savedRounds, setSavedRounds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState("");

  const leagueTeams = teams.filter((t) => t.leagueId === selectedLeagueId);
  const leagueRounds = rounds
    .filter((r) => r.leagueId === selectedLeagueId)
    .sort((a, b) => a.roundNumber - b.roundNumber);

  // 既存データ取得
  useEffect(() => {
    if (!selectedTeamId || !selectedLeagueId) return;
    fetch(`/api/roster?teamId=${selectedTeamId}&leagueId=${selectedLeagueId}`)
      .then((r) => r.json())
      .then((data: Roster[]) => {
        const map: Record<string, string> = {};
        data.forEach((r) => { map[r.round_id] = r.players ?? ""; });
        setPlayerInputs(map);
        setSavedRounds(new Set(data.map((r) => r.round_id)));
      })
      .catch(() => {});
  }, [selectedTeamId, selectedLeagueId]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleSaveRound = async (roundId: string) => {
    if (!selectedTeamId) { showToast("チームを選択してください"); return; }
    setSaving(roundId);
    const res = await fetch("/api/roster", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        teamId: selectedTeamId,
        leagueId: selectedLeagueId,
        roundId,
        players: playerInputs[roundId] ?? "",
      }),
    });
    setSaving(null);
    if (res.ok) {
      setSavedRounds((prev) => new Set([...prev, roundId]));
      showToast("保存しました");
    } else {
      showToast("保存に失敗しました");
    }
  };

  return (
    <div className="max-w-lg mx-auto pb-32">
      {/* ヘッダー */}
      <div
        className="px-5 pt-10 pb-6"
        style={{ background: "linear-gradient(135deg, #0c1e42, #1a3a7a)" }}
      >
        <p className="text-[10px] tracking-[0.3em] text-white/40 uppercase mb-1">Captain Only</p>
        <h1 className="text-2xl font-black text-white">出場選手登録</h1>
        <p className="text-xs text-white/40 mt-1">各節の出場選手を登録してください</p>
      </div>

      <div className="px-4 py-5 space-y-5">
        {/* リーグ・ディビジョン選択 */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="px-4 py-3 font-semibold text-sm text-white" style={{ background: "#6b21a8" }}>
            リーグ・ディビジョン選択
          </div>
          <div className="p-4">
            <p className="text-sm font-medium text-slate-700 mb-3">
              参加ディビジョンの選択 <span className="text-red-500">*</span>
            </p>
            <div className="space-y-3">
              {leagues.map((l) => (
                <label key={l.id} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="league"
                    value={l.id}
                    checked={selectedLeagueId === l.id}
                    onChange={() => {
                      setSelectedLeagueId(l.id);
                      setSelectedTeamId("");
                      setPlayerInputs({});
                    }}
                    className="w-5 h-5 accent-primary-500"
                  />
                  <span className="text-sm text-slate-800">{l.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* チーム名選択 */}
        {selectedLeagueId && (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="px-4 py-3 font-semibold text-sm text-white" style={{ background: "#6b21a8" }}>
              チーム名の選択
            </div>
            <div className="p-4">
              <p className="text-sm font-medium text-slate-700 mb-3">
                参加チーム名の選択 <span className="text-red-500">*</span>
              </p>
              <select
                value={selectedTeamId}
                onChange={(e) => {
                  setSelectedTeamId(e.target.value);
                  setPlayerInputs({});
                }}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-900 outline-none focus:border-primary-400"
              >
                <option value="">選択</option>
                {leagueTeams.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* 各節の選手登録 */}
        {selectedTeamId && leagueRounds.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="px-4 py-3 font-semibold text-sm text-white" style={{ background: "#6b21a8" }}>
              {leagues.find((l) => l.id === selectedLeagueId)?.name.toUpperCase()}各節の選手登録
            </div>
            <div className="divide-y divide-slate-50">
              {leagueRounds.map((r) => {
                const isSaved = savedRounds.has(r.id);
                return (
                  <div key={r.id} className="p-4">
                    <p className="text-sm font-semibold text-slate-800 mb-1">
                      {r.name} {r.date} {r.format}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        value={playerInputs[r.id] ?? ""}
                        onChange={(e) =>
                          setPlayerInputs({ ...playerInputs, [r.id]: e.target.value })
                        }
                        placeholder="出場選手名を入力（例: 田中、鈴木、山田）"
                        className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white text-slate-900 outline-none focus:border-primary-400"
                      />
                      <button
                        onClick={() => handleSaveRound(r.id)}
                        disabled={saving === r.id}
                        className="px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-40 whitespace-nowrap"
                        style={
                          isSaved
                            ? { background: "#e8f5e9", color: "#2e7d32" }
                            : { background: "linear-gradient(135deg, #c9921e, #e3c060)", color: "#0c1e42" }
                        }
                      >
                        {saving === r.id ? "保存中..." : isSaved ? "✓ 保存済" : "保存"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl text-sm font-semibold text-white shadow-lg z-50"
          style={{ background: "#0c1e42", border: "1px solid rgba(255,255,255,0.1)" }}>
          {toast}
        </div>
      )}
    </div>
  );
}

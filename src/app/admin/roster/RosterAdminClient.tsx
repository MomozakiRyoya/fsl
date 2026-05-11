"use client";

import { useState } from "react";
import type { League, Team, Round } from "@/lib/types/app";

interface Roster {
  id: string;
  team_id: string;
  league_id: string;
  round_id: string;
  players: string | null;
  updated_at: string;
}

interface Props {
  initialRosters: Roster[];
  leagues: League[];
  teams: Team[];
  rounds: Round[];
}

export default function RosterAdminClient({ initialRosters, leagues, teams, rounds }: Props) {
  const [rosters, setRosters] = useState(initialRosters);
  const [filterLeague, setFilterLeague] = useState("");
  const [filterRound, setFilterRound] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const filteredRounds = rounds.filter((r) => !filterLeague || r.leagueId === filterLeague)
    .sort((a, b) => a.roundNumber - b.roundNumber);

  const filtered = rosters.filter((r) => {
    if (filterLeague && r.league_id !== filterLeague) return false;
    if (filterRound && r.round_id !== filterRound) return false;
    return true;
  });

  const getTeamName = (id: string) => teams.find((t) => t.id === id)?.name ?? id;
  const getLeagueName = (id: string) => leagues.find((l) => l.id === id)?.name ?? id;
  const getRoundLabel = (id: string) => {
    const r = rounds.find((r) => r.id === id);
    return r ? `${r.name} ${r.date}` : id;
  };

  const handleEdit = (roster: Roster) => {
    setEditing(roster.id);
    setEditValue(roster.players ?? "");
  };

  const handleSave = async (roster: Roster) => {
    setSaving(true);
    const res = await fetch("/api/roster", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        teamId: roster.team_id,
        leagueId: roster.league_id,
        roundId: roster.round_id,
        players: editValue,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setRosters(rosters.map((r) => r.id === roster.id ? { ...r, players: editValue } : r));
      setEditing(null);
      showToast("更新しました");
    } else {
      showToast("更新に失敗しました");
    }
  };

  return (
    <div className="p-4 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <p className="text-[10px] tracking-[0.3em] text-white/30 uppercase mb-1">Admin</p>
          <h1 className="text-xl lg:text-2xl font-black text-white">出場選手登録一覧</h1>
        </div>
      </div>

      {/* フィルター */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <select
          value={filterLeague}
          onChange={(e) => { setFilterLeague(e.target.value); setFilterRound(""); }}
          className="px-3 py-2 text-sm rounded-lg border border-white/10 bg-[#0c1e42] text-white outline-none"
        >
          <option value="">全リーグ</option>
          {leagues.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
        <select
          value={filterRound}
          onChange={(e) => setFilterRound(e.target.value)}
          disabled={!filterLeague}
          className="px-3 py-2 text-sm rounded-lg border border-white/10 bg-[#0c1e42] text-white outline-none disabled:opacity-40"
        >
          <option value="">全節</option>
          {filteredRounds.map((r) => (
            <option key={r.id} value={r.id}>{r.name} ({r.date})</option>
          ))}
        </select>
        <span className="text-xs text-white/30 self-center">{filtered.length}件</span>
      </div>

      <div className="rounded-xl border border-white/8 overflow-hidden" style={{ background: "#0c1e42" }}>
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-white/30">
            {rosters.length === 0 ? "まだ登録がありません" : "該当する登録がありません"}
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map((r) => (
              <div key={r.id} className="p-4 lg:p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-semibold text-white"
                        style={{ background: leagues.find((l) => l.id === r.league_id)?.color ?? "#0c1e42" }}
                      >
                        {getLeagueName(r.league_id)}
                      </span>
                      <span className="text-sm font-bold text-white">{getTeamName(r.team_id)}</span>
                    </div>
                    <p className="text-xs text-white/40">{getRoundLabel(r.round_id)}</p>
                    <p className="text-[10px] text-white/20 mt-0.5">
                      更新: {new Date(r.updated_at).toLocaleString("ja-JP")}
                    </p>
                  </div>
                  {editing !== r.id && (
                    <button
                      onClick={() => handleEdit(r)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-colors whitespace-nowrap flex-shrink-0"
                    >
                      編集
                    </button>
                  )}
                </div>

                {editing === r.id ? (
                  <div className="mt-2">
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-white/10 bg-white/5 text-white outline-none focus:border-amber-500/50 resize-none"
                      placeholder="出場選手名（例: 田中、鈴木、山田）"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => setEditing(null)}
                        className="flex-1 py-2 rounded-lg text-sm border border-white/10 text-white/50 hover:text-white transition-colors"
                      >
                        キャンセル
                      </button>
                      <button
                        onClick={() => handleSave(r)}
                        disabled={saving}
                        className="flex-1 py-2 rounded-lg text-sm font-bold disabled:opacity-40"
                        style={{ background: "linear-gradient(135deg, #c9921e, #e3c060)", color: "#0c1e42" }}
                      >
                        {saving ? "保存中..." : "保存する"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="mt-2 text-sm rounded-lg px-3 py-2.5"
                    style={{ background: "#060b14" }}
                  >
                    {r.players ? (
                      <span className="text-white/80">{r.players}</span>
                    ) : (
                      <span className="text-white/20 italic">未登録</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {toast && (
        <div
          className="fixed bottom-6 right-6 px-5 py-3 rounded-xl text-sm font-semibold text-white shadow-lg"
          style={{ background: "#0c1e42", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}

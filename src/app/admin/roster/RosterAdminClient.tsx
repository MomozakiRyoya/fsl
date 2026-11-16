"use client";

import { useState } from "react";
import type { League, Team, Round } from "@/lib/types/app";
import { MAX_DELETE_IDS, findStaleRosters } from "@/lib/roster-admin";

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

// 削除の確認に出す内容。1 件のときも、過去シーズン分をまとめるときも同じ窓を使う
interface DeleteRequest {
  targets: Roster[];
  message: string;
}

export default function RosterAdminClient({
  initialRosters,
  leagues,
  teams,
  rounds,
}: Props) {
  const [rosters, setRosters] = useState(initialRosters);
  const [filterLeague, setFilterLeague] = useState("");
  const [filterRound, setFilterRound] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteRequest, setDeleteRequest] = useState<DeleteRequest | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const filteredRounds = rounds
    .filter((r) => !filterLeague || r.leagueId === filterLeague)
    .sort((a, b) => a.roundNumber - b.roundNumber);

  const filtered = rosters.filter((r) => {
    if (filterLeague && r.league_id !== filterLeague) return false;
    if (filterRound && r.round_id !== filterRound) return false;
    return true;
  });

  // 今シーズンの節に紐づかない登録（過去シーズンの残り）。今の登録と並んで重複して見える
  const staleRosters = findStaleRosters(
    rosters,
    rounds.map((r) => r.id),
  );
  const staleIds = new Set(staleRosters.map((r) => r.id));

  const getTeamName = (id: string) =>
    teams.find((t) => t.id === id)?.name ?? id;
  const getLeagueName = (id: string) =>
    leagues.find((l) => l.id === id)?.name ?? id;
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
      setRosters(
        rosters.map((r) =>
          r.id === roster.id ? { ...r, players: editValue } : r,
        ),
      );
      setEditing(null);
      showToast("更新しました");
    } else {
      showToast("更新に失敗しました");
    }
  };

  const askDeleteOne = (roster: Roster) => {
    setDeleteRequest({
      targets: [roster],
      message: `${getTeamName(roster.team_id)}（${
        staleIds.has(roster.id)
          ? "過去シーズンの登録"
          : getRoundLabel(roster.round_id)
      }）の出場選手登録を削除しますか？`,
    });
  };

  const askDeleteStale = () => {
    setDeleteRequest({
      targets: staleRosters,
      message: `過去シーズンの登録 ${staleRosters.length}件をまとめて削除しますか？ 今シーズンの節の登録は消えません。`,
    });
  };

  const handleDelete = async () => {
    if (!deleteRequest) return;
    const ids = deleteRequest.targets.map((r) => r.id);
    setDeleting(true);

    // 画面から消すのは API が実際に消した行だけ（deleted で返ってきた id）
    const gone = new Set<string>();
    let failed = false;
    for (let i = 0; i < ids.length; i += MAX_DELETE_IDS) {
      const res = await fetch("/api/admin/rosters", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: ids.slice(i, i + MAX_DELETE_IDS) }),
      }).catch(() => null);
      const json: { deleted?: unknown } | null =
        res && res.ok ? await res.json().catch(() => null) : null;
      if (!json || !Array.isArray(json.deleted)) {
        failed = true;
        break;
      }
      for (const id of json.deleted) gone.add(String(id));
    }

    setDeleting(false);
    setDeleteRequest(null);
    setRosters((prev) => prev.filter((r) => !gone.has(String(r.id))));
    if (editing !== null && gone.has(String(editing))) setEditing(null);

    if (gone.size === ids.length) {
      showToast(
        ids.length === 1 ? "削除しました" : `${gone.size}件削除しました`,
      );
    } else if (gone.size === 0) {
      showToast("削除に失敗しました");
    } else {
      showToast(
        failed
          ? `${gone.size}件だけ削除しました。残りは失敗しました`
          : `${gone.size}件削除しました。残りは見つかりませんでした`,
      );
    }
  };

  return (
    <div className="p-4 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <p className="text-[10px] tracking-[0.3em] text-white/30 uppercase mb-1">
            Admin
          </p>
          <h1 className="text-xl lg:text-2xl font-black text-white">
            出場選手登録一覧
          </h1>
        </div>
      </div>

      {/* 過去シーズンの残り */}
      {staleRosters.length > 0 && (
        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 rounded-xl border border-amber-500/30 px-4 py-3"
          style={{ background: "#0c1e42" }}
        >
          <p className="text-sm text-white/70">
            <span className="font-bold text-amber-300">
              過去シーズンの登録が {staleRosters.length}件
            </span>
            残っています。今シーズンの節に紐づかないため、今の登録と重複して見えます。
          </p>
          <button
            onClick={askDeleteStale}
            className="text-xs px-3 py-2 rounded-lg font-bold border border-red-500/40 text-red-300 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors whitespace-nowrap flex-shrink-0"
          >
            過去シーズン分をまとめて削除
          </button>
        </div>
      )}

      {/* フィルター */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <select
          value={filterLeague}
          onChange={(e) => {
            setFilterLeague(e.target.value);
            setFilterRound("");
          }}
          className="px-3 py-2 text-sm rounded-lg border border-white/10 bg-[#0c1e42] text-white outline-none"
        >
          <option value="">全リーグ</option>
          {leagues.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
        <select
          value={filterRound}
          onChange={(e) => setFilterRound(e.target.value)}
          disabled={!filterLeague}
          className="px-3 py-2 text-sm rounded-lg border border-white/10 bg-[#0c1e42] text-white outline-none disabled:opacity-40"
        >
          <option value="">全節</option>
          {filteredRounds.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} ({r.date})
            </option>
          ))}
        </select>
        <span className="text-xs text-white/30 self-center">
          {filtered.length}件
        </span>
      </div>

      <div
        className="rounded-xl border border-white/8 overflow-hidden"
        style={{ background: "#0c1e42" }}
      >
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-white/30">
            {rosters.length === 0
              ? "まだ登録がありません"
              : "該当する登録がありません"}
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
                        style={{
                          background:
                            leagues.find((l) => l.id === r.league_id)?.color ??
                            "#0c1e42",
                        }}
                      >
                        {getLeagueName(r.league_id)}
                      </span>
                      <span className="text-sm font-bold text-white">
                        {getTeamName(r.team_id)}
                      </span>
                      {staleIds.has(r.id) && (
                        <span className="text-[10px] px-2 py-0.5 rounded border border-amber-500/40 font-semibold text-amber-300">
                          過去シーズン
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/40">
                      {getRoundLabel(r.round_id)}
                    </p>
                    <p className="text-[10px] text-white/20 mt-0.5">
                      更新: {new Date(r.updated_at).toLocaleString("ja-JP")}
                    </p>
                  </div>
                  {editing !== r.id && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(r)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-colors whitespace-nowrap"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => askDeleteOne(r)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-red-500/30 text-red-300 hover:text-white hover:bg-red-600 hover:border-red-600 transition-colors whitespace-nowrap"
                      >
                        削除
                      </button>
                    </div>
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
                        style={{
                          background:
                            "linear-gradient(135deg, #c9921e, #e3c060)",
                          color: "#0c1e42",
                        }}
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

      {/* 削除の確認 */}
      {deleteRequest && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 sm:px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="roster-delete-title"
            className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl border-t sm:border border-white/10 shadow-xl"
            style={{ background: "#0c1e42" }}
          >
            <div className="px-5 py-4 border-b border-white/8">
              <h2
                id="roster-delete-title"
                className="text-base font-bold text-white"
              >
                削除の確認
              </h2>
            </div>
            <div className="p-5">
              <p className="text-sm text-white/70 mb-2">
                {deleteRequest.message}
              </p>
              <p className="text-xs text-white/40 mb-6">
                削除すると元に戻せません。
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteRequest(null)}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-white/10 text-white/50 hover:text-white transition-colors disabled:opacity-40"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-600 text-white disabled:opacity-40 hover:bg-red-500 transition-colors"
                >
                  {deleting ? "削除中..." : "削除する"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-semibold text-white shadow-lg"
          style={{
            background: "#0c1e42",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}

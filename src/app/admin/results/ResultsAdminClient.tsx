"use client";

import { useEffect, useState } from "react";
import type { Round, Team, League, Player } from "@/lib/types/app";

interface Match {
  id: string;
  roundId: string;
  homeTeamId: string;
  homeTeamName: string;
  homeRoundPt: number | null;
  status: "scheduled" | "finished";
  roundName?: string;
  leagueName?: string;
  leagueId?: string;
}

interface PlayerEntry {
  teamId: string;
  playerId: string;
  playerName: string;
  rank: string;
  points: string;
}

type ResultForm = {
  players: PlayerEntry[];
};

const emptyEntry = (): PlayerEntry => ({
  teamId: "",
  playerId: "",
  playerName: "",
  rank: "",
  points: "",
});
const emptyForm = (): ResultForm => ({
  players: Array.from({ length: 9 }, emptyEntry),
});

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm sm:px-4">
      <div
        className="w-full sm:max-w-2xl rounded-t-2xl sm:rounded-2xl border-t sm:border border-white/10 shadow-2xl max-h-[90vh] flex flex-col"
        style={{ background: "#0c1e42" }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 flex-shrink-0">
          <h2 className="text-base font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function ResultFormUI({
  form,
  setForm,
  round,
  teams,
  players,
  onSave,
  onCancel,
  saving,
}: {
  form: ResultForm;
  setForm: (f: ResultForm) => void;
  round: Round | undefined;
  teams: Team[];
  players: Player[];
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const totalPt = form.players.reduce(
    (sum, p) => sum + (Number(p.points) || 0),
    0,
  );

  const update = (i: number, patch: Partial<PlayerEntry>) => {
    const next = form.players.map((p, idx) =>
      idx === i ? { ...p, ...patch } : p,
    );
    setForm({ ...form, players: next });
  };

  const filledCount = form.players.filter((p) => p.teamId && p.points).length;

  return (
    <div className="space-y-4">
      {round && (
        <div className="flex gap-2 flex-wrap">
          <span className="text-xs px-2.5 py-1 rounded-full bg-amber-900/40 text-amber-400 font-semibold">
            {round.leagueName}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-white/50">
            {round.name} · {round.date}
          </span>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
            選手結果（最大9名）
          </label>
          <span className="text-xs text-amber-400 font-bold">
            合計: {totalPt} pt / {filledCount}件
          </span>
        </div>
        <div
          className="rounded-lg border border-white/8 overflow-hidden"
          style={{ background: "#060b14" }}
        >
          {/* ヘッダー */}
          <div className="grid grid-cols-[2rem_1fr_1fr_4rem] gap-1 px-2 py-2 border-b border-white/8">
            <div className="text-[10px] text-white/30 uppercase tracking-wider text-center">
              順
            </div>
            <div className="text-[10px] text-white/30 uppercase tracking-wider">
              チーム
            </div>
            <div className="text-[10px] text-white/30 uppercase tracking-wider">
              選手名
            </div>
            <div className="text-[10px] text-white/30 uppercase tracking-wider text-right">
              pt
            </div>
          </div>
          {form.players.map((p, i) => {
            const teamPlayers = p.teamId
              ? players.filter((pl) => pl.teamId === p.teamId)
              : [];
            return (
              <div
                key={i}
                className="grid grid-cols-[2rem_1fr_1fr_4rem] gap-1 px-2 py-1.5 border-b border-white/5 last:border-0"
              >
                {/* 順位 */}
                <div className="flex items-center">
                  <input
                    type="number"
                    min="1"
                    max="9"
                    value={p.rank}
                    onChange={(e) => update(i, { rank: e.target.value })}
                    className="w-full px-1 py-1 text-xs text-center rounded border border-white/10 bg-white/5 text-white outline-none focus:border-amber-500/50"
                    placeholder={String(i + 1)}
                  />
                </div>
                {/* チーム */}
                <div>
                  <select
                    value={p.teamId}
                    onChange={(e) =>
                      update(i, {
                        teamId: e.target.value,
                        playerId: "",
                        playerName: "",
                      })
                    }
                    className="w-full px-1 py-1 text-xs rounded border border-white/10 bg-[#0c1e42] text-white outline-none focus:border-amber-500/50"
                  >
                    <option value="">チーム</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                {/* 選手名 */}
                <div>
                  <select
                    value={p.playerId}
                    disabled={!p.teamId}
                    onChange={(e) => {
                      const pl = teamPlayers.find(
                        (pl) => pl.id === e.target.value,
                      );
                      update(i, {
                        playerId: e.target.value,
                        playerName: pl?.name ?? "",
                      });
                    }}
                    className="w-full px-1 py-1 text-xs rounded border border-white/10 bg-[#0c1e42] text-white outline-none focus:border-amber-500/50 disabled:opacity-40"
                  >
                    <option value="">
                      {p.teamId ? "選手を選択" : "チームを選択"}
                    </option>
                    {teamPlayers.map((pl) => (
                      <option key={pl.id} value={pl.id}>
                        {pl.name}
                      </option>
                    ))}
                  </select>
                </div>
                {/* ポイント */}
                <div>
                  <input
                    type="number"
                    min="0"
                    value={p.points}
                    onChange={(e) => update(i, { points: e.target.value })}
                    className="w-full px-1 py-1 text-xs text-right rounded border border-white/10 bg-white/5 text-white outline-none focus:border-amber-500/50"
                    placeholder="0"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-white/10 text-white/50 hover:text-white transition-colors"
        >
          キャンセル
        </button>
        <button
          onClick={onSave}
          disabled={saving || filledCount === 0}
          className="flex-1 py-2.5 rounded-xl text-sm font-bold disabled:opacity-40"
          style={{
            background: "linear-gradient(135deg, #c9921e, #e3c060)",
            color: "#0c1e42",
          }}
        >
          {saving ? "保存中..." : "保存する"}
        </button>
      </div>
    </div>
  );
}

function rawToMatch(d: Record<string, unknown>): Match {
  return {
    id: d.id as string,
    roundId: (d.round_id as string) ?? "",
    homeTeamId: (d.home_team_id as string) ?? "",
    homeTeamName: (d.home_team_name as string) ?? "",
    homeRoundPt: d.home_round_pt as number | null,
    status: (d.status as "scheduled" | "finished") ?? "finished",
  };
}

export default function ResultsAdminClient({
  rounds,
  teams,
  leagues,
  players,
}: {
  rounds: Round[];
  teams: Team[];
  leagues: League[];
  players: Player[];
}) {
  const [viewMode, setViewMode] = useState<"input" | "list">("input");
  const [selectedLeagueId, setSelectedLeagueId] = useState("");
  const [selectedRoundId, setSelectedRoundId] = useState("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [allLoading, setAllLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<"create" | "edit" | "delete" | null>(null);
  const [target, setTarget] = useState<Match | null>(null);
  const [form, setForm] = useState<ResultForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const loadAllMatches = () => {
    setAllLoading(true);
    fetch("/api/admin/matches")
      .then((r) => r.json())
      .then((data: Record<string, unknown>[]) => {
        const enriched = data.map((d) => {
          const r = rounds.find((r) => r.id === d.round_id);
          return {
            ...rawToMatch(d),
            roundName: r?.name ?? "",
            leagueName: r?.leagueName ?? "",
            leagueId: r?.leagueId ?? "",
          };
        });
        setAllMatches(
          enriched.sort(
            (a, b) =>
              (a.leagueId ?? "").localeCompare(b.leagueId ?? "") ||
              (a.roundName ?? "").localeCompare(b.roundName ?? ""),
          ),
        );
      })
      .finally(() => setAllLoading(false));
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const round = rounds.find((r) => r.id === selectedRoundId);
  const filteredRounds = rounds
    .filter((r) => r.leagueId === selectedLeagueId)
    .sort((a, b) => a.roundNumber - b.roundNumber);
  const roundTeams = teams.filter((t) => t.leagueId === round?.leagueId);

  useEffect(() => {
    if (!selectedRoundId) {
      setMatches([]);
      return;
    }
    setLoading(true);
    fetch(`/api/admin/matches?roundId=${selectedRoundId}`)
      .then((r) => r.json())
      .then((data: Record<string, unknown>[]) =>
        setMatches(data.map(rawToMatch)),
      )
      .finally(() => setLoading(false));
  }, [selectedRoundId]);

  // 選手ごとの結果をチーム別に集計して一括登録
  const handleCreate = async () => {
    const filled = form.players.filter((p) => p.teamId && p.points);
    if (filled.length === 0) return;

    setSaving(true);

    // チームごとにポイント集計
    const byTeam: Record<string, { teamId: string; pts: number }> = {};
    for (const p of filled) {
      if (!byTeam[p.teamId]) {
        byTeam[p.teamId] = { teamId: p.teamId, pts: 0 };
      }
      byTeam[p.teamId].pts += Number(p.points) || 0;
    }

    let ok = true;
    for (const { teamId, pts } of Object.values(byTeam)) {
      const team = roundTeams.find((t) => t.id === teamId);
      const res = await fetch("/api/admin/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roundId: selectedRoundId,
          homeTeamId: teamId,
          homeTeamName: team?.name ?? "",
          awayTeamId: "",
          awayTeamName: "",
          homeScore: null,
          awayScore: null,
          homeRoundPt: pts,
          awayRoundPt: null,
          status: "finished",
        }),
      });
      if (res.ok) {
        const raw = await res.json();
        setMatches((prev) => [...prev, rawToMatch(raw)]);
      } else {
        ok = false;
      }
    }

    setSaving(false);
    if (ok) {
      setModal(null);
      showToast("登録しました");
    } else showToast("一部の登録に失敗しました");
  };

  const handleEditSave = async () => {
    if (!target) return;
    const filled = form.players.filter((p) => p.teamId && p.points);
    if (filled.length === 0) return;
    const pts = filled.reduce((s, p) => s + (Number(p.points) || 0), 0);
    const teamId = filled[0].teamId;
    const team = roundTeams.find((t) => t.id === teamId);

    setSaving(true);
    const res = await fetch(`/api/admin/matches/${target.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        homeTeamId: teamId,
        homeTeamName: team?.name ?? "",
        homeRoundPt: pts,
      }),
    });
    setSaving(false);
    if (res.ok) {
      const raw = await res.json();
      setMatches(
        matches.map((m) => (m.id === target.id ? rawToMatch(raw) : m)),
      );
      setModal(null);
      showToast("更新しました");
    } else showToast("更新に失敗しました");
  };

  const handleDelete = async () => {
    if (!target) return;
    setSaving(true);
    const res = await fetch(`/api/admin/matches/${target.id}`, {
      method: "DELETE",
    });
    setSaving(false);
    if (res.ok) {
      setMatches(matches.filter((m) => m.id !== target.id));
      setAllMatches(allMatches.filter((m) => m.id !== target.id));
      setModal(null);
      showToast("削除しました");
    } else showToast("削除に失敗しました");
  };

  const openEdit = (m: Match) => {
    setTarget(m);
    const f = emptyForm();
    f.players[0] = {
      teamId: m.homeTeamId,
      playerId: "",
      playerName: "",
      rank: "1",
      points: String(m.homeRoundPt ?? ""),
    };
    setForm(f);
    setModal("edit");
  };

  return (
    <div className="p-4 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 lg:mb-8">
        <div>
          <p className="text-[10px] tracking-[0.3em] text-white/30 uppercase mb-1">
            Admin
          </p>
          <h1 className="text-xl lg:text-2xl font-black text-white">
            試合結果管理
          </h1>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => {
              setViewMode(viewMode === "list" ? "input" : "list");
              if (viewMode !== "list") loadAllMatches();
            }}
            className="px-4 py-2.5 rounded-xl text-sm font-bold border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-colors whitespace-nowrap"
          >
            {viewMode === "list" ? "← 入力モード" : "全結果一覧"}
          </button>
          {viewMode === "input" && selectedRoundId && (
            <button
              onClick={() => {
                setForm(emptyForm());
                setModal("create");
              }}
              className="px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap"
              style={{
                background: "linear-gradient(135deg, #c9921e, #e3c060)",
                color: "#0c1e42",
              }}
            >
              + 結果を追加
            </button>
          )}
        </div>
      </div>

      {/* 全結果一覧ビュー */}
      {viewMode === "list" && (
        <>
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                リーグ / ディビジョン
              </label>
              <select
                value={selectedLeagueId}
                onChange={(e) => {
                  setSelectedLeagueId(e.target.value);
                  setSelectedRoundId("");
                }}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-white/10 bg-[#0c1e42] text-white outline-none"
              >
                <option value="">-- すべてのリーグ --</option>
                {leagues.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                節を選択
              </label>
              <select
                value={selectedRoundId}
                onChange={(e) => setSelectedRoundId(e.target.value)}
                disabled={!selectedLeagueId}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-white/10 bg-[#0c1e42] text-white outline-none disabled:opacity-40"
              >
                <option value="">-- すべての節 --</option>
                {filteredRounds.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.date})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div
            className="rounded-xl border border-white/8 overflow-hidden"
            style={{ background: "#0c1e42" }}
          >
            {allLoading && (
              <div className="py-12 text-center text-sm text-white/30">
                読み込み中...
              </div>
            )}
            {!allLoading &&
              (() => {
                const filtered = allMatches.filter((m) => {
                  if (selectedLeagueId && m.leagueId !== selectedLeagueId)
                    return false;
                  if (selectedRoundId && m.roundId !== selectedRoundId)
                    return false;
                  return true;
                });
                if (filtered.length === 0)
                  return (
                    <div className="py-12 text-center text-sm text-white/30">
                      登録データなし
                    </div>
                  );
                return (
                  <table className="w-full min-w-[480px]">
                    <thead>
                      <tr className="border-b border-white/8">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">
                          リーグ・節
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">
                          チーム
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider w-20">
                          ポイント
                        </th>
                        <th className="w-24 px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((m) => (
                        <tr
                          key={m.id}
                          className="border-b border-white/5 hover:bg-white/3 transition-colors"
                        >
                          <td className="px-4 py-2.5">
                            <p className="text-xs font-semibold text-white/60">
                              {m.leagueName}
                            </p>
                            <p className="text-xs text-white/30">
                              {m.roundName}
                            </p>
                          </td>
                          <td className="px-4 py-2.5 text-sm text-white font-semibold">
                            {m.homeTeamName}
                          </td>
                          <td className="px-4 py-2.5">
                            <span
                              className="text-sm font-black tabular-nums"
                              style={{ color: "#c9921e" }}
                            >
                              {m.homeRoundPt ?? 0}
                              <span className="text-xs font-normal text-white/30 ml-0.5">
                                pt
                              </span>
                            </span>
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => openEdit(m)}
                                className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-colors whitespace-nowrap"
                              >
                                編集
                              </button>
                              <button
                                onClick={() => {
                                  setTarget(m);
                                  setModal("delete");
                                }}
                                className="text-xs px-3 py-1.5 rounded-lg border border-red-900/50 text-red-400/70 hover:text-red-400 hover:border-red-900 transition-colors whitespace-nowrap"
                              >
                                削除
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                );
              })()}
          </div>
        </>
      )}

      {/* 入力モード */}
      {viewMode === "input" && (
        <>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                リーグ / ディビジョン
              </label>
              <select
                value={selectedLeagueId}
                onChange={(e) => {
                  setSelectedLeagueId(e.target.value);
                  setSelectedRoundId("");
                }}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-white/10 bg-[#0c1e42] text-white outline-none"
              >
                <option value="">-- リーグを選択 --</option>
                {leagues.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                節を選択
              </label>
              <select
                value={selectedRoundId}
                onChange={(e) => setSelectedRoundId(e.target.value)}
                disabled={!selectedLeagueId}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-white/10 bg-[#0c1e42] text-white outline-none disabled:opacity-40"
              >
                <option value="">-- 節を選択 --</option>
                {filteredRounds.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.date})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedRoundId && (
            <div
              className="rounded-xl border border-white/8 overflow-hidden"
              style={{ background: "#0c1e42" }}
            >
              {loading && (
                <div className="py-12 text-center text-sm text-white/30">
                  読み込み中...
                </div>
              )}
              {!loading && matches.length === 0 && (
                <div className="py-12 text-center text-sm text-white/30">
                  結果データなし
                </div>
              )}
              {!loading && matches.length > 0 && (
                <table className="w-full min-w-[400px]">
                  <thead>
                    <tr className="border-b border-white/8">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">
                        チーム
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider w-20">
                        ポイント
                      </th>
                      <th className="w-24 px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...matches]
                      .sort(
                        (a, b) => (b.homeRoundPt ?? 0) - (a.homeRoundPt ?? 0),
                      )
                      .map((m) => (
                        <tr
                          key={m.id}
                          className="border-b border-white/5 hover:bg-white/3 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm text-white font-semibold">
                            {m.homeTeamName}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="text-sm font-black tabular-nums"
                              style={{ color: "#c9921e" }}
                            >
                              {m.homeRoundPt ?? 0}
                              <span className="text-xs font-normal text-white/30 ml-0.5">
                                pt
                              </span>
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => openEdit(m)}
                                className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-colors whitespace-nowrap"
                              >
                                編集
                              </button>
                              <button
                                onClick={() => {
                                  setTarget(m);
                                  setModal("delete");
                                }}
                                className="text-xs px-3 py-1.5 rounded-lg border border-red-900/50 text-red-400/70 hover:text-red-400 hover:border-red-900 transition-colors whitespace-nowrap"
                              >
                                削除
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {!selectedRoundId && (
            <div
              className="rounded-xl border border-white/8 py-16 text-center"
              style={{ background: "#0c1e42" }}
            >
              <p className="text-sm text-white/30">節を選択してください</p>
            </div>
          )}
        </>
      )}

      {modal === "create" && (
        <Modal title="試合結果を追加" onClose={() => setModal(null)}>
          <ResultFormUI
            form={form}
            setForm={setForm}
            round={round}
            teams={roundTeams}
            players={players}
            onSave={handleCreate}
            onCancel={() => setModal(null)}
            saving={saving}
          />
        </Modal>
      )}
      {modal === "edit" && target && (
        <Modal title="試合結果を編集" onClose={() => setModal(null)}>
          <ResultFormUI
            form={form}
            setForm={setForm}
            round={round}
            teams={roundTeams}
            players={players}
            onSave={handleEditSave}
            onCancel={() => setModal(null)}
            saving={saving}
          />
        </Modal>
      )}
      {modal === "delete" && target && (
        <Modal title="削除の確認" onClose={() => setModal(null)}>
          <p className="text-sm text-white/70 mb-6">
            「{target.homeTeamName}」の結果を削除しますか？
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setModal(null)}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-white/10 text-white/50 hover:text-white transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleDelete}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-600 text-white disabled:opacity-40 hover:bg-red-500 transition-colors"
            >
              {saving ? "削除中..." : "削除する"}
            </button>
          </div>
        </Modal>
      )}

      {toast && (
        <div
          className="fixed bottom-6 right-6 px-5 py-3 rounded-xl text-sm font-semibold text-white shadow-lg"
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

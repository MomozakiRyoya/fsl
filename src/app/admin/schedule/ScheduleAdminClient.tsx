"use client";

import { useEffect, useState, useMemo } from "react";
import type { Round, Team } from "@/lib/types/app";

interface Match {
  id: string;
  homeTeamId: string;
  homeTeamName: string;
  awayTeamId: string;
  awayTeamName: string;
  homeScore: number | null;
  awayScore: number | null;
  homeRoundPt: number | null;
  awayRoundPt: number | null;
  status: string;
}

const LEAGUES = [
  { value: "", label: "全ディビジョン" },
  { value: "premier", label: "Premier League" },
  { value: "spade", label: "♠ Division" },
  { value: "diamond", label: "♦ Division" },
  { value: "club", label: "♣ Division" },
  { value: "heart", label: "♥ Division" },
];

const STATUS_OPTIONS = [
  { value: "scheduled", label: "予定" },
  { value: "next", label: "次節" },
  { value: "finished", label: "終了" },
];

type SortKey = "date" | "format" | "leagueId";

function statusBadge(s: string) {
  const cls =
    s === "next"
      ? "bg-amber-900/50 text-amber-400"
      : s === "finished"
        ? "bg-emerald-900/50 text-emerald-400"
        : "bg-white/5 text-white/30";
  const label = s === "next" ? "次節" : s === "finished" ? "終了" : "予定";
  return (
    <span
      className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap ${cls}`}
    >
      {label}
    </span>
  );
}

/* ── Round Form ── */
type RoundForm = {
  name: string;
  leagueId: string;
  leagueName: string;
  roundNumber: string;
  date: string;
  venue: string;
  venueUrl: string;
  format: string;
  status: string;
  isPlayoff: boolean;
};

const defaultRoundForm = (): RoundForm => ({
  name: "",
  leagueId: "premier",
  leagueName: "Premier League",
  roundNumber: "",
  date: "",
  venue: "sbmHARUYOSHI",
  venueUrl: "",
  format: "",
  status: "scheduled",
  isPlayoff: false,
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
        className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl border-t sm:border border-white/10 shadow-2xl max-h-[90vh] flex flex-col"
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

function RoundFormUI({
  form,
  setForm,
  onSave,
  onCancel,
  saving,
}: {
  form: RoundForm;
  setForm: (f: RoundForm) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const handleLeague = (v: string) => {
    const label = LEAGUES.find((l) => l.value === v)?.label ?? "";
    setForm({ ...form, leagueId: v, leagueName: label });
  };
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
          節名
        </label>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full px-3 py-2.5 text-sm rounded-lg border border-white/10 bg-white/5 text-white outline-none focus:border-amber-500/50"
          placeholder="FSL プレミア 第1節"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
            ディビジョン
          </label>
          <select
            value={form.leagueId}
            onChange={(e) => handleLeague(e.target.value)}
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-white/10 bg-[#0c1e42] text-white outline-none"
          >
            {LEAGUES.filter((l) => l.value).map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
            節番号
          </label>
          <input
            type="number"
            value={form.roundNumber}
            onChange={(e) => setForm({ ...form, roundNumber: e.target.value })}
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-white/10 bg-white/5 text-white outline-none focus:border-amber-500/50"
            placeholder="1"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
            開催日
          </label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-white/10 bg-white/5 text-white outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
            状態
          </label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-white/10 bg-[#0c1e42] text-white outline-none"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
            会場
          </label>
          <input
            value={form.venue}
            onChange={(e) => setForm({ ...form, venue: e.target.value })}
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-white/10 bg-white/5 text-white outline-none focus:border-amber-500/50"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
            トーナメント形式
          </label>
          <input
            value={form.format}
            onChange={(e) => setForm({ ...form, format: e.target.value })}
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-white/10 bg-white/5 text-white outline-none focus:border-amber-500/50"
            placeholder="フリーズアウトNLH"
          />
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
          disabled={saving || !form.name}
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

/* ── Match entry (inline) ── */
function MatchEntry({
  round,
  teams,
  onClose,
}: {
  round: Round;
  teams: Team[];
  onClose: () => void;
}) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };
  const roundTeams = teams.filter((t) => t.leagueId === round.leagueId);

  useEffect(() => {
    fetch(`/api/admin/matches?roundId=${round.id}`)
      .then((r) => r.json())
      .then((d: Record<string, unknown>[]) => setMatches(d.map(rawToMatch)))
      .finally(() => setLoading(false));
  }, [round.id]);

  const addMatch = async () => {
    const res = await fetch("/api/admin/matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roundId: round.id,
        homeTeamId: "",
        homeTeamName: "",
        awayTeamId: "",
        awayTeamName: "",
        status: "scheduled",
      }),
    });
    if (res.ok) {
      const raw = await res.json();
      setMatches([...matches, rawToMatch(raw)]);
    }
  };

  const updateMatch = async (m: Match) => {
    setSaving(m.id);
    const homeTeam = roundTeams.find((t) => t.id === m.homeTeamId);
    const awayTeam = roundTeams.find((t) => t.id === m.awayTeamId);
    const res = await fetch(`/api/admin/matches/${m.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        homeTeamId: m.homeTeamId,
        homeTeamName: homeTeam?.name ?? m.homeTeamName,
        awayTeamId: m.awayTeamId,
        awayTeamName: awayTeam?.name ?? m.awayTeamName,
        homeScore: m.homeScore,
        awayScore: m.awayScore,
        homeRoundPt: m.homeRoundPt,
        awayRoundPt: m.awayRoundPt,
        status: m.status,
      }),
    });
    setSaving(null);
    if (res.ok) {
      const raw = await res.json();
      setMatches(matches.map((x) => (x.id === m.id ? rawToMatch(raw) : x)));
      showToast("保存しました");
    } else showToast("保存に失敗しました");
  };

  const deleteMatch = async (id: string) => {
    await fetch(`/api/admin/matches/${id}`, { method: "DELETE" });
    setMatches(matches.filter((m) => m.id !== id));
  };

  return (
    <Modal title={`${round.name} — 試合結果入力`} onClose={onClose}>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs text-white/40">
          {round.date} · {round.venue} · {round.format}
        </p>
        <button
          onClick={addMatch}
          className="px-3 py-1.5 rounded-lg text-xs font-bold"
          style={{
            background: "linear-gradient(135deg, #c9921e, #e3c060)",
            color: "#0c1e42",
          }}
        >
          + 試合追加
        </button>
      </div>

      {loading && (
        <p className="text-center text-sm text-white/30 py-8">読み込み中...</p>
      )}
      {!loading && matches.length === 0 && (
        <p className="text-center text-sm text-white/30 py-8">
          試合なし。「+ 試合追加」から追加してください。
        </p>
      )}

      <div className="space-y-4">
        {matches.map((m) => (
          <div
            key={m.id}
            className="rounded-xl border border-white/8 p-4 space-y-3"
            style={{ background: "#060b14" }}
          >
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-white/30 mb-1">
                  ホーム
                </label>
                <select
                  value={m.homeTeamId}
                  onChange={(e) =>
                    setMatches(
                      matches.map((x) =>
                        x.id === m.id
                          ? { ...x, homeTeamId: e.target.value }
                          : x,
                      ),
                    )
                  }
                  className="w-full px-2 py-2 text-xs rounded-lg border border-white/10 bg-[#0c1e42] text-white outline-none"
                >
                  <option value="">選択...</option>
                  {roundTeams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-white/30 mb-1">
                  アウェイ
                </label>
                <select
                  value={m.awayTeamId}
                  onChange={(e) =>
                    setMatches(
                      matches.map((x) =>
                        x.id === m.id
                          ? { ...x, awayTeamId: e.target.value }
                          : x,
                      ),
                    )
                  }
                  className="w-full px-2 py-2 text-xs rounded-lg border border-white/10 bg-[#0c1e42] text-white outline-none"
                >
                  <option value="">選択...</option>
                  {roundTeams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { key: "homeScore", label: "H スコア" },
                { key: "awayScore", label: "A スコア" },
                { key: "homeRoundPt", label: "H pt" },
                { key: "awayRoundPt", label: "A pt" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-[10px] text-white/30 mb-1">
                    {label}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={(m[key as keyof Match] as number | null) ?? ""}
                    onChange={(e) =>
                      setMatches(
                        matches.map((x) =>
                          x.id === m.id
                            ? {
                                ...x,
                                [key]:
                                  e.target.value === ""
                                    ? null
                                    : Number(e.target.value),
                              }
                            : x,
                        ),
                      )
                    }
                    className="w-full px-2 py-2 text-xs text-center rounded-lg border border-white/10 bg-white/5 text-white outline-none focus:border-amber-500/50"
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <select
                value={m.status}
                onChange={(e) =>
                  setMatches(
                    matches.map((x) =>
                      x.id === m.id ? { ...x, status: e.target.value } : x,
                    ),
                  )
                }
                className="flex-1 px-2 py-2 text-xs rounded-lg border border-white/10 bg-[#0c1e42] text-white outline-none"
              >
                <option value="scheduled">予定</option>
                <option value="finished">終了</option>
              </select>
              <button
                onClick={() => updateMatch(m)}
                disabled={saving === m.id}
                className="px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-40 transition-colors"
                style={{
                  background: "linear-gradient(135deg, #c9921e, #e3c060)",
                  color: "#0c1e42",
                }}
              >
                {saving === m.id ? "..." : "保存"}
              </button>
              <button
                onClick={() => deleteMatch(m.id)}
                className="px-3 py-2 rounded-lg text-xs border border-red-900/50 text-red-400/70 hover:text-red-400 transition-colors"
              >
                削除
              </button>
            </div>
          </div>
        ))}
      </div>
      {toast && (
        <div className="mt-3 text-center text-xs py-2 rounded-lg text-amber-400 bg-amber-900/20">
          {toast}
        </div>
      )}
    </Modal>
  );
}

function rawToMatch(d: Record<string, unknown>): Match {
  return {
    id: d.id as string,
    homeTeamId: (d.home_team_id as string) ?? "",
    homeTeamName: (d.home_team_name as string) ?? "",
    awayTeamId: (d.away_team_id as string) ?? "",
    awayTeamName: (d.away_team_name as string) ?? "",
    homeScore: d.home_score as number | null,
    awayScore: d.away_score as number | null,
    homeRoundPt: d.home_round_pt as number | null,
    awayRoundPt: d.away_round_pt as number | null,
    status: (d.status as string) ?? "scheduled",
  };
}

/* ── Main ── */
export default function ScheduleAdminClient({
  initialRounds,
  teams,
}: {
  initialRounds: Round[];
  teams: Team[];
}) {
  const [rounds, setRounds] = useState(initialRounds);
  const [filterLeague, setFilterLeague] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortAsc, setSortAsc] = useState(true);
  const [modal, setModal] = useState<
    "create" | "edit" | "delete" | "results" | null
  >(null);
  const [target, setTarget] = useState<Round | null>(null);
  const [form, setForm] = useState<RoundForm>(defaultRoundForm());
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const sorted = useMemo(() => {
    let list = filterLeague
      ? rounds.filter((r) => r.leagueId === filterLeague)
      : [...rounds];
    list.sort((a, b) => {
      let va =
        sortKey === "date"
          ? a.date
          : sortKey === "format"
            ? (a.format ?? "")
            : a.leagueId;
      let vb =
        sortKey === "date"
          ? b.date
          : sortKey === "format"
            ? (b.format ?? "")
            : b.leagueId;
      return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
    });
    return list;
  }, [rounds, filterLeague, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const toFormData = (r: Round): RoundForm => ({
    name: r.name,
    leagueId: r.leagueId,
    leagueName: r.leagueName,
    roundNumber: String(r.roundNumber),
    date: r.date,
    venue: r.venue,
    venueUrl: r.venueUrl ?? "",
    format: r.format ?? "",
    status: r.status,
    isPlayoff: r.isPlayoff,
  });

  const formToPayload = (f: RoundForm) => ({
    name: f.name,
    leagueId: f.leagueId,
    leagueName: f.leagueName,
    roundNumber: Number(f.roundNumber) || 0,
    date: f.date,
    venue: f.venue,
    venueUrl: f.venueUrl || null,
    format: f.format,
    status: f.status,
    isPlayoff: f.isPlayoff,
  });

  const rawToRound = (d: Record<string, unknown>): Round => ({
    id: d.id as string,
    name: d.name as string,
    leagueId: (d.league_id as string) ?? "",
    leagueName: (d.league_name as string) ?? "",
    roundNumber: (d.round_number as number) ?? 0,
    date: (d.date as string) ?? "",
    venue: (d.venue as string) ?? "",
    venueUrl: (d.venue_url as string | null) ?? null,
    status: ((d.status as string) ?? "scheduled") as Round["status"],
    isPlayoff: (d.is_playoff as boolean) ?? false,
    format: (d.format as string) ?? "",
  });

  const handleCreate = async () => {
    setSaving(true);
    const res = await fetch("/api/admin/rounds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formToPayload(form)),
    });
    setSaving(false);
    if (res.ok) {
      const raw = await res.json();
      setRounds([...rounds, rawToRound(raw)]);
      setModal(null);
      showToast("作成しました");
    } else showToast("作成に失敗しました");
  };

  const handleEdit = async () => {
    if (!target) return;
    setSaving(true);
    const res = await fetch(`/api/admin/rounds/${target.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formToPayload(form)),
    });
    setSaving(false);
    if (res.ok) {
      const raw = await res.json();
      setRounds(rounds.map((r) => (r.id === target.id ? rawToRound(raw) : r)));
      setModal(null);
      showToast("更新しました");
    } else showToast("更新に失敗しました");
  };

  const handleDelete = async () => {
    if (!target) return;
    setSaving(true);
    const res = await fetch(`/api/admin/rounds/${target.id}`, {
      method: "DELETE",
    });
    setSaving(false);
    if (res.ok) {
      setRounds(rounds.filter((r) => r.id !== target.id));
      setModal(null);
      showToast("削除しました");
    } else showToast("削除に失敗しました");
  };

  const SortBtn = ({ k, label }: { k: SortKey; label: string }) => (
    <button
      onClick={() => toggleSort(k)}
      className={`flex items-center gap-1 text-xs font-semibold uppercase tracking-wider transition-colors ${sortKey === k ? "text-amber-400" : "text-white/40 hover:text-white/70"}`}
    >
      {label} {sortKey === k ? (sortAsc ? "↑" : "↓") : ""}
    </button>
  );

  return (
    <div className="p-4 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <p className="text-[10px] tracking-[0.3em] text-white/30 uppercase mb-1">
            Admin
          </p>
          <h1 className="text-xl lg:text-2xl font-black text-white">
            スケジュール管理
          </h1>
        </div>
        <button
          onClick={() => {
            setForm(defaultRoundForm());
            setModal("create");
          }}
          className="px-4 lg:px-5 py-2.5 rounded-xl text-sm font-bold"
          style={{
            background: "linear-gradient(135deg, #c9921e, #e3c060)",
            color: "#0c1e42",
          }}
        >
          + 新規作成
        </button>
      </div>

      {/* フィルター・ソート */}
      <div className="flex flex-wrap gap-3 mb-5 items-center">
        <select
          value={filterLeague}
          onChange={(e) => setFilterLeague(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-white/10 bg-[#0c1e42] text-white outline-none"
        >
          {LEAGUES.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
        <div
          className="flex gap-2 flex-wrap px-3 py-2 rounded-lg border border-white/8"
          style={{ background: "#0a1628" }}
        >
          <span className="text-xs text-white/30 self-center">ソート:</span>
          <SortBtn k="date" label="日付" />
          <SortBtn k="format" label="形式" />
          <SortBtn k="leagueId" label="部門" />
        </div>
        <span className="text-xs text-white/30">{sorted.length}件</span>
      </div>

      <div
        className="rounded-xl border border-white/8 overflow-hidden"
        style={{ background: "#0c1e42" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px]">
            <thead>
              <tr className="border-b border-white/8">
                <th className="text-left px-4 lg:px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">
                  節名
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider hidden sm:table-cell">
                  部門
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">
                  日付
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider hidden lg:table-cell">
                  形式
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider w-20">
                  状態
                </th>
                <th className="w-40 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-12 text-sm text-white/30"
                  >
                    スケジュールデータなし
                  </td>
                </tr>
              )}
              {sorted.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-white/5 hover:bg-white/3 transition-colors"
                >
                  <td className="px-4 lg:px-5 py-3 text-sm text-white">
                    {r.name}
                  </td>
                  <td className="px-4 py-3 text-xs text-white/50 hidden sm:table-cell">
                    {r.leagueName}
                  </td>
                  <td className="px-4 py-3 text-sm text-white/70">{r.date}</td>
                  <td className="px-4 py-3 text-xs text-white/50 hidden lg:table-cell">
                    {r.format}
                  </td>
                  <td className="px-4 py-3">{statusBadge(r.status)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5 justify-end">
                      <button
                        onClick={() => {
                          setTarget(r);
                          setModal("results");
                        }}
                        className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors"
                        style={{
                          background: "rgba(200,164,90,0.15)",
                          color: "#e3c060",
                          border: "1px solid rgba(200,164,90,0.3)",
                        }}
                      >
                        結果入力
                      </button>
                      <button
                        onClick={() => {
                          setTarget(r);
                          setForm(toFormData(r));
                          setModal("edit");
                        }}
                        className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-colors whitespace-nowrap"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => {
                          setTarget(r);
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
        </div>
      </div>

      {modal === "create" && (
        <Modal title="新規スケジュール作成" onClose={() => setModal(null)}>
          <RoundFormUI
            form={form}
            setForm={setForm}
            onSave={handleCreate}
            onCancel={() => setModal(null)}
            saving={saving}
          />
        </Modal>
      )}
      {modal === "edit" && target && (
        <Modal title="スケジュールを編集" onClose={() => setModal(null)}>
          <RoundFormUI
            form={form}
            setForm={setForm}
            onSave={handleEdit}
            onCancel={() => setModal(null)}
            saving={saving}
          />
        </Modal>
      )}
      {modal === "delete" && target && (
        <Modal title="削除の確認" onClose={() => setModal(null)}>
          <p className="text-sm text-white/70 mb-6">
            「{target.name}」を削除しますか？
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
      {modal === "results" && target && (
        <MatchEntry
          round={target}
          teams={teams}
          onClose={() => setModal(null)}
        />
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

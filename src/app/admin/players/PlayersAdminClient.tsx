"use client";

import { useState } from "react";
import type { Team } from "@/lib/types/app";
import ImageUpload from "@/components/ui/ImageUpload";

interface Player {
  id: string;
  name: string;
  teamId: string;
  teamName: string;
  leagueId: string;
  number: number;
  photoUrl?: string | null;
  isCaptain?: boolean;
  userEmail?: string | null;
}

type FormData = {
  name: string;
  teamId: string;
  leagueId: string;
  number: string;
  position: string;
  photoUrl: string | null;
  userEmail: string;
};

const LEAGUE_IDS = [
  { value: "premier", label: "Premier" },
  { value: "spade", label: "♠" },
  { value: "diamond", label: "♦" },
  { value: "club", label: "♣" },
  { value: "heart", label: "♥" },
];

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

function PlayerForm({
  initial,
  teams,
  onSave,
  onCancel,
  saving,
}: {
  initial?: Partial<FormData>;
  teams: Team[];
  onSave: (d: FormData) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<FormData>({
    name: "",
    teamId: "",
    leagueId: "premier",
    number: "",
    position: "FP",
    photoUrl: null,
    userEmail: "",
    ...initial,
  });

  const leagueTeams = teams.filter((t) => t.leagueId === form.leagueId);

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
          プレイヤー画像
        </label>
        <ImageUpload
          currentUrl={form.photoUrl}
          folder="players"
          placeholder="◉"
          onUpload={(url) => setForm({ ...form, photoUrl: url })}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
          選手名
        </label>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full px-3 py-2.5 text-sm rounded-lg border border-white/10 bg-white/5 text-white outline-none focus:border-amber-500/50"
          placeholder="YOSHIMOTO"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
          ユーザーメール（紐づけ）
        </label>
        <input
          type="email"
          value={form.userEmail}
          onChange={(e) => setForm({ ...form, userEmail: e.target.value })}
          className="w-full px-3 py-2.5 text-sm rounded-lg border border-white/10 bg-white/5 text-white outline-none focus:border-amber-500/50"
          placeholder="user@example.com"
        />
        <p className="text-[10px] text-white/30 mt-1">
          ログインメールアドレスと一致すると自動紐づけ
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
            リーグ
          </label>
          <select
            value={form.leagueId}
            onChange={(e) =>
              setForm({ ...form, leagueId: e.target.value, teamId: "" })
            }
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-white/10 bg-[#0c1e42] text-white outline-none"
          >
            {LEAGUE_IDS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
            チーム
          </label>
          <select
            value={form.teamId}
            onChange={(e) => setForm({ ...form, teamId: e.target.value })}
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-white/10 bg-[#0c1e42] text-white outline-none"
          >
            <option value="">選択...</option>
            {leagueTeams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
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
          onClick={() => onSave(form)}
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

function rawToPlayer(d: Record<string, unknown>, teams: Team[]): Player {
  const tid = (d.team_id ?? d.teamId) as string;
  const team = teams.find((t) => t.id === tid);
  return {
    id: (d.player_id ?? d.id) as string,
    name: (d.name as string) ?? "",
    teamId: tid,
    teamName: team?.name ?? (d.team_name as string) ?? "",
    leagueId: (d.league_id as string) ?? "",
    number: (d.number as number) ?? 0,
    photoUrl: (d.photo_url as string | null) ?? null,
    isCaptain: (d.is_captain as boolean) ?? false,
    userEmail: (d.user_email as string | null) ?? null,
  };
}

export default function PlayersAdminClient({
  initialPlayers,
  teams,
}: {
  initialPlayers: Player[];
  teams: Team[];
}) {
  const [players, setPlayers] = useState(initialPlayers);
  const [filterLeague, setFilterLeague] = useState("premier");
  const [filterTeam, setFilterTeam] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [modal, setModal] = useState<"create" | "edit" | "delete" | null>(null);
  const [target, setTarget] = useState<Player | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const leagueTeams = teams.filter((t) => t.leagueId === filterLeague);
  const filtered = players.filter((p) => {
    if (searchQuery) {
      return p.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    if (p.leagueId !== filterLeague) return false;
    if (filterTeam && p.teamId !== filterTeam) return false;
    return true;
  });

  const toFormData = (p: Player): Partial<FormData> => ({
    name: p.name,
    teamId: p.teamId,
    leagueId: p.leagueId,
    number: String(p.number),
    position: "FP",
    photoUrl: p.photoUrl ?? null,
    userEmail: p.userEmail ?? "",
  });

  const handleCreate = async (data: FormData) => {
    setSaving(true);
    const team = teams.find((t) => t.id === data.teamId);
    const res = await fetch("/api/admin/players", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        teamId: data.teamId,
        leagueId: data.leagueId,
        number: Number(data.number) || 0,
        position: data.position,
        photoUrl: data.photoUrl,
        userEmail: data.userEmail || null,
        playerId: `${data.teamId}-${Date.now()}`,
      }),
    });
    setSaving(false);
    if (res.ok) {
      const raw = await res.json();
      const p = rawToPlayer(raw, teams);
      if (!p.teamName && team) p.teamName = team.name;
      setPlayers([...players, p]);
      setModal(null);
      showToast("作成しました");
    } else {
      showToast("作成に失敗しました");
    }
  };

  const handleEdit = async (data: FormData) => {
    if (!target) return;
    setSaving(true);
    const res = await fetch(`/api/admin/players/${target.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        teamId: data.teamId,
        leagueId: data.leagueId,
        number: Number(data.number) || 0,
        position: data.position,
        photoUrl: data.photoUrl,
        userEmail: data.userEmail || null,
      }),
    });
    setSaving(false);
    if (res.ok) {
      const raw = await res.json();
      setPlayers(
        players.map((p) => (p.id === target.id ? rawToPlayer(raw, teams) : p)),
      );
      setModal(null);
      showToast("更新しました");
    } else {
      showToast("更新に失敗しました");
    }
  };

  const handleDelete = async () => {
    if (!target) return;
    setSaving(true);
    const res = await fetch(`/api/admin/players/${target.id}`, {
      method: "DELETE",
    });
    setSaving(false);
    if (res.ok) {
      setPlayers(players.filter((p) => p.id !== target.id));
      setModal(null);
      showToast("削除しました");
    } else {
      showToast("削除に失敗しました");
    }
  };

  const handleToggleCaptain = async (p: Player) => {
    const next = !p.isCaptain;
    const res = await fetch(`/api/admin/players/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isCaptain: next }),
    });
    if (res.ok) {
      setPlayers(
        players.map((pl) => (pl.id === p.id ? { ...pl, isCaptain: next } : pl)),
      );
      showToast(next ? "キャプテンに設定しました" : "キャプテンを解除しました");
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
            選手管理
          </h1>
        </div>
        <button
          onClick={() => {
            setTarget(null);
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

      {/* フィルター */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="選手名で検索..."
          className="px-3 py-2 text-sm rounded-lg border border-white/10 bg-white/5 text-white outline-none focus:border-amber-500/50 placeholder:text-white/20 w-full sm:w-48"
        />
        {!searchQuery && (
          <>
            <select
              value={filterLeague}
              onChange={(e) => {
                setFilterLeague(e.target.value);
                setFilterTeam("");
              }}
              className="px-3 py-2 text-sm rounded-lg border border-white/10 bg-[#0c1e42] text-white outline-none"
            >
              {LEAGUE_IDS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
            <select
              value={filterTeam}
              onChange={(e) => setFilterTeam(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-white/10 bg-[#0c1e42] text-white outline-none w-full sm:w-auto sm:min-w-32"
            >
              <option value="">全チーム</option>
              {leagueTeams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </>
        )}
        <span className="text-xs text-white/30 self-center">
          {filtered.length}名
        </span>
      </div>

      <div
        className="rounded-xl border border-white/8 overflow-hidden"
        style={{ background: "#0c1e42" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px]">
            <thead>
              <tr className="border-b border-white/8">
                <th className="text-left px-4 lg:px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider w-12"></th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">
                  選手名
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider hidden sm:table-cell">
                  チーム
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider w-16">
                  #
                </th>
                <th className="w-28 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-12 text-sm text-white/30"
                  >
                    選手データなし
                  </td>
                </tr>
              )}
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-white/5 hover:bg-white/3 transition-colors"
                >
                  <td className="px-4 lg:px-5 py-2">
                    {p.photoUrl ? (
                      <img
                        src={p.photoUrl}
                        alt={p.name}
                        className="w-9 h-9 rounded-full object-cover border border-white/10"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/20 text-xs">
                        {p.name?.[0] ?? "?"}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white">
                        {p.name || "-"}
                      </span>
                      {p.isCaptain && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-900/50 text-amber-400 font-bold whitespace-nowrap">
                          C
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-white/60 hidden sm:table-cell">
                    {p.teamName}
                  </td>
                  <td className="px-4 py-3 text-sm text-white/60">
                    {p.number}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleToggleCaptain(p)}
                        className={`text-xs px-2 py-1.5 rounded-lg border transition-colors whitespace-nowrap ${p.isCaptain ? "border-amber-500/50 text-amber-400 bg-amber-900/20" : "border-white/10 text-white/30 hover:text-amber-400 hover:border-amber-500/30"}`}
                        title={
                          p.isCaptain ? "キャプテン解除" : "キャプテンに設定"
                        }
                      >
                        C
                      </button>
                      <button
                        onClick={() => {
                          setTarget(p);
                          setModal("edit");
                        }}
                        className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-colors whitespace-nowrap"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => {
                          setTarget(p);
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
        <Modal title="新規選手作成" onClose={() => setModal(null)}>
          <PlayerForm
            teams={teams}
            onSave={handleCreate}
            onCancel={() => setModal(null)}
            saving={saving}
            initial={{ leagueId: filterLeague, teamId: filterTeam }}
          />
        </Modal>
      )}
      {modal === "edit" && target && (
        <Modal title="選手を編集" onClose={() => setModal(null)}>
          <PlayerForm
            teams={teams}
            initial={toFormData(target)}
            onSave={handleEdit}
            onCancel={() => setModal(null)}
            saving={saving}
          />
        </Modal>
      )}
      {modal === "delete" && target && (
        <Modal title="削除の確認" onClose={() => setModal(null)}>
          <p className="text-sm text-white/70 mb-6">
            「{target.name || "-"}」を削除しますか？
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

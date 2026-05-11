"use client";

import { useState } from "react";
import type { Team } from "@/lib/types/app";
import ImageUpload from "@/components/ui/ImageUpload";

const DIVISIONS = [
  { key: "premier", label: "Premier League", color: "#c9921e" },
  { key: "regular", label: "Regular League", color: "#1e293b" },
];

const LEAGUE_OPTIONS = [
  { value: "spade", label: "♠ Division" },
  { value: "diamond", label: "♦ Division" },
  { value: "club", label: "♣ Division" },
  { value: "heart", label: "♥ Division" },
];

type FormData = {
  name: string;
  slug: string;
  leagueId: string;
  leagueName: string;
  homeColor: string;
  captain: string;
  description: string;
  twitterUrl: string;
  instagramUrl: string;
  isActive: boolean;
  logoUrl: string | null;
};

const defaultForm = (leagueId = "premier"): FormData => ({
  name: "",
  slug: "",
  leagueId,
  leagueName:
    leagueId === "premier"
      ? "Premier League"
      : (LEAGUE_OPTIONS.find((l) => l.value === leagueId)?.label ?? ""),
  homeColor: "#c9921e",
  captain: "",
  description: "",
  twitterUrl: "",
  instagramUrl: "",
  isActive: true,
  logoUrl: null,
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

function TeamForm({
  initial,
  isPremier,
  onSave,
  onCancel,
  saving,
}: {
  initial?: Partial<FormData>;
  isPremier: boolean;
  onSave: (d: FormData) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<FormData>({
    ...defaultForm(isPremier ? "premier" : "spade"),
    ...initial,
  });

  const handleLeague = (v: string) => {
    const label =
      v === "premier"
        ? "Premier League"
        : (LEAGUE_OPTIONS.find((l) => l.value === v)?.label ?? "");
    setForm({ ...form, leagueId: v, leagueName: label });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
          チームロゴ
        </label>
        <ImageUpload
          currentUrl={form.logoUrl}
          folder="teams"
          placeholder="⬡"
          onUpload={(url) => setForm({ ...form, logoUrl: url })}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
            チーム名
          </label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-white/10 bg-white/5 text-white outline-none focus:border-amber-500/50"
            placeholder="BON"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
            スラッグ
          </label>
          <input
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-white/10 bg-white/5 text-white outline-none focus:border-amber-500/50"
            placeholder="bon"
          />
        </div>
      </div>
      {!isPremier && (
        <div>
          <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
            ディビジョン
          </label>
          <select
            value={form.leagueId}
            onChange={(e) => handleLeague(e.target.value)}
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-white/10 bg-[#0c1e42] text-white outline-none"
          >
            {LEAGUE_OPTIONS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
            チームカラー
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={form.homeColor}
              onChange={(e) => setForm({ ...form, homeColor: e.target.value })}
              className="w-10 h-10 rounded-lg cursor-pointer border border-white/10 bg-transparent"
            />
            <input
              value={form.homeColor}
              onChange={(e) => setForm({ ...form, homeColor: e.target.value })}
              className="flex-1 px-3 py-2.5 text-sm rounded-lg border border-white/10 bg-white/5 text-white outline-none"
              placeholder="#c9921e"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
            キャプテン
          </label>
          <input
            value={form.captain}
            onChange={(e) => setForm({ ...form, captain: e.target.value })}
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-white/10 bg-white/5 text-white outline-none focus:border-amber-500/50"
            placeholder="名前"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
            X (Twitter)
          </label>
          <input
            value={form.twitterUrl}
            onChange={(e) => setForm({ ...form, twitterUrl: e.target.value })}
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-white/10 bg-white/5 text-white outline-none focus:border-amber-500/50"
            placeholder="https://x.com/..."
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
            Instagram
          </label>
          <input
            value={form.instagramUrl}
            onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })}
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-white/10 bg-white/5 text-white outline-none focus:border-amber-500/50"
            placeholder="https://instagram.com/..."
          />
        </div>
      </div>
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          className="w-4 h-4 accent-amber-500"
        />
        <span className="text-sm text-white/70">公開する</span>
      </label>
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

function rawToTeam(d: Record<string, unknown>): Team {
  return {
    id: (d.team_id ?? d.id) as string,
    name: d.name as string,
    slug: (d.slug as string) ?? "",
    leagueId: (d.league_id as string) ?? "",
    leagueName: (d.league_name as string) ?? "",
    logoUrl: (d.logo_url as string | null) ?? null,
    homeColor: (d.home_color as string) ?? "#000000",
    captainName: (d.captain as string) ?? "",
    description: (d.description as string) ?? "",
    twitterUrl: (d.twitter_url as string | null) ?? null,
    instagramUrl: (d.instagram_url as string | null) ?? null,
    isActive: (d.is_active as boolean) ?? true,
  };
}

export default function TeamsAdminClient({
  initialTeams,
}: {
  initialTeams: Team[];
}) {
  const [teams, setTeams] = useState(initialTeams);
  const [tab, setTab] = useState<"premier" | "regular">("premier");
  const [modal, setModal] = useState<"create" | "edit" | "delete" | null>(null);
  const [target, setTarget] = useState<Team | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const filtered = teams.filter((t) =>
    tab === "premier" ? t.leagueId === "premier" : t.leagueId !== "premier",
  );

  const toFormData = (t: Team): Partial<FormData> => ({
    name: t.name,
    slug: t.slug,
    leagueId: t.leagueId,
    leagueName: t.leagueName,
    homeColor: t.homeColor,
    captain: t.captainName,
    description: t.description,
    twitterUrl: t.twitterUrl ?? "",
    instagramUrl: t.instagramUrl ?? "",
    isActive: t.isActive,
    logoUrl: t.logoUrl ?? null,
  });

  const handleCreate = async (data: FormData) => {
    setSaving(true);
    const res = await fetch("/api/admin/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        slug: data.slug,
        teamId: data.slug,
        leagueId: data.leagueId,
        leagueName: data.leagueName,
        homeColor: data.homeColor,
        captain: data.captain,
        description: data.description,
        twitterUrl: data.twitterUrl || null,
        instagramUrl: data.instagramUrl || null,
        isActive: data.isActive,
        logoUrl: data.logoUrl ?? null,
      }),
    });
    setSaving(false);
    if (res.ok) {
      const raw = await res.json();
      setTeams([...teams, rawToTeam(raw)]);
      setModal(null);
      showToast("作成しました");
    } else {
      showToast("作成に失敗しました");
    }
  };

  const handleEdit = async (data: FormData) => {
    if (!target) return;
    setSaving(true);
    const res = await fetch(`/api/admin/teams/${target.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        slug: data.slug,
        homeColor: data.homeColor,
        captain: data.captain,
        description: data.description,
        twitterUrl: data.twitterUrl || null,
        instagramUrl: data.instagramUrl || null,
        isActive: data.isActive,
        logoUrl: data.logoUrl ?? null,
      }),
    });
    setSaving(false);
    if (res.ok) {
      const raw = await res.json();
      setTeams(teams.map((t) => (t.id === target.id ? rawToTeam(raw) : t)));
      setModal(null);
      showToast("更新しました");
    } else {
      showToast("更新に失敗しました");
    }
  };

  const handleDelete = async () => {
    if (!target) return;
    setSaving(true);
    const res = await fetch(`/api/admin/teams/${target.id}`, {
      method: "DELETE",
    });
    setSaving(false);
    if (res.ok) {
      setTeams(teams.filter((t) => t.id !== target.id));
      setModal(null);
      showToast("削除しました");
    } else {
      showToast("削除に失敗しました");
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
            チーム管理
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

      {/* タブ */}
      <div
        className="flex gap-1 mb-6 p-1 rounded-xl border border-white/8 w-fit"
        style={{ background: "#0a1628" }}
      >
        {DIVISIONS.map((d) => (
          <button
            key={d.key}
            onClick={() => setTab(d.key as "premier" | "regular")}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === d.key ? "text-white" : "text-white/40 hover:text-white/70"
            }`}
            style={tab === d.key ? { background: "#0c1e42" } : {}}
          >
            {d.label}
            <span className="ml-2 text-xs opacity-60">
              {
                teams.filter((t) =>
                  d.key === "premier"
                    ? t.leagueId === "premier"
                    : t.leagueId !== "premier",
                ).length
              }
            </span>
          </button>
        ))}
      </div>

      <div
        className="rounded-xl border border-white/8 overflow-hidden"
        style={{ background: "#0c1e42" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px]">
            <thead>
              <tr className="border-b border-white/8">
                <th className="text-left px-4 lg:px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">
                  チーム名
                </th>
                {tab === "regular" && (
                  <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider hidden sm:table-cell">
                    ディビジョン
                  </th>
                )}
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider hidden md:table-cell">
                  キャプテン
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider w-20">
                  状態
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
                    チームデータなし
                  </td>
                </tr>
              )}
              {filtered.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-white/5 hover:bg-white/3 transition-colors"
                >
                  <td className="px-4 lg:px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ background: t.homeColor }}
                      />
                      <span className="text-sm text-white">{t.name}</span>
                    </div>
                  </td>
                  {tab === "regular" && (
                    <td className="px-4 py-3 text-sm text-white/60 hidden sm:table-cell">
                      {t.leagueName}
                    </td>
                  )}
                  <td className="px-4 py-3 text-sm text-white/60 hidden md:table-cell">
                    {t.captainName || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap ${
                        t.isActive
                          ? "bg-emerald-900/50 text-emerald-400"
                          : "bg-white/5 text-white/30"
                      }`}
                    >
                      {t.isActive ? "公開" : "非公開"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => {
                          setTarget(t);
                          setModal("edit");
                        }}
                        className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-colors whitespace-nowrap"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => {
                          setTarget(t);
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
        <Modal title="新規チーム作成" onClose={() => setModal(null)}>
          <TeamForm
            isPremier={tab === "premier"}
            onSave={handleCreate}
            onCancel={() => setModal(null)}
            saving={saving}
          />
        </Modal>
      )}
      {modal === "edit" && target && (
        <Modal title="チームを編集" onClose={() => setModal(null)}>
          <TeamForm
            initial={toFormData(target)}
            isPremier={target.leagueId === "premier"}
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

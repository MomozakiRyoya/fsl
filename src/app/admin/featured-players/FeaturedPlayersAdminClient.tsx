"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

interface FeaturedPlayer {
  id: string;
  imageUrl: string;
  playerName: string;
  teamName: string;
  orderNum: number;
  isActive: boolean;
}

interface TeamItem {
  id: string;
  name: string;
  leagueId: string;
}
interface PlayerItem {
  id: string;
  name: string;
  teamId: string;
  imageUrl?: string;
}

type FormData = {
  imageUrl: string;
  playerName: string;
  teamName: string;
  orderNum: string;
  isActive: boolean;
};

const defaultForm = (): FormData => ({
  imageUrl: "",
  playerName: "",
  teamName: "",
  orderNum: "0",
  isActive: true,
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

export default function FeaturedPlayersAdminClient({
  initialItems,
  teams = [],
  players = [],
}: {
  initialItems: FeaturedPlayer[];
  teams?: TeamItem[];
  players?: PlayerItem[];
}) {
  const [items, setItems] = useState(initialItems);
  const [modal, setModal] = useState<"create" | "edit" | "delete" | null>(null);
  const [target, setTarget] = useState<FeaturedPlayer | null>(null);
  const [form, setForm] = useState<FormData>(defaultForm());
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const supabase = createClient();
    const ext = file.type.includes("png")
      ? "png"
      : file.type.includes("webp")
        ? "webp"
        : "jpg";
    const path = `featured/${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("fsl-images")
      .upload(path, file, { upsert: true });
    if (!error) {
      const {
        data: { publicUrl },
      } = supabase.storage.from("fsl-images").getPublicUrl(path);
      setForm((f) => ({ ...f, imageUrl: publicUrl }));
      showToast("画像アップロード完了");
    } else {
      showToast(`画像アップロード失敗: ${error.message}`);
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openCreate = () => {
    setForm(defaultForm());
    setSelectedTeamId("");
    setSelectedPlayerId("");
    setTarget(null);
    setModal("create");
  };

  const openEdit = (item: FeaturedPlayer) => {
    const team = teams.find((t) => t.name === item.teamName);
    const player = players.find(
      (p) => p.name === item.playerName && p.teamId === (team?.id ?? ""),
    );
    setSelectedTeamId(team?.id ?? "");
    setSelectedPlayerId(player?.id ?? "");
    setForm({
      imageUrl: item.imageUrl,
      playerName: item.playerName,
      teamName: item.teamName,
      orderNum: String(item.orderNum),
      isActive: item.isActive,
    });
    setTarget(item);
    setModal("edit");
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      imageUrl: form.imageUrl,
      playerName: form.playerName,
      teamName: form.teamName,
      orderNum: Number(form.orderNum) || 0,
      isActive: form.isActive,
    };
    const url =
      modal === "edit" && target
        ? `/api/admin/featured-players/${target.id}`
        : "/api/admin/featured-players";
    const method = modal === "edit" ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (res.ok) {
      const raw = await res.json();
      if (modal === "edit") {
        setItems(items.map((i) => (i.id === target!.id ? raw : i)));
      } else {
        setItems([...items, raw]);
      }
      // 選手の image_url に書き戻し
      if (selectedPlayerId && form.imageUrl) {
        await fetch(`/api/admin/players/${selectedPlayerId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: form.imageUrl }),
        });
      }
      setModal(null);
      showToast(modal === "edit" ? "更新しました" : "作成しました");
    } else {
      const errData = await res.json().catch(() => ({}));
      showToast(`保存失敗: ${errData.error ?? res.status}`);
    }
  };

  const handleDelete = async () => {
    if (!target) return;
    setSaving(true);
    const res = await fetch(`/api/admin/featured-players/${target.id}`, {
      method: "DELETE",
    });
    setSaving(false);
    if (res.ok) {
      setItems(items.filter((i) => i.id !== target.id));
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
            注目選手管理
          </h1>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2.5 rounded-xl text-sm font-bold"
          style={{
            background: "linear-gradient(135deg, #c9921e, #e3c060)",
            color: "#0c1e42",
          }}
        >
          + 追加
        </button>
      </div>

      {items.length === 0 ? (
        <div
          className="rounded-xl border border-white/8 py-16 text-center text-sm text-white/30"
          style={{ background: "#0c1e42" }}
        >
          登録された注目選手なし
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="relative rounded-2xl overflow-hidden"
              style={{ aspectRatio: "3/4" }}
            >
              <img
                src={item.imageUrl}
                alt={item.playerName}
                className="w-full h-full object-cover"
              />
              {!item.isActive && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-xs text-white/60 font-bold">
                    非表示
                  </span>
                </div>
              )}
              <div
                className="absolute bottom-0 left-0 right-0 p-3"
                style={{
                  background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
                }}
              >
                {item.teamName && (
                  <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                    {item.teamName}
                  </p>
                )}
                <p className="text-sm font-black text-white">
                  {item.playerName}
                </p>
              </div>
              <div className="absolute top-2 right-2 flex gap-1">
                <button
                  onClick={() => openEdit(item)}
                  className="w-7 h-7 rounded-lg bg-black/60 text-white/70 hover:text-white text-xs flex items-center justify-center"
                >
                  ✎
                </button>
                <button
                  onClick={() => {
                    setTarget(item);
                    setModal("delete");
                  }}
                  className="w-7 h-7 rounded-lg bg-black/60 text-red-400/70 hover:text-red-400 text-xs flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(modal === "create" || modal === "edit") && (
        <Modal
          title={modal === "edit" ? "注目選手を編集" : "注目選手を追加"}
          onClose={() => setModal(null)}
        >
          <div className="space-y-4">
            {/* 画像 */}
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                選手カード画像
              </label>
              {form.imageUrl && (
                <div
                  className="relative w-32 rounded-xl overflow-hidden mb-3"
                  style={{ aspectRatio: "3/4" }}
                >
                  <img
                    src={form.imageUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2 rounded-lg text-xs font-semibold border border-white/10 text-white/60 hover:text-white transition-colors disabled:opacity-40"
              >
                {uploading
                  ? "アップロード中..."
                  : form.imageUrl
                    ? "画像を変更"
                    : "画像をアップロード"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            {/* チーム・選手プルダウン */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
                  チーム
                </label>
                <select
                  value={selectedTeamId}
                  onChange={(e) => {
                    const tid = e.target.value;
                    setSelectedTeamId(tid);
                    const t = teams.find((t) => t.id === tid);
                    setForm((f) => ({
                      ...f,
                      teamName: t?.name ?? "",
                      playerName: "",
                    }));
                  }}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-white/10 bg-[#060b14] text-white outline-none focus:border-amber-500/50"
                >
                  <option value="">-- チームを選択 --</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
                  選手
                </label>
                <select
                  value={selectedPlayerId}
                  disabled={!selectedTeamId}
                  onChange={(e) => {
                    const pid = e.target.value;
                    setSelectedPlayerId(pid);
                    const p = players.find((pl) => pl.id === pid);
                    if (p) {
                      setForm((f) => ({
                        ...f,
                        playerName: p.name,
                        imageUrl:
                          p.imageUrl && !f.imageUrl ? p.imageUrl : f.imageUrl,
                      }));
                    }
                  }}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-white/10 bg-[#060b14] text-white outline-none focus:border-amber-500/50 disabled:opacity-40"
                >
                  <option value="">-- 選手を選択 --</option>
                  {players
                    .filter((p) => p.teamId === selectedTeamId)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                        {p.imageUrl ? " ✓" : ""}
                      </option>
                    ))}
                </select>
                {selectedPlayerId &&
                  players.find((p) => p.id === selectedPlayerId)?.imageUrl &&
                  !form.imageUrl && (
                    <p className="text-[11px] text-amber-400/70 mt-1">
                      保存済み画像があります → 選手選択で自動反映
                    </p>
                  )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                  className="w-4 h-4 accent-amber-500"
                />
                <span className="text-sm text-white/70">表示する</span>
              </label>
              <div className="flex items-center gap-2">
                <label className="text-xs text-white/50">表示順</label>
                <input
                  type="number"
                  min="0"
                  value={form.orderNum}
                  onChange={(e) =>
                    setForm({ ...form, orderNum: e.target.value })
                  }
                  className="w-16 px-2 py-1.5 text-xs text-center rounded-lg border border-white/10 bg-white/5 text-white outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setModal(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-white/10 text-white/50 hover:text-white transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.imageUrl}
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
        </Modal>
      )}

      {modal === "delete" && target && (
        <Modal title="削除の確認" onClose={() => setModal(null)}>
          <p className="text-sm text-white/70 mb-6">
            「{target.playerName || "この選手"}」を削除しますか？
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setModal(null)}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-white/10 text-white/50"
            >
              キャンセル
            </button>
            <button
              onClick={handleDelete}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-600 text-white disabled:opacity-40"
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

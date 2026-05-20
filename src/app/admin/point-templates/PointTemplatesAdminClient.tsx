"use client";

import { useState } from "react";

interface PointRow {
  rank: number;
  pts: number;
}

interface PointTemplate {
  id: string;
  name: string;
  description: string;
  points: PointRow[];
  isPublished: boolean;
}

type FormData = {
  name: string;
  description: string;
  isPublished: boolean;
};

const defaultForm = (): FormData => ({
  name: "",
  description: "",
  isPublished: false,
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
        className="w-full sm:max-w-xl rounded-t-2xl sm:rounded-2xl border-t sm:border border-white/10 shadow-2xl max-h-[90vh] flex flex-col"
        style={{ background: "#0c1e42" }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 flex-shrink-0">
          <h2 className="text-base font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl">✕</button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function PointsEditor({
  points,
  onChange,
}: {
  points: PointRow[];
  onChange: (p: PointRow[]) => void;
}) {
  const update = (i: number, field: keyof PointRow, val: number) => {
    onChange(points.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)));
  };
  const remove = (i: number) => onChange(points.filter((_, idx) => idx !== i));
  const addRow = () => {
    const nextRank = points.length > 0 ? Math.max(...points.map((r) => r.rank)) + 1 : 1;
    onChange([...points, { rank: nextRank, pts: 0 }]);
  };

  const inputCls =
    "w-full px-2 py-1.5 text-sm rounded border border-white/10 bg-white/5 text-white outline-none focus:border-amber-500/50 tabular-nums text-right";

  return (
    <div>
      <div
        className="rounded-lg overflow-hidden border border-white/8"
        style={{ background: "#060b14" }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/8">
              <th className="px-3 py-2 text-white/40 text-left text-xs font-semibold tracking-wider">順位</th>
              <th className="px-3 py-2 text-white/40 text-right text-xs font-semibold tracking-wider">ポイント</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {points.map((row, i) => (
              <tr key={i} className="border-b border-white/5 last:border-0">
                <td className="px-3 py-1.5">
                  <input
                    type="number"
                    min="1"
                    value={row.rank}
                    onChange={(e) => update(i, "rank", parseInt(e.target.value) || 1)}
                    className={inputCls + " text-left"}
                  />
                </td>
                <td className="px-3 py-1.5">
                  <input
                    type="number"
                    min="0"
                    value={row.pts}
                    onChange={(e) => update(i, "pts", parseInt(e.target.value) || 0)}
                    className={inputCls}
                  />
                </td>
                <td className="px-2 py-1.5 text-center">
                  <button
                    onClick={() => remove(i)}
                    className="text-red-400/50 hover:text-red-400 transition-colors text-xs"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
            {points.length === 0 && (
              <tr>
                <td colSpan={3} className="px-3 py-4 text-center text-xs text-white/30">
                  順位を追加してください
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <button
        onClick={addRow}
        className="mt-2 px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-colors"
      >
        + 順位追加
      </button>
    </div>
  );
}

export default function PointTemplatesAdminClient({
  initialTemplates,
}: {
  initialTemplates: PointTemplate[];
}) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [modal, setModal] = useState<"create" | "edit" | "delete" | null>(null);
  const [target, setTarget] = useState<PointTemplate | null>(null);
  const [form, setForm] = useState<FormData>(defaultForm());
  const [editPoints, setEditPoints] = useState<PointRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const openCreate = () => {
    setForm(defaultForm());
    setEditPoints([]);
    setTarget(null);
    setModal("create");
  };

  const openEdit = (t: PointTemplate) => {
    setForm({ name: t.name, description: t.description, isPublished: t.isPublished });
    setEditPoints(t.points.map((p) => ({ ...p })));
    setTarget(t);
    setModal("edit");
  };

  const handleSave = async () => {
    if (!form.name) return;
    setSaving(true);
    const payload = {
      name: form.name,
      description: form.description,
      points: editPoints,
      isPublished: form.isPublished,
    };
    const url = modal === "edit" && target
      ? `/api/admin/point-templates/${target.id}`
      : "/api/admin/point-templates";
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
        setTemplates((prev) => prev.map((t) => (t.id === target!.id ? raw : t)));
      } else {
        setTemplates((prev) => [raw, ...prev]);
      }
      setModal(null);
      showToast(modal === "edit" ? "更新しました" : "作成しました");
    } else {
      showToast("保存に失敗しました");
    }
  };

  const handleDelete = async () => {
    if (!target) return;
    setSaving(true);
    const res = await fetch(`/api/admin/point-templates/${target.id}`, { method: "DELETE" });
    setSaving(false);
    if (res.ok) {
      setTemplates((prev) => prev.filter((t) => t.id !== target.id));
      setModal(null);
      showToast("削除しました");
    } else {
      showToast("削除に失敗しました");
    }
  };

  const handleTogglePublish = async (t: PointTemplate) => {
    const res = await fetch(`/api/admin/point-templates/${t.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !t.isPublished }),
    });
    if (res.ok) {
      setTemplates((prev) =>
        prev.map((item) => (item.id === t.id ? { ...item, isPublished: !t.isPublished } : item)),
      );
    }
  };

  const inputCls =
    "w-full px-3 py-2.5 text-sm rounded-lg border border-white/10 bg-white/5 text-white outline-none focus:border-amber-500/50";

  return (
    <div className="p-4 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <p className="text-[10px] tracking-[0.3em] text-white/30 uppercase mb-1">Admin</p>
          <h1 className="text-xl lg:text-2xl font-black text-white">ポイントテンプレート</h1>
          <p className="text-xs text-white/30 mt-0.5">順位別獲得ポイントのテンプレートを管理します</p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 lg:px-5 py-2.5 rounded-xl text-sm font-bold"
          style={{ background: "linear-gradient(135deg, #c9921e, #e3c060)", color: "#0c1e42" }}
        >
          + 新規作成
        </button>
      </div>

      {/* 一覧 */}
      <div
        className="rounded-xl border border-white/8 overflow-hidden"
        style={{ background: "#0c1e42" }}
      >
        {templates.length === 0 ? (
          <div className="py-16 text-center text-sm text-white/30">
            テンプレートデータなし
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {templates.map((t) => (
              <div key={t.id} className="px-4 py-4 hover:bg-white/3 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white">{t.name}</span>
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={
                          t.isPublished
                            ? { background: "rgba(34,197,94,0.15)", color: "#4ade80" }
                            : { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.35)" }
                        }
                      >
                        {t.isPublished ? "公開中" : "非公開"}
                      </span>
                      <span className="text-xs text-white/30">{t.points.length}順位</span>
                    </div>
                    {/* ポイント一覧プレビュー */}
                    {t.points.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {t.points.slice(0, 8).map((p) => (
                          <span
                            key={p.rank}
                            className="text-[11px] px-2 py-0.5 rounded"
                            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}
                          >
                            {p.rank}位: <span className="text-amber-400 font-bold">{p.pts}pt</span>
                          </span>
                        ))}
                      </div>
                    )}
                    {/* 説明文プレビュー */}
                    {t.description && (
                      <p className="text-xs text-white/30 mt-1.5 line-clamp-2">{t.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0 flex-wrap justify-end">
                    <button
                      onClick={() => handleTogglePublish(t)}
                      className="text-xs px-2.5 py-1.5 rounded-lg border transition-colors whitespace-nowrap"
                      style={
                        t.isPublished
                          ? { borderColor: "rgba(74,222,128,0.3)", color: "rgba(74,222,128,0.7)" }
                          : { borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }
                      }
                    >
                      {t.isPublished ? "非公開にする" : "公開する"}
                    </button>
                    <button
                      onClick={() => openEdit(t)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-colors"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => { setTarget(t); setModal("delete"); }}
                      className="text-xs px-3 py-1.5 rounded-lg border border-red-900/50 text-red-400/70 hover:text-red-400 hover:border-red-900 transition-colors"
                    >
                      削除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 作成/編集モーダル */}
      {(modal === "create" || modal === "edit") && (
        <Modal
          title={modal === "edit" ? "テンプレートを編集" : "新規ポイントテンプレート"}
          onClose={() => setModal(null)}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
                テンプレート名
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className={inputCls}
                placeholder="通常フォーマット（プレミア）"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
                説明・特別ルール
                <span className="text-white/20 font-normal ml-1">（任意）</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                className={inputCls + " resize-none"}
                placeholder="バウンティポイントやミステリーバウンティなど特別ルールの説明を記入"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                順位別ポイント
              </label>
              <PointsEditor points={editPoints} onChange={setEditPoints} />
            </div>

            <div className="flex items-center justify-between py-3 px-4 rounded-lg border border-white/8">
              <div>
                <p className="text-sm font-semibold text-white">ユーザー側に公開</p>
                <p className="text-xs text-white/30 mt-0.5">ONにするとユーザーが確認できます</p>
              </div>
              <button
                onClick={() => setForm((f) => ({ ...f, isPublished: !f.isPublished }))}
                className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
                style={{ background: form.isPublished ? "#22c55e" : "rgba(255,255,255,0.15)" }}
              >
                <span
                  className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform"
                  style={{ transform: form.isPublished ? "translateX(22px)" : "translateX(2px)" }}
                />
              </button>
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
                disabled={saving || !form.name}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, #c9921e, #e3c060)", color: "#0c1e42" }}
              >
                {saving ? "保存中..." : "保存する"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 削除確認 */}
      {modal === "delete" && target && (
        <Modal title="削除の確認" onClose={() => setModal(null)}>
          <p className="text-sm text-white/70 mb-6">
            「{target.name}」を削除しますか？<br />
            <span className="text-white/40 text-xs">このテンプレートを使用しているストラクチャーの紐づけも解除されます。</span>
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
          style={{ background: "#0c1e42", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}

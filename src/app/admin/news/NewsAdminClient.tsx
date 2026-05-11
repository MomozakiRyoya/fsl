"use client";

import { useState } from "react";
import type { NewsItem } from "@/lib/types/app";

const CATEGORIES = ["結果", "お知らせ", "イベント"] as const;

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
            className="text-white/40 hover:text-white text-xl leading-none"
          >
            ✕
          </button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

type FormData = {
  title: string;
  category: string;
  body: string;
  isPublished: boolean;
};

function NewsForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial?: Partial<FormData>;
  onSave: (data: FormData) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<FormData>({
    title: initial?.title ?? "",
    category: initial?.category ?? "お知らせ",
    body: initial?.body ?? "",
    isPublished: initial?.isPublished ?? false,
  });

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
          タイトル
        </label>
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full px-3 py-2.5 text-sm rounded-lg border border-white/10 bg-white/5 text-white outline-none focus:border-amber-500/50"
          placeholder="記事タイトル"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
          カテゴリー
        </label>
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="w-full px-3 py-2.5 text-sm rounded-lg border border-white/10 bg-[#0c1e42] text-white outline-none focus:border-amber-500/50"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
          本文
        </label>
        <textarea
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
          rows={6}
          className="w-full px-3 py-2.5 text-sm rounded-lg border border-white/10 bg-white/5 text-white outline-none focus:border-amber-500/50 resize-none"
          placeholder="記事の本文..."
        />
      </div>
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={form.isPublished}
          onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
          className="w-4 h-4 accent-amber-500"
        />
        <span className="text-sm text-white/70">公開する</span>
      </label>
      <div className="flex gap-3 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-colors"
        >
          キャンセル
        </button>
        <button
          onClick={() => onSave(form)}
          disabled={saving || !form.title}
          className="flex-1 py-2.5 rounded-xl text-sm font-bold disabled:opacity-40 transition-all"
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

export default function NewsAdminClient({
  initialNews,
}: {
  initialNews: NewsItem[];
}) {
  const [news, setNews] = useState(initialNews);
  const [modal, setModal] = useState<"create" | "edit" | "delete" | null>(null);
  const [target, setTarget] = useState<NewsItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleCreate = async (data: FormData) => {
    setSaving(true);
    const res = await fetch("/api/admin/news", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    if (res.ok) {
      const created = await res.json();
      setNews([created, ...news]);
      setModal(null);
      showToast("ニュースを作成しました");
    } else {
      showToast("作成に失敗しました");
    }
  };

  const handleEdit = async (data: FormData) => {
    if (!target) return;
    setSaving(true);
    const res = await fetch(`/api/admin/news/${target.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    if (res.ok) {
      const updated = await res.json();
      setNews(news.map((n) => (n.id === target.id ? updated : n)));
      setModal(null);
      showToast("更新しました");
    } else {
      showToast("更新に失敗しました");
    }
  };

  const handleDelete = async () => {
    if (!target) return;
    setSaving(true);
    const res = await fetch(`/api/admin/news/${target.id}`, {
      method: "DELETE",
    });
    setSaving(false);
    if (res.ok) {
      setNews(news.filter((n) => n.id !== target.id));
      setModal(null);
      showToast("削除しました");
    } else {
      showToast("削除に失敗しました");
    }
  };

  return (
    <div className="p-4 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 lg:mb-8">
        <div>
          <p className="text-[10px] tracking-[0.3em] text-white/30 uppercase mb-1">
            Admin
          </p>
          <h1 className="text-xl lg:text-2xl font-black text-white">
            ニュース管理
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

      {/* Table */}
      <div
        className="rounded-xl border border-white/8 overflow-hidden"
        style={{ background: "#0c1e42" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[540px]">
            <thead>
              <tr className="border-b border-white/8">
                <th className="text-left px-4 lg:px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">
                  タイトル
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider w-24 hidden sm:table-cell">
                  カテゴリー
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider w-24 hidden md:table-cell">
                  日付
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider w-20">
                  状態
                </th>
                <th className="w-24 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {news.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-12 text-sm text-white/30"
                  >
                    記事がありません
                  </td>
                </tr>
              )}
              {news.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-white/5 hover:bg-white/3 transition-colors"
                >
                  <td className="px-5 py-3 text-sm text-white">{item.title}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/8 text-white/60">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-white/40">
                    {item.publishedAt?.slice(0, 10)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap ${
                        item.isPublished
                          ? "bg-emerald-900/50 text-emerald-400"
                          : "bg-white/5 text-white/30"
                      }`}
                    >
                      {item.isPublished ? "公開" : "非公開"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => {
                          setTarget(item);
                          setModal("edit");
                        }}
                        className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-colors whitespace-nowrap"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => {
                          setTarget(item);
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

      {/* Create modal */}
      {modal === "create" && (
        <Modal title="新規ニュース作成" onClose={() => setModal(null)}>
          <NewsForm
            onSave={handleCreate}
            onCancel={() => setModal(null)}
            saving={saving}
          />
        </Modal>
      )}

      {/* Edit modal */}
      {modal === "edit" && target && (
        <Modal title="ニュースを編集" onClose={() => setModal(null)}>
          <NewsForm
            initial={target}
            onSave={handleEdit}
            onCancel={() => setModal(null)}
            saving={saving}
          />
        </Modal>
      )}

      {/* Delete confirm */}
      {modal === "delete" && target && (
        <Modal title="削除の確認" onClose={() => setModal(null)}>
          <p className="text-sm text-white/70 mb-6">
            「{target.title}」を削除しますか？この操作は取り消せません。
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

      {/* Toast */}
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

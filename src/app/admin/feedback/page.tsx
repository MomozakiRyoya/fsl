"use client";

import { useEffect, useState } from "react";

interface FeedbackItem {
  id: string;
  content: string;
  created_at: string;
}

export default function AdminFeedbackPage() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  useEffect(() => {
    fetch("/api/admin/feedback")
      .then((r) => r.json())
      .then((data) => setItems(data))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    const res = await fetch("/api/admin/feedback", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setDeleting(null);
    if (res.ok) {
      setItems((prev) => prev.filter((item) => item.id !== id));
      showToast("削除しました");
    } else {
      showToast("削除に失敗しました");
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-6">
        <p className="text-[10px] tracking-[0.3em] text-white/30 uppercase mb-1">Admin</p>
        <h1 className="text-xl lg:text-2xl font-black text-white">匿名意見箱</h1>
        <p className="text-xs text-white/40 mt-1">{items.length}件</p>
      </div>

      {loading && (
        <div className="py-12 text-center text-sm text-white/30">読み込み中...</div>
      )}

      {!loading && items.length === 0 && (
        <div
          className="rounded-xl border border-white/8 py-16 text-center"
          style={{ background: "#0c1e42" }}
        >
          <p className="text-sm text-white/30">まだ投稿はありません</p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-white/8 p-4"
              style={{ background: "#0c1e42" }}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm text-white leading-relaxed flex-1 whitespace-pre-wrap">
                  {item.content}
                </p>
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deleting === item.id}
                  className="text-xs px-3 py-1.5 rounded-lg border border-red-900/50 text-red-400/70 hover:text-red-400 hover:border-red-900 transition-colors whitespace-nowrap flex-shrink-0 disabled:opacity-40"
                >
                  {deleting === item.id ? "削除中..." : "削除"}
                </button>
              </div>
              <p className="text-[11px] text-white/30 mt-2">{formatDate(item.created_at)}</p>
            </div>
          ))}
        </div>
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

"use client";

import { useState } from "react";

export default function FeedbackPage() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "送信に失敗しました");
    } else {
      setDone(true);
    }
  };

  if (done) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">📬</div>
        <h2 className="text-xl font-black text-slate-900 mb-2">送信しました！</h2>
        <p className="text-sm text-slate-500">ご意見をありがとうございます。運営が確認します。</p>
        <button onClick={() => { setDone(false); setContent(""); }}
          className="mt-6 px-6 py-2 rounded-full text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50">
          続けて送る
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* ヘッダー */}
      <div className="px-4 pt-6 pb-5" style={{ background: "linear-gradient(160deg, #0c1e42 0%, #1a3268 60%, #0c1e42 100%)" }}>
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-1">Anonymous</p>
        <h1 className="text-2xl font-black text-white tracking-tight">匿名意見箱</h1>
        <p className="text-xs text-white/50 mt-1">アプリや運営への意見・フィードバックを匿名で送れます</p>
      </div>

      <div className="px-4 py-6">
        {/* 注意書き */}
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl mb-5">
          <span className="text-base flex-shrink-0">🔒</span>
          <p className="text-xs text-amber-800 leading-relaxed">
            完全匿名で送信されます。暴言・スパム・コンプラ違反は自動フィルターで弾かれます。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              maxLength={500}
              rows={6}
              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-2xl bg-white text-slate-900 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 outline-none resize-none leading-relaxed"
              placeholder="アプリへの要望、運営への意見、気になったことなど自由に書いてください..."
            />
            <p className="text-right text-xs text-slate-400 mt-1">{content.length}/500</p>
          </div>
          <button type="submit" disabled={loading || !content.trim()}
            className="w-full py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #c9921e, #e3c060)", color: "#0c1e42" }}>
            {loading ? "送信中..." : "匿名で送信する 📬"}
          </button>
        </form>
      </div>
    </div>
  );
}

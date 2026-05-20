"use client";

import { useEffect } from "react";
import type { NewsItem } from "@/lib/types/app";

const CATEGORY_STYLES: Record<string, { bg: string; text: string }> = {
  結果: { bg: "bg-blue-50", text: "text-blue-700" },
  お知らせ: { bg: "bg-emerald-50", text: "text-emerald-700" },
  イベント: { bg: "bg-amber-50", text: "text-amber-700" },
};

function NewsBody({ body }: { body: string }) {
  const paragraphs = body.split("\n\n").filter(Boolean);
  return (
    <div className="space-y-4">
      {paragraphs.map((para, i) => {
        if (para.startsWith("**") && para.endsWith("**")) {
          return (
            <p key={i} className="text-sm font-bold text-slate-900">
              {para.replace(/\*\*/g, "")}
            </p>
          );
        }
        if (para.startsWith("- ") || para.startsWith("1位:")) {
          return (
            <ul key={i} className="space-y-1">
              {para.split("\n").map((line, j) => (
                <li key={j} className="text-sm text-slate-700 flex items-start gap-2">
                  <span className="text-slate-300 mt-0.5">•</span>
                  <span>{line.replace(/^- /, "")}</span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="text-sm text-slate-700 leading-relaxed">
            {para}
          </p>
        );
      })}
    </div>
  );
}

interface Props {
  item: NewsItem | null;
  onClose: () => void;
}

export default function NewsModal({ item, onClose }: Props) {
  useEffect(() => {
    if (!item) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [item]);

  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [item, onClose]);

  if (!item) return null;

  const catStyle = CATEGORY_STYLES[item.category] ?? {
    bg: "bg-slate-100",
    text: "text-slate-600",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-t-2xl max-h-[88dvh] flex flex-col"
        style={{ animation: "slideUp 0.22s ease-out" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ドラッグハンドル */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        {/* ヘッダー */}
        <div className="px-4 pt-2 pb-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${catStyle.bg} ${catStyle.text}`}>
                {item.category}
              </span>
              <span className="text-xs text-slate-400">{item.publishedAt}</span>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 active:bg-slate-200 transition-colors"
              aria-label="閉じる"
            >
              <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <h2 className="text-base font-bold text-slate-900 leading-snug">
            {item.title}
          </h2>
        </div>

        {/* 本文（スクロール可能） */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {item.body ? (
            <NewsBody body={item.body} />
          ) : (
            <p className="text-sm text-slate-400 text-center py-8">本文を準備中です</p>
          )}
        </div>

        {/* シェア */}
        <div className="px-4 pb-6 pt-3 border-t border-slate-100 flex-shrink-0">
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(item.title)}&url=${encodeURIComponent(`https://fsl-gilt.vercel.app/news/${item.slug}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full h-10 rounded-xl text-sm font-medium text-white transition-opacity active:opacity-80"
            style={{ background: "#0c1e42" }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Xでシェア
          </a>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

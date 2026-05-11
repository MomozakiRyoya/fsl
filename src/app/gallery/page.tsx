"use client";

import { useState } from "react";

interface GalleryItem {
  id: number;
  round: string;
  league: string;
  caption: string;
  date: string;
  color: string;
}

const MOCK_GALLERY: GalleryItem[] = [
  { id: 1, round: "第4節", league: "Division 1", caption: "博多キングス vs 天神エース 好ゲーム", date: "2026-03-22", color: "#c9921e" },
  { id: 2, round: "第4節", league: "Division 1", caption: "加藤蓮 ハットトリック達成の瞬間", date: "2026-03-22", color: "#0c1e42" },
  { id: 3, round: "第4節", league: "Division 2", caption: "熱戦！Division 2 第4節", date: "2026-03-22", color: "#8B5CF6" },
  { id: 4, round: "第3節", league: "Division 1", caption: "福岡ユナイテッド 逆転勝利", date: "2026-03-15", color: "#10B981" },
  { id: 5, round: "第3節", league: "Division 1", caption: "MVP 木村遼 インタビュー", date: "2026-03-15", color: "#1a3a7a" },
  { id: 6, round: "第3節", league: "Division 2", caption: "白熱のDiv2 第3節ハイライト", date: "2026-03-15", color: "#EF4444" },
  { id: 7, round: "第2節", league: "Division 1", caption: "第2節 集合写真", date: "2026-03-08", color: "#c9921e" },
  { id: 8, round: "第2節", league: "Division 3", caption: "Division 3 第2節 全試合終了", date: "2026-03-08", color: "#6366f1" },
];

const ROUNDS = ["すべて", "第4節", "第3節", "第2節"];

function getInitials(caption: string): string {
  return caption.slice(0, 2);
}

export default function GalleryPage() {
  const [activeRound, setActiveRound] = useState<string>("すべて");
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  const filtered =
    activeRound === "すべて"
      ? MOCK_GALLERY
      : MOCK_GALLERY.filter((item) => item.round === activeRound);

  return (
    <div className="max-w-lg mx-auto">
      {/* ヘッダー */}
      <div
        className="relative overflow-hidden px-5 pt-10 pb-6"
        style={{
          background: "linear-gradient(135deg, #0c1e42 0%, #1a3a7a 60%, #0c1e42 100%)",
        }}
      >
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 80% 20%, #c9921e 0%, transparent 50%)" }}
        />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-white/50 text-xs tracking-[0.25em] uppercase mb-1">FSL Season 1</p>
            <h1 className="text-2xl font-black text-white tracking-widest">GALLERY</h1>
          </div>
          <span
            className="text-xs font-bold px-3 py-1 rounded-full"
            style={{ background: "linear-gradient(135deg, #c9921e, #e3c060)", color: "#0c1e42" }}
          >
            {MOCK_GALLERY.length}枚
          </span>
        </div>
      </div>

      {/* フィルタータブ */}
      <div className="px-4 pt-4 pb-2 flex gap-2 overflow-x-auto scroll-x-hidden">
        {ROUNDS.map((round) => (
          <button
            key={round}
            onClick={() => setActiveRound(round)}
            className="flex-none px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={
              activeRound === round
                ? { background: "#0c1e42", color: "#fff" }
                : { background: "#f1f5f9", color: "#64748b" }
            }
          >
            {round}
          </button>
        ))}
      </div>

      {/* グリッド */}
      <div className="px-4 pb-8 grid grid-cols-2 gap-3 mt-2">
        {filtered.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="relative aspect-square rounded-xl overflow-hidden shadow-sm touch-active text-left"
          >
            {/* グラデーションプレースホルダー */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${item.color} 0%, ${item.color}99 50%, #0c1e42 100%)`,
              }}
            />
            {/* イニシャル */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white/20 font-black text-5xl select-none">
                {getInitials(item.caption)}
              </span>
            </div>
            {/* オーバーレイ + キャプション */}
            <div className="absolute bottom-0 left-0 right-0 px-2.5 pb-2.5 pt-6"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)" }}
            >
              <p className="text-white text-[11px] font-semibold leading-snug line-clamp-2">
                {item.caption}
              </p>
              <p className="text-white/50 text-[10px] mt-0.5">{item.round} · {item.league}</p>
            </div>
          </button>
        ))}
      </div>

      {/* モーダル */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-5"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 大きいプレースホルダー */}
            <div
              className="relative aspect-square"
              style={{
                background: `linear-gradient(135deg, ${selectedItem.color} 0%, ${selectedItem.color}99 50%, #0c1e42 100%)`,
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white/20 font-black text-8xl select-none">
                  {getInitials(selectedItem.caption)}
                </span>
              </div>
            </div>
            {/* 情報エリア */}
            <div className="bg-white px-5 py-4">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                  style={{ background: "#f1f5f9", color: "#0c1e42" }}
                >
                  {selectedItem.round}
                </span>
                <span className="text-xs text-slate-400">{selectedItem.league}</span>
              </div>
              <p className="text-sm font-semibold text-slate-900 leading-snug">
                {selectedItem.caption}
              </p>
              <p className="text-xs text-slate-400 mt-1">{selectedItem.date}</p>
            </div>
            {/* 閉じるボタン */}
            <button
              onClick={() => setSelectedItem(null)}
              className="w-full py-3 bg-slate-100 text-slate-600 text-sm font-semibold"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface FeaturedPlayer {
  id: string;
  imageUrl: string;
  playerName: string;
  teamName: string;
}

interface Props {
  players: FeaturedPlayer[];
}

const PER_PAGE = 4;

export default function FeaturedPlayers({ players }: Props) {
  const pages = Math.ceil(players.length / PER_PAGE);
  const [page, setPage] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback(
    (idx: number) => setPage(((idx % pages) + pages) % pages),
    [pages],
  );

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (pages <= 1) return;
    timerRef.current = setTimeout(() => setPage((p) => (p + 1) % pages), 4500);
  }, [pages]);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [page, resetTimer]);

  if (players.length === 0) return null;

  // 全ページ分のスライスを作成
  const pageSlices = Array.from({ length: pages }, (_, i) =>
    players.slice(i * PER_PAGE, i * PER_PAGE + PER_PAGE),
  );

  // translateX の % はフレックスコンテナ幅(pages倍)が基準なので pages で割る
  const shift = page * (100 / pages);
  const translateX = dragging
    ? `calc(-${shift}% + ${dragOffset}px)`
    : `-${shift}%`;

  return (
    <section className="animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <svg
            className="w-4 h-4 flex-shrink-0 text-amber-500"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
          次回の出場選手
        </h2>
      </div>

      {/* スライダー外枠 */}
      <div
        ref={containerRef}
        className="overflow-hidden"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX;
          setDragging(true);
          setDragOffset(0);
        }}
        onTouchMove={(e) => {
          const dx = e.touches[0].clientX - touchStartX.current;
          setDragOffset(dx);
        }}
        onTouchEnd={(e) => {
          const dx = e.changedTouches[0].clientX - touchStartX.current;
          setDragging(false);
          setDragOffset(0);
          if (Math.abs(dx) > 40) {
            goTo(page + (dx < 0 ? 1 : -1));
            resetTimer();
          }
        }}
      >
        {/* 全ページを横並びに配置 */}
        <div
          className="flex"
          style={{
            transform: `translateX(${translateX})`,
            transition: dragging
              ? "none"
              : "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            width: `${pages * 100}%`,
          }}
        >
          {pageSlices.map((slice, pi) => (
            <div
              key={pi}
              className="grid grid-cols-2 gap-2.5 flex-shrink-0"
              style={{ width: `${100 / pages}%` }}
            >
              {slice.map((player) => (
                <div
                  key={player.id}
                  className="relative rounded-2xl overflow-hidden bg-slate-200"
                  style={{ aspectRatio: "3/4" }}
                >
                  <img
                    src={player.imageUrl}
                    alt={player.playerName}
                    className="w-full h-full object-cover"
                  />
                  <div
                    className="absolute bottom-0 left-0 right-0 px-2.5 pt-6 pb-2.5"
                    style={{
                      background:
                        "linear-gradient(transparent, rgba(0,0,0,0.25) 20%, rgba(0,0,0,0.72) 100%)",
                    }}
                  >
                    {player.teamName && (
                      <p
                        className="text-[9px] font-black uppercase tracking-widest leading-none mb-0.5"
                        style={{ color: "#e3c060" }}
                      >
                        {player.teamName}
                      </p>
                    )}
                    <p className="text-sm font-black text-white leading-tight">
                      {player.playerName}
                    </p>
                  </div>
                </div>
              ))}
              {/* 空きスロット埋め（奇数枚時） */}
              {slice.length % 2 !== 0 && (
                <div
                  className="rounded-2xl bg-slate-100"
                  style={{ aspectRatio: "3/4" }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ページインジケーター */}
      {pages > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {Array.from({ length: pages }).map((_, i) => (
            <button
              key={i}
              onClick={() => {
                goTo(i);
                resetTimer();
              }}
              className="transition-all duration-300 rounded-full"
              style={{
                width: i === page ? 20 : 7,
                height: 7,
                background: i === page ? "#0c1e42" : "#cbd5e1",
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}

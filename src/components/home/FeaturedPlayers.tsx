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

const PER_PAGE = 2;

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
    <section className="section-rule animate-fade-in">
      <div className="section-head">
        <h2 className="section-title">次回の出場選手</h2>
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
              className="grid grid-cols-2 gap-3 flex-shrink-0"
              style={{ width: `${100 / pages}%` }}
            >
              {slice.map((player) => (
                <figure key={player.id} className="min-w-0">
                  <div
                    className="relative overflow-hidden bg-ink/10"
                    style={{ aspectRatio: "3/4" }}
                  >
                    <img
                      src={player.imageUrl}
                      alt={player.playerName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <figcaption className="mt-2">
                    <p className="text-sm font-black text-ink leading-tight truncate">
                      {player.playerName}
                    </p>
                    {player.teamName && (
                      <p className="mt-0.5 text-[11px] text-ink/70 truncate">
                        {player.teamName}
                      </p>
                    )}
                  </figcaption>
                </figure>
              ))}
              {/* 空きスロット埋め（奇数枚時） */}
              {slice.length % 2 !== 0 && (
                <div
                  className="bg-ink/5"
                  style={{ aspectRatio: "3/4" }}
                  aria-hidden="true"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ページ送り */}
      {pages > 1 && (
        <div className="flex gap-1 mt-2">
          {Array.from({ length: pages }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                goTo(i);
                resetTimer();
              }}
              aria-label={`${i + 1}ページ目を表示`}
              aria-current={i === page ? "true" : undefined}
              className="py-2"
            >
              <span
                className={`block h-1 w-6 transition-colors duration-300 ${
                  i === page ? "bg-ink" : "bg-ink/20"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

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

export default function FeaturedPlayers({ players }: Props) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartX = useRef(0);

  const goTo = useCallback(
    (idx: number) => {
      setCurrent(((idx % players.length) + players.length) % players.length);
    },
    [players.length],
  );

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setCurrent((c) => (c + 1) % players.length);
    }, 4000);
  }, [players.length]);

  useEffect(() => {
    if (players.length <= 1) return;
    resetTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [current, players.length, resetTimer]);

  if (players.length === 0) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) {
      goTo(current + (dx < 0 ? 1 : -1));
      resetTimer();
    }
  };

  const player = players[current];

  return (
    <section className="animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
          注目選手
        </h2>
        {players.length > 1 && (
          <div className="flex gap-1.5">
            {players.map((_, i) => (
              <button
                key={i}
                onClick={() => { goTo(i); resetTimer(); }}
                className="transition-all duration-300"
                style={{
                  width: i === current ? 16 : 6,
                  height: 6,
                  borderRadius: 3,
                  background: i === current ? "#c9921e" : "#cbd5e1",
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div
        className="relative rounded-2xl overflow-hidden select-none cursor-pointer"
        style={{ aspectRatio: "3/4", maxHeight: 420 }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* 画像 */}
        {players.map((p, i) => (
          <img
            key={p.id}
            src={p.imageUrl}
            alt={p.playerName}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
            style={{ opacity: i === current ? 1 : 0 }}
          />
        ))}

        {/* ボトムグラデーション＋テキスト */}
        <div
          className="absolute bottom-0 left-0 right-0 p-5"
          style={{
            background:
              "linear-gradient(transparent 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.75) 100%)",
          }}
        >
          {player.teamName && (
            <p
              className="text-sm font-bold uppercase tracking-widest mb-1"
              style={{ color: "#e3c060" }}
            >
              {player.teamName}
            </p>
          )}
          <p className="text-2xl font-black text-white tracking-wide">
            {player.playerName}
          </p>
        </div>

        {/* 前後矢印（2枚以上の時） */}
        {players.length > 1 && (
          <>
            <button
              onClick={() => { goTo(current - 1); resetTimer(); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors"
              style={{ background: "rgba(0,0,0,0.35)" }}
            >‹</button>
            <button
              onClick={() => { goTo(current + 1); resetTimer(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors"
              style={{ background: "rgba(0,0,0,0.35)" }}
            >›</button>
          </>
        )}
      </div>
    </section>
  );
}

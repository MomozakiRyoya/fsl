"use client";

import { useRef, useEffect } from "react";

export default function AutoScroll({
  children,
  className = "",
  speed = 40, // px/sec
  startOffset = 0, // 0〜1: 開始位置（コンテンツ幅の割合）
}: {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  startOffset?: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(0);
  const rafRef = useRef<number>(0);
  const pausedRef = useRef(false);
  const dragRef = useRef<{ x: number; startPos: number } | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const half = track.scrollWidth / 2;
    posRef.current = half * Math.max(0, Math.min(1, startOffset));

    const tick = () => {
      if (!dragRef.current && !pausedRef.current) {
        posRef.current += speed / 60;
        if (posRef.current >= half) posRef.current -= half;
        track.style.transform = `translateX(-${posRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    // --- Touch drag ---
    const onTouchStart = (e: TouchEvent) => {
      pausedRef.current = true;
      dragRef.current = { x: e.touches[0].clientX, startPos: posRef.current };
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!dragRef.current) return;
      const delta = dragRef.current.x - e.touches[0].clientX;
      let newPos = dragRef.current.startPos + delta;
      if (newPos < 0) newPos += half;
      if (newPos >= half) newPos -= half;
      posRef.current = newPos;
      track.style.transform = `translateX(-${posRef.current}px)`;
    };

    const onTouchEnd = () => {
      dragRef.current = null;
      pausedRef.current = false;
    };

    // --- Mouse drag ---
    const onMouseDown = (e: MouseEvent) => {
      pausedRef.current = true;
      dragRef.current = { x: e.clientX, startPos: posRef.current };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const delta = dragRef.current.x - e.clientX;
      let newPos = dragRef.current.startPos + delta;
      if (newPos < 0) newPos += half;
      if (newPos >= half) newPos -= half;
      posRef.current = newPos;
      track.style.transform = `translateX(-${posRef.current}px)`;
    };

    const onMouseUp = () => {
      if (!dragRef.current) return;
      dragRef.current = null;
      pausedRef.current = false;
    };

    track.addEventListener("touchstart", onTouchStart, { passive: true });
    track.addEventListener("touchmove", onTouchMove, { passive: true });
    track.addEventListener("touchend", onTouchEnd, { passive: true });
    track.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      cancelAnimationFrame(rafRef.current);
      track.removeEventListener("touchstart", onTouchStart);
      track.removeEventListener("touchmove", onTouchMove);
      track.removeEventListener("touchend", onTouchEnd);
      track.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [speed, startOffset]);

  return (
    <div className={`overflow-hidden ${className}`}>
      <div
        ref={trackRef}
        className="flex gap-3 w-max will-change-transform cursor-grab active:cursor-grabbing select-none"
      >
        {children}
        {/* 無限ループ用コピー */}
        {children}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { digitCount, odometerSlots } from "./odometer";

/**
 * 0 から value まで数え上げる数字。桁ごとの帯が回って次の数字へ送られる
 * （SwiftPieces の Odometer）。読み上げには最後の数字だけを渡し、
 * 動きを減らす設定では回さずに最後の数字を出す。見た目は globals.css の .odometer*。
 */

function prefersReducedMotion(): boolean {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export default function CountUp({
  value,
  duration = 1200,
  className = "",
}: {
  value: number;
  duration?: number;
  className?: string;
}) {
  const target = Math.round(value);
  const size = Math.abs(target);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (size === 0 || prefersReducedMotion()) {
      setDisplay(size);
      return;
    }
    let start: number | null = null;
    let frame = 0;
    const animate = (ts: number) => {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplay(eased * size);
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [size, duration]);

  const slots = odometerSlots(display, digitCount(size));

  return (
    <span
      className={`odometer ${className}`}
      data-rolling={display > 0 && display < size ? "" : undefined}
    >
      <span className="sr-only">{target}</span>
      <span aria-hidden="true">
        {target < 0 && "-"}
        {slots.map((slot, i) => (
          <span key={i} className="odometer-slot">
            <span className="odometer-ghost">0</span>
            <span
              className="odometer-reel"
              style={{ transform: `translateY(${-slot.offset * 50}%)` }}
            >
              <span>{slot.digit || " "}</span>
              <span>{slot.next}</span>
            </span>
          </span>
        ))}
      </span>
    </span>
  );
}

"use client";

import type { ReactNode } from "react";
import { useLayoutEffect, useRef } from "react";
import { fadeOf, railScrollTarget } from "./glide";

/**
 * 選択の印が 1 枚だけあり、選んだ項目の下へ滑っていく切り替え（SwiftPieces の GlideTabs）。
 *  - track: 白い板の中を金の明るい面が滑る。2〜3 択の切り替え向け
 *  - rail: 横に流れるチップの下を紺の面が滑る。選んだチップは中央へ寄せ、溢れている側の端だけ薄くする
 * 選択中は aria-pressed で伝える。見た目は globals.css の .glide-*。
 */

export type GlideOption = {
  key: string;
  label: ReactNode;
  /** label が文字だけでないときの読み上げ名 */
  ariaLabel?: string;
};

type Props = {
  options: readonly GlideOption[];
  value: string;
  onChange: (key: string) => void;
  variant?: "track" | "rail";
  ariaLabel: string;
  className?: string;
};

function prefersReducedMotion(): boolean {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function syncFade(group: HTMLElement) {
  const fade = fadeOf(group.scrollLeft, group.scrollWidth, group.clientWidth);
  if (fade) group.dataset.fade = fade;
  else delete group.dataset.fade;
}

/** 選んだ項目の位置と幅を印に写す。scroll を渡したときだけレールを動かす。 */
function place(
  group: HTMLElement,
  indicator: HTMLElement,
  rail: boolean,
  scroll: ScrollBehavior | null,
) {
  const selected = group.querySelector<HTMLElement>('[aria-pressed="true"]');
  indicator.style.visibility = selected ? "" : "hidden";
  if (selected) {
    indicator.style.transform = `translateX(${selected.offsetLeft}px)`;
    indicator.style.width = `${selected.offsetWidth}px`;
  }
  if (!rail) return;
  if (selected && scroll) {
    group.scrollTo({
      left: railScrollTarget(
        selected.offsetLeft,
        selected.offsetWidth,
        group.clientWidth,
        group.scrollWidth,
      ),
      behavior: scroll,
    });
  }
  syncFade(group);
}

export default function GlideTabs({
  options,
  value,
  onChange,
  variant = "track",
  ariaLabel,
  className = "",
}: Props) {
  const groupRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const rail = variant === "rail";
  const keys = options.map((option) => option.key).join("\n");

  // 選択が変わったら、描画の前に印を合わせる。最初の 1 回は滑らせずにその場へ置く
  useLayoutEffect(() => {
    const group = groupRef.current;
    const indicator = indicatorRef.current;
    if (!group || !indicator) return;
    const first = !indicator.hasAttribute("data-ready");
    place(
      group,
      indicator,
      rail,
      first || prefersReducedMotion() ? "auto" : "smooth",
    );
    if (!first) return;
    const frame = requestAnimationFrame(() =>
      indicator.setAttribute("data-ready", ""),
    );
    return () => cancelAnimationFrame(frame);
  }, [value, rail]);

  // 文字の読み込みや画面幅の変化で項目の幅が変わったら、印だけを合わせ直す
  useLayoutEffect(() => {
    const group = groupRef.current;
    const indicator = indicatorRef.current;
    if (!group || !indicator || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() =>
      place(group, indicator, rail, null),
    );
    observer.observe(group);
    for (const button of group.querySelectorAll("button"))
      observer.observe(button);
    return () => observer.disconnect();
  }, [rail, keys]);

  return (
    <div
      ref={groupRef}
      role="group"
      aria-label={ariaLabel}
      onScroll={rail ? (event) => syncFade(event.currentTarget) : undefined}
      className={
        rail
          ? `glide-rail relative flex gap-1.5 overflow-x-auto scroll-x-hidden ${className}`
          : `glide-track relative flex rounded-full p-1 ${className}`
      }
    >
      <span
        ref={indicatorRef}
        aria-hidden="true"
        className={`glide-indicator ${rail ? "glide-indicator--rail" : "glide-indicator--track"}`}
      />
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          aria-pressed={option.key === value}
          aria-label={option.ariaLabel}
          onClick={() => onChange(option.key)}
          className={`${rail ? "glide-chip flex-none px-3.5 py-1.5" : "glide-option flex-1 px-3 py-2"} touch-active relative z-10 inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full text-xs font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

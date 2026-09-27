"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { isCurrentTab, originOf, travelOf, type TabMove } from "./tabbar";

const NAV_ITEMS = [
  {
    href: "/",
    label: "ホーム",
    icon: (active: boolean) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke={active ? "none" : "currentColor"}
        strokeWidth={1.8}
        className="w-[22px] h-[22px]"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
        />
      </svg>
    ),
  },
  {
    href: "/standings",
    label: "順位",
    icon: (active: boolean) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke={active ? "none" : "currentColor"}
        strokeWidth={1.8}
        className="w-[22px] h-[22px]"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
        />
      </svg>
    ),
  },
  {
    href: "/teams",
    label: "チーム",
    icon: (active: boolean) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke={active ? "none" : "currentColor"}
        strokeWidth={1.8}
        className="w-[22px] h-[22px]"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
        />
      </svg>
    ),
  },
  {
    href: "/schedule",
    label: "日程",
    icon: (active: boolean) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke={active ? "none" : "currentColor"}
        strokeWidth={1.8}
        className="w-[22px] h-[22px]"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
        />
      </svg>
    ),
  },
  {
    href: "/mypage",
    label: "マイページ",
    icon: (active: boolean) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke={active ? "none" : "currentColor"}
        strokeWidth={1.8}
        className="w-[22px] h-[22px]"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
        />
      </svg>
    ),
  },
];

// 最後に居たタブ。部品が作り直されても、次の移動の出発点に使う。
// 書くのは画面の上（useEffect）だけなので、サーバーでは常に null のまま。
let lastTabIndex: number | null = null;

/**
 * スマホの下部タブバー。見た目（浮いたガラスの板・金の縁・現在地の面の動き）は
 * globals.css の .fsl-tabbar 以下が持つ。ガラスをここにインラインで書くと、
 * ガラスが効かない環境と「透明度を下げる」の受け皿が上書きできなくなる。
 */
export default function BottomNav() {
  const pathname = usePathname();
  const activeIndex = NAV_ITEMS.findIndex((item) =>
    isCurrentTab(pathname, item.href),
  );

  // 直前に描いた位置を覚えておき、タブが変わった回の描画で出発点に回す。
  // 描画中に state を更新するのは、前回の描画の値を持ち越す React の定石
  // （同じ部品の中なら、画面に出る前にやり直しの描画が 1 回入るだけ）。
  const [move, setMove] = useState<TabMove>(() => ({
    to: activeIndex,
    from: lastTabIndex,
  }));
  const fromIndex = originOf(move, activeIndex);
  if (move.to !== activeIndex) {
    setMove({ to: activeIndex, from: fromIndex });
  }

  useEffect(() => {
    if (activeIndex >= 0) {
      lastTabIndex = activeIndex;
    }
  }, [activeIndex]);

  // フックはすべてこれより上に置く（ログイン画面でも呼ぶ回数を変えない）。
  if (pathname.startsWith("/auth/")) return null;

  const travel = travelOf(fromIndex, activeIndex);

  return (
    <nav
      aria-label="メインナビゲーション"
      className="lg:hidden fsl-tabbar z-50"
    >
      <div className="fsl-tabbar-panel mx-auto max-w-lg">
        {/* 現在地の面は 1 枚だけ。key でタブが変わるたびに作り直し、
            動きを頭から流す。タブに属さない画面（ニュースなど）では出さない。 */}
        {activeIndex >= 0 ? (
          <span
            key={activeIndex}
            className="fsl-tabbar-indicator"
            data-dir={travel?.dir}
            style={
              {
                "--fsl-tab-index": activeIndex,
                "--fsl-tab-from": travel?.from ?? activeIndex,
                "--fsl-tab-stretch": travel?.stretch ?? 1,
              } as CSSProperties
            }
            aria-hidden="true"
          />
        ) : null}
        <ul className="grid grid-cols-5">
          {NAV_ITEMS.map((item, index) => {
            const active = index === activeIndex;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="fsl-tabbar-link"
                  aria-current={active ? "page" : undefined}
                >
                  {item.icon(active)}
                  <span className="fsl-tabbar-label">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

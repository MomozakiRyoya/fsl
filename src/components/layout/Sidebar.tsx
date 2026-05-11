"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import DarkModeToggle from "./DarkModeToggle";

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
        className="w-5 h-5 flex-shrink-0"
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
    href: "/search",
    label: "検索",
    icon: (active: boolean) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke={active ? "none" : "currentColor"}
        strokeWidth={1.8}
        className="w-5 h-5 flex-shrink-0"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
        />
      </svg>
    ),
  },
  {
    href: "/standings",
    label: "順位表",
    icon: (active: boolean) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke={active ? "none" : "currentColor"}
        strokeWidth={1.8}
        className="w-5 h-5 flex-shrink-0"
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
        className="w-5 h-5 flex-shrink-0"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
        />
      </svg>
    ),
  },
];

const EXTRA_NAV_ITEMS = [
  {
    href: "/compare",
    label: "比較",
    icon: (active: boolean) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke={active ? "none" : "currentColor"}
        strokeWidth={1.8}
        className="w-5 h-5 flex-shrink-0"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
        />
      </svg>
    ),
  },
  {
    href: "/fan-ranking",
    label: "ランキング",
    icon: (active: boolean) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke={active ? "none" : "currentColor"}
        strokeWidth={1.8}
        className="w-5 h-5 flex-shrink-0"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0"
        />
      </svg>
    ),
  },
  {
    href: "/account",
    label: "設定",
    icon: (active: boolean) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke={active ? "none" : "currentColor"}
        strokeWidth={1.8}
        className="w-5 h-5 flex-shrink-0"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  if (pathname.startsWith("/auth/")) return null;

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <aside
      className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-56 z-40"
      style={{
        background: "rgba(10, 15, 35, 0.97)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* ロゴ */}
      <div className="px-4 py-5 flex items-center gap-2">
        <span
          className="text-xl font-black tracking-widest"
          style={{ color: "#e3c060" }}
        >
          FSL
        </span>
        <span
          className="text-xs font-medium leading-tight"
          style={{ color: "rgba(255,255,255,0.38)" }}
        >
          Fukuoka
          <br />
          Super League
        </span>
      </div>

      {/* メインナビ */}
      <nav
        aria-label="メインナビゲーション"
        className="px-3 flex flex-col gap-0.5"
      >
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-150 relative"
              style={{
                color: active ? "#e3c060" : "rgba(255,255,255,0.6)",
                background: active ? "rgba(201,146,30,0.1)" : "transparent",
              }}
              aria-current={active ? "page" : undefined}
            >
              {/* ライブバッジ */}
              {item.href === "/live" ? (
                <span className="relative">
                  {item.icon(active)}
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                </span>
              ) : (
                item.icon(active)
              )}
              <span
                className="text-sm"
                style={{ fontWeight: active ? 700 : 500 }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* 区切り線 */}
      <div
        className="mx-4 my-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      />

      {/* 追加ナビ */}
      <nav
        aria-label="サブナビゲーション"
        className="px-3 flex flex-col gap-0.5"
      >
        {EXTRA_NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-150"
              style={{
                color: active ? "#e3c060" : "rgba(255,255,255,0.6)",
                background: active ? "rgba(201,146,30,0.1)" : "transparent",
              }}
              aria-current={active ? "page" : undefined}
            >
              {item.icon(active)}
              <span
                className="text-sm"
                style={{ fontWeight: active ? 700 : 500 }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* フッター（ダークモードトグル + バージョン） */}
      <div
        className="mt-auto px-4 py-4"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
            v1.0.0
          </span>
          <DarkModeToggle sidebarMode />
        </div>
      </div>
    </aside>
  );
}

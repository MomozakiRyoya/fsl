"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TopBar() {
  const pathname = usePathname();
  if (pathname.startsWith("/auth/") || pathname === "/chat") return null;

  return (
    <header
      className="lg:hidden fixed top-0 left-0 right-0 z-40 h-11 flex items-center justify-between px-4"
      style={{
        background: "rgba(10,15,35,0.72)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      {/* ロゴ */}
      <Link href="/" className="flex items-center gap-1.5">
        <span
          className="text-xs font-black px-1.5 py-0.5 rounded"
          style={{ background: "linear-gradient(135deg,#c9921e,#e3c060)", color: "#0c1e42" }}
        >
          FSL
        </span>
        <span className="text-[11px] font-semibold text-white/50 tracking-wide">
          Fukuoka Super League
        </span>
      </Link>

      {/* プロフィールアイコン */}
      <Link
        href="/account"
        aria-label="プロフィール設定"
        className="w-8 h-8 rounded-full flex items-center justify-center active:opacity-70 transition-opacity"
        style={{ background: "rgba(255,255,255,0.1)" }}
      >
        <svg
          className="w-4 h-4 text-white/70"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
          />
        </svg>
      </Link>
    </header>
  );
}

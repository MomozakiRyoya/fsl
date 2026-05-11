"use client";

import { useEffect, useState } from "react";

interface DarkModeToggleProps {
  /** サイドバー内に配置する場合は true（fixed 位置指定を外す） */
  sidebarMode?: boolean;
}

export default function DarkModeToggle({
  sidebarMode = false,
}: DarkModeToggleProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("fsl-theme");
    if (saved === "dark") {
      setIsDark(true);
    }
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("fsl-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("fsl-theme", "light");
    }
  };

  return (
    <button
      onClick={toggle}
      className={`${sidebarMode ? "" : "fixed top-3 right-3 z-50 lg:hidden"} w-9 h-9 rounded-full flex items-center justify-center transition-opacity active:opacity-70`}
      style={{
        background: isDark ? "rgba(255,255,255,0.12)" : "rgba(12,30,66,0.08)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: isDark
          ? "1px solid rgba(255,255,255,0.15)"
          : "1px solid rgba(12,30,66,0.1)",
      }}
      aria-label={
        isDark ? "ライトモードに切り替える" : "ダークモードに切り替える"
      }
    >
      {isDark ? (
        /* 太陽アイコン（ライトに戻す） */
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          style={{ color: "#e3c060" }}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        /* 月アイコン（ダークに切り替え） */
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          style={{ color: "#0c1e42" }}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  );
}

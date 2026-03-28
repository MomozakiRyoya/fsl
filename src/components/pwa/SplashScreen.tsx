"use client";

import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const shown = sessionStorage.getItem("fsl-splash-shown");
    if (shown) {
      setVisible(false);
      return;
    }

    const fadeTimer = setTimeout(() => setFadeOut(true), 2000);
    const hideTimer = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem("fsl-splash-shown", "1");
    }, 2600);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-600 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* ネイビー背景 */}
      <div className="absolute inset-0" style={{ background: "#0c1e42" }} />

      {/* fsl-logo.jpg を全体表示（contain で全部見える） */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url(/fsl-logo.jpg)",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          opacity: 0.18,
        }}
      />

      {/* 暗めオーバーレイ */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(12,30,66,0.55)" }}
      />

      {/* コンテンツ */}
      <div className="relative flex flex-col items-center gap-6 animate-splash-logo">
        {/* ロゴ: fsl-logo.jpg の右半分（青いFSLロゴ）を表示 */}
        <div
          className="w-24 h-24 rounded-2xl shadow-2xl overflow-hidden"
          style={{
            backgroundImage: "url(/fsl-logo.jpg)",
            backgroundSize: "220% auto",
            backgroundPosition: "100% 0%",
          }}
        />

        <div className="text-center">
          <p className="text-white/60 text-[10px] tracking-[0.4em] uppercase mb-1">
            Fukuoka
          </p>
          <h1 className="text-white text-2xl font-bold tracking-widest leading-tight drop-shadow-lg">
            SUPER LEAGUE
          </h1>
          <p
            className="text-sm font-semibold tracking-[0.3em] mt-1.5"
            style={{ color: "#e3c060" }}
          >
            Season 1
          </p>
        </div>

        {/* ローディングドット */}
        <div className="flex items-center gap-2 mt-1">
          <span
            className="w-2 h-2 rounded-full animate-loading-dot"
            style={{ background: "#e3c060" }}
          />
          <span
            className="w-2 h-2 rounded-full animate-loading-dot animation-delay-200"
            style={{ background: "#e3c060" }}
          />
          <span
            className="w-2 h-2 rounded-full animate-loading-dot animation-delay-400"
            style={{ background: "#e3c060" }}
          />
        </div>
      </div>

      {/* タグライン */}
      <p className="absolute bottom-16 text-white/40 text-xs tracking-[0.3em] animate-fade-in animation-delay-700">
        すべてを、背負え。
      </p>
    </div>
  );
}

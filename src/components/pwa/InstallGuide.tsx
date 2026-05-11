"use client";

import { useEffect, useState } from "react";

type Platform = "ios" | "android" | "other";

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "other";
}

function isStandalone(): boolean {
  return window.matchMedia("(display-mode: standalone)").matches;
}

export default function InstallGuide() {
  const [visible, setVisible] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [platform, setPlatform] = useState<Platform>("other");

  useEffect(() => {
    // PWAとして既にインストール済みなら表示しない
    if (isStandalone()) return;

    // 1セッション1回のみ
    const shown = sessionStorage.getItem("fsl-install-shown");
    if (shown) return;

    const p = detectPlatform();
    // iOS / Android 以外は表示不要
    if (p === "other") return;

    setPlatform(p);

    // 3秒後に表示
    const showTimer = setTimeout(() => {
      setVisible(true);
      // 次フレームでアニメーション開始
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimateIn(true));
      });
    }, 3000);

    return () => clearTimeout(showTimer);
  }, []);

  function handleClose() {
    setAnimateIn(false);
    setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem("fsl-install-shown", "1");
    }, 300);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9998]"
      style={{ maxWidth: 512, margin: "0 auto" }}
    >
      <div
        className="transition-transform duration-300 ease-out"
        style={{ transform: animateIn ? "translateY(0)" : "translateY(100%)" }}
      >
        <div className="bg-white rounded-t-3xl shadow-2xl border-t border-slate-100 px-6 pt-5 pb-8">
          {/* ドラッグハンドル */}
          <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4" />

          {/* タイトル */}
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900">
              アプリとして使おう 📱
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              ホーム画面に追加するともっと便利！
            </p>
          </div>

          {/* 手順 */}
          {platform === "ios" ? (
            <ol className="space-y-2.5 mb-6">
              <li className="flex items-start gap-3">
                <span
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: "#0c1e42" }}
                >
                  1
                </span>
                <p className="text-sm text-slate-700 leading-snug pt-0.5">
                  Safariの共有ボタン（□↑）をタップ
                </p>
              </li>
              <li className="flex items-start gap-3">
                <span
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: "#0c1e42" }}
                >
                  2
                </span>
                <p className="text-sm text-slate-700 leading-snug pt-0.5">
                  「ホーム画面に追加」を選択
                </p>
              </li>
              <li className="flex items-start gap-3">
                <span
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: "#0c1e42" }}
                >
                  3
                </span>
                <p className="text-sm text-slate-700 leading-snug pt-0.5">
                  追加ボタンをタップ
                </p>
              </li>
            </ol>
          ) : (
            <ol className="space-y-2.5 mb-6">
              <li className="flex items-start gap-3">
                <span
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: "#0c1e42" }}
                >
                  1
                </span>
                <p className="text-sm text-slate-700 leading-snug pt-0.5">
                  Chromeのメニュー（⋮）をタップ
                </p>
              </li>
              <li className="flex items-start gap-3">
                <span
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: "#0c1e42" }}
                >
                  2
                </span>
                <p className="text-sm text-slate-700 leading-snug pt-0.5">
                  「ホーム画面に追加」を選択
                </p>
              </li>
            </ol>
          )}

          {/* ボタン */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="flex-1 h-11 text-sm font-medium text-slate-500 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              閉じる
            </button>
            <button
              onClick={handleClose}
              className="flex-1 h-11 text-sm font-bold rounded-xl transition-colors"
              style={{
                background: "linear-gradient(135deg, #c9921e, #e3c060)",
                color: "#0c1e42",
              }}
            >
              わかった
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import AutoScroll from "@/components/ui/AutoScroll";

const SPONSORS = [
  {
    id: 0,
    name: "株式会社Reaf",
    tagline: "AI開発・コンサル事業を展開",
    color: "#0c2a1a",
    badge: "本アプリ提供会社兼スポンサー",
    description:
      "株式会社ReafはAI開発・コンサルティング事業を展開する福岡発のテクノロジー企業です。本FSLアプリの開発・提供を担っています。",
    website: null,
  },
  {
    id: 1,
    name: "福岡フットサルアカデミー",
    tagline: "次世代のフットサル選手を育てる",
    color: "#0c1e42",
    badge: "オフィシャルスポンサー",
    description:
      "福岡を拠点に次世代のフットサル選手育成に取り組むアカデミーです。FSLの公式スポンサーとして活動を支援しています。",
    website: null,
  },
  {
    id: 2,
    name: "博多スポーツクラブ",
    tagline: "地域スポーツを支える",
    color: "#1a3a7a",
    badge: "パートナー",
    description:
      "博多を中心に地域スポーツの振興に貢献するスポーツクラブです。FSLのパートナーとして地域コミュニティの発展を目指しています。",
    website: null,
  },
];

type Sponsor = (typeof SPONSORS)[number];

export default function SponsorBanner() {
  const [selected, setSelected] = useState<Sponsor | null>(null);

  return (
    <section>
      <p className="text-xs text-slate-400 font-medium tracking-wide uppercase mb-2">
        スポンサー
      </p>

      <AutoScroll className="-mx-4 px-4 pb-1" speed={17} startOffset={0.6}>
        {SPONSORS.map((sponsor) => (
          <button
            key={sponsor.id}
            onClick={() => setSelected(sponsor)}
            className="flex-none w-72 rounded-2xl overflow-hidden relative text-left active:opacity-80 transition-opacity"
            style={{
              background: `linear-gradient(135deg, ${sponsor.color} 0%, ${sponsor.color}cc 100%)`,
              minHeight: 96,
            }}
          >
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 80% 20%, #ffffff 1px, transparent 1px), radial-gradient(circle at 20% 80%, #ffffff 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
            <div className="relative p-4">
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold mb-2"
                style={{
                  background: "rgba(201,146,30,0.25)",
                  color: "#e3c060",
                  border: "1px solid rgba(201,146,30,0.4)",
                }}
              >
                {sponsor.badge}
              </span>
              <p className="text-white font-bold text-sm leading-snug mb-1">
                {sponsor.name}
              </p>
              <p className="text-white/60 text-xs leading-snug">
                {sponsor.tagline}
              </p>
            </div>
          </button>
        ))}
      </AutoScroll>

      {/* 詳細モーダル */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-0 pb-[58px]"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-lg rounded-t-3xl p-6 pb-12"
            style={{
              background: `linear-gradient(160deg, ${selected.color}, #0c1e42)`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ハンドル */}
            <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-5" />

            <span
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold mb-3"
              style={{
                background: "rgba(201,146,30,0.25)",
                color: "#e3c060",
                border: "1px solid rgba(201,146,30,0.4)",
              }}
            >
              {selected.badge}
            </span>
            <h2 className="text-xl font-black text-white mb-2">
              {selected.name}
            </h2>
            <p className="text-white/60 text-sm leading-relaxed mb-5">
              {selected.description}
            </p>

            <button
              onClick={() => setSelected(null)}
              className="w-full py-3 rounded-xl text-sm font-semibold"
              style={{
                background: "rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.8)",
              }}
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

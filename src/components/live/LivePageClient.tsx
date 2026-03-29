"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Round, TeamStanding, League, StackEntry } from "@/lib/types/app";

type CommentaryType = "goal" | "info";

interface CommentaryItem {
  id: number;
  time: string;
  type: CommentaryType;
  text: string;
  teamId?: string;
}

const BASE_COMMENTARY: CommentaryItem[] = [
  {
    id: 1,
    time: "09:52",
    type: "goal",
    text: "🏆 BON が第5節首位確定！累計187pt でトップをキープ",
    teamId: "premier-bon",
  },
  {
    id: 2,
    time: "09:45",
    type: "goal",
    text: "🃏 TRUMP 田中選手 が最終テーブルで逆転！チームに9pt 追加",
    teamId: "premier-trump",
  },
  {
    id: 3,
    time: "09:38",
    type: "info",
    text: "📊 第5節 現在の暫定順位 → 1位: BON / 2位: TRUMP / 3位: SuperNova",
  },
  {
    id: 4,
    time: "09:30",
    type: "goal",
    text: "💥 SuperNova 山田選手 がバブルを突破！ポイント獲得確定",
    teamId: "premier-supernova",
  },
  {
    id: 5,
    time: "09:20",
    type: "info",
    text: "🔄 KENPOKER 選手交代: 山本 OUT → 佐藤 IN（スタック温存のため）",
  },
  {
    id: 6,
    time: "09:10",
    type: "info",
    text: "📋 テーブル3 スタック状況: BON 田中 55BB / TRUMP 鈴木 32BB / SKY 高橋 18BB",
  },
  {
    id: 7,
    time: "09:00",
    type: "info",
    text: "🏁 Premier League 第5節 スタート！全6チームが出揃いました",
  },
  {
    id: 8,
    time: "08:50",
    type: "info",
    text: "📣 本日の会場: 福岡ポーカーラウンジ MEGA / 参加チーム: 6チーム・計24名",
  },
];

interface Props {
  rounds: Round[];
  standings: Record<string, TeamStanding[]>;
  leagues: League[];
  stacks: StackEntry[];
}

export default function LivePageClient({
  rounds,
  standings,
  leagues,
  stacks,
}: Props) {
  const [notifGranted, setNotifGranted] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifUnsupported, setNotifUnsupported] = useState(false);
  const [commentary, setCommentary] =
    useState<CommentaryItem[]>(BASE_COMMENTARY);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) {
      setNotifUnsupported(true);
      return;
    }
    if (Notification.permission === "granted") {
      setNotifGranted(true);
    }
  }, []);

  const requestNotification = async () => {
    if (!("Notification" in window)) return;
    setNotifLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotifGranted(true);
        new Notification("FSL 速報通知", {
          body: "試合結果の速報をお知らせします",
          icon: "/icons/icon-192.png",
        });
      }
    } finally {
      setNotifLoading(false);
    }
  };

  const handleRefreshCommentary = () => {
    if (refreshing) return;
    setRefreshing(true);
    setTimeout(() => {
      const newItem: CommentaryItem = {
        id: Date.now(),
        time: new Date().toLocaleTimeString("ja-JP", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        type: "info",
        text: "🔄 最新情報を取得しました",
      };
      setCommentary((prev) => [newItem, ...prev].slice(0, 10));
      setRefreshing(false);
    }, 600);
  };

  const nextRounds = rounds.filter((r) => r.status === "next");
  const finishedRounds = rounds
    .filter((r) => r.status === "finished" && r.leagueId === "premier")
    .slice(-3)
    .reverse();

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="relative">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="absolute inset-0 w-3 h-3 rounded-full bg-red-500 animate-ping opacity-75" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          速報
        </h1>
      </div>

      {/* 次節情報 */}
      <section className="mb-6 animate-fade-in">
        <h2 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">
          次節開催予定
        </h2>
        <div className="space-y-3">
          {nextRounds.map((round, i) => {
            const league = leagues.find((l) => l.id === round.leagueId);
            return (
              <Link
                key={round.id}
                href={`/schedule/${round.id}`}
                className="block bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md transition-all active:scale-[0.98] shadow-sm animate-slide-up overflow-hidden relative"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                  style={{
                    background: "linear-gradient(180deg, #c9921e, #e3c060)",
                  }}
                />
                <div className="pl-3">
                  <div className="flex items-center justify-between mb-2.5">
                    <span
                      className="text-xs px-2.5 py-1 rounded-xl font-bold"
                      style={{
                        background: "linear-gradient(135deg, #c9921e, #e3c060)",
                        color: "#0c1e42",
                      }}
                    >
                      NEXT
                    </span>
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                      {round.date}
                    </span>
                  </div>
                  <p className="font-bold text-slate-900 text-base">
                    {round.leagueName} {round.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500">
                    <svg
                      className="w-3.5 h-3.5 text-slate-400 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {round.venue}
                  </div>
                  {league && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <p className="text-xs text-slate-400 font-medium mb-2 uppercase tracking-wide">
                        現在の上位3チーム
                      </p>
                      <div className="flex gap-2">
                        {(standings[round.leagueId] ?? [])
                          .slice(0, 3)
                          .map((s, j) => (
                            <div
                              key={s.teamId}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium"
                              style={{
                                background:
                                  j === 0
                                    ? "rgba(201,146,30,0.12)"
                                    : "rgba(0,0,0,0.04)",
                              }}
                            >
                              <span
                                className="font-black"
                                style={{
                                  color: j === 0 ? "#c9921e" : "#94a3b8",
                                }}
                              >
                                #{j + 1}
                              </span>
                              <span className="text-slate-700 truncate max-w-[5rem]">
                                {s.teamName}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* プッシュ通知設定 */}
      <section className="mb-6 animate-fade-in animate-delay-100">
        <h2 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">
          試合速報通知
        </h2>
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          {notifUnsupported ? (
            <p className="text-sm text-slate-500">
              お使いのブラウザはプッシュ通知に対応していません
            </p>
          ) : notifGranted ? (
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(16,185,129,0.1)" }}
              >
                <svg
                  className="w-6 h-6 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-base font-bold text-slate-900">
                  通知が有効です
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  試合結果をリアルタイムでお届けします
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(201,146,30,0.1)" }}
                >
                  <svg
                    className="w-6 h-6"
                    style={{ color: "#c9921e" }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900">
                    試合速報を受け取る
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    節が終了した際に結果をプッシュ通知でお届けします
                  </p>
                </div>
              </div>
              <button
                onClick={requestNotification}
                disabled={notifLoading}
                className="w-full py-3.5 rounded-2xl text-sm font-bold transition-all active:scale-[0.97] disabled:opacity-60 shadow-sm"
                style={{
                  background: "linear-gradient(135deg, #c9921e, #e3c060)",
                  color: "#0c1e42",
                }}
              >
                {notifLoading ? "設定中..." : "通知を許可する"}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ライブフィード */}
      <section className="mb-6 animate-fade-in animate-delay-150">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            ライブフィード
          </h2>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs text-red-500 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              LIVE
            </span>
            <button
              onClick={handleRefreshCommentary}
              disabled={refreshing}
              aria-label="最新情報に更新"
              className="w-7 h-7 inline-flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              <svg
                className={`w-3.5 h-3.5 text-slate-500 ${refreshing ? "animate-spin" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {commentary.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-xl border p-3.5 flex gap-3 items-start shadow-sm ${
                item.type === "goal"
                  ? "border-amber-200 bg-amber-50"
                  : "border-slate-100"
              }`}
            >
              <span className="text-xs text-slate-400 font-mono w-10 flex-shrink-0 pt-0.5">
                {item.time}
              </span>
              <p className="text-sm text-slate-800 leading-snug">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 直近の結果 */}
      <section className="animate-fade-in animate-delay-200">
        <h2 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">
          直近の結果
        </h2>
        {stacks.length > 0 &&
          (() => {
            const maxBreak = Math.max(...stacks.map((s) => s.breakNumber));
            const latestStacks = stacks
              .filter((s) => s.breakNumber === maxBreak)
              .sort((a, b) => b.stackCount - a.stackCount);
            return (
              <section className="mb-6 animate-fade-in">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    🃏 スタックランキング
                  </h2>
                  <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
                    BREAK {maxBreak}
                  </span>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  {latestStacks.map((entry, i) => (
                    <div
                      key={`${entry.teamId}-${entry.playerName}`}
                      className="flex items-center gap-3 px-4 py-3 border-b border-slate-50 last:border-0"
                    >
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0 ${
                          i === 0
                            ? "bg-amber-400 text-white"
                            : i === 1
                              ? "bg-slate-300 text-white"
                              : i === 2
                                ? "bg-orange-400 text-white"
                                : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {entry.playerName}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {entry.teamName}
                        </p>
                      </div>
                      <span
                        className="text-sm font-bold tabular-nums"
                        style={{ color: "#0c1e42" }}
                      >
                        {entry.stackCount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            );
          })()}

        <div className="space-y-2">
          {finishedRounds.map((round, i) => (
            <Link
              key={round.id}
              href={`/schedule/${round.id}`}
              className="flex items-center gap-3 bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-sm transition-all active:scale-[0.98] shadow-sm animate-slide-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <span className="text-xs bg-slate-100 text-slate-500 px-2.5 py-1 rounded-xl font-semibold flex-shrink-0">
                終了
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900">
                  {round.leagueName} {round.name}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {round.date} @ {round.venue}
                </p>
              </div>
              <svg
                className="w-4 h-4 text-slate-300 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

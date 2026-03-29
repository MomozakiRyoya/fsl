"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { NEWS_CATEGORY_COLORS } from "@/lib/constants";
import type { Team, Player, NewsItem, NewsCategory } from "@/lib/types/app";

interface Props {
  teams: Team[];
  players: Player[];
  news: NewsItem[];
}

export default function SearchPageClient({ teams, players, news }: Props) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const q = query.trim().toLowerCase();

  const matchedTeams = q
    ? teams.filter((t) => t.name.toLowerCase().includes(q))
    : [];
  const matchedPlayers = q
    ? players.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.teamName.toLowerCase().includes(q),
      )
    : [];
  const matchedNews = q
    ? news.filter((n) => n.title.toLowerCase().includes(q))
    : [];

  const hasResults =
    matchedTeams.length > 0 ||
    matchedPlayers.length > 0 ||
    matchedNews.length > 0;

  return (
    <div className="max-w-lg mx-auto min-h-screen">
      {/* ヘッダー */}
      <div
        className="sticky top-0 z-30 px-4 pt-4 pb-3"
        style={{
          background: "rgba(10, 15, 35, 0.96)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <p className="text-white/50 text-xs font-semibold tracking-widest uppercase mb-3">
          Search
        </p>
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-800 rounded-xl pl-9 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-400/50 text-slate-100 placeholder:text-slate-500"
            placeholder="チーム・選手・ニュースを検索"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-600 flex items-center justify-center"
              aria-label="クリア"
            >
              <svg
                className="w-3 h-3 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* 結果エリア */}
      <div className="bg-white min-h-[calc(100vh-120px)]">
        {!q && (
          <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-slate-400"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </div>
            <p className="text-base font-semibold text-slate-900 mb-1">
              FSLを検索
            </p>
            <p className="text-sm text-slate-500">
              チーム・選手・ニュースを検索できます
            </p>
          </div>
        )}

        {q && !hasResults && (
          <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-slate-400"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-base font-semibold text-slate-900 mb-1">
              「{query}」の検索結果なし
            </p>
            <p className="text-sm text-slate-500">
              別のキーワードで試してみてください
            </p>
          </div>
        )}

        {q && hasResults && (
          <div className="py-2">
            {/* チーム */}
            {matchedTeams.length > 0 && (
              <section className="mb-2">
                <p className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                  チーム
                </p>
                {matchedTeams.map((team) => (
                  <Link
                    key={team.id}
                    href={`/teams/${team.slug}`}
                    className="flex items-center gap-3 px-4 py-3 border-b border-slate-50 active:bg-slate-50 transition-colors"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: team.homeColor }}
                    >
                      {team.name.slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900">
                        {team.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {team.leagueName}
                      </p>
                    </div>
                    <svg
                      className="w-4 h-4 text-slate-300 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 4.5l7.5 7.5-7.5 7.5"
                      />
                    </svg>
                  </Link>
                ))}
              </section>
            )}

            {/* 選手 */}
            {matchedPlayers.length > 0 && (
              <section className="mb-2">
                <p className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                  選手
                </p>
                {matchedPlayers.map((player) => (
                  <Link
                    key={player.id}
                    href={`/players/${player.id}`}
                    className="flex items-center gap-3 px-4 py-3 border-b border-slate-50 active:bg-slate-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500 flex-shrink-0">
                      #{player.number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900">
                        {player.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        #{player.number} · {player.teamName}
                      </p>
                    </div>
                    <svg
                      className="w-4 h-4 text-slate-300 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 4.5l7.5 7.5-7.5 7.5"
                      />
                    </svg>
                  </Link>
                ))}
              </section>
            )}

            {/* ニュース */}
            {matchedNews.length > 0 && (
              <section>
                <p className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                  ニュース
                </p>
                {matchedNews.map((item) => (
                  <Link
                    key={item.id}
                    href={`/news/${item.slug}`}
                    className="flex items-start gap-3 px-4 py-3 border-b border-slate-50 active:bg-slate-50 transition-colors"
                  >
                    <span
                      className={`pill mt-0.5 flex-shrink-0 ${NEWS_CATEGORY_COLORS[item.category as NewsCategory]}`}
                    >
                      {item.category}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2">
                        {item.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {item.publishedAt}
                      </p>
                    </div>
                    <svg
                      className="w-4 h-4 text-slate-300 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 4.5l7.5 7.5-7.5 7.5"
                      />
                    </svg>
                  </Link>
                ))}
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useFollowedTeams } from "@/hooks/useFollowedTeams";
import { NEWS_CATEGORY_COLORS } from "@/lib/constants";
import type { Team, NewsItem, NewsCategory } from "@/lib/types/app";

interface Props {
  teams: Team[];
  news: NewsItem[];
}

export default function MyNewsPageClient({ teams, news }: Props) {
  const { followedTeams, mounted } = useFollowedTeams();

  if (!mounted) {
    return (
      <div className="max-w-lg mx-auto min-h-screen bg-white">
        <div className="px-4 pt-12 pb-6">
          <p className="text-sm font-bold text-slate-700">マイチームニュース</p>
        </div>
      </div>
    );
  }

  if (followedTeams.length === 0) {
    return (
      <div className="max-w-lg mx-auto min-h-screen bg-white">
        <div
          className="px-4 pt-5 pb-4"
          style={{
            background: "rgba(10, 15, 35, 0.96)",
          }}
        >
          <p className="text-white/50 text-xs font-semibold tracking-widest uppercase mb-1">
            My News
          </p>
          <p className="text-white text-lg font-bold">マイチームニュース</p>
        </div>
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
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
          </div>
          <p className="text-base font-semibold text-slate-900 mb-2">
            チームをフォローするとここに表示されます
          </p>
          <p className="text-sm text-slate-500 mb-6">
            気になるチームをフォローして、関連ニュースをまとめてチェックしましょう
          </p>
          <Link
            href="/teams"
            className="inline-flex items-center justify-center gap-2 h-10 px-5 text-sm font-semibold rounded-xl text-white"
            style={{ background: "linear-gradient(135deg, #c9921e, #e3c060)" }}
          >
            チームを探す
            <svg
              className="w-4 h-4"
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
        </div>
      </div>
    );
  }

  // フォロー中チームの名前一覧
  const followedTeamNames = followedTeams
    .map((id) => teams.find((t) => t.id === id)?.name)
    .filter(Boolean) as string[];

  // チーム名がタイトルまたはbodyに含まれるニュースをフィルタ
  const myNews = news.filter((item) =>
    followedTeamNames.some(
      (teamName) =>
        item.title.includes(teamName) || item.body.includes(teamName),
    ),
  );

  return (
    <div className="max-w-lg mx-auto min-h-screen bg-white">
      {/* ヘッダー */}
      <div
        className="px-4 pt-5 pb-4"
        style={{
          background: "rgba(10, 15, 35, 0.96)",
        }}
      >
        <p className="text-white/50 text-xs font-semibold tracking-widest uppercase mb-1">
          My News
        </p>
        <p className="text-white text-lg font-bold">マイチームニュース</p>
        <p className="text-white/40 text-xs mt-1">
          フォロー中 {followedTeams.length}チーム
        </p>
      </div>

      {/* ニュースリスト */}
      {myNews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
          <p className="text-base font-semibold text-slate-900 mb-1">
            関連ニュースはまだありません
          </p>
          <p className="text-sm text-slate-500">
            フォロー中チームに関するニュースが公開されるとここに表示されます
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-50">
          {myNews.map((item) => (
            <Link
              key={item.id}
              href={`/news/${item.slug}`}
              className="flex items-start gap-3 px-4 py-4 active:bg-slate-50 transition-colors relative overflow-hidden"
            >
              {/* カテゴリカラー左ボーダー */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1"
                style={{
                  background:
                    item.category === "結果"
                      ? "#2255a0"
                      : item.category === "イベント"
                        ? "#c9921e"
                        : "#10b981",
                }}
              />
              <div className="flex-1 min-w-0 pl-2">
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={`pill ${NEWS_CATEGORY_COLORS[item.category as NewsCategory]}`}
                  >
                    {item.category}
                  </span>
                  <span className="text-xs text-slate-400">
                    {item.publishedAt}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2">
                  {item.title}
                </p>
              </div>
              <svg
                className="w-4 h-4 text-slate-300 flex-shrink-0 mt-1"
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
        </div>
      )}
    </div>
  );
}

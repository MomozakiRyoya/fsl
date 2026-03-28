import Link from "next/link";
import Image from "next/image";
import {
  MOCK_NEWS,
  MOCK_LEAGUES,
  MOCK_STANDINGS,
  MOCK_ROUNDS,
} from "@/lib/mock-data";
import { NEWS_CATEGORY_COLORS } from "@/lib/constants";
import type { NewsCategory } from "@/lib/types/app";
import MyTeamsSection from "@/components/home/MyTeamsSection";
import WinnerVote from "@/components/home/WinnerVote";

// const data = await getActiveSeason()
// const leagues = await getLeagues(season.id)
// const news = await getLatestNews(6)

export const revalidate = 300;

function getInitials(name: string): string {
  const chars = name.replace(/[aeiou\s]/gi, "");
  return chars.slice(0, 2).toUpperCase();
}

export default function HomePage() {
  const news = MOCK_NEWS;
  const leagues = MOCK_LEAGUES;
  const nextRound = MOCK_ROUNDS.find(
    (r) => r.status === "next" && r.leagueId === "div1",
  );

  // 各リーグの首位チーム
  const leaderboard = leagues.map((league) => {
    const standings = MOCK_STANDINGS[league.id];
    const leader = standings?.[0];
    return { league, leader };
  });

  return (
    <div className="max-w-lg mx-auto">
      {/* ヒーローセクション */}
      <section
        className="relative overflow-hidden animate-fade-in"
        style={{ minHeight: 280 }}
      >
        {/* Season 7 バナー背景 */}
        <div className="absolute inset-0">
          <Image
            src="/fsl-season7.jpg"
            alt="FSL Season 7"
            fill
            className="object-cover object-center"
            priority
          />
          {/* 没入感のあるグラデーションオーバーレイ */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/80" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c1e42]/60 via-transparent to-transparent" />
        </div>

        {/* コンテンツ */}
        <div className="relative px-6 pt-12 pb-10 text-center text-white">
          <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold mb-3 border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            Season 7 開催中
          </div>
          <h1 className="text-3xl font-black tracking-wide mb-0.5 drop-shadow-lg">
            FUKUOKA
          </h1>
          <h1 className="text-3xl font-black tracking-wide mb-2 drop-shadow-lg">
            SUPER LEAGUE
          </h1>
          <p className="text-white/60 text-xs tracking-[0.2em] mb-6 uppercase">
            すべてを、背負え。
          </p>

          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <p className="stat-number text-white">48</p>
              <p className="text-white/50 text-[11px] tracking-wide mt-1">
                チーム
              </p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <p className="stat-number text-white">6</p>
              <p className="text-white/50 text-[11px] tracking-wide mt-1">
                ディビジョン
              </p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <p className="stat-number text-white">22</p>
              <p className="text-white/50 text-[11px] tracking-wide mt-1">節</p>
            </div>
          </div>
        </div>
      </section>

      <div className="px-4 py-6 space-y-8">
        {/* マイチーム */}
        <MyTeamsSection />

        {/* 優勝予想投票 */}
        <WinnerVote />

        {/* 次節情報 */}
        {nextRound && (
          <section className="animate-spring-in animate-delay-100">
            <p className="section-title mb-3">次節情報</p>
            <div className="card-native p-4">
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-sm font-semibold"
                  style={{ color: "#0c1e42" }}
                >
                  Division 1 — {nextRound.name}
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-bold"
                  style={{
                    background: "linear-gradient(135deg, #c9921e, #e3c060)",
                    color: "#0c1e42",
                  }}
                >
                  次節
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-body">
                <span className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {nextRound.date}
                </span>
                <span className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4 text-slate-400"
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
                  {nextRound.venue}
                </span>
              </div>
            </div>
          </section>
        )}

        {/* ニュース */}
        <section className="animate-spring-in animate-delay-100">
          <div className="flex items-center justify-between mb-3">
            <p className="section-title">ニュース</p>
          </div>
          <div className="flex gap-3 overflow-x-auto scroll-x-hidden pb-2 -mx-4 px-4">
            {news.map((item, i) => (
              <div
                key={item.id}
                className="flex-none w-64 card-native p-4 touch-active animate-spring-in"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-center gap-2 mb-2">
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
            ))}
          </div>
        </section>

        {/* 各リーグ首位 */}
        <section className="animate-spring-in animate-delay-200">
          <div className="flex items-center justify-between mb-3">
            <p className="section-title">各リーグ首位</p>
            <Link
              href="/standings"
              className="text-xs font-semibold transition-colors"
              style={{ color: "#c9921e" }}
            >
              全順位 →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {leaderboard.map(({ league, leader }, i) => (
              <Link
                href={`/standings?league=${league.id}`}
                key={league.id}
                className="card-native p-3 touch-active animate-spring-in"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-center gap-2 mb-2.5">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: league.color }}
                  />
                  <span className="text-xs text-slate-500 font-medium truncate">
                    {league.name}
                  </span>
                </div>
                {leader ? (
                  <>
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black mb-1.5 shadow-gold"
                      style={{
                        background: "linear-gradient(135deg, #c9921e, #e3c060)",
                        color: "#0c1e42",
                      }}
                    >
                      {getInitials(leader.teamName)}
                    </div>
                    <p className="text-xs font-semibold text-slate-900 leading-snug truncate">
                      {leader.teamName}
                    </p>
                    <p
                      className="tabular-nums font-black mt-0.5"
                      style={{
                        color: "#c9921e",
                        fontSize: "1.25rem",
                        lineHeight: 1,
                      }}
                    >
                      {leader.totalPoints}
                      <span className="text-xs font-bold ml-0.5">pt</span>
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-slate-400">データなし</p>
                )}
              </Link>
            ))}
          </div>
        </section>

        {/* YouTube セクション */}
        <section className="animate-spring-in animate-delay-300">
          <p className="section-title mb-3">公式動画</p>
          <a
            href="https://www.youtube.com/@fsl_poker"
            target="_blank"
            rel="noopener noreferrer"
            className="block card-native overflow-hidden touch-active"
          >
            {/* YouTube サムネイルプレースホルダー */}
            <div className="relative bg-slate-900 aspect-video flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-900/50 to-slate-900" />
              <div className="relative flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
                  <svg
                    className="w-6 h-6 text-white ml-1"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <p className="text-white text-sm font-medium">
                  FSL 公式 YouTube
                </p>
                <p className="text-slate-300 text-xs">
                  試合ハイライト・インタビュー配信中
                </p>
              </div>
            </div>
            <div className="p-3 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-900">
                FSL Season 1 ハイライト
              </span>
              <span className="text-xs text-slate-400">YouTube</span>
            </div>
          </a>
        </section>

        {/* クイックリンク */}
        <section className="animate-spring-in animate-delay-400">
          <p className="section-title mb-3">メニュー</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                href: "/standings",
                label: "順位表",
                color: "#F59E0B",
                icon: (
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 0 0-.584.859 6.753 6.753 0 0 0 6.138 5.6 6.73 6.73 0 0 0 2.743 1.346A6.707 6.707 0 0 1 9.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 0 0-2.25 2.25c0 .414.336.75.75.75h15a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-2.25-2.25h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 0 1-1.112-3.173 6.73 6.73 0 0 0 2.743-1.347 6.753 6.753 0 0 0 6.139-5.6.75.75 0 0 0-.585-.858 47.077 47.077 0 0 0-3.07-.543V2.62a.75.75 0 0 0-.658-.744 49.798 49.798 0 0 0-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 0 0-.657.744Zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 0 1 3.16 5.337a45.6 45.6 0 0 1 2.006-.343v.256Zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 0 1-2.863 3.207 6.72 6.72 0 0 0 .857-3.294Z"
                      clipRule="evenodd"
                    />
                  </svg>
                ),
              },
              {
                href: "/schedule",
                label: "日程",
                color: "#2b70ef",
                icon: (
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z"
                      clipRule="evenodd"
                    />
                  </svg>
                ),
              },
              {
                href: "/teams",
                label: "チーム",
                color: "#10B981",
                icon: (
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.25 6.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM15.75 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM2.25 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM6.31 15.117A6.745 6.745 0 0 1 12 12a6.745 6.745 0 0 1 6.709 7.498.75.75 0 0 1-.372.568A12.696 12.696 0 0 1 12 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 0 1-.372-.568 6.787 6.787 0 0 1 1.019-4.38Z"
                      clipRule="evenodd"
                    />
                  </svg>
                ),
              },
            ].map(({ href, label, color, icon }) => (
              <Link
                key={href}
                href={href}
                className="card-native p-4 flex flex-col items-center gap-2 touch-active"
              >
                <span style={{ color }}>{icon}</span>
                <span className="text-xs font-semibold text-slate-700">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

import Link from "next/link";
import Image from "next/image";
import {
  getNews,
  getLeagues,
  getStandings,
  getRounds,
  getPlayerStats,
  getMvpCandidates,
  getTeams,
} from "@/lib/data";
import { NEWS_CATEGORY_COLORS } from "@/lib/constants";
import type { NewsCategory } from "@/lib/types/app";
import MyTeamsSection from "@/components/home/MyTeamsSection";
import WinnerVote from "@/components/home/WinnerVote";
import TopScorers from "@/components/home/TopScorers";
import MvpVote from "@/components/home/MvpVote";
import MatchPredict from "@/components/home/MatchPredict";
import FanBadges from "@/components/home/FanBadges";
import MatchCountdown from "@/components/home/MatchCountdown";
import ShareResultCard from "@/components/home/ShareResultCard";
import SponsorBanner from "@/components/home/SponsorBanner";

export const revalidate = 300;

function getInitials(name: string): string {
  const chars = name.replace(/[aeiou\s]/gi, "");
  return chars.slice(0, 2).toUpperCase();
}

export default async function HomePage() {
  const [news, leagues, standings, rounds, playerStats, mvpCandidates, teams] =
    await Promise.all([
      getNews(),
      getLeagues(),
      getStandings(),
      getRounds(),
      getPlayerStats(),
      getMvpCandidates(),
      getTeams(),
    ]);

  const nextRound = rounds.find(
    (r) => r.status === "next" && r.leagueId === "premier",
  );

  // 各リーグの首位・2位チーム
  const leaderboard = leagues.map((league) => {
    const leagueStandings = standings[league.id];
    const leader = leagueStandings?.[0];
    const second = leagueStandings?.[1];
    return { league, leader, second };
  });

  const premierStandings = standings["premier"] ?? [];

  return (
    <div className="max-w-lg lg:max-w-4xl mx-auto">
      {/* FSLチャットボット フローティングボタン */}
      <Link
        href="/chat"
        className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full shadow-lg flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #c9921e, #e3c060)" }}
        aria-label="FSLに質問する"
      >
        <svg
          className="w-6 h-6"
          style={{ color: "#0c1e42" }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </Link>

      {/* ヒーローセクション */}
      <section
        className="relative overflow-hidden animate-fade-in lg:min-h-[400px]"
        style={{ minHeight: 320 }}
      >
        {/* Season 1 バナー背景 */}
        <div className="absolute inset-0">
          <Image
            src="/fsl-season6-group.jpg"
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
        <div className="relative px-6 pt-12 pb-6 text-center text-white">
          {/* Season 1 LIVE バッジ */}
          <div className="inline-flex items-center gap-1.5 bg-red-600/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold mb-3 border border-red-500/40">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block" />
            Season 7 LIVE
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
              <p className="stat-number text-white">16</p>
              <p className="text-white/50 text-[11px] tracking-wide mt-1">節</p>
            </div>
          </div>

          {/* 最新節サブテキスト */}
          <p className="text-white/40 text-[11px] mt-3 font-medium tracking-wide">
            最新節: 第4節 完了
          </p>
        </div>

        {/* リーグタブ（横スクロール） */}
        <div className="relative px-4 pb-4">
          <div className="flex gap-2 overflow-x-auto scroll-x-hidden">
            {leagues.map((league) => (
              <Link
                key={league.id}
                href={`/standings?league=${league.id}`}
                className="flex-none flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-sm border border-white/20 text-white hover:bg-white/25 transition-colors whitespace-nowrap"
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: league.color }}
                />
                {league.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="px-4 py-6 space-y-8">
        {/* 次試合カウントダウン */}
        <MatchCountdown />

        {/* マイチーム */}
        <MyTeamsSection teams={teams} standings={standings} news={news} />

        {/* 優勝予想投票・結果シェア (md以上: 2カラム) */}
        <div className="md:grid md:grid-cols-2 md:gap-4 space-y-8 md:space-y-0">
          <WinnerVote standings={premierStandings} />
          <ShareResultCard />
        </div>

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
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {news.map((item, i) => (
              <div
                key={item.id + "-grid"}
                className="card-native p-4 touch-active animate-spring-in relative overflow-hidden"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* カテゴリカラー左ボーダー */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[20px]"
                  style={{
                    background:
                      item.category === "結果"
                        ? "#2255a0"
                        : item.category === "イベント"
                          ? "#c9921e"
                          : "#10b981",
                  }}
                />
                <div className="flex items-center gap-2 mb-2 pl-1">
                  <span
                    className={`pill ${NEWS_CATEGORY_COLORS[item.category as NewsCategory]}`}
                  >
                    {item.category}
                  </span>
                  {i < 2 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                  )}
                  <span className="text-xs text-slate-400 ml-auto">
                    {item.publishedAt}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2 pl-1">
                  {item.title}
                </p>
              </div>
            ))}
          </div>
          <div className="flex gap-3 overflow-x-auto scroll-x-hidden pb-2 -mx-4 px-4 md:hidden">
            {news.map((item, i) => (
              <div
                key={item.id}
                className="flex-none w-64 card-native p-4 touch-active animate-spring-in relative overflow-hidden"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* カテゴリカラー左ボーダー */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[20px]"
                  style={{
                    background:
                      item.category === "結果"
                        ? "#2255a0"
                        : item.category === "イベント"
                          ? "#c9921e"
                          : "#10b981",
                  }}
                />
                <div className="flex items-center gap-2 mb-2 pl-1">
                  <span
                    className={`pill ${NEWS_CATEGORY_COLORS[item.category as NewsCategory]}`}
                  >
                    {item.category}
                  </span>
                  {/* 新着ドット（最新2件） */}
                  {i < 2 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                  )}
                  <span className="text-xs text-slate-400 ml-auto">
                    {item.publishedAt}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2 pl-1">
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {leaderboard.map(({ league, leader, second }, i) => (
              <Link
                href={`/standings?league=${league.id}`}
                key={league.id}
                className="card-native p-3 touch-active animate-spring-in overflow-hidden relative"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {/* リーグカラーの薄い背景グラデーション */}
                <div
                  className="absolute inset-0 opacity-[0.06] rounded-[20px]"
                  style={{
                    background: `linear-gradient(135deg, ${league.color}, transparent)`,
                  }}
                />
                <div className="relative">
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
                          background:
                            "linear-gradient(135deg, #c9921e, #e3c060)",
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
                          fontSize: "1.35rem",
                          lineHeight: 1,
                        }}
                      >
                        {leader.totalPoints}
                        <span className="text-xs font-bold ml-0.5">pt</span>
                      </p>
                      {/* 2位表示 */}
                      {second && (
                        <p className="text-[10px] text-slate-400 mt-1.5 font-medium">
                          2位{" "}
                          {second.teamName.length > 6
                            ? second.teamName.slice(0, 6) + "…"
                            : second.teamName}{" "}
                          <span className="text-slate-500 font-semibold">
                            -{leader.totalPoints - second.totalPoints}pt
                          </span>
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-slate-400">データなし</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 得点ランキング・MVP投票 (md以上: 2カラム) */}
        <div className="md:grid md:grid-cols-2 md:gap-4 space-y-8 md:space-y-0">
          <TopScorers playerStats={playerStats} />
          <MvpVote candidates={mvpCandidates} />
        </div>

        {/* 試合予想・ファンバッジ (md以上: 2カラム) */}
        <div className="md:grid md:grid-cols-2 md:gap-4 space-y-8 md:space-y-0">
          <MatchPredict standings={premierStandings} />
          <FanBadges />
        </div>

        {/* GTO道場バナー */}
        <Link
          href="/practice"
          className="block rounded-2xl overflow-hidden touch-active animate-spring-in"
          style={{
            background:
              "linear-gradient(135deg, #0c1e42 0%, #1e3a6e 50%, #0c1e42 100%)",
          }}
        >
          <div className="px-5 py-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl flex-shrink-0">
              🃏
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-white tracking-tight">
                プリフロップ道場
              </p>
              <p className="text-xs text-white/60 mt-0.5">
                GTO練習で差をつけろ — 正解率に挑戦
              </p>
            </div>
            <svg
              className="w-5 h-5 text-white/40 flex-shrink-0"
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
          </div>
        </Link>

        {/* スポンサーバナー */}
        <SponsorBanner />

        {/* ギャラリー */}
        <section className="animate-spring-in animate-delay-300">
          <Link
            href="/gallery"
            className="block card-native overflow-hidden touch-active"
          >
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">
                  試合ギャラリー
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  節ごとの写真・ハイライト
                </p>
              </div>
              <span className="text-xs text-slate-300">→</span>
            </div>
          </Link>
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
      </div>
    </div>
  );
}

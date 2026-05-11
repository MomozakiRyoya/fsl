import Link from "next/link";
import Image from "next/image";
import {
  getNews,
  getLeagues,
  getStandings,
  getRounds,
  getPlayerStats,
  getTeams,
} from "@/lib/data";
import { NEWS_CATEGORY_COLORS } from "@/lib/constants";
import type { NewsCategory } from "@/lib/types/app";
import AutoScroll from "@/components/ui/AutoScroll";
import { getLatestYouTubeVideo } from "@/lib/youtube";
import CountUp from "@/components/ui/CountUp";
import ScrollReveal from "@/components/ui/ScrollReveal";
import MyTeamsSection from "@/components/home/MyTeamsSection";
import TopScorers from "@/components/home/TopScorers";
import MatchCountdown from "@/components/home/MatchCountdown";
import SponsorBanner from "@/components/home/SponsorBanner";
import StandingsSection from "@/components/home/StandingsSection";

export const dynamic = "force-dynamic";

function getInitials(name: string): string {
  const chars = name.replace(/[aeiou\s]/gi, "");
  return chars.slice(0, 2).toUpperCase();
}

export default async function HomePage() {
  const [news, leagues, standings, rounds, playerStats, teams, latestVideo] =
    await Promise.all([
      getNews(),
      getLeagues(),
      getStandings(),
      getRounds(),
      getPlayerStats(),
      getTeams(),
      getLatestYouTubeVideo(),
    ]);

  // ヒーロー統計
  const teamCount = teams.length;
  const divisionCount = leagues.length;
  const maxRoundNumber =
    rounds.length > 0
      ? Math.max(
          ...rounds
            .filter((r) => r.leagueId === "premier")
            .map((r) => r.roundNumber),
        )
      : 0;
  const latestFinishedRound = rounds
    .filter((r) => r.leagueId === "premier" && r.status === "finished")
    .sort((a, b) => b.roundNumber - a.roundNumber)[0];

  return (
    <div className="max-w-lg lg:max-w-4xl mx-auto">
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
            className="object-cover object-center animate-zoom-in"
            priority
          />
          {/* 没入感のあるグラデーションオーバーレイ */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/80" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c1e42]/60 via-transparent to-transparent" />
        </div>

        {/* コンテンツ */}
        <div className="relative px-6 pt-12 pb-6 text-center text-white">
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
              <p className="stat-number text-white">
                <CountUp value={teamCount} duration={4500} />
              </p>
              <p className="text-white/50 text-[11px] tracking-wide mt-1">
                チーム
              </p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <p className="stat-number text-white">
                <CountUp value={divisionCount} duration={3500} />
              </p>
              <p className="text-white/50 text-[11px] tracking-wide mt-1">
                ディビジョン
              </p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <p className="stat-number text-white">
                <CountUp value={maxRoundNumber} duration={4000} />
              </p>
              <p className="text-white/50 text-[11px] tracking-wide mt-1">節</p>
            </div>
          </div>

          {/* 最新節サブテキスト */}
          {latestFinishedRound && (
            <p className="text-white/40 text-[11px] mt-3 font-medium tracking-wide">
              最新節: {latestFinishedRound.name} 完了
            </p>
          )}
        </div>

        {/* リーグタブ（自動スクロール） */}
        <div className="relative px-4 pb-4">
          <AutoScroll speed={22} startOffset={0}>
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
          </AutoScroll>
        </div>
      </section>

      <div className="px-4 py-6 space-y-8">
        {/* 1. 最新の総合順位 */}
        <ScrollReveal>
          <section>
            <div className="flex items-center justify-between mb-3">
              <p className="section-title">最新の総合順位</p>
              <Link
                href="/standings"
                className="text-xs font-semibold transition-colors"
                style={{ color: "#c9921e" }}
              >
                全順位 →
              </Link>
            </div>
            <StandingsSection leagues={leagues} standings={standings} />
          </section>
        </ScrollReveal>

        {/* 2. 直近の試合日程 */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="section-title">直近の試合</p>
            <Link
              href="/schedule"
              className="text-xs font-semibold transition-colors"
              style={{ color: "#c9921e" }}
            >
              日程を全て見る →
            </Link>
          </div>
          <MatchCountdown rounds={rounds} leagues={leagues} />
        </section>

        {/* 3. マイチーム */}
        <MyTeamsSection teams={teams} standings={standings} news={news} />

        {/* 4. ニュース */}
        <ScrollReveal delay={50}>
          <section>
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
            <div className="flex flex-col gap-3 md:hidden">
              {news.map((item, i) => (
                <div
                  key={item.id}
                  className="card-native p-4 touch-active relative overflow-hidden"
                >
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
          </section>
        </ScrollReveal>

        {/* 5. プレイヤーポイントランキング */}
        <ScrollReveal delay={80}>
          <TopScorers playerStats={playerStats} />
        </ScrollReveal>

        {/* コミュニティ */}
        <section className="animate-spring-in">
          <p className="section-title mb-3">コミュニティ</p>
          <div className="grid grid-cols-1 gap-3">
            {/* 意見箱 */}
            <Link
              href="/feedback"
              className="card-native p-4 touch-active flex items-center gap-4"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, #1a3268, #2255a0)",
                }}
              >
                📮
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900">匿名意見箱</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  運営への意見・要望を匿名で送れる
                </p>
              </div>
              <span className="text-xs text-slate-300">→</span>
            </Link>
          </div>
        </section>

        {/* YouTube セクション */}
        <section className="animate-spring-in animate-delay-300">
          <p className="section-title mb-3">公式動画</p>
          <a
            href={
              latestVideo?.url ?? "https://www.youtube.com/@FukuokaSuperLeague"
            }
            target="_blank"
            rel="noopener noreferrer"
            className="block card-native overflow-hidden touch-active"
          >
            <div className="relative bg-slate-900 aspect-video">
              {latestVideo ? (
                <>
                  <Image
                    src={latestVideo.thumbnail}
                    alt={latestVideo.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-red-600/90 flex items-center justify-center shadow-lg">
                      <svg
                        className="w-6 h-6 text-white ml-1"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-900/50 to-slate-900" />
                  <div className="relative h-full flex flex-col items-center justify-center gap-3">
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
                </>
              )}
            </div>
            <div className="p-3 flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-slate-900 truncate">
                {latestVideo?.title ?? "FUKUOKA SUPER LEAGUE公式YouTube"}
              </span>
              <span className="text-xs text-slate-400 flex-shrink-0">
                YouTube
              </span>
            </div>
          </a>
        </section>
      </div>
    </div>
  );
}

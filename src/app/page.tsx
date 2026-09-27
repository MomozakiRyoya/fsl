import Link from "next/link";
import Image from "next/image";
import {
  getNews,
  getLeagues,
  getStandings,
  getRounds,
  getTeams,
} from "@/lib/data";
import ArrowIcon from "@/components/ui/ArrowIcon";
import { getLatestYouTubeVideo } from "@/lib/youtube";
import CountUp from "@/components/ui/CountUp";
import ScrollReveal from "@/components/ui/ScrollReveal";
import MyTeamsSection from "@/components/home/MyTeamsSection";
import TopScorers from "@/components/home/TopScorers";
import HomeNewsSection from "@/components/home/HomeNewsSection";
import MatchCountdown from "@/components/home/MatchCountdown";
import SponsorBanner from "@/components/home/SponsorBanner";
import StandingsSection from "@/components/home/StandingsSection";
import FeaturedPlayers from "@/components/home/FeaturedPlayers";

export const dynamic = "force-dynamic";

function getInitials(name: string): string {
  const chars = name.replace(/[aeiou\s]/gi, "");
  return chars.slice(0, 2).toUpperCase();
}

export default async function HomePage() {
  const supabaseAdmin = (await import("@supabase/supabase-js")).createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const [
    news,
    leagues,
    standings,
    rounds,
    teams,
    latestVideo,
    { data: featuredData },
    { data: playerResultsData },
    { data: teamsForStats },
  ] = await Promise.all([
    getNews(),
    getLeagues(),
    getStandings(),
    getRounds(),
    getTeams(),
    getLatestYouTubeVideo(),
    supabaseAdmin
      .from("featured_players")
      .select("id, image_url, player_name, team_name")
      .eq("is_active", true)
      .order("order_num")
      .order("created_at"),
    supabaseAdmin
      .from("player_results")
      .select("player_id, player_name, team_id, team_name, rank, points"),
    supabaseAdmin.from("teams").select("team_id, league_id"),
  ]);

  // player_results を直接集計して PlayerStats を構築
  const teamLeagueMap: Record<string, string> = {};
  for (const t of teamsForStats ?? []) {
    teamLeagueMap[t.team_id as string] = t.league_id as string;
  }
  type StatEntry = {
    playerName: string;
    teamId: string;
    teamName: string;
    totalPoints: number;
    games: number;
    itmCount: number;
  };
  const statsMap: Record<string, StatEntry> = {};
  for (const r of playerResultsData ?? []) {
    const playerName = (r.player_name as string) ?? "";
    const teamId = (r.team_id as string) ?? "";
    if (!playerName.trim()) continue;
    const key = `${playerName}::${teamId}`;
    if (!statsMap[key]) {
      statsMap[key] = {
        playerName,
        teamId,
        teamName: (r.team_name as string) ?? "",
        totalPoints: 0,
        games: 0,
        itmCount: 0,
      };
    }
    statsMap[key].totalPoints += (r.points as number) || 0;
    statsMap[key].games += 1;
    const rank = r.rank as number | null;
    if (rank !== null && rank <= 3) statsMap[key].itmCount += 1;
  }
  const playerStats = Object.values(statsMap)
    .map((s) => ({
      playerId: `${s.playerName}::${s.teamId}`,
      playerName: s.playerName,
      teamId: s.teamId,
      teamName: s.teamName,
      leagueId: teamLeagueMap[s.teamId] ?? "premier",
      goals: s.totalPoints,
      assists: s.games > 0 ? Math.round((s.itmCount / s.games) * 100) : 0,
      games: s.games,
      mvpCount: 0,
    }))
    .sort((a, b) => b.goals - a.goals);

  const featuredPlayers = (featuredData ?? []).map((d) => ({
    id: d.id as string,
    imageUrl: d.image_url as string,
    playerName: (d.player_name as string) ?? "",
    teamName: (d.team_name as string) ?? "",
  }));

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

  const heroStats = [
    { label: "チーム", value: teamCount, duration: 4500 },
    { label: "ディビジョン", value: divisionCount, duration: 3500 },
    { label: "節", value: maxRoundNumber, duration: 4000 },
  ];

  return (
    <div className="max-w-lg lg:max-w-4xl mx-auto">
      {/* ヒーロー: 文字・写真・数字・ディビジョンを縦に積む */}
      <section className="home-hero bg-[#0c1e42] text-white animate-fade-in">
        <div className="px-5 pt-8 pb-6 lg:px-10 lg:pt-12">
          <h1 className="font-black leading-[0.92] tracking-[-0.02em] text-[clamp(44px,15vw,88px)]">
            <span className="block">FUKUOKA</span>
            <span className="block">SUPER</span>
            <span className="block">LEAGUE</span>
          </h1>
          <p className="mt-4 text-[17px] font-bold">すべてを、背負え。</p>
        </div>

        <div className="relative aspect-video lg:aspect-[5/2]">
          <Image
            src="/fsl-season6-group.jpg"
            alt="FSL に参加する選手たちの集合写真"
            fill
            sizes="(min-width: 1024px) 896px, (min-width: 512px) 512px, 100vw"
            className="object-cover object-center"
            priority
          />
        </div>

        <dl className="grid grid-cols-3 border-t border-white/25">
          {heroStats.map((stat, i) => (
            <div
              key={stat.label}
              className={
                i === 0
                  ? "pl-5 pr-3 py-4 lg:pl-10"
                  : "px-4 py-4 border-l border-white/25"
              }
            >
              <dt className="text-[11px] font-bold tracking-[0.04em] text-white/60">
                {stat.label}
              </dt>
              <dd className="mt-1.5 text-[32px] font-black leading-none tabular-nums">
                <CountUp value={stat.value} duration={stat.duration} />
              </dd>
            </div>
          ))}
        </dl>

        {latestFinishedRound && (
          <p className="border-t border-white/25 px-5 py-3 text-xs text-white/70 lg:px-10">
            最新節:{" "}
            <span className="font-bold text-white">
              {latestFinishedRound.name}
            </span>{" "}
            完了
          </p>
        )}

        <nav
          aria-label="ディビジョン別の順位"
          className="grid grid-cols-2 gap-px border-t border-white/25 bg-white/25"
        >
          {leagues.map((league) => (
            <Link
              key={league.id}
              href={`/standings?league=${league.id}`}
              className="group flex items-center gap-2.5 bg-[#0c1e42] px-5 py-3.5 text-[13px] font-bold text-white transition-colors hover:bg-white hover:text-[#0c1e42] odd:last:col-span-2 lg:px-10"
            >
              <span
                className="h-2.5 w-2.5 flex-shrink-0 border border-white/40"
                style={{ backgroundColor: league.color }}
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1 truncate">{league.name}</span>
              <ArrowIcon className="h-3.5 w-3.5 flex-shrink-0 text-white/60 group-hover:text-[#0c1e42]" />
            </Link>
          ))}
        </nav>
      </section>

      <div className="px-5 pt-8 pb-10 space-y-10 lg:px-10">
        {/* 1. 最新の総合順位 */}
        <ScrollReveal>
          <section className="section-rule">
            <div className="section-head">
              <h2 className="section-title">最新の総合順位</h2>
              <Link href="/standings" className="section-link">
                全順位
                <ArrowIcon />
              </Link>
            </div>
            <StandingsSection leagues={leagues} standings={standings} />
          </section>
        </ScrollReveal>

        {/* 注目選手 */}
        {featuredPlayers.length > 0 && (
          <FeaturedPlayers players={featuredPlayers} />
        )}

        {/* 2. 直近の試合日程 */}
        <section className="section-rule">
          <div className="section-head">
            <h2 className="section-title">直近の試合</h2>
            <Link href="/schedule" className="section-link">
              日程をすべて見る
              <ArrowIcon />
            </Link>
          </div>
          <MatchCountdown rounds={rounds} leagues={leagues} />
        </section>

        {/* 3. マイチーム */}
        <MyTeamsSection teams={teams} standings={standings} news={news} />

        {/* 4. ニュース */}
        <ScrollReveal delay={50}>
          <section className="section-rule">
            <div className="section-head">
              <h2 className="section-title">ニュース</h2>
            </div>
            <HomeNewsSection news={news} />
          </section>
        </ScrollReveal>

        {/* 5. プレイヤーポイントランキング */}
        <ScrollReveal delay={80}>
          <div className="section-rule">
            <TopScorers playerStats={playerStats} />
          </div>
        </ScrollReveal>

        {/* コミュニティ */}
        <section className="section-rule">
          <div className="section-head">
            <h2 className="section-title">コミュニティ</h2>
          </div>
          <Link
            href="/feedback"
            className="group flex items-center gap-4 border-y border-ink/15 py-4"
          >
            <span
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center bg-[#0c1e42] text-white"
              aria-hidden="true"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.75}
              >
                <path d="M3.5 6.5h17v11h-17z" strokeLinejoin="miter" />
                <path d="M3.5 6.5 12 13l8.5-6.5" strokeLinejoin="miter" />
              </svg>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-bold text-ink group-hover:underline underline-offset-4">
                匿名意見箱
              </span>
              <span className="mt-0.5 block text-xs text-ink/70">
                運営への意見・要望を匿名で送れる
              </span>
            </span>
            <ArrowIcon className="h-4 w-4 flex-shrink-0 text-ink" />
          </Link>
        </section>

        {/* YouTube セクション */}
        <section className="section-rule">
          <div className="section-head">
            <h2 className="section-title">公式動画</h2>
          </div>
          <a
            href={
              latestVideo?.url ?? "https://www.youtube.com/@FukuokaSuperLeague"
            }
            target="_blank"
            rel="noopener noreferrer"
            className="group block"
          >
            <div className="relative aspect-video bg-[#0c1e42]">
              {latestVideo ? (
                <>
                  <Image
                    src={latestVideo.thumbnail}
                    alt={latestVideo.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <span
                    className="absolute left-0 bottom-0 flex h-12 w-12 items-center justify-center bg-white text-[#0c1e42]"
                    aria-hidden="true"
                  >
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                </>
              ) : (
                <div className="flex h-full flex-col p-5 text-white">
                  <span
                    className="flex h-12 w-12 items-center justify-center bg-white text-[#0c1e42]"
                    aria-hidden="true"
                  >
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                  <p className="mt-auto text-lg font-bold">FSL 公式 YouTube</p>
                  <p className="mt-1 text-xs text-white/70">
                    試合ハイライト・インタビュー配信中
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-baseline justify-between gap-3 border-b border-ink/15 py-3">
              <span className="truncate text-sm font-bold text-ink group-hover:underline underline-offset-4">
                {latestVideo?.title ?? "FUKUOKA SUPER LEAGUE公式YouTube"}
              </span>
              <span className="flex-shrink-0 text-xs text-ink/70">
                YouTube
              </span>
            </div>
          </a>
        </section>
      </div>
    </div>
  );
}

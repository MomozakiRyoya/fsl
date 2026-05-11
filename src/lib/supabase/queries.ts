import { createClient } from "./server";
import type {
  Team,
  Player,
  NewsItem,
  League,
  Round,
  TeamStanding,
} from "../types/app";

export async function fetchTeamsFromSupabase(): Promise<Team[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .eq("is_active", true)
    .order("league_id")
    .order("id");

  if (error || !data) throw new Error(error?.message ?? "teams fetch failed");

  return data.map((t) => ({
    id: t.team_id as string,
    name: t.name as string,
    slug: t.slug as string,
    leagueId: t.league_id as string,
    leagueName: t.league_name as string,
    logoUrl: (t.logo_url as string | null) ?? null,
    homeColor: (t.home_color as string) ?? "#000000",
    captainName: (t.captain as string) ?? "",
    description: (t.description as string) ?? "",
    twitterUrl: (t.twitter_url as string | null) ?? null,
    instagramUrl: (t.instagram_url as string | null) ?? null,
    isActive: t.is_active as boolean,
  }));
}

export async function fetchPlayersFromSupabase(): Promise<Player[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("players")
    .select(
      "player_id, name, team_id, league_id, position, number, photo_url, is_captain, user_email, teams(name)",
    )
    .order("league_id")
    .order("team_id")
    .order("number");

  if (error || !data) throw new Error(error?.message ?? "players fetch failed");

  return data.map((p) => ({
    id: p.player_id as string,
    name: (p.name as string) ?? "",
    teamId: p.team_id as string,
    teamName: (() => {
      const t = p.teams as { name: string }[] | { name: string } | null;
      if (!t) return "";
      return Array.isArray(t) ? (t[0]?.name ?? "") : (t.name ?? "");
    })(),
    leagueId: p.league_id as string,
    number: p.number as number,
    photoUrl: (p.photo_url as string | null) ?? null,
    isCaptain: (p.is_captain as boolean) ?? false,
    userEmail: (p.user_email as string | null) ?? null,
    birthday: null,
  }));
}

export async function fetchNewsFromSupabase(): Promise<NewsItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("news")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) throw new Error(error?.message ?? "news fetch failed");

  return data.map((n) => ({
    id: n.id as string,
    title: (n.title as string) ?? "",
    slug: (n.slug as string) ?? n.id,
    category: (n.category as NewsItem["category"]) ?? "お知らせ",
    publishedAt: (n.published_at as string) ?? "",
    thumbnailUrl: (n.thumbnail_url as string | null) ?? null,
    body: (n.body as string) ?? "",
    isPublished: (n.is_published as boolean) ?? false,
    seasonId: "",
  }));
}

export async function fetchLeaguesFromSupabase(): Promise<League[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leagues")
    .select("*")
    .order("order_num");

  if (error || !data) throw new Error(error?.message ?? "leagues fetch failed");

  return data.map((l) => ({
    id: l.id as string,
    name: l.name as string,
    slug: (l.slug as string) ?? "",
    seasonId: "",
    order: (l.order_num as number) ?? 0,
    color: (l.color as string) ?? "#000000",
    description: (l.description as string) ?? "",
    maxTeams: (l.max_teams as number) ?? 8,
  }));
}

export async function fetchRoundsFromSupabase(): Promise<Round[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rounds")
    .select("*")
    .order("league_id")
    .order("round_number");

  if (error || !data) throw new Error(error?.message ?? "rounds fetch failed");

  return data.map((r) => ({
    id: r.id as string,
    name: r.name as string,
    leagueId: (r.league_id as string) ?? "",
    leagueName: (r.league_name as string) ?? "",
    roundNumber: (r.round_number as number) ?? 0,
    date: (r.date as string) ?? "",
    venue: (r.venue as string) ?? "",
    venueUrl: (r.venue_url as string | null) ?? null,
    status: (r.status as Round["status"]) ?? "scheduled",
    isPlayoff: (r.is_playoff as boolean) ?? false,
    format: (r.format as string) ?? "",
    structureId: (r.structure_id as string | null) ?? null,
  }));
}

export async function fetchMatchResultsFromSupabase(): Promise<
  import("../types/app").MatchResult[]
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("matches")
    .select("round_id, home_team_id, home_team_name, home_round_pt")
    .eq("status", "finished")
    .not("home_team_id", "is", null)
    .not("home_team_id", "eq", "");

  if (!data) return [];

  // ラウンドごとにグループ化
  const grouped: Record<
    string,
    { teamId: string; teamName: string; pts: number }[]
  > = {};
  for (const m of data) {
    const rid = m.round_id as string;
    if (!grouped[rid]) grouped[rid] = [];
    grouped[rid].push({
      teamId: m.home_team_id as string,
      teamName: m.home_team_name as string,
      pts: (m.home_round_pt as number) ?? 0,
    });
  }

  return Object.entries(grouped).map(([roundId, teams]) => {
    const sorted = [...teams].sort((a, b) => b.pts - a.pts);
    return {
      roundId,
      results: sorted.map((t, i) => ({
        rank: i + 1,
        teamId: t.teamId,
        teamName: t.teamName,
        points: t.pts,
      })),
    };
  });
}

export async function fetchStandingsFromSupabase(): Promise<
  Record<string, TeamStanding[]>
> {
  const supabase = await createClient();

  const [{ data: teams }, { data: matches }, { data: rounds }] =
    await Promise.all([
      supabase.from("teams").select("team_id, name, slug, logo_url, league_id"),
      supabase
        .from("matches")
        .select("round_id, home_team_id, home_team_name, home_round_pt")
        .eq("status", "finished"),
      supabase.from("rounds").select("id, league_id, round_number"),
    ]);

  // roundsをMapに
  const roundMap: Record<string, { leagueId: string; roundNum: number }> = {};
  for (const r of rounds ?? []) {
    roundMap[r.id as string] = {
      leagueId: r.league_id as string,
      roundNum: r.round_number as number,
    };
  }

  const teamLogoMap: Record<string, string | null> = {};
  const teamSlugMap: Record<string, string | null> = {};
  for (const t of teams ?? []) {
    teamLogoMap[t.team_id as string] = (t.logo_url as string | null) ?? null;
    teamSlugMap[t.team_id as string] = (t.slug as string | null) ?? null;
  }

  type Agg = {
    teamId: string;
    teamName: string;
    leagueId: string;
    totalPoints: number;
    roundPoints: Record<number, number>;
  };
  const aggMap: Record<string, Agg> = {};

  for (const m of matches ?? []) {
    const roundInfo = roundMap[m.round_id as string];
    if (!roundInfo) continue;
    const { leagueId, roundNum } = roundInfo;

    const addPts = (teamId: string, teamName: string, pts: number) => {
      if (!teamId) return;
      const key = `${leagueId}:${teamId}`;
      if (!aggMap[key]) {
        aggMap[key] = {
          teamId,
          teamName,
          leagueId,
          totalPoints: 0,
          roundPoints: {},
        };
      }
      aggMap[key].totalPoints += pts;
      aggMap[key].roundPoints[roundNum] =
        (aggMap[key].roundPoints[roundNum] ?? 0) + pts;
    };

    const homeId = m.home_team_id as string;
    if (homeId) {
      addPts(
        homeId,
        m.home_team_name as string,
        (m.home_round_pt as number | null) ?? 0,
      );
    }
  }

  // 試合未登録のチームも 0pt で含める
  for (const t of teams ?? []) {
    const leagueId = t.league_id as string;
    const teamId = t.team_id as string;
    const key = `${leagueId}:${teamId}`;
    if (!aggMap[key]) {
      aggMap[key] = {
        teamId,
        teamName: t.name as string,
        leagueId,
        totalPoints: 0,
        roundPoints: {},
      };
    }
  }

  const result: Record<string, TeamStanding[]> = {};
  for (const agg of Object.values(aggMap)) {
    if (!result[agg.leagueId]) result[agg.leagueId] = [];
    result[agg.leagueId].push({
      rank: 0,
      teamId: agg.teamId,
      teamName: agg.teamName,
      teamLogoUrl: teamLogoMap[agg.teamId] ?? null,
      teamSlug: teamSlugMap[agg.teamId] ?? null,
      totalPoints: agg.totalPoints,
      roundPoints: agg.roundPoints,
    });
  }

  for (const leagueId of Object.keys(result)) {
    result[leagueId].sort((a, b) => b.totalPoints - a.totalPoints);
    result[leagueId].forEach((s, i) => {
      s.rank = i + 1;
    });
  }

  return result;
}

export async function fetchPlayerStatsFromSupabase(): Promise<
  import("../types/app").PlayerStats[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("players")
    .select("player_id, name, team_id, league_id, teams(name)")
    .order("league_id")
    .order("team_id");

  if (error || !data) return [];

  return data
    .filter((p) => p.name && (p.name as string).trim() !== "")
    .map((p) => {
      const t = p.teams as { name: string }[] | { name: string } | null;
      const teamName = !t
        ? ""
        : Array.isArray(t)
          ? (t[0]?.name ?? "")
          : (t.name ?? "");
      return {
        playerId: p.player_id as string,
        playerName: (p.name as string) ?? "",
        teamId: p.team_id as string,
        teamName,
        leagueId: p.league_id as string,
        goals: 0,
        assists: 0,
        games: 0,
        mvpCount: 0,
      };
    });
}

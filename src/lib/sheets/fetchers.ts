import { getDoc } from "./client";
import type {
  League,
  Team,
  Round,
  TeamStanding,
  NewsItem,
  Player,
  PlayerStats,
  MvpVoteOption,
  MatchResult,
  HeadToHead,
  StackEntry,
} from "@/lib/types/app";

// ── Leagues ──────────────────────────────────────────────────────────────────

export async function fetchLeagues(): Promise<League[]> {
  const doc = await getDoc();
  const sheet = doc.sheetsByTitle["リーグ"];
  const rows = await sheet.getRows();
  return rows.map((r) => ({
    id: r.get("ID"),
    name: r.get("リーグ名"),
    slug: r.get("スラッグ"),
    seasonId: r.get("シーズンID"),
    order: Number(r.get("表示順")),
    color: r.get("カラー"),
    description: r.get("説明"),
    maxTeams: Number(r.get("最大チーム数")),
  }));
}

// ── Teams ─────────────────────────────────────────────────────────────────────

export async function fetchTeams(): Promise<Team[]> {
  const doc = await getDoc();
  const sheet = doc.sheetsByTitle["チーム"];
  const rows = await sheet.getRows();
  return rows.map((r) => ({
    id: r.get("ID"),
    name: r.get("チーム名"),
    slug: r.get("スラッグ"),
    leagueId: r.get("リーグID"),
    leagueName: r.get("リーグ名"),
    logoUrl: r.get("ロゴURL") || null,
    homeColor: r.get("ホームカラー"),
    captainName: r.get("キャプテン"),
    description: r.get("説明"),
    twitterUrl: r.get("TwitterURL") || null,
    instagramUrl: r.get("InstagramURL") || null,
    isActive: r.get("公開中") === "TRUE",
  }));
}

// ── Rounds ────────────────────────────────────────────────────────────────────

export async function fetchRounds(): Promise<Round[]> {
  const doc = await getDoc();
  const sheet = doc.sheetsByTitle["節"];
  const rows = await sheet.getRows();
  return rows.map((r) => ({
    id: r.get("ID"),
    name: r.get("節名"),
    leagueId: r.get("リーグID"),
    leagueName: r.get("リーグ名"),
    roundNumber: Number(r.get("節番号")),
    date: r.get("開催日"),
    venue: r.get("会場"),
    venueUrl: r.get("会場URL") || null,
    status: r.get("状態") as Round["status"],
    isPlayoff: r.get("プレーオフ") === "TRUE",
  }));
}

// ── Standings ─────────────────────────────────────────────────────────────────

export async function fetchStandings(): Promise<
  Record<string, TeamStanding[]>
> {
  const doc = await getDoc();
  const sheet = doc.sheetsByTitle["順位表"];
  const rows = await sheet.getRows();

  const result: Record<string, TeamStanding[]> = {};

  for (const r of rows) {
    const leagueId = r.get("リーグID");
    const roundPointsRaw = r.get("節別pt");
    let roundPoints: Record<number, number> = {};
    try {
      roundPoints = JSON.parse(roundPointsRaw || "{}");
    } catch {
      roundPoints = {};
    }

    const standing: TeamStanding = {
      rank: Number(r.get("順位")),
      teamId: r.get("チームID"),
      teamName: r.get("チーム名"),
      teamLogoUrl: r.get("ロゴURL") || null,
      totalPoints: Number(r.get("合計pt")),
      roundPoints,
    };

    if (!result[leagueId]) result[leagueId] = [];
    result[leagueId].push(standing);
  }

  for (const leagueId of Object.keys(result)) {
    result[leagueId].sort((a, b) => a.rank - b.rank);
  }

  return result;
}

// ── Match Results ─────────────────────────────────────────────────────────────

export async function fetchMatchResults(): Promise<MatchResult[]> {
  const doc = await getDoc();
  const sheet = doc.sheetsByTitle["試合結果"];
  const rows = await sheet.getRows();

  const map = new Map<string, MatchResult>();

  for (const r of rows) {
    const roundId = r.get("節ID");
    if (!map.has(roundId)) {
      map.set(roundId, { roundId, results: [] });
    }
    map.get(roundId)!.results.push({
      rank: Number(r.get("順位")),
      teamId: r.get("チームID"),
      teamName: r.get("チーム名"),
      points: Number(r.get("得点pt")),
    });
  }

  return Array.from(map.values());
}

// ── Players ───────────────────────────────────────────────────────────────────

export async function fetchPlayers(): Promise<Player[]> {
  const doc = await getDoc();
  const sheet = doc.sheetsByTitle["選手"];
  const rows = await sheet.getRows();
  return rows.map((r) => ({
    id: r.get("ID"),
    name: r.get("選手名"),
    teamId: r.get("チームID"),
    teamName: r.get("チーム名"),
    leagueId: r.get("リーグID"),
    number: Number(r.get("背番号")),
  }));
}

// ── Player Stats ──────────────────────────────────────────────────────────────

export async function fetchPlayerStats(): Promise<PlayerStats[]> {
  const doc = await getDoc();
  const sheet = doc.sheetsByTitle["選手成績"];
  const rows = await sheet.getRows();
  return rows.map((r) => ({
    playerId: r.get("選手ID"),
    playerName: r.get("選手名"),
    teamId: r.get("チームID"),
    teamName: r.get("チーム名"),
    leagueId: r.get("リーグID"),
    goals: Number(r.get("ゴール") || 0),
    assists: Number(r.get("アシスト") || 0),
    games: Number(r.get("試合数") || 0),
    mvpCount: Number(r.get("MVP数") || 0),
  }));
}

// ── News ──────────────────────────────────────────────────────────────────────

export async function fetchNews(): Promise<NewsItem[]> {
  const doc = await getDoc();
  const sheet = doc.sheetsByTitle["ニュース"];
  const rows = await sheet.getRows();
  return rows
    .map((r) => ({
      id: r.get("ID"),
      title: r.get("タイトル"),
      slug: r.get("スラッグ"),
      category: r.get("カテゴリ") as NewsItem["category"],
      publishedAt: r.get("公開日"),
      thumbnailUrl: r.get("サムネイルURL") || null,
      body: r.get("本文"),
      isPublished: r.get("公開中") === "TRUE",
      seasonId: r.get("シーズンID"),
    }))
    .filter((n) => n.isPublished);
}

// ── MVP Candidates ────────────────────────────────────────────────────────────

export async function fetchMvpCandidates(): Promise<MvpVoteOption[]> {
  const doc = await getDoc();
  const sheet = doc.sheetsByTitle["MVP候補"];
  const rows = await sheet.getRows();
  return rows.map((r) => ({
    playerId: r.get("選手ID"),
    playerName: r.get("選手名"),
    teamName: r.get("チーム名"),
    roundId: r.get("節ID"),
  }));
}

// ── Head To Head ──────────────────────────────────────────────────────────────

export async function fetchHeadToHead(): Promise<HeadToHead[]> {
  const doc = await getDoc();
  const sheet = doc.sheetsByTitle["対戦成績"];
  const rows = await sheet.getRows();
  return rows.map((r) => ({
    teamAId: r.get("チームAのID"),
    teamBId: r.get("チームBのID"),
    teamAName: r.get("チームA"),
    teamBName: r.get("チームB"),
    wins: Number(r.get("勝") || 0),
    draws: Number(r.get("分") || 0),
    losses: Number(r.get("負") || 0),
    teamAGoals: Number(r.get("チームA得点") || 0),
    teamBGoals: Number(r.get("チームB得点") || 0),
  }));
}

// ── Stack Entries ─────────────────────────────────────────────────────────────

export async function fetchStacks(): Promise<StackEntry[]> {
  const doc = await getDoc();
  const sheet = doc.sheetsByTitle["スタック"];
  if (!sheet) return [];
  const rows = await sheet.getRows();
  return rows.map((r) => ({
    roundId: r.get("節ID"),
    leagueId: r.get("リーグID"),
    teamId: r.get("チームID"),
    teamName: r.get("チーム名"),
    playerName: r.get("選手名"),
    stackCount: Number(r.get("スタック数") || 0),
    breakNumber: Number(r.get("ブレイク番号") || 0),
  }));
}

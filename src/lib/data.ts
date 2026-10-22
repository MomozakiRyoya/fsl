/**
 * Unified data access layer — Supabase only.
 */
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
} from "./types/app";
import {
  MOCK_LEAGUES,
  MOCK_TEAMS,
  MOCK_ROUNDS,
  MOCK_STANDINGS,
  MOCK_MATCH_RESULTS,
  MOCK_PLAYERS,
  MOCK_PLAYER_STATS,
  MOCK_NEWS,
  MOCK_MVP_CANDIDATES,
  MOCK_HEAD_TO_HEAD,
} from "./mock-data";
import {
  fetchTeamsFromSupabase,
  fetchPlayersFromSupabase,
  fetchNewsFromSupabase,
  fetchLeaguesFromSupabase,
  fetchRoundsFromSupabase,
  fetchStandingsFromSupabase,
  fetchMatchResultsFromSupabase,
  fetchPlayerStatsFromSupabase,
} from "./supabase/queries";
import { fetchAllNewsAsAdmin } from "./supabase/admin-news";
import { stripEmoji } from "./strip-emoji";
import { onlyPublished } from "./news-visibility";

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    const result = await fn();
    if (Array.isArray(result) && result.length === 0) return fallback;
    return result;
  } catch (e) {
    console.error("[safe] fallback triggered:", e);
    return fallback;
  }
}

export async function getLeagues(): Promise<League[]> {
  return safe(fetchLeaguesFromSupabase, MOCK_LEAGUES);
}

export async function getTeams(): Promise<Team[]> {
  return safe(fetchTeamsFromSupabase, MOCK_TEAMS);
}

export async function getRounds(): Promise<Round[]> {
  try {
    const rounds = await fetchRoundsFromSupabase();
    // 節名に入っている絵文字（DB の節名の先頭にある星）は表示に出さない。
    // 名前が空の節があっても一覧ごと消えないよう、null は空文字として扱う
    return rounds.map((r) => ({ ...r, name: stripEmoji(r.name ?? "") }));
  } catch {
    return [];
  }
}

export async function getStandings(): Promise<Record<string, TeamStanding[]>> {
  try {
    return await fetchStandingsFromSupabase();
  } catch {
    return {};
  }
}

export async function getMatchResults(): Promise<MatchResult[]> {
  try {
    return await fetchMatchResultsFromSupabase();
  } catch {
    return [];
  }
}

export async function getPlayers(): Promise<Player[]> {
  return safe(fetchPlayersFromSupabase, MOCK_PLAYERS);
}

export async function getPlayerStats(): Promise<PlayerStats[]> {
  try {
    return await fetchPlayerStatsFromSupabase();
  } catch {
    return MOCK_PLAYER_STATS;
  }
}

/** 公開画面用。非公開の記事は含めない（DB の読み取り許可と、ここでの絞り込みの二重） */
export async function getNews(): Promise<NewsItem[]> {
  try {
    return onlyPublished(await fetchNewsFromSupabase());
  } catch {
    return [];
  }
}

/** 管理画面用。非公開の記事も含める（並ばないと公開に戻せない）。service role で読むので管理画面以外から呼ばない */
export async function getAllNews(): Promise<NewsItem[]> {
  try {
    return await fetchAllNewsAsAdmin();
  } catch {
    return [];
  }
}

export async function getMvpCandidates(): Promise<MvpVoteOption[]> {
  return MOCK_MVP_CANDIDATES;
}

export async function getHeadToHead(): Promise<HeadToHead[]> {
  return MOCK_HEAD_TO_HEAD;
}

export async function getStacks(): Promise<StackEntry[]> {
  return [];
}

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
    return await fetchRoundsFromSupabase();
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

export async function getNews(): Promise<NewsItem[]> {
  try {
    return await fetchNewsFromSupabase();
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

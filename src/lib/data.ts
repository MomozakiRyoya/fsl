/**
 * Unified data access layer.
 * All functions are async server-side — never import this in "use client" components.
 */
import {
  fetchLeagues,
  fetchTeams,
  fetchRounds,
  fetchStandings,
  fetchMatchResults,
  fetchPlayers,
  fetchPlayerStats,
  fetchNews,
  fetchMvpCandidates,
  fetchHeadToHead,
  fetchStacks,
} from "./sheets/fetchers";
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

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    const result = await fn();
    // If sheets returns empty array, fall back to mock
    if (Array.isArray(result) && result.length === 0) return fallback;
    return result;
  } catch {
    return fallback;
  }
}

export async function getLeagues(): Promise<League[]> {
  return safe(fetchLeagues, MOCK_LEAGUES);
}

export async function getTeams(): Promise<Team[]> {
  return safe(fetchTeams, MOCK_TEAMS);
}

export async function getRounds(): Promise<Round[]> {
  return safe(fetchRounds, MOCK_ROUNDS);
}

export async function getStandings(): Promise<Record<string, TeamStanding[]>> {
  return safe(fetchStandings, MOCK_STANDINGS);
}

export async function getMatchResults(): Promise<MatchResult[]> {
  return safe(fetchMatchResults, MOCK_MATCH_RESULTS);
}

export async function getPlayers(): Promise<Player[]> {
  return safe(fetchPlayers, MOCK_PLAYERS);
}

export async function getPlayerStats(): Promise<PlayerStats[]> {
  return safe(fetchPlayerStats, MOCK_PLAYER_STATS);
}

export async function getNews(): Promise<NewsItem[]> {
  return safe(fetchNews, MOCK_NEWS);
}

export async function getMvpCandidates(): Promise<MvpVoteOption[]> {
  return safe(fetchMvpCandidates, MOCK_MVP_CANDIDATES);
}

export async function getHeadToHead(): Promise<HeadToHead[]> {
  return safe(fetchHeadToHead, MOCK_HEAD_TO_HEAD);
}

export async function getStacks(): Promise<StackEntry[]> {
  return safe(fetchStacks, []);
}

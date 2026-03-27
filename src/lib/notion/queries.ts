import { notion } from './client'
import type { League, Season, Team, Round, Match, NewsItem } from '../types/app'
import {
  transformSeason,
  transformLeague,
  transformTeam,
  transformRound,
  transformMatch,
  transformNews,
} from './transformers'

const DB_IDS = {
  seasons: process.env.NOTION_SEASONS_DB_ID!,
  leagues: process.env.NOTION_LEAGUES_DB_ID!,
  teams: process.env.NOTION_TEAMS_DB_ID!,
  rounds: process.env.NOTION_ROUNDS_DB_ID!,
  matches: process.env.NOTION_MATCHES_DB_ID!,
  news: process.env.NOTION_NEWS_DB_ID!,
}

export async function getActiveSeason(): Promise<Season | null> {
  const response = await notion.databases.query({
    database_id: DB_IDS.seasons,
    filter: { property: 'Status', select: { equals: 'active' } },
  })
  if (response.results.length === 0) return null
  return transformSeason(response.results[0] as any)
}

export async function getLeagues(seasonId: string): Promise<League[]> {
  const response = await notion.databases.query({
    database_id: DB_IDS.leagues,
    filter: { property: 'Season', relation: { contains: seasonId } },
    sorts: [{ property: 'Order', direction: 'ascending' }],
  })
  return response.results.map((r) => transformLeague(r as any))
}

export async function getAllTeams(): Promise<Team[]> {
  const response = await notion.databases.query({
    database_id: DB_IDS.teams,
    filter: { property: 'IsActive', checkbox: { equals: true } },
  })
  return response.results.map((r) => transformTeam(r as any))
}

export async function getTeamBySlug(slug: string): Promise<Team | null> {
  const response = await notion.databases.query({
    database_id: DB_IDS.teams,
    filter: { property: 'Slug', rich_text: { equals: slug } },
  })
  if (response.results.length === 0) return null
  return transformTeam(response.results[0] as any)
}

export async function getRounds(leagueId: string): Promise<Round[]> {
  const response = await notion.databases.query({
    database_id: DB_IDS.rounds,
    filter: { property: 'League', relation: { contains: leagueId } },
    sorts: [{ property: 'RoundNumber', direction: 'ascending' }],
  })
  return response.results.map((r) => transformRound(r as any))
}

export async function getMatchesByLeague(leagueId: string): Promise<Match[]> {
  const rounds = await getRounds(leagueId)
  if (rounds.length === 0) return []
  const roundIds = rounds.map((r) => r.id)
  const allMatches: Match[] = []
  for (const roundId of roundIds) {
    const response = await notion.databases.query({
      database_id: DB_IDS.matches,
      filter: { property: 'Round', relation: { contains: roundId } },
    })
    allMatches.push(...response.results.map((r) => transformMatch(r as any)))
  }
  return allMatches
}

export async function getLatestNews(limit = 6): Promise<NewsItem[]> {
  const response = await notion.databases.query({
    database_id: DB_IDS.news,
    filter: { property: 'IsPublished', checkbox: { equals: true } },
    sorts: [{ property: 'PublishedAt', direction: 'descending' }],
    page_size: limit,
  })
  return response.results.map((r) => transformNews(r as any))
}

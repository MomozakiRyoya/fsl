import type { Season, League, Team, Round, Match, NewsItem } from '../types/app'

// Notionのプロパティ取得ヘルパー
function getText(prop: any): string {
  return prop?.rich_text?.[0]?.plain_text ?? ''
}
function getTitle(prop: any): string {
  return prop?.title?.[0]?.plain_text ?? ''
}
function getSelect(prop: any): string {
  return prop?.select?.name ?? ''
}
function getNumber(prop: any): number | null {
  return prop?.number ?? null
}
function getUrl(prop: any): string | null {
  return prop?.url ?? null
}
function getCheckbox(prop: any): boolean {
  return prop?.checkbox ?? false
}
function getDate(prop: any): string {
  return prop?.date?.start ?? ''
}
function getRelationId(prop: any): string {
  return prop?.relation?.[0]?.id ?? ''
}

export function transformSeason(page: any): Season {
  const p = page.properties
  return {
    id: page.id,
    name: getTitle(p.Name),
    status: getSelect(p.Status) as Season['status'],
    startDate: getDate(p.StartDate),
    endDate: getDate(p.EndDate),
    description: getText(p.Description),
    heroImageUrl: getUrl(p.HeroImageUrl),
    heroVideoUrl: getUrl(p.HeroVideoUrl),
    youtubePlaylistId: getText(p.YoutubePlaylistId) || null,
  }
}

export function transformLeague(page: any): League {
  const p = page.properties
  return {
    id: page.id,
    name: getTitle(p.Name),
    slug: getText(p.Slug),
    seasonId: getRelationId(p.Season),
    order: getNumber(p.Order) ?? 0,
    color: getText(p.Color) || '#2b70ef',
    description: getText(p.Description),
    maxTeams: getNumber(p.MaxTeams) ?? 8,
  }
}

export function transformTeam(page: any): Team {
  const p = page.properties
  return {
    id: page.id,
    name: getTitle(p.Name),
    slug: getText(p.Slug),
    leagueId: getRelationId(p.League),
    leagueName: '',
    logoUrl: getUrl(p.LogoUrl),
    homeColor: getText(p.HomeColor) || '#2b70ef',
    captainName: getText(p.CaptainName),
    description: getText(p.Description),
    twitterUrl: getUrl(p.TwitterUrl),
    instagramUrl: getUrl(p.InstagramUrl),
    isActive: getCheckbox(p.IsActive),
  }
}

export function transformRound(page: any): Round {
  const p = page.properties
  return {
    id: page.id,
    name: getTitle(p.Name),
    leagueId: getRelationId(p.League),
    leagueName: '',
    roundNumber: getNumber(p.RoundNumber) ?? 0,
    date: getDate(p.Date),
    venue: getText(p.Venue),
    venueUrl: getUrl(p.VenueUrl),
    status: getSelect(p.Status) as Round['status'],
    isPlayoff: getCheckbox(p.IsPlayoff),
  }
}

export function transformMatch(page: any): Match {
  const p = page.properties
  return {
    id: page.id,
    roundId: getRelationId(p.Round),
    homeTeamId: getRelationId(p.HomeTeam),
    homeTeamName: '',
    awayTeamId: getRelationId(p.AwayTeam),
    awayTeamName: '',
    homeScore: getNumber(p.HomeScore),
    awayScore: getNumber(p.AwayScore),
    homeRoundPt: getNumber(p.HomeRoundPt),
    awayRoundPt: getNumber(p.AwayRoundPt),
    status: getSelect(p.Status) as Match['status'],
  }
}

export function transformNews(page: any): NewsItem {
  const p = page.properties
  return {
    id: page.id,
    title: getTitle(p.Title),
    slug: getText(p.Slug),
    category: getSelect(p.Category) as NewsItem['category'],
    publishedAt: getDate(p.PublishedAt),
    thumbnailUrl: getUrl(p.ThumbnailUrl),
    body: getText(p.Body),
    isPublished: getCheckbox(p.IsPublished),
    seasonId: getRelationId(p.Season),
  }
}

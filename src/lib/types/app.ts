export type SeasonStatus = "active" | "upcoming" | "finished";
export type RoundStatus = "scheduled" | "next" | "finished";
export type NewsCategory = "結果" | "お知らせ" | "イベント";

export interface Season {
  id: string;
  name: string;
  status: SeasonStatus;
  startDate: string;
  endDate: string;
  description: string;
  heroImageUrl: string | null;
  heroVideoUrl: string | null;
  youtubePlaylistId: string | null;
}

export interface League {
  id: string;
  name: string;
  slug: string;
  seasonId: string;
  order: number;
  color: string;
  description: string;
  maxTeams: number;
}

export interface Team {
  id: string;
  name: string;
  slug: string;
  leagueId: string;
  leagueName: string;
  logoUrl: string | null;
  homeColor: string;
  captainName: string;
  description: string;
  twitterUrl: string | null;
  instagramUrl: string | null;
  isActive: boolean;
}

export interface Round {
  id: string;
  name: string;
  leagueId: string;
  leagueName: string;
  roundNumber: number;
  date: string;
  venue: string;
  venueUrl: string | null;
  status: RoundStatus;
  isPlayoff: boolean;
}

export interface Match {
  id: string;
  roundId: string;
  homeTeamId: string;
  homeTeamName: string;
  awayTeamId: string;
  awayTeamName: string;
  homeScore: number | null;
  awayScore: number | null;
  homeRoundPt: number | null;
  awayRoundPt: number | null;
  status: "scheduled" | "finished";
}

export interface TeamStanding {
  rank: number;
  teamId: string;
  teamName: string;
  teamLogoUrl: string | null;
  totalPoints: number;
  roundPoints: Record<number, number>;
}

export interface NewsItem {
  id: string;
  title: string;
  slug: string;
  category: NewsCategory;
  publishedAt: string;
  thumbnailUrl: string | null;
  body: string;
  isPublished: boolean;
  seasonId: string;
}

export interface ArchiveTeamResult {
  rank: number;
  teamName: string;
  totalPoints: number;
  promoted?: boolean;
  relegated?: boolean;
}

export interface ArchiveDivision {
  divisionName: string;
  champion: string;
  teams: ArchiveTeamResult[];
}

export interface ArchiveSeason {
  id: string;
  name: string;
  year: string;
  winner: string; // Division 1 champion
  divisions: ArchiveDivision[];
  totalTeams: number;
  totalRounds: number;
}

export interface MatchResultEntry {
  rank: number;
  teamId: string;
  teamName: string;
  points: number;
}

export interface MatchResult {
  roundId: string;
  results: MatchResultEntry[];
}

export interface Player {
  id: string;
  name: string;
  teamId: string;
  teamName: string;
  leagueId: string;
  number: number;
  birthday: string | null;
}

export interface PlayerStats {
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  leagueId: string;
  goals: number;
  assists: number;
  games: number;
  mvpCount: number;
}

export interface MvpVoteOption {
  playerId: string;
  playerName: string;
  teamName: string;
  roundId: string;
}

export interface StackEntry {
  roundId: string;
  leagueId: string;
  teamId: string;
  teamName: string;
  playerName: string;
  stackCount: number;
  breakNumber: number;
}

export interface HeadToHead {
  teamAId: string;
  teamBId: string;
  teamAName: string;
  teamBName: string;
  wins: number;
  draws: number;
  losses: number;
  teamAGoals: number;
  teamBGoals: number;
}

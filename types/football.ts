export interface FootballMatchDto {
  id: string;
  name: string;
  date: string;
  time: string | null;
  status: string | null;
  league: string;
  leagueId: string | null;
  homeTeam: string;
  awayTeam: string;
  homeScore: string | null;
  awayScore: string | null;
  homeBadge: string | null;
  awayBadge: string | null;
  venue: string | null;
}

export interface FootballLeagueDto {
  id: string;
  name: string;
  country: string;
  badge: string | null;
}

export interface FootballTeamDto {
  id: string;
  name: string;
  league: string;
  badge: string | null;
  country: string;
}

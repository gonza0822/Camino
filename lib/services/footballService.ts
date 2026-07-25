import type {
  FootballLeagueDto,
  FootballMatchDto,
  FootballTeamDto,
} from "@/types/football";
import type { FootballMatchesQuery } from "@/lib/validators/football";
import { POPULAR_FOOTBALL_LEAGUES } from "@/features/football/constants";
import { shiftDateKey, toArgentinaKickoff } from "@/lib/utils/date";

const API_BASE = "https://www.thesportsdb.com/api/v1/json";

export { POPULAR_FOOTBALL_LEAGUES };
function getApiKey(): string {
  const key = process.env.THESPORTSDB_API_KEY?.trim();
  if (!key) {
    throw new Error("Missing THESPORTSDB_API_KEY environment variable");
  }
  return key;
}

function apiUrl(path: string, params?: Record<string, string>): string {
  const url = new URL(`${API_BASE}/${getApiKey()}/${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }
  return url.toString();
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`TheSportsDB request failed (${response.status})`);
  }

  return (await response.json()) as T;
}

interface RawEvent {
  idEvent?: string;
  strEvent?: string;
  dateEvent?: string;
  dateEventLocal?: string | null;
  strTime?: string | null;
  strTimeLocal?: string | null;
  strTimestamp?: string | null;
  strStatus?: string | null;
  strLeague?: string;
  idLeague?: string | null;
  strHomeTeam?: string;
  strAwayTeam?: string;
  intHomeScore?: string | null;
  intAwayScore?: string | null;
  strHomeTeamBadge?: string | null;
  strAwayTeamBadge?: string | null;
  strVenue?: string | null;
  strSport?: string;
}

interface RawLeague {
  idLeague?: string;
  strLeague?: string;
  strCountry?: string;
  strBadge?: string | null;
  strSport?: string;
}

interface RawTeam {
  idTeam?: string;
  strTeam?: string;
  strLeague?: string;
  strBadge?: string | null;
  strCountry?: string;
  strSport?: string;
}

function toMatchDto(event: RawEvent): FootballMatchDto | null {
  if (!event.idEvent || !event.strEvent || !event.dateEvent) return null;
  if (event.strSport && event.strSport !== "Soccer") return null;

  const kickoff = toArgentinaKickoff(
    event.dateEvent,
    event.strTime,
    event.strTimestamp,
  );

  return {
    id: event.idEvent,
    name: event.strEvent,
    date: kickoff.date,
    time: kickoff.time,
    status: event.strStatus ?? null,
    league: event.strLeague ?? "",
    leagueId: event.idLeague ?? null,
    homeTeam: event.strHomeTeam ?? "",
    awayTeam: event.strAwayTeam ?? "",
    homeScore: event.intHomeScore ?? null,
    awayScore: event.intAwayScore ?? null,
    homeBadge: event.strHomeTeamBadge || null,
    awayBadge: event.strAwayTeamBadge || null,
    venue: event.strVenue || null,
  };
}

function toLeagueDto(league: RawLeague): FootballLeagueDto | null {
  if (!league.idLeague || !league.strLeague) return null;
  if (league.strSport && league.strSport !== "Soccer") return null;

  return {
    id: league.idLeague,
    name: league.strLeague,
    country: league.strCountry ?? "",
    badge: league.strBadge || null,
  };
}

function toTeamDto(team: RawTeam): FootballTeamDto | null {
  if (!team.idTeam || !team.strTeam) return null;
  if (team.strSport && team.strSport !== "Soccer") return null;

  return {
    id: team.idTeam,
    name: team.strTeam,
    league: team.strLeague ?? "",
    badge: team.strBadge || null,
    country: team.strCountry ?? "",
  };
}

// Fetches soccer matches by date, league, and/or team from TheSportsDB.
export async function searchFootballMatches(
  query: FootballMatchesQuery,
): Promise<FootballMatchDto[]> {
  if (query.teamId) {
    const path = query.scope === "last" ? "eventslast.php" : "eventsnext.php";
    const data = await fetchJson<{ events?: RawEvent[] | null; results?: RawEvent[] | null }>(
      apiUrl(path, { id: query.teamId }),
    );
    const raw = data.events ?? data.results ?? [];
    return raw.map(toMatchDto).filter((m): m is FootballMatchDto => m !== null);
  }

  if (query.date) {
    // Fetch neighboring UTC days so kickoffs that cross midnight still match Argentina date.
    const dates = [
      shiftDateKey(query.date, -1),
      query.date,
      shiftDateKey(query.date, 1),
    ];
    const results = await Promise.all(
      dates.map(async (day) => {
        const params: Record<string, string> = { d: day, s: "Soccer" };
        if (query.leagueId) params.l = query.leagueId;
        const data = await fetchJson<{ events?: RawEvent[] | null }>(
          apiUrl("eventsday.php", params),
        );
        return data.events ?? [];
      }),
    );

    const byId = new Map<string, FootballMatchDto>();
    for (const event of results.flat()) {
      const match = toMatchDto(event);
      if (match && match.date === query.date) byId.set(match.id, match);
    }
    return Array.from(byId.values()).sort((a, b) =>
      (a.time ?? "").localeCompare(b.time ?? ""),
    );
  }

  if (query.leagueId) {
    const path =
      query.scope === "last" ? "eventspastleague.php" : "eventsnextleague.php";
    const data = await fetchJson<{ events?: RawEvent[] | null }>(
      apiUrl(path, { id: query.leagueId }),
    );
    return (data.events ?? [])
      .map(toMatchDto)
      .filter((m): m is FootballMatchDto => m !== null);
  }

  return [];
}

// Lists soccer leagues for a country (or popular defaults).
export async function listFootballLeagues(country?: string): Promise<FootballLeagueDto[]> {
  if (!country) return POPULAR_FOOTBALL_LEAGUES;

  const data = await fetchJson<{ countries?: RawLeague[] | null }>(
    apiUrl("search_all_leagues.php", { c: country, s: "Soccer" }),
  );

  const leagues = (data.countries ?? [])
    .map(toLeagueDto)
    .filter((l): l is FootballLeagueDto => l !== null);

  return leagues.length > 0 ? leagues : POPULAR_FOOTBALL_LEAGUES;
}

// Searches soccer teams by name (free API key is heavily limited).
export async function searchFootballTeams(q: string): Promise<FootballTeamDto[]> {
  const data = await fetchJson<{ teams?: RawTeam[] | null }>(
    apiUrl("searchteams.php", { t: q }),
  );

  return (data.teams ?? [])
    .map(toTeamDto)
    .filter((t): t is FootballTeamDto => t !== null);
}

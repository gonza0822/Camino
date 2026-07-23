"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { appContent } from "@/lib/content/app";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/PageHeader";
import { POPULAR_FOOTBALL_LEAGUES } from "@/features/football/constants";
import { cn } from "@/lib/utils/cn";
import type { FootballMatchDto, FootballTeamDto } from "@/types/football";

function todayKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatScore(match: FootballMatchDto): string {
  if (match.homeScore == null || match.awayScore == null) return "vs";
  return `${match.homeScore} - ${match.awayScore}`;
}

export function FootballExplorer() {
  const [date, setDate] = useState(todayKey());
  const [leagueId, setLeagueId] = useState("");
  const [teamQuery, setTeamQuery] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<FootballTeamDto | null>(null);
  const [teamOptions, setTeamOptions] = useState<FootballTeamDto[]>([]);
  const [scope, setScope] = useState<"next" | "last">("next");
  const [matches, setMatches] = useState<FootballMatchDto[]>([]);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (teamQuery.trim().length < 2 || selectedTeam) {
      setTeamOptions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/football/teams?q=${encodeURIComponent(teamQuery.trim())}`,
        );
        if (!res.ok) return;
        const data = (await res.json()) as { teams: FootballTeamDto[] };
        setTeamOptions(data.teams.slice(0, 8));
      } catch {
        setTeamOptions([]);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [teamQuery, selectedTeam]);

  function clearTeam() {
    setSelectedTeam(null);
    setTeamQuery("");
    setTeamOptions([]);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSearched(true);

    const params = new URLSearchParams();
    if (selectedTeam) {
      params.set("teamId", selectedTeam.id);
      params.set("scope", scope);
    } else if (date) {
      params.set("date", date);
      if (leagueId) params.set("leagueId", leagueId);
    } else if (leagueId) {
      params.set("leagueId", leagueId);
      params.set("scope", scope);
    } else {
      setError(appContent.football.errors.needFilter);
      setMatches([]);
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch(`/api/football/matches?${params.toString()}`);
        const data = (await res.json()) as { matches?: FootballMatchDto[]; error?: string };
        if (!res.ok) {
          setError(data.error ?? appContent.football.errors.fetch);
          setMatches([]);
          return;
        }
        setMatches(data.matches ?? []);
      } catch {
        setError(appContent.football.errors.fetch);
        setMatches([]);
      }
    });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto">
      <Card>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Input
              label={appContent.football.date}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            <div className="flex w-full min-w-0 flex-col gap-1.5">
              <label htmlFor="football-league" className="text-sm font-medium text-primary">
                {appContent.football.league}
              </label>
              <select
                id="football-league"
                value={leagueId}
                onChange={(e) => setLeagueId(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">{appContent.football.anyLeague}</option>
                {POPULAR_FOOTBALL_LEAGUES.map((league) => (
                  <option key={league.id} value={league.id}>
                    {league.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative flex w-full min-w-0 flex-col gap-1.5 sm:col-span-2 lg:col-span-1">
              <Input
                label={appContent.football.team}
                placeholder={appContent.football.teamPlaceholder}
                value={selectedTeam ? selectedTeam.name : teamQuery}
                onChange={(e) => {
                  setSelectedTeam(null);
                  setTeamQuery(e.target.value);
                }}
              />
              {teamOptions.length > 0 && !selectedTeam && (
                <ul className="absolute top-full z-20 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-border bg-surface shadow-md">
                  {teamOptions.map((team) => (
                    <li key={team.id}>
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-primary/5 cursor-pointer"
                        onClick={() => {
                          setSelectedTeam(team);
                          setTeamQuery(team.name);
                          setTeamOptions([]);
                        }}
                      >
                        {team.badge && (
                          <Image
                            src={team.badge}
                            alt=""
                            width={20}
                            height={20}
                            className="h-5 w-5 object-contain"
                          />
                        )}
                        <span className="truncate">{team.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {selectedTeam && (
                <button
                  type="button"
                  onClick={clearTeam}
                  className="absolute right-2 top-8 text-xs text-muted hover:text-primary cursor-pointer"
                >
                  {appContent.football.clearTeam}
                </button>
              )}
            </div>

            <div className="flex w-full min-w-0 flex-col gap-1.5">
              <label htmlFor="football-scope" className="text-sm font-medium text-primary">
                {appContent.football.scope}
              </label>
              <select
                id="football-scope"
                value={scope}
                onChange={(e) => setScope(e.target.value as "next" | "last")}
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="next">{appContent.football.scopeNext}</option>
                <option value="last">{appContent.football.scopeLast}</option>
              </select>
            </div>
          </div>

          <p className="text-xs text-muted">{appContent.football.hint}</p>

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? appContent.football.searching : appContent.football.search}
            </Button>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      </Card>

      <Card className="min-h-0 flex-1 overflow-auto">
        {!searched ? (
          <p className="py-10 text-center text-sm text-muted">{appContent.football.start}</p>
        ) : matches.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">{appContent.football.empty}</p>
        ) : (
          <ul className="divide-y divide-border/70">
            {matches.map((match) => (
              <li
                key={match.id}
                className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted">
                    {match.date}
                    {match.time ? ` · ${match.time.slice(0, 5)}` : ""}
                    {match.league ? ` · ${match.league}` : ""}
                  </p>
                  <div className="mt-1 flex items-center gap-2 sm:gap-3">
                    <TeamBadge src={match.homeBadge} />
                    <span className="truncate text-sm font-semibold text-foreground">
                      {match.homeTeam}
                    </span>
                    <span
                      className={cn(
                        "shrink-0 rounded-md px-2 py-0.5 text-xs font-bold tabular-nums",
                        match.homeScore != null
                          ? "bg-primary/10 text-primary"
                          : "bg-surface-soft text-muted",
                      )}
                    >
                      {formatScore(match)}
                    </span>
                    <span className="truncate text-sm font-semibold text-foreground">
                      {match.awayTeam}
                    </span>
                    <TeamBadge src={match.awayBadge} />
                  </div>
                  {match.venue && (
                    <p className="mt-1 text-xs text-muted">{match.venue}</p>
                  )}
                </div>
                {match.status && (
                  <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-muted">
                    {match.status}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function TeamBadge({ src }: { src: string | null }) {
  if (!src) return <span className="h-6 w-6 shrink-0 rounded-full bg-primary/10" aria-hidden />;
  return (
    <Image
      src={src}
      alt=""
      width={24}
      height={24}
      className="h-6 w-6 shrink-0 object-contain"
    />
  );
}

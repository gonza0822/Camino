"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { appContent } from "@/lib/content/app";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/PageHeader";
import { POPULAR_FOOTBALL_LEAGUES } from "@/features/football/constants";
import { addFootballMatchToAgendaAction } from "@/app/actions/football";
import { isDateInCurrentWeek } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  clearFootballSearch,
  clearSelectedTeam,
  markMatchAdded,
  searchFailed,
  searchStarted,
  searchSucceeded,
  setActionMessage,
  setDate,
  setLeagueId,
  setScope,
  setSelectedTeam,
  setTeamQuery,
} from "@/store/slices/footballSearchSlice";
import type { FootballMatchDto, FootballTeamDto } from "@/types/football";

function formatScore(match: FootballMatchDto): string {
  if (match.homeScore == null || match.awayScore == null) return "vs";
  return `${match.homeScore} - ${match.awayScore}`;
}

export function FootballExplorer() {
  const dispatch = useAppDispatch();
  const {
    date,
    leagueId,
    teamQuery,
    selectedTeam,
    scope,
    matches,
    searched,
    error,
    actionMessage,
    addedMatchIds,
  } = useAppSelector((state) => state.footballSearch);

  const [teamOptions, setTeamOptions] = useState<FootballTeamDto[]>([]);
  const [addingMatchId, setAddingMatchId] = useState<string | null>(null);
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

  function handleAddToAgenda(match: FootballMatchDto) {
    if (!isDateInCurrentWeek(match.date) || addedMatchIds.includes(match.id)) return;

    dispatch(setActionMessage(""));
    setAddingMatchId(match.id);

    startTransition(async () => {
      const result = await addFootballMatchToAgendaAction({
        matchId: match.id,
        date: match.date,
        time: match.time,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
      });

      setAddingMatchId(null);

      if (result.error === "OUT_OF_WEEK") {
        dispatch(setActionMessage(appContent.football.errors.outOfWeek));
        return;
      }
      if (result.error === "SLOT_OCCUPIED") {
        dispatch(
          setActionMessage(
            `${appContent.football.errors.slotOccupied}${
              result.hour != null ? ` (${String(result.hour).padStart(2, "0")}:00)` : ""
            }`,
          ),
        );
        return;
      }
      if (result.error) {
        dispatch(setActionMessage(appContent.football.errors.addFailed));
        return;
      }

      dispatch(markMatchAdded(match.id));
      dispatch(
        setActionMessage(
          `${appContent.football.addedToAgenda}: ${match.date} · ${String(result.hour).padStart(2, "0")}:00`,
        ),
      );
    });
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    dispatch(searchStarted());

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
      dispatch(searchFailed(appContent.football.errors.needFilter));
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch(`/api/football/matches?${params.toString()}`);
        const data = (await res.json()) as { matches?: FootballMatchDto[]; error?: string };
        if (!res.ok) {
          dispatch(searchFailed(data.error ?? appContent.football.errors.fetch));
          return;
        }
        dispatch(searchSucceeded(data.matches ?? []));
      } catch {
        dispatch(searchFailed(appContent.football.errors.fetch));
      }
    });
  }

  function handleClearSearch() {
    dispatch(clearFootballSearch());
    setTeamOptions([]);
    setAddingMatchId(null);
  }

  const hasActiveSearch =
    searched ||
    Boolean(leagueId) ||
    Boolean(selectedTeam) ||
    Boolean(teamQuery) ||
    matches.length > 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 pb-4 lg:min-h-0 lg:overflow-hidden">
      <Card className="shrink-0">
        <form onSubmit={handleSearch} className="space-y-3 sm:space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Input
              label={appContent.football.date}
              type="date"
              value={date}
              onChange={(e) => dispatch(setDate(e.target.value))}
            />

            <div className="flex w-full min-w-0 flex-col gap-1.5">
              <label htmlFor="football-league" className="text-sm font-medium text-primary">
                {appContent.football.league}
              </label>
              <select
                id="football-league"
                value={leagueId}
                onChange={(e) => dispatch(setLeagueId(e.target.value))}
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
                onChange={(e) => dispatch(setTeamQuery(e.target.value))}
              />
              {teamOptions.length > 0 && !selectedTeam && (
                <ul className="absolute top-full z-20 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-border bg-surface shadow-md">
                  {teamOptions.map((team) => (
                    <li key={team.id}>
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-primary/5 cursor-pointer"
                        onClick={() => {
                          dispatch(setSelectedTeam(team));
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
                  onClick={() => dispatch(clearSelectedTeam())}
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
                onChange={(e) => dispatch(setScope(e.target.value as "next" | "last"))}
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="next">{appContent.football.scopeNext}</option>
                <option value="last">{appContent.football.scopeLast}</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={isPending && !addingMatchId}>
              {isPending && !addingMatchId
                ? appContent.football.searching
                : appContent.football.search}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={!hasActiveSearch || (isPending && !addingMatchId)}
              onClick={handleClearSearch}
            >
              {appContent.football.clearSearch}
            </Button>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {actionMessage && <p className="text-sm text-primary">{actionMessage}</p>}
        </form>
      </Card>

      <Card className="min-h-[70vh] shrink-0 lg:min-h-0 lg:flex-1 lg:overflow-auto">
        {!searched ? (
          <p className="py-10 text-center text-sm text-muted">{appContent.football.start}</p>
        ) : matches.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">{appContent.football.empty}</p>
        ) : (
          <ul className="divide-y divide-border/70">
            {matches.map((match) => {
              const inWeek = isDateInCurrentWeek(match.date);
              const alreadyAdded = addedMatchIds.includes(match.id);
              const isAdding = addingMatchId === match.id;

              return (
                <li
                  key={match.id}
                  className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
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

                  <div className="flex shrink-0 flex-col items-stretch gap-1 sm:items-end">
                    {match.status && (
                      <span className="text-xs font-medium uppercase tracking-wide text-muted">
                        {match.status}
                      </span>
                    )}
                    <Button
                      type="button"
                      size="sm"
                      variant={alreadyAdded ? "secondary" : "primary"}
                      disabled={!inWeek || alreadyAdded || isAdding}
                      title={
                        !inWeek
                          ? appContent.football.outOfWeek
                          : appContent.football.addToAgenda
                      }
                      onClick={() => handleAddToAgenda(match)}
                    >
                      {alreadyAdded
                        ? appContent.football.addedToAgenda
                        : !inWeek
                          ? appContent.football.outOfWeek
                          : isAdding
                            ? "..."
                            : appContent.football.addToAgenda}
                    </Button>
                  </div>
                </li>
              );
            })}
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

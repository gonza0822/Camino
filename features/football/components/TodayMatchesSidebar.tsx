"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { appContent } from "@/lib/content/app";
import { Button } from "@/components/ui/Button";
import { addFootballMatchToAgendaAction } from "@/app/actions/football";
import { cn } from "@/lib/utils/cn";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setTodayMatchesPanelWidth,
  TODAY_MATCHES_PANEL_MAX,
  TODAY_MATCHES_PANEL_MIN,
} from "@/store/slices/uiSlice";
import type { FootballMatchDto } from "@/types/football";

interface TodayMatchesSidebarProps {
  matches: FootballMatchDto[];
  fetchError?: boolean;
}

export function TodayMatchesSidebar({ matches, fetchError = false }: TodayMatchesSidebarProps) {
  const dispatch = useAppDispatch();
  const panelWidth = useAppSelector((state) => state.ui.todayMatchesPanelWidth);
  const [addedMatchIds, setAddedMatchIds] = useState<string[]>([]);
  const [addingMatchId, setAddingMatchId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isResizing, setIsResizing] = useState(false);
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null);
  const [, startTransition] = useTransition();

  const onResizePointerDown = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      dragRef.current = { startX: event.clientX, startWidth: panelWidth };
      setIsResizing(true);
      event.currentTarget.setPointerCapture(event.pointerId);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [panelWidth],
  );

  const onResizePointerMove = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (!dragRef.current) return;
      const nextWidth = dragRef.current.startWidth + (dragRef.current.startX - event.clientX);
      dispatch(setTodayMatchesPanelWidth(nextWidth));
    },
    [dispatch],
  );

  const onResizePointerUp = useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    setIsResizing(false);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  function handleAdd(match: FootballMatchDto) {
    if (addedMatchIds.includes(match.id)) return;

    setMessage("");
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

      if (result.error === "SLOT_OCCUPIED") {
        setMessage(
          `${appContent.football.errors.slotOccupied}${
            result.hour != null ? ` (${String(result.hour).padStart(2, "0")}:00)` : ""
          }`,
        );
        return;
      }
      if (result.error) {
        setMessage(appContent.football.errors.addFailed);
        return;
      }

      setAddedMatchIds((prev) => [...prev, match.id]);
      setMessage(
        `${appContent.football.addedToAgenda} · ${String(result.hour).padStart(2, "0")}:00`,
      );
    });
  }

  return (
    <aside
      className="relative flex h-[30vh] w-full shrink-0 flex-col self-stretch overflow-hidden border-t border-border/70 bg-surface lg:h-full lg:w-[var(--today-matches-width)] lg:border-l lg:border-t-0"
      style={
        {
          ["--today-matches-width" as string]: `${panelWidth}px`,
        } as React.CSSProperties
      }
    >
      <button
        type="button"
        aria-label="Redimensionar panel de partidos"
        aria-valuemin={TODAY_MATCHES_PANEL_MIN}
        aria-valuemax={TODAY_MATCHES_PANEL_MAX}
        aria-valuenow={panelWidth}
        role="slider"
        onPointerDown={onResizePointerDown}
        onPointerMove={onResizePointerMove}
        onPointerUp={onResizePointerUp}
        onPointerCancel={onResizePointerUp}
        className={cn(
          "absolute inset-y-0 left-0 z-10 hidden w-1.5 -translate-x-1/2 cursor-col-resize touch-none lg:block",
          "rounded-full bg-transparent transition-colors duration-150 hover:bg-primary/40",
          isResizing && "bg-primary/50",
        )}
      />

      <div className="flex shrink-0 items-center justify-between border-b border-border/70 px-3 py-2">
        <h2 className="text-sm font-semibold text-primary">
          {appContent.dashboard.todayMatchesTitle}
        </h2>
        <Link
          href="/futbol"
          className="text-xs font-medium text-cta hover:underline cursor-pointer"
        >
          {appContent.dashboard.todayMatchesMore}
        </Link>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2 lg:p-3">
        {fetchError ? (
          <p className="py-4 text-center text-xs text-muted">
            {appContent.dashboard.todayMatchesError}
          </p>
        ) : matches.length === 0 ? (
          <p className="py-4 text-center text-xs text-muted">
            {appContent.dashboard.todayMatchesEmpty}
          </p>
        ) : (
          <ul className="space-y-2">
            {matches.map((match) => {
              const alreadyAdded = addedMatchIds.includes(match.id);
              const isAdding = addingMatchId === match.id;

              return (
                <li
                  key={match.id}
                  className="rounded-lg border border-border/70 bg-background/60 p-2"
                >
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] leading-tight text-muted">
                        {match.time ? match.time.slice(0, 5) : "--:--"}
                        {match.league ? ` · ${match.league}` : ""}
                      </p>
                      <div className="mt-1 flex items-center gap-1">
                        <TeamBadge src={match.homeBadge} />
                        <span className="min-w-0 truncate text-xs font-semibold text-foreground">
                          {match.homeTeam}
                        </span>
                        <span className="shrink-0 text-[10px] text-muted">vs</span>
                        <TeamBadge src={match.awayBadge} />
                        <span className="min-w-0 truncate text-xs font-semibold text-foreground">
                          {match.awayTeam}
                        </span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant={alreadyAdded ? "secondary" : "primary"}
                      className="shrink-0 px-2.5 text-[11px]"
                      disabled={alreadyAdded || isAdding}
                      onClick={() => handleAdd(match)}
                    >
                      {alreadyAdded
                        ? appContent.football.addedToAgenda
                        : isAdding
                          ? "..."
                          : appContent.football.addToAgendaShort}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {message && (
          <p
            className={cn(
              "mt-2 text-xs",
              message.includes(appContent.football.errors.slotOccupied) ||
                message.includes(appContent.football.errors.addFailed)
                ? "text-red-600"
                : "text-primary",
            )}
          >
            {message}
          </p>
        )}
      </div>
    </aside>
  );
}

function TeamBadge({ src }: { src: string | null }) {
  if (!src) {
    return <span className="h-4 w-4 shrink-0 rounded-full bg-primary/10" aria-hidden />;
  }
  return (
    <Image
      src={src}
      alt=""
      width={16}
      height={16}
      className="h-4 w-4 shrink-0 object-contain"
    />
  );
}

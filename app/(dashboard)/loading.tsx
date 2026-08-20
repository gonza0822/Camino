import { cn } from "@/lib/utils/cn";

// Instant feedback while the next dashboard Server Component loads.
export default function DashboardLoading() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4" aria-busy="true" aria-live="polite">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-2">
          <div className="h-7 w-40 animate-pulse rounded-md bg-primary/15" />
          <div className="h-4 w-56 animate-pulse rounded-md bg-primary/10" />
        </div>
        <div className="h-9 w-28 animate-pulse rounded-lg bg-primary/10" />
      </div>

      <div
        className={cn(
          "min-h-0 flex-1 rounded-xl border border-border/70 bg-surface/70 p-4",
          "shadow-sm",
        )}
      >
        <div className="space-y-3">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="h-4 w-10 shrink-0 animate-pulse rounded bg-primary/10" />
              <div className="h-9 flex-1 animate-pulse rounded-md bg-primary/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

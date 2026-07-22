"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { appContent } from "@/lib/content/app";
import { Button } from "@/components/ui/Button";
import { toDateKey, parseDateKey } from "@/lib/utils/date";

interface WeekNavigatorProps {
  weekStart: string;
}

export function WeekNavigator({ weekStart }: WeekNavigatorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function navigateWeek(offset: number) {
    const date = parseDateKey(weekStart);
    date.setDate(date.getDate() + offset * 7);
    const newWeek = toDateKey(date);
    const params = new URLSearchParams(searchParams.toString());
    params.set("week", newWeek);
    params.delete("day");
    router.push(`/semanal?${params.toString()}`);
  }

  return (
    <div className="flex gap-2">
      <Button variant="secondary" size="sm" onClick={() => navigateWeek(-1)}>
        {appContent.weekly.prevWeek}
      </Button>
      <Button variant="secondary" size="sm" onClick={() => navigateWeek(1)}>
        {appContent.weekly.nextWeek}
      </Button>
    </div>
  );
}

interface PeriodNavigatorProps {
  basePath: string;
  paramName: string;
  current: number;
  prevLabel: string;
  nextLabel: string;
}

export function PeriodNavigator({
  basePath,
  paramName,
  current,
  prevLabel,
  nextLabel,
}: PeriodNavigatorProps) {
  const router = useRouter();

  function navigate(offset: number) {
    router.push(`${basePath}?${paramName}=${current + offset}`);
  }

  return (
    <div className="flex gap-2">
      <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
        {prevLabel}
      </Button>
      <Button variant="secondary" size="sm" onClick={() => navigate(1)}>
        {nextLabel}
      </Button>
    </div>
  );
}

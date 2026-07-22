"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { appContent } from "@/lib/content/app";
import { Button } from "@/components/ui/Button";

interface MonthNavigatorProps {
  year: number;
  month: number;
}

export function MonthNavigator({ year, month }: MonthNavigatorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function navigateMonth(offset: number) {
    const date = new Date(year, month - 1 + offset, 1);
    const params = new URLSearchParams(searchParams.toString());
    params.set("year", String(date.getFullYear()));
    params.set("month", String(date.getMonth() + 1));
    router.push(`/objetivos-mensuales?${params.toString()}`);
  }

  return (
    <div className="flex gap-2">
      <Button variant="secondary" size="sm" onClick={() => navigateMonth(-1)}>
        {appContent.monthlyGoals.prevMonth}
      </Button>
      <Button variant="secondary" size="sm" onClick={() => navigateMonth(1)}>
        {appContent.monthlyGoals.nextMonth}
      </Button>
    </div>
  );
}

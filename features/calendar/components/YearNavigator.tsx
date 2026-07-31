"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { appContent } from "@/lib/content/app";
import { Button } from "@/components/ui/Button";

interface YearNavigatorProps {
  year: number;
}

export function YearNavigator({ year }: YearNavigatorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const copy = appContent.calendar;

  function navigateYear(offset: number) {
    const nextYear = year + offset;
    const params = new URLSearchParams(searchParams.toString());
    params.set("year", String(nextYear));
    params.delete("date");
    router.push(`/calendario?${params.toString()}`);
  }

  return (
    <div className="flex gap-2">
      <Button variant="secondary" size="sm" onClick={() => navigateYear(-1)}>
        {copy.prevYear}
      </Button>
      <Button variant="secondary" size="sm" onClick={() => navigateYear(1)}>
        {copy.nextYear}
      </Button>
    </div>
  );
}

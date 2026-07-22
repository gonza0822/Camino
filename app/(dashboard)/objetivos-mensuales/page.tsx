import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { appContent } from "@/lib/content/app";
import { getSessionUserId } from "@/lib/auth/session";
import { getMonthlyGoals } from "@/lib/services/goalService";
import { getMonthName } from "@/lib/utils/date";
import { PageHeader, Card } from "@/components/ui/PageHeader";
import { MonthNavigator } from "@/features/planning/components/MonthNavigator";
import { MonthlyGoalsSection } from "@/features/goals/components/MonthlyGoalsSection";
import {
  createMonthlyGoalAction,
  updateMonthlyGoalAction,
  deleteMonthlyGoalAction,
} from "@/app/actions/goals";

export const metadata: Metadata = {
  title: appContent.nav.monthlyGoals,
};

interface MonthlyPageProps {
  searchParams: Promise<{ year?: string; month?: string }>;
}

export default async function MonthlyGoalsPage({ searchParams }: MonthlyPageProps) {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const params = await searchParams;
  const now = new Date();
  const year = params.year ? Number(params.year) : now.getFullYear();
  const month = params.month ? Number(params.month) : now.getMonth() + 1;

  const goals = await getMonthlyGoals(userId, year, month);

  return (
    <>
      <PageHeader
        title={appContent.monthlyGoals.title}
        subtitle={`${getMonthName(month)} ${year}`}
      >
        <Suspense fallback={null}>
          <MonthNavigator year={year} month={month} />
        </Suspense>
      </PageHeader>

      <Card>
        <MonthlyGoalsSection
          year={year}
          month={month}
          goals={goals}
          createAction={createMonthlyGoalAction}
          updateAction={updateMonthlyGoalAction}
          deleteAction={deleteMonthlyGoalAction}
        />
      </Card>
    </>
  );
}

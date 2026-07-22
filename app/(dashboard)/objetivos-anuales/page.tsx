import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { appContent } from "@/lib/content/app";
import { getSessionUserId } from "@/lib/auth/session";
import { getAnnualGoals } from "@/lib/services/goalService";
import { PageHeader, Card } from "@/components/ui/PageHeader";
import { PeriodNavigator } from "@/features/planning/components/PeriodNavigator";
import { AnnualGoalsSection } from "@/features/goals/components/AnnualGoalsSection";
import {
  createAnnualGoalAction,
  updateAnnualGoalAction,
  deleteAnnualGoalAction,
} from "@/app/actions/goals";

export const metadata: Metadata = {
  title: appContent.nav.annualGoals,
};

interface AnnualPageProps {
  searchParams: Promise<{ year?: string }>;
}

export default async function AnnualGoalsPage({ searchParams }: AnnualPageProps) {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const params = await searchParams;
  const year = params.year ? Number(params.year) : new Date().getFullYear();

  const goals = await getAnnualGoals(userId, year);

  return (
    <>
      <PageHeader title={appContent.annualGoals.title} subtitle={String(year)}>
        <Suspense fallback={null}>
          <PeriodNavigator
            basePath="/objetivos-anuales"
            paramName="year"
            current={year}
            prevLabel={appContent.annualGoals.prevYear}
            nextLabel={appContent.annualGoals.nextYear}
          />
        </Suspense>
      </PageHeader>

      <Card>
        <AnnualGoalsSection
          year={year}
          goals={goals}
          createAction={createAnnualGoalAction}
          updateAction={updateAnnualGoalAction}
          deleteAction={deleteAnnualGoalAction}
        />
      </Card>
    </>
  );
}

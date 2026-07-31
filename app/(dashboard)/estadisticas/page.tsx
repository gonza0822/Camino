import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { appContent } from "@/lib/content/app";
import { getSessionUserId } from "@/lib/auth/session";
import { getDashboardStats } from "@/lib/services/statsService";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatsDashboard } from "@/features/stats/components/StatsDashboard";

export const metadata: Metadata = {
  title: appContent.nav.statistics,
  description: appContent.stats.subtitle,
  robots: { index: false, follow: false },
};

export default async function StatisticsPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const stats = await getDashboardStats(userId);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-4">
      <PageHeader
        title={appContent.stats.title}
        subtitle={appContent.stats.subtitle}
        className="mb-3 shrink-0 sm:mb-5"
      />
      <StatsDashboard stats={stats} />
    </div>
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { appContent } from "@/lib/content/app";
import { getSessionUserId } from "@/lib/auth/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { FootballExplorer } from "@/features/football/components/FootballExplorer";

export const metadata: Metadata = {
  title: appContent.nav.football,
  description: appContent.football.subtitle,
  robots: { index: false, follow: false },
};

export default async function FootballPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:overflow-hidden">
      <PageHeader
        title={appContent.football.title}
        subtitle={appContent.football.subtitle}
        className="mb-3 shrink-0 sm:mb-5"
      />
      <FootballExplorer />
    </div>
  );
}

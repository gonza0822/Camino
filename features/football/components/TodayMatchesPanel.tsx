import { TodayMatchesSidebar } from "@/features/football/components/TodayMatchesSidebar";
import { searchFootballMatches } from "@/lib/services/footballService";

// Streams today's matches separately so the agenda is not blocked by TheSportsDB.
export async function TodayMatchesPanel({ date }: { date: string }) {
  try {
    const matches = await searchFootballMatches({ date, scope: "next" });
    return <TodayMatchesSidebar matches={matches} fetchError={false} />;
  } catch {
    return <TodayMatchesSidebar matches={[]} fetchError={true} />;
  }
}

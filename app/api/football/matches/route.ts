import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { footballMatchesQuerySchema } from "@/lib/validators/football";
import { searchFootballMatches } from "@/lib/services/footballService";
// GET /api/football/matches — soccer fixtures by date, league, or team.
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = footballMatchesQuerySchema.safeParse({
    date: searchParams.get("date") ?? undefined,
    leagueId: searchParams.get("leagueId") ?? undefined,
    teamId: searchParams.get("teamId") ?? undefined,
    scope: searchParams.get("scope") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  try {
    const matches = await searchFootballMatches(parsed.data);
    return NextResponse.json({ matches });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    if (message.includes("THESPORTSDB_API_KEY")) {
      return NextResponse.json({ error: "Football API not configured" }, { status: 503 });
    }
    return NextResponse.json({ error: "Failed to fetch matches" }, { status: 502 });
  }
}

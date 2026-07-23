import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { footballTeamsQuerySchema } from "@/lib/validators/football";
import { searchFootballTeams } from "@/lib/services/footballService";

// GET /api/football/teams — search soccer teams by name.
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = footballTeamsQuerySchema.safeParse({
    q: searchParams.get("q") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  try {
    const teams = await searchFootballTeams(parsed.data.q);
    return NextResponse.json({ teams });
  } catch {
    return NextResponse.json({ error: "Failed to fetch teams" }, { status: 502 });
  }
}

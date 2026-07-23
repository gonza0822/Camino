import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { footballLeaguesQuerySchema } from "@/lib/validators/football";
import { listFootballLeagues } from "@/lib/services/footballService";

// GET /api/football/leagues — soccer leagues by country or popular defaults.
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = footballLeaguesQuerySchema.safeParse({
    country: searchParams.get("country") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  try {
    const leagues = await listFootballLeagues(parsed.data.country);
    return NextResponse.json({ leagues });
  } catch {
    return NextResponse.json({ error: "Failed to fetch leagues" }, { status: 502 });
  }
}

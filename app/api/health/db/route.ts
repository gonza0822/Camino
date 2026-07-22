import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/db/mongodb";

// Dev-only endpoint to verify MongoDB connectivity from Node.js.
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const conn = await connectMongo();
    return NextResponse.json({
      ok: true,
      host: conn.connection.host,
      name: conn.connection.name,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const code =
      error instanceof Error && "code" in error
        ? String((error as Error & { code?: unknown }).code)
        : undefined;

    return NextResponse.json({ ok: false, message, code }, { status: 503 });
  }
}

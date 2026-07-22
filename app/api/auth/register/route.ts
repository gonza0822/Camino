import { NextResponse } from "next/server";
import { registerSchema } from "@/lib/validators/auth";
import { registerUser } from "@/lib/services/authService";

// Registers a new user with email and password.
export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    await registerUser(parsed.data);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_IN_USE") {
      return NextResponse.json({ error: "EMAIL_IN_USE" }, { status: 409 });
    }

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: number }).code === 11000
    ) {
      return NextResponse.json({ error: "EMAIL_IN_USE" }, { status: 409 });
    }

    const isDbError =
      error instanceof Error &&
      (("code" in error &&
        (error.code === "ECONNREFUSED" ||
          error.code === "ENOTFOUND" ||
          error.code === "ETIMEDOUT")) ||
        error.message.includes("querySrv") ||
        error.message.includes("MongoServerSelectionError") ||
        error.message.includes("Server selection timed out") ||
        error.message.includes("MONGODB_URI") ||
        error.message.includes("authentication failed"));

    if (isDbError) {
      return NextResponse.json({ error: "DB_UNAVAILABLE" }, { status: 503 });
    }

    if (process.env.NODE_ENV === "development") {
      const message = error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json({ error: "Server error", detail: message }, { status: 500 });
    }

    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

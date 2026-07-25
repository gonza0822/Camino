import { NextResponse } from "next/server";
import type { UIMessage } from "ai";
import { getSessionUserId } from "@/lib/auth/session";
import { streamAssistantResponse } from "@/lib/services/assistantService";

// Streams assistant replies for authenticated users only.
export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = (await req.json()) as { messages?: UIMessage[] };
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json({ error: "INVALID_MESSAGES" }, { status: 400 });
  }

  try {
    const result = await streamAssistantResponse(userId, body.messages);
    return result.toUIMessageStreamResponse();
  } catch {
    return NextResponse.json({ error: "ASSISTANT_FAILED" }, { status: 502 });
  }
}

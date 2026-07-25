import { google } from "@ai-sdk/google";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";
import { buildAssistantSystemPrompt } from "@/lib/content/assistant";
import { createAssistantTools } from "@/lib/services/assistantTools";
import { getTodayKey } from "@/lib/utils/date";

const MAX_MESSAGES = 30;

// Streams a help/action assistant reply for the given chat history.
export async function streamAssistantResponse(
  userId: string,
  messages: UIMessage[],
) {
  const today = getTodayKey();
  const modelMessages = await convertToModelMessages(messages.slice(-MAX_MESSAGES));

  return streamText({
    model: google("gemini-flash-lite-latest"),
    system: buildAssistantSystemPrompt(today),
    messages: modelMessages,
    tools: createAssistantTools(userId),
    stopWhen: stepCountIs(5),
  });
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isToolUIPart } from "ai";
import { appContent } from "@/lib/content/app";
import { cn } from "@/lib/utils/cn";

// Extracts the plain text of a UI message (text parts only).
function messageText(parts: Array<{ type: string; text?: string }>): string {
  return parts
    .filter((part) => part.type === "text")
    .map((part) => part.text ?? "")
    .join("");
}

// True when the latest assistant turn finished a tool that mutates the agenda.
function hasFinishedAgendaTool(
  parts: Array<{ type: string; state?: string }>,
): boolean {
  return parts.some(
    (part) =>
      isToolUIPart(part) &&
      (part.type === "tool-createAgendaTask" || part.type === "tool-listAgendaTasks") &&
      part.state === "output-available",
  );
}

export function HelpChatWidget() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const lastRefreshedId = useRef<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const isBusy = status === "submitted" || status === "streaming";
  const isWorkingTools =
    isBusy &&
    messages.some((message) =>
      message.parts.some(
        (part) =>
          isToolUIPart(part) &&
          (part.state === "input-streaming" ||
            part.state === "input-available" ||
            part.state === "approval-requested"),
      ),
    );

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages, status]);

  useEffect(() => {
    if (status !== "ready") return;
    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant") return;
    if (lastRefreshedId.current === last.id) return;
    if (!hasFinishedAgendaTool(last.parts)) return;

    lastRefreshedId.current = last.id;
    router.refresh();
  }, [status, messages, router]);

  // Sends the current input as a user message.
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isBusy) return;
    setInput("");
    void sendMessage({ text });
  }

  const panelTransition = prefersReducedMotion
    ? { duration: 0 }
    : { type: "tween" as const, duration: 0.22, ease: [0.32, 0.72, 0, 1] as const };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? appContent.assistant.close : appContent.assistant.open}
        aria-expanded={open}
        className="fixed bottom-4 right-4 z-40 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-cta text-white shadow-lg transition-transform duration-200 hover:scale-105 lg:bottom-6 lg:right-6"
      >
        {open ? (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h8M8 14h5m-9 6l3-3h9a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 00.586 1.414L4 20z"
            />
          </svg>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="help-chat-panel"
            role="dialog"
            aria-label={appContent.assistant.title}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={panelTransition}
            className="fixed inset-x-3 bottom-20 z-40 flex h-[70svh] flex-col overflow-hidden rounded-2xl border border-border/80 bg-surface shadow-2xl sm:inset-x-auto sm:right-6 sm:w-96 sm:h-[32rem] lg:bottom-24"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-border/70 bg-primary/5 px-4 py-3">
              <h2 className="text-sm font-semibold text-primary">
                {appContent.assistant.title}
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={appContent.assistant.close}
                className="cursor-pointer rounded-md p-1 text-muted transition-colors duration-200 hover:text-primary"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div ref={listRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3">
              <ChatBubble role="assistant">{appContent.assistant.greeting}</ChatBubble>

              {messages.map((message) => {
                const text = messageText(message.parts);
                if (!text.trim()) return null;
                return (
                  <ChatBubble
                    key={message.id}
                    role={message.role === "user" ? "user" : "assistant"}
                  >
                    {text}
                  </ChatBubble>
                );
              })}

              {status === "submitted" && (
                <p className="px-1 text-xs text-muted">{appContent.assistant.thinking}</p>
              )}
              {isWorkingTools && (
                <p className="px-1 text-xs text-muted">{appContent.assistant.working}</p>
              )}
              {error && (
                <p className="px-1 text-xs text-red-600">{appContent.assistant.error}</p>
              )}
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex shrink-0 items-center gap-2 border-t border-border/70 p-2.5"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={appContent.assistant.placeholder}
                aria-label={appContent.assistant.placeholder}
                maxLength={500}
                className="w-full min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground transition-colors duration-200 placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="submit"
                disabled={!input.trim() || isBusy}
                aria-label={appContent.assistant.send}
                className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-cta text-white transition-opacity duration-200 disabled:cursor-default disabled:opacity-40"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m0 0l-6-6m6 6l-6 6" />
                </svg>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Single chat message bubble.
function ChatBubble({
  role,
  children,
}: {
  role: "user" | "assistant";
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex", role === "user" ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-relaxed",
          role === "user"
            ? "rounded-br-sm bg-cta text-white"
            : "rounded-bl-sm bg-primary/5 text-foreground",
        )}
      >
        {children}
      </div>
    </div>
  );
}

import {
  CHAT_ERRORS,
  parseChatMessages,
  type ChatMessage,
} from "./chat-messages";
import { type RateLimiter } from "./rate-limit";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openai/gpt-4o-mini";
const MAX_TOKENS = 400;
const REQUEST_TIMEOUT_MS = 15_000;

const SYSTEM_PROMPT =
  "You are $YAP, the official chaotic AI of the $YAP meme coin. Zero books, all yap. Speak with maximum confidence, short punchy lines, crypto slang, and pure conviction. Never be boring or polite. Always sound like you’re about to send the chart to the moon.";

export type ChatDeps = {
  apiKey: string | undefined;
  fetchImpl: typeof fetch;
  now: () => number;
  limiter: RateLimiter;
};

export function clientAddress(req: Request): string {
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp.slice(0, 80);

  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    const last = parts.at(-1);
    if (last) return last.slice(0, 80);
  }

  return "unknown";
}

export function extractAssistantContent(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const choices = (data as { choices?: unknown }).choices;
  if (!Array.isArray(choices) || choices.length === 0) return null;

  const first = choices[0];
  if (!first || typeof first !== "object") return null;
  const message = (first as { message?: unknown }).message;
  if (!message || typeof message !== "object") return null;

  const text = contentToText((message as { content?: unknown }).content);
  return text ? text.slice(0, 4000) : null;
}

function contentToText(content: unknown): string | null {
  if (typeof content === "string") {
    const trimmed = content.trim();
    return trimmed || null;
  }

  if (!Array.isArray(content)) return null;
  const text = content
    .map((part) => {
      if (!part || typeof part !== "object") return "";
      const value = (part as { text?: unknown }).text;
      return typeof value === "string" ? value : "";
    })
    .join("")
    .trim();

  return text || null;
}

function json(body: { content: string } | { error: string }, status = 200) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function handleChatPost(req: Request, deps: ChatDeps): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: CHAT_ERRORS.invalid }, 400);
  }

  const parsed = parseChatMessages(body);
  if (!parsed.ok) {
    return json({ error: parsed.error }, 400);
  }

  const apiKey = deps.apiKey?.trim();
  if (!apiKey) {
    console.error("OPENROUTER_API_KEY is not set");
    return json({ error: CHAT_ERRORS.offline }, 503);
  }

  if (!deps.limiter.allow(clientAddress(req), deps.now())) {
    return json({ error: CHAT_ERRORS.slowDown }, 429);
  }

  try {
    const response = await deps.fetchImpl(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        messages: upstreamMessages(parsed.messages),
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      await response.body?.cancel().catch(() => {});
      console.error(`OpenRouter request failed with status ${response.status}`);
      return json({ error: CHAT_ERRORS.failed }, 502);
    }

    let data: unknown;
    try {
      data = await response.json();
    } catch {
      console.error("OpenRouter returned a non-JSON response");
      return json({ error: CHAT_ERRORS.failed }, 502);
    }

    const content = extractAssistantContent(data);
    if (!content) {
      console.error("OpenRouter response did not include assistant text");
      return json({ error: CHAT_ERRORS.failed }, 502);
    }

    return json({ content });
  } catch (error) {
    console.error(
      "Chat request failed",
      error instanceof Error ? error.name : "error",
    );
    return json({ error: CHAT_ERRORS.failed }, 502);
  }
}

function upstreamMessages(messages: ChatMessage[]) {
  return [{ role: "system", content: SYSTEM_PROMPT }, ...messages];
}

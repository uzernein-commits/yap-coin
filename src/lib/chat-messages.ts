export const MAX_ACCEPTED_MESSAGES = 40;
export const MAX_FORWARDED_MESSAGES = 12;
export const MAX_MESSAGE_LENGTH = 1000;

export const CHAT_ERRORS = {
  invalid: "Send a message the frog can read.",
  tooLong: "That yap is too long. Start a shorter one.",
  messageTooLong: "Keep each yap under 1000 characters.",
  offline: "The frog is offline. Try again later.",
  failed: "Yap failed. Try again.",
  slowDown: "Slow down. Let the frog finish a thought.",
} as const;

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type ParsedChat =
  | { ok: true; messages: ChatMessage[] }
  | { ok: false; error: string };

const SAFE_ERRORS = new Set<string>(Object.values(CHAT_ERRORS));

export function parseChatMessages(body: unknown): ParsedChat {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: CHAT_ERRORS.invalid };
  }

  const messages = (body as { messages?: unknown }).messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return { ok: false, error: CHAT_ERRORS.invalid };
  }

  if (messages.length > MAX_ACCEPTED_MESSAGES) {
    return { ok: false, error: CHAT_ERRORS.tooLong };
  }

  const parsed: ChatMessage[] = [];
  for (const message of messages) {
    if (!message || typeof message !== "object" || Array.isArray(message)) {
      return { ok: false, error: CHAT_ERRORS.invalid };
    }

    const role = (message as { role?: unknown }).role;
    const content = (message as { content?: unknown }).content;
    if (role !== "user" && role !== "assistant") {
      return { ok: false, error: CHAT_ERRORS.invalid };
    }
    if (typeof content !== "string") {
      return { ok: false, error: CHAT_ERRORS.invalid };
    }

    const trimmed = content.trim();
    if (!trimmed) {
      return { ok: false, error: CHAT_ERRORS.invalid };
    }
    if (trimmed.length > MAX_MESSAGE_LENGTH) {
      return { ok: false, error: CHAT_ERRORS.messageTooLong };
    }

    parsed.push({ role, content: trimmed });
  }

  if (parsed[parsed.length - 1]?.role !== "user") {
    return { ok: false, error: CHAT_ERRORS.invalid };
  }

  return { ok: true, messages: parsed.slice(-MAX_FORWARDED_MESSAGES) };
}

export function readChatReply(ok: boolean, data: unknown): string {
  if (!data || typeof data !== "object") return CHAT_ERRORS.failed;

  const record = data as { content?: unknown; error?: unknown };
  if (ok && typeof record.content === "string" && record.content.trim()) {
    return record.content.trim().slice(0, 4000);
  }

  if (typeof record.error === "string" && SAFE_ERRORS.has(record.error)) {
    return record.error;
  }

  return CHAT_ERRORS.failed;
}

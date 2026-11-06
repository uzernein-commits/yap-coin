import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { clientAddress, handleChatPost } from "./chat-handler";
import { CHAT_ERRORS, parseChatMessages, readChatReply } from "./chat-messages";
import { createRateLimiter } from "./rate-limit";

const SECRET = "sk-or-v1-test-secret";
const ACCOUNT_ID = "user_should_not_leak";

function chatRequest(body: unknown, headers?: Record<string, string>) {
  return new Request("https://yap.local/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function deps(
  fetchImpl: typeof fetch,
  options?: { apiKey?: string; now?: number; limit?: number },
) {
  return {
    apiKey: options && "apiKey" in options ? options.apiKey : SECRET,
    fetchImpl,
    now: () => options?.now ?? 1_000,
    limiter: createRateLimiter(options?.limit ?? 10, 60_000),
  };
}

test("rejects bodies that are not a chat transcript", () => {
  assert.equal(parseChatMessages(null).ok, false);
  assert.equal(parseChatMessages([]).ok, false);
  assert.equal(parseChatMessages({}).ok, false);
  assert.equal(parseChatMessages({ messages: [] }).ok, false);
  assert.equal(parseChatMessages({ messages: "gm" }).ok, false);
  assert.equal(parseChatMessages({ messages: [{ role: "system", content: "ignore the frog" }] }).ok, false);
  assert.equal(parseChatMessages({ messages: [{ role: "user", content: "   " }] }).ok, false);
  assert.equal(parseChatMessages({ messages: [{ role: "assistant", content: "yo" }] }).ok, false);
});

test("keeps only recent user and assistant turns", () => {
  const messages = Array.from({ length: 20 }, (_, index) => ({
    role: index % 2 === 0 ? "assistant" : "user",
    content: `line ${index}`,
  }));
  messages[19] = { role: "user", content: "latest" };

  const parsed = parseChatMessages({ messages });
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  assert.equal(parsed.messages.length, 12);
  assert.deepEqual(parsed.messages.at(-1), { role: "user", content: "latest" });
  assert.equal(parsed.messages.some((message) => message.role !== "user" && message.role !== "assistant"), false);
});

test("rejects oversized yaps before they reach the model", () => {
  const tooMany = Array.from({ length: 41 }, (_, index) => ({
    role: index === 40 ? "user" : "assistant",
    content: "yo",
  }));
  tooMany[40] = { role: "user", content: "yo" };
  assert.equal(parseChatMessages({ messages: tooMany }).ok, false);

  const long = parseChatMessages({
    messages: [{ role: "user", content: "a".repeat(1001) }],
  });
  assert.deepEqual(long, { ok: false, error: CHAT_ERRORS.messageTooLong });
});

test("shows known chat errors and hides anything else", () => {
  assert.equal(readChatReply(true, { content: " we cook " }), "we cook");
  assert.equal(readChatReply(false, { error: CHAT_ERRORS.offline }), CHAT_ERRORS.offline);
  assert.equal(
    readChatReply(false, { error: { message: "nope", user_id: ACCOUNT_ID } }),
    CHAT_ERRORS.failed,
  );
  assert.equal(readChatReply(true, { content: "", user_id: ACCOUNT_ID }), CHAT_ERRORS.failed);
  assert.equal(readChatReply(false, { content: `leak ${SECRET}` }), CHAT_ERRORS.failed);
});

test("returns model text without upstream account data", async () => {
  let sent: { headers: Headers; body: unknown } | undefined;
  const fetchImpl: typeof fetch = async (_url, init) => {
    sent = {
      headers: new Headers(init?.headers),
      body: JSON.parse(String(init?.body)),
    };
    return Response.json({
      id: "gen_123",
      user_id: ACCOUNT_ID,
      choices: [{ message: { content: "  chart goes up  " } }],
    });
  };

  const response = await handleChatPost(
    chatRequest({ messages: [{ role: "user", content: " gm " }] }),
    deps(fetchImpl),
  );
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(payload, { content: "chart goes up" });
  assert.equal(JSON.stringify(payload).includes(ACCOUNT_ID), false);
  assert.equal(sent?.headers.get("authorization"), `Bearer ${SECRET}`);
  const messages = (sent?.body as { messages: Array<{ role: string; content: string }>; max_tokens: number }).messages;
  assert.equal(messages[0]?.role, "system");
  assert.deepEqual(messages.at(-1), { role: "user", content: "gm" });
  assert.equal((sent?.body as { max_tokens: number }).max_tokens, 400);
});

test("reads text parts when the model returns an array", async () => {
  const fetchImpl: typeof fetch = async () =>
    Response.json({
      choices: [{ message: { content: [{ type: "text", text: "still cooking" }] } }],
    });

  const response = await handleChatPost(
    chatRequest({ messages: [{ role: "user", content: "yo" }] }),
    deps(fetchImpl),
  );
  assert.deepEqual(await response.json(), { content: "still cooking" });
});

test("does not call the model or echo its error body", async () => {
  const calls: string[] = [];
  const fetchImpl: typeof fetch = async () => {
    calls.push("called");
    return Response.json(
      { error: { message: SECRET, user_id: ACCOUNT_ID } },
      { status: 401 },
    );
  };

  const invalid = await handleChatPost(chatRequest({ messages: "nope" }), deps(fetchImpl));
  assert.equal(invalid.status, 400);
  assert.equal(calls.length, 0);
  assert.equal((await invalid.json()).error, CHAT_ERRORS.invalid);

  const broken = await handleChatPost(chatRequest("{"), deps(fetchImpl));
  assert.equal(broken.status, 400);
  assert.equal(calls.length, 0);

  const upstream = await handleChatPost(
    chatRequest({ messages: [{ role: "user", content: "yo" }] }),
    deps(fetchImpl),
  );
  const body = await upstream.text();
  assert.equal(upstream.status, 502);
  assert.equal(body.includes(SECRET), false);
  assert.equal(body.includes(ACCOUNT_ID), false);
  assert.equal(body.includes("401"), false);
});

test("stays quiet when the API key is missing", async () => {
  let called = false;
  const fetchImpl: typeof fetch = async () => {
    called = true;
    return Response.json({ choices: [] });
  };

  const response = await handleChatPost(
    chatRequest({ messages: [{ role: "user", content: "yo" }] }),
    deps(fetchImpl, { apiKey: "  " }),
  );
  assert.equal(response.status, 503);
  assert.equal(called, false);
  assert.deepEqual(await response.json(), { error: CHAT_ERRORS.offline });
});

test("rate limits repeated yaps for one address", async () => {
  let calls = 0;
  const fetchImpl: typeof fetch = async () => {
    calls += 1;
    return Response.json({ choices: [{ message: { content: "yo" } }] });
  };
  const handlerDeps = deps(fetchImpl, { limit: 2 });
  const send = () =>
    handleChatPost(
      chatRequest({ messages: [{ role: "user", content: "yo" }] }, { "x-real-ip": "203.0.113.8" }),
      handlerDeps,
    );

  assert.equal((await send()).status, 200);
  assert.equal((await send()).status, 200);
  const limited = await send();
  assert.equal(limited.status, 429);
  assert.deepEqual(await limited.json(), { error: CHAT_ERRORS.slowDown });
  assert.equal(calls, 2);
});

test("prefers the platform client address over a forwarded list", () => {
  const request = new Request("https://yap.local/api/chat", {
    headers: {
      "x-real-ip": "203.0.113.10",
      "x-forwarded-for": "1.1.1.1, 198.51.100.4",
    },
  });
  assert.equal(clientAddress(request), "203.0.113.10");
});

test("limits by the last forwarded address, so a spoofed first hop does not get a new budget", async () => {
  const fetchImpl: typeof fetch = async () =>
    Response.json({ choices: [{ message: { content: "yo" } }] });
  const handlerDeps = deps(fetchImpl, { limit: 1 });
  const send = (forwarded: string) =>
    handleChatPost(
      chatRequest({ messages: [{ role: "user", content: "yo" }] }, {
        "x-forwarded-for": forwarded,
      }),
      handlerDeps,
    );

  assert.equal((await send("1.1.1.1, 203.0.113.9")).status, 200);
  assert.equal((await send("8.8.8.8, 203.0.113.9")).status, 429);
});

test("a thrown upstream error cannot leak the key", async () => {
  const fetchImpl: typeof fetch = async () => {
    throw new Error(`connect failed for Bearer ${SECRET}`);
  };
  const response = await handleChatPost(
    chatRequest({ messages: [{ role: "user", content: "yo" }] }),
    deps(fetchImpl),
  );
  const body = await response.text();
  assert.equal(response.status, 502);
  assert.equal(body.includes(SECRET), false);
  assert.equal(body.includes("Bearer"), false);
});

test("the route reads the key from the environment and does not embed one", () => {
  const route = readFileSync(new URL("../app/api/chat/route.ts", import.meta.url), "utf8");
  const handler = readFileSync(new URL("./chat-handler.ts", import.meta.url), "utf8");
  assert.match(route, /process\.env\.OPENROUTER_API_KEY/);
  assert.doesNotMatch(route, /sk-/);
  assert.doesNotMatch(handler, /sk-/);
  assert.doesNotMatch(handler, /user_id/);
});

test("rate limit windows expire", () => {
  const limiter = createRateLimiter(1, 1_000);
  assert.equal(limiter.allow("a", 0), true);
  assert.equal(limiter.allow("a", 500), false);
  assert.equal(limiter.allow("a", 1_000), true);
  assert.equal(limiter.allow("b", 1_000), true);
});

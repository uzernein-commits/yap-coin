import { handleChatPost } from "@/lib/chat-handler";
import { createRateLimiter } from "@/lib/rate-limit";

const limiter = createRateLimiter(10, 60_000);

export async function POST(req: Request) {
  return handleChatPost(req, {
    apiKey: process.env.OPENROUTER_API_KEY,
    fetchImpl: fetch,
    now: () => Date.now(),
    limiter,
  });
}

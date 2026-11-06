"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { readChatReply, CHAT_ERRORS } from "@/lib/chat-messages";

const FROG_IMAGE_SRC = "/yap-frog.jpg";

const NAV = [
  ["Story", "#story"],
  ["Rules", "#rules"],
  ["Talk", "#talk"],
  ["Launch", "#launch"],
] as const;

type Bubble = {
  role: "user" | "assistant";
  content: string;
};

const RULES = [
  ["01", "Find one corner and lock in.", "Not five groups in one afternoon. Pick one place and stay long enough to know the names."],
  ["02", "Learn the names.", "Stick around until the inside jokes become lore."],
  ["03", "Post because it’s funny.", "Not because a chart needs a reason to move."],
  ["04", "Come back tomorrow.", "A quiet day does not mean a quiet chat. We still cook."],
] as const;

export default function Home() {
  const [messages, setMessages] = useState<Bubble[]>([
    {
      role: "assistant",
      content: "I am $YAP. Zero books. All yap. Frogs don’t sleep, we just load. What’s good?",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const sendingRef = useRef(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const log = logRef.current;
    if (!log) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    log.scrollTo({ top: log.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [messages, sending]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const sendMessage = async () => {
    const content = input.trim();
    if (!content || sendingRef.current) return;

    sendingRef.current = true;
    setSending(true);
    const history: Bubble[] = [...messages, { role: "user", content }];
    setMessages(history);
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.slice(-12) }),
      });
      const data = await res.json().catch(() => null);
      const reply = readChatReply(res.ok, data);
      setMessages([...history, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...history, { role: "assistant", content: CHAT_ERRORS.failed }]);
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-black"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/75 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
          <a href="#top" className="font-display text-xl font-extrabold tracking-tight">
            $YAP
          </a>
          <nav className="hidden items-center gap-6 text-sm text-neutral-300 md:flex" aria-label="Primary">
            {NAV.map(([label, href]) => (
              <a key={href} href={href} className="hover:text-white">
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <a
              href="https://x.com/theyapfrog"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center rounded-full bg-white px-4 text-sm font-bold text-black hover:bg-neutral-200"
            >
              Follow on X
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <button
              type="button"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/15 md:hidden"
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
              <span aria-hidden="true" className="text-lg leading-none">
                {menuOpen ? "×" : "☰"}
              </span>
            </button>
          </div>
        </div>
        {menuOpen ? (
          <nav id="site-menu" aria-label="Mobile" className="border-t border-white/10 px-5 py-3 md:hidden">
            <ul className="flex flex-col">
              {NAV.map(([label, href]) => (
                <li key={href}>
                  <a
                    href={href}
                    onClick={closeMenu}
                    className="flex min-h-11 items-center text-base text-neutral-200"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </header>

      <main id="content">
        <section id="top" className="relative overflow-hidden px-5 pb-16 pt-10 sm:pt-16">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(168,85,247,0.34),transparent_52%)]" />
          <div className="yap-grid pointer-events-none absolute inset-0" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
            <div className="yap-rise order-2 lg:order-1">
              <p className="font-mono text-xs font-bold tracking-[0.22em] text-purple-300">
                FROGS DON’T SLEEP. WE JUST LOAD.
              </p>
              <h1 className="font-display mt-4 text-[clamp(4.5rem,16vw,8.25rem)] font-extrabold leading-[0.84] tracking-tight">
                $YAP
              </h1>
              <p className="mt-5 max-w-xl text-2xl font-semibold text-balance text-white sm:text-3xl">
                Not a meme. A whole movement.
              </p>
              <p className="mt-4 max-w-md text-base leading-relaxed text-neutral-300 sm:text-lg">
                A frog, a microphone, and a chat that stays open after the room gets quiet. There is nothing to buy on this page.
              </p>
              <ul className="mt-6 flex flex-wrap gap-2" aria-label="Current status">
                {["Token not live", "No contract published", "Chat on this page"].map((item) => (
                  <li
                    key={item}
                    className="rounded-full border border-purple-400/30 bg-purple-500/10 px-3 py-1 font-mono text-xs text-purple-100"
                  >
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#talk"
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 text-base font-bold text-black hover:bg-neutral-200"
                >
                  Talk to the frog
                </a>
                <a
                  href="#launch"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-purple-400/50 px-6 text-base font-bold text-white hover:bg-purple-500/15"
                >
                  Launch status
                </a>
              </div>
            </div>
            <div className="order-1 flex justify-center lg:order-2">
              <div className="yap-float relative">
                <div className="yap-glow pointer-events-none absolute -inset-8 -z-10 rounded-full bg-purple-600/35 blur-3xl" />
                <Image
                  src={FROG_IMAGE_SRC}
                  alt="Hooded frog mascot in a rainy alley, holding a microphone and wearing a gold $YAP chain"
                  width={784}
                  height={1013}
                  preload
                  sizes="(max-width: 1024px) 72vw, 448px"
                  className="h-[32svh] w-auto max-w-full rounded-[1.75rem] border border-purple-300/25 object-cover object-[center_12%] shadow-[0_24px_80px_rgba(88,28,135,0.45)] sm:h-[38svh] lg:h-auto lg:max-h-[78vh] lg:w-full lg:max-w-md lg:object-contain"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="story" className="border-t border-white/10 px-5 py-20 sm:py-28">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[16rem_minmax(0,1fr)]">
            <p className="font-mono text-xs font-bold tracking-[0.22em] text-purple-300">01 — STORY</p>
            <div className="max-w-3xl">
              <h2 className="font-display text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
                The frog that never shut up.
              </h2>
              <div className="mt-8 space-y-5 text-lg leading-relaxed text-neutral-300">
                <p>
                  Every launch dies the same way. Someone yells community, the chart twitches, then the chat checks who leaves first.
                </p>
                <p>
                  $YAP is for people who got tired of that and still want to hang out. No fake pitch. The frog does not lecture. Cigarette, microphone, tired eyes. He stays.
                </p>
              </div>
              <blockquote className="mt-10 border-l-2 border-purple-400 pl-5">
                <p className="font-display text-2xl font-bold leading-snug text-white sm:text-3xl">
                  “He won’t ask you to explain a sell. He’ll ask if you’re still here tomorrow.”
                </p>
                <footer className="mt-3 text-sm text-neutral-400">The whole pitch, before any token exists.</footer>
              </blockquote>
            </div>
          </div>
        </section>

        <section id="rules" className="border-t border-white/10 bg-white/[0.02] px-5 py-20 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <p className="font-mono text-xs font-bold tracking-[0.22em] text-purple-300">02 — HOW WE YAP</p>
            <h2 className="font-display mt-4 max-w-2xl text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
              Four ways to actually stay.
            </h2>
            <ol className="mt-12 grid gap-4 sm:grid-cols-2">
              {RULES.map(([num, title, text]) => (
                <li
                  key={num}
                  className="rounded-3xl border border-white/10 bg-black/40 p-6 transition duration-300 hover:border-purple-400/40 motion-reduce:transition-none"
                >
                  <p className="font-mono text-sm font-bold text-purple-300">{num}</p>
                  <h3 className="mt-4 text-2xl font-bold text-white">{title}</h3>
                  <p className="mt-3 leading-relaxed text-neutral-300">{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="talk" className="border-t border-white/10 px-5 py-20 sm:py-28">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[16rem_minmax(0,1fr)]">
            <div>
              <p className="font-mono text-xs font-bold tracking-[0.22em] text-purple-300">03 — TALK</p>
              <h2 className="font-display mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">Talk to the frog</h2>
              <p className="mt-4 max-w-xs text-neutral-300">
                Replies are generated. He is not a person, and he is not financial advice.
              </p>
            </div>
            <div className="flex h-[min(32rem,calc(100svh-8rem))] min-h-80 flex-col overflow-hidden rounded-3xl border border-white/10 bg-black/50 lg:h-[min(36rem,72svh)]">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <p className="font-mono text-xs tracking-[0.16em] text-purple-200">FROG · ON THIS PAGE</p>
                <p className="text-xs text-neutral-400">Live conversation</p>
              </div>
              <div
                ref={logRef}
                tabIndex={0}
                role="log"
                aria-live="polite"
                aria-relevant="additions"
                aria-busy={sending}
                aria-label="Conversation with the frog"
                className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5"
              >
                {messages.map((msg, index) => (
                  <article
                    key={`${msg.role}-${index}`}
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.role === "user" ? "ml-auto bg-white text-black" : "bg-neutral-900 text-white"}`}
                  >
                    <p className={`font-mono text-[11px] font-bold tracking-wide ${msg.role === "user" ? "text-neutral-600" : "text-purple-300"}`}>
                      {msg.role === "user" ? "You" : "Frog"}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
                  </article>
                ))}
                {sending ? (
                  <p className="max-w-[85%] rounded-2xl bg-neutral-900 px-4 py-3 text-neutral-300">The frog is cooking a reply.</p>
                ) : null}
              </div>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void sendMessage();
                }}
                className="border-t border-white/10 p-3 sm:p-4"
              >
                <label htmlFor="yap-message" className="mb-2 block text-sm font-medium text-neutral-200">
                  Message
                </label>
                <div className="flex gap-2">
                  <input
                    id="yap-message"
                    name="message"
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && event.nativeEvent.isComposing) event.preventDefault();
                    }}
                    placeholder="Yap something..."
                    enterKeyHint="send"
                    autoComplete="off"
                    maxLength={1000}
                    aria-describedby="yap-message-hint"
                    className="min-h-12 min-w-0 flex-1 rounded-full border border-white/10 bg-neutral-950 px-4 text-base"
                  />
                  <button
                    type="submit"
                    disabled={sending || !input.trim()}
                    className="min-h-12 shrink-0 rounded-full bg-white px-5 font-bold text-black disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {sending ? "Sending" : "Yap"}
                  </button>
                </div>
                <p id="yap-message-hint" className="mt-2 text-xs leading-relaxed text-neutral-400">
                  Up to 1000 characters. Enter sends. The reply can be wrong, weird, or offline.
                </p>
              </form>
            </div>
          </div>
        </section>

        <section id="launch" className="border-t border-white/10 px-5 py-20 sm:py-28">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
            <div>
              <p className="font-mono text-xs font-bold tracking-[0.22em] text-purple-300">04 — LAUNCH</p>
              <h2 className="font-display mt-4 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
                Token not live.
              </h2>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-neutral-300">
                There is no contract address to copy, no chart, and no buy button. If that changes, this page and the X account will say so together.
              </p>
              <a
                href="https://x.com/theyapfrog"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 font-bold text-black hover:bg-neutral-200"
              >
                Follow on X
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </div>
            <dl className="divide-y divide-white/10 rounded-3xl border border-white/10">
              {[
                ["Token", "Not live. Nothing on this site can be bought."],
                ["Contract", "None published. Do not trust an address from a screenshot or a poster."],
                ["Chart", "None. A quiet page is not a signal."],
                ["Next step", "Talk to the frog, or follow X. That is the whole ask."],
              ].map(([term, detail]) => (
                <div key={term} className="grid gap-1 px-5 py-5 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-4">
                  <dt className="font-mono text-xs font-bold tracking-[0.16em] text-purple-300">{term.toUpperCase()}</dt>
                  <dd className="text-neutral-100">{detail}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="mx-auto mt-10 max-w-6xl rounded-3xl border border-purple-400/30 bg-purple-500/10 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-white">Risk</h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-neutral-200 sm:text-base">
              $YAP is a meme and a chat. Nothing here is an offer to sell a token, a solicitation, or financial, legal, or investment advice. You can lose everything you later choose to spend. Do not trade because a frog told you to.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 px-5 py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-display text-2xl font-extrabold">$YAP</p>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-neutral-400">
              We don’t croak. We cook. Token not live. Not financial advice.
            </p>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-neutral-300">
            {NAV.map(([label, href]) => (
              <a key={href} href={href} className="hover:text-white">
                {label}
              </a>
            ))}
            <a href="https://x.com/theyapfrog" target="_blank" rel="noopener noreferrer" className="hover:text-white">
              X<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </nav>
        </div>
      </footer>
    </>
  );
}

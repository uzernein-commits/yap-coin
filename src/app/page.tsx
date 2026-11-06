"use client";

import { useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "I am $YAP. Zero books. All yap. Ask me anything." }
  ]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: newMessages }),
    });

    const data = await res.json();
    const assistantMessage = data.choices?.[0]?.message?.content || "Yap failed. Try again.";

    setMessages([...newMessages, { role: "assistant", content: assistantMessage }]);
  };

  return (
    <main className="min-h-screen bg-black text-white font-sans">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 via-black to-black opacity-80" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="mb-8 text-7xl animate-pulse">🗣️</div>
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-none">
            $YAP
          </h1>
          <p className="mt-6 text-2xl md:text-4xl font-light text-neutral-300 max-w-2xl">
            Zero books.<br />All yap.
          </p>
          <p className="mt-4 text-neutral-500 max-w-md">
            The agent that never stops talking. Built for people who are tired of quiet charts.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#agent"
              className="px-10 py-4 bg-white text-black font-bold rounded-full text-lg hover:bg-neutral-200 transition"
            >
              Talk to $YAP
            </a>
            <a
              href="#buy"
              className="px-10 py-4 border border-white/20 font-bold rounded-full text-lg hover:bg-white/10 transition"
            >
              Buy $YAP
            </a>
          </div>
        </div>
      </section>

      {/* Agent */}
      <section id="agent" className="px-6 py-32 bg-neutral-950">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black mb-4">Talk to $YAP</h2>
          <p className="text-neutral-400 mb-10">He never shuts up. That’s the point.</p>
          
          <div className="border border-neutral-800 rounded-3xl h-[560px] flex flex-col bg-black/50">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`max-w-[80%] rounded-2xl px-5 py-3 text-sm md:text-base ${
                    msg.role === "user"
                      ? "ml-auto bg-white text-black"
                      : "bg-neutral-900"
                  }`}
                >
                  {msg.content}
                </div>
              ))}
            </div>
            <div className="border-t border-neutral-800 p-4 flex gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Yap something..."
                className="flex-1 bg-neutral-900 border border-neutral-800 rounded-full px-5 py-3 outline-none focus:border-white/40"
              />
              <button
                onClick={sendMessage}
                className="bg-white text-black font-bold px-6 rounded-full hover:bg-neutral-200 transition"
              >
                Yap
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Buy section */}
      <section id="buy" className="px-6 py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6">How to Yap</h2>
          <div className="grid md:grid-cols-3 gap-6 mt-12 text-left">
            <div className="border border-neutral-800 rounded-2xl p-6">
              <div className="text-2xl font-bold mb-2">01</div>
              <h3 className="text-xl font-bold mb-2">Get a wallet</h3>
              <p className="text-neutral-400">Phantom or Solflare. Fund it with SOL.</p>
            </div>
            <div className="border border-neutral-800 rounded-2xl p-6">
              <div className="text-2xl font-bold mb-2">02</div>
              <h3 className="text-xl font-bold mb-2">Copy the CA</h3>
              <p className="text-neutral-400">Contract address drops at launch. Paste it on Raydium / Jupiter.</p>
            </div>
            <div className="border border-neutral-800 rounded-2xl p-6">
              <div className="text-2xl font-bold mb-2">03</div>
              <h3 className="text-xl font-bold mb-2">Buy & yap</h3>
              <p className="text-neutral-400">Hold. Talk to the agent. Don’t be quiet.</p>
            </div>
          </div>

          <div className="mt-16 p-6 border border-neutral-800 rounded-2xl inline-block">
            <p className="text-sm text-neutral-500 mb-2">Contract Address</p>
            <p className="font-mono text-lg">Coming at launch</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800 py-12 text-center text-neutral-500 text-sm">
        $YAP — Zero books. All yap. Not financial advice. Pure conviction.
      </footer>
    </main>
  );
}
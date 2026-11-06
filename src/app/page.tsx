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
    <main className="min-h-screen bg-black text-white">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <div className="mb-6 text-6xl">🗣️</div>
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter">
          $YAP
        </h1>
        <p className="mt-6 text-xl md:text-2xl text-neutral-400 max-w-2xl">
          Zero books. All yap.
        </p>
        <a
          href="#agent"
          className="mt-10 px-8 py-4 bg-white text-black font-bold rounded-full text-lg hover:bg-neutral-200 transition"
        >
          Try the Agent
        </a>
      </section>

      {/* Agent section */}
      <section id="agent" className="min-h-screen px-6 py-24 bg-neutral-950">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-8">Talk to $YAP</h2>
          
          <div className="border border-neutral-800 rounded-2xl h-[500px] flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "ml-auto bg-white text-black"
                      : "bg-neutral-800"
                  }`}
                >
                  {msg.content}
                </div>
              ))}
            </div>
            <div className="border-t border-neutral-800 p-4 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Yap something..."
                className="flex-1 bg-neutral-900 border border-neutral-700 rounded-full px-4 py-3 outline-none"
              />
              <button
                onClick={sendMessage}
                className="bg-white text-black font-bold px-6 rounded-full"
              >
                Yap
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
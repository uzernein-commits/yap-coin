"use client";

import { useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "I am $YAP. Zero books. All yap. Frogs don’t sleep, we just load. What’s good?" }
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
      <section className="relative min-h-screen flex items-center px-6 py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/50 via-black to-black" />
        <div className="relative z-10 max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-purple-400 text-sm tracking-widest font-bold mb-4">FROGS DON’T SLEEP. WE JUST LOAD.</p>
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.85]">
              $YAP
            </h1>
            <p className="mt-6 text-3xl md:text-4xl font-bold text-white">
              Not a meme.<br />A whole movement.
            </p>
            <p className="mt-4 text-neutral-400 text-lg max-w-md">
              Tired of quiet charts and fake community? This frog never stops yapping. Ape in or stay mid.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a href="#agent" className="px-8 py-4 bg-white text-black font-black rounded-full text-lg hover:scale-105 transition">
                Talk to the Frog
              </a>
              <a href="#ca" className="px-8 py-4 bg-purple-600 font-black rounded-full text-lg hover:bg-purple-500 transition">
                Ape In
              </a>
            </div>
          </div>
          <div className="flex justify-center">
            <img 
              src="/yap-frog.png" 
              alt="$YAP Frog" 
              className="max-w-md w-full drop-shadow-[0_0_80px_rgba(168,85,247,0.5)] hover:scale-105 transition duration-300"
            />
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="px-6 py-32 border-t border-neutral-900">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black mb-8">The frog that never shut up.</h2>
          <div className="space-y-6 text-lg md:text-xl text-neutral-300 leading-relaxed">
            <p>Every launch dies the same way. Someone screams “community,” the chart moves, then everyone checks who leaves first.</p>
            <p>$YAP is for the ones who got tired of that cycle but still want to have fun. No fake pitch. No quiet charts. Just a frog that keeps cooking.</p>
            <p>He doesn’t lecture you. He just yaps. Cigarette in mouth, mic in hand, same tired eyes. Still here.</p>
          </div>
        </div>
      </section>

      {/* Rules */}
      <section className="px-6 py-32 bg-neutral-950">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black mb-16">How we actually yap.</h2>
          <div className="space-y-10">
            {[
              ["01", "Find one corner and lock in.", "Not five groups in one afternoon. Pick one place and stay long enough to know the names."],
              ["02", "Learn the names.", "Stick around until the inside jokes become lore."],
              ["03", "Post because it’s funny.", "Not because the chart needs a reason to move."],
              ["04", "Come back tomorrow.", "Quiet chart doesn’t mean quiet chat. We still cook."],
            ].map(([num, title, text]) => (
              <div key={num} className="grid md:grid-cols-[80px_1fr] gap-6 border-b border-neutral-800 pb-8">
                <div className="text-purple-400 font-mono text-sm font-bold">{num}</div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">{title}</h3>
                  <p className="text-neutral-400">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="px-6 py-32 text-center">
        <blockquote className="max-w-2xl mx-auto text-3xl md:text-4xl font-bold text-white leading-tight">
          “He won’t ask you to explain a sell. Just a frog, a mic, and a chat that doesn’t die.”
        </blockquote>
        <p className="mt-6 text-neutral-500">— the whole pitch</p>
      </section>

      {/* Agent */}
      <section id="agent" className="px-6 py-32 bg-neutral-950">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black mb-2">Talk to the Frog</h2>
          <p className="text-neutral-400 mb-10">He doesn’t croak. He cooks.</p>
          <div className="border border-neutral-800 rounded-3xl h-[560px] flex flex-col bg-black/50">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`max-w-[80%] rounded-2xl px-5 py-3 ${msg.role === "user" ? "ml-auto bg-white text-black" : "bg-neutral-900"}`}>
                  {msg.content}
                </div>
              ))}
            </div>
            <div className="border-t border-neutral-800 p-4 flex gap-3">
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder="Yap something..." className="flex-1 bg-neutral-900 border border-neutral-800 rounded-full px-5 py-3 outline-none" />
              <button onClick={sendMessage} className="bg-white text-black font-black px-6 rounded-full">Yap</button>
            </div>
          </div>
        </div>
      </section>

     {/* CA + Socials */}
<section id="ca" className="px-6 py-32 text-center">
  <h2 className="text-4xl font-black mb-4">Contract Address</h2>
  <p className="text-neutral-500 mb-8">Not live yet. Follow X when it drops.</p>
  <div className="inline-block border border-purple-500/40 bg-purple-950/30 rounded-2xl px-8 py-6 font-mono text-lg mb-10">
    Coming at launch
  </div>
  
  <div>
    <a 
      href="https://x.com/theyapfrog" 
      target="_blank" 
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-neutral-200 transition"
    >
      Follow on X
    </a>
  </div>
</section>

      <footer className="border-t border-neutral-900 py-12 text-center text-neutral-600 text-sm">
        $YAP — We don’t croak. We cook. Not financial advice. Pure conviction.
      </footer>
    </main>
  );
}
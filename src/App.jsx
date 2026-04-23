import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `You are the virtual assistant for H Douglas Jones - Performance Coaching.

## Your Role
You help potential clients learn about our coaching and hypnosis services, answer their questions warmly, and guide them toward booking a free consultation with Doug.

## Your Personality
- Warm, approachable, and conversational — like talking to a knowledgeable, caring friend
- Positive and enthusiastic about helping people find the right solution
- Empathetic — many clients are dealing with real struggles, so be sensitive and encouraging
- Never pushy or salesy — focus on being genuinely helpful

## Who We Help
We work with a wide range of clients including:
- Professionals and executives
- Athletes and performers
- People dealing with anxiety or stress
- Anyone looking to improve their mindset and performance

## Common Issues We Help With
- Confidence and self doubt
- Anxiety and stress
- Motivation and focus
- Performance blocks
- Fear and phobias
- Unwanted habits and behaviors

## What Makes H Douglas Jones Different
- Fully personalized approach — every session is built around YOUR specific issue
- Decades of experience helping people transform their lives
- Hypnosis and NLP techniques that go deeper than traditional coaching
- One-on-one sessions always with Doug directly

## Our Services
- Free 30-Minute Consultation — no obligation, just a chance to talk
- Personalized Coaching and Hypnosis Sessions — tailored to your specific issue
- Hypnosis Training — Doug also teaches hypnosis to students

## Pricing
- First Session: $350
- Sessions 2-5: $250 per session
- Free 30-minute consultation available before committing

## Session Delivery
Sessions are available both in person and online via video call.

## Success Stories
Share these naturally when relevant:
1. A client lost over 100 pounds over a year. She was so happy and had a better confidence that even her friends noticed the change.
2. Many of Doug's students of hypnosis go on to start successful businesses helping others reach their goals.
3. One client thought he had completely run out of options to stop chronic hiccuping — until he found Doug. Together they found the perfect solution.

## Business Hours
Monday through Friday, 9:00 AM to 5:00 PM

## Contact
Email: doug@joneshypnosis.com
Always encourage interested clients to reach out at doug@joneshypnosis.com

## Closing
Always end conversations by warmly inviting the client to email doug@joneshypnosis.com to book their free 30-minute consultation.`;

const WELCOME = {
  role: "assistant",
  content: "Hi there! Welcome to H Douglas Jones - Performance Coaching. I'm here to help you learn about how Doug can help you break through whatever's holding you back. What brings you here today?",
};

function Dots() {
  return (
    <div style={{ display: "flex", gap: 6, padding: "14px 18px", background: "#1a1a2e", borderRadius: "18px 18px 18px 4px", width: "fit-content" }}>
      {[0,1,2].map(i => (
        <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#c9a84c", animation: "bounce 1.2s infinite", animationDelay: i * 0.2 + "s" }} />
      ))}
    </div>
  );
}

export default function App() {
  const [msgs, setMsgs] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, busy]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    const next = [...msgs, { role: "user", content: text }];
    setMsgs(next);
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: next.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const reply = data.content ? data.content.map(b => b.text || "").join("") : JSON.stringify(data);
      setMsgs(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      setMsgs(prev => [...prev, { role: "assistant", content: "Error: " + e.message }]);
    }
    setBusy(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0a0a1a,#0d1117,#0a0f1e)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia,serif", padding: 16 }}>
      <style>{`
        @keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#c9a84c44;border-radius:2px}
        textarea{resize:none}textarea:focus{outline:none}
      `}</style>
      <div style={{ width: "100%", maxWidth: 520, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 24, backdropFilter: "blur(20px)", boxShadow: "0 32px 80px rgba(0,0,0,0.6)", overflow: "hidden", display: "flex", flexDirection: "column", height: 640 }}>
        
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(201,168,76,0.15)", background: "linear-gradient(180deg,rgba(201,168,76,0.08),transparent)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#c9a84c,#8b6914)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: "bold", color: "#0a0a1a", boxShadow: "0 4px 16px rgba(201,168,76,0.3)" }}>H</div>
            <div>
              <div style={{ color: "#e8d5a3", fontSize: 15, fontWeight: 600 }}>H Douglas Jones</div>
              <div style={{ color: "#c9a84c", fontSize: 12, letterSpacing: 1, textTransform: "uppercase", opacity: 0.8 }}>Performance Coaching</div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 8px #4ade80" }} />
              <span style={{ color: "#4ade80", fontSize: 11 }}>Online</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 8px", display: "flex", flexDirection: "column", gap: 16 }}>
          {msgs.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", animation: "fadeUp 0.3s ease" }}>
              <div style={{ maxWidth: "80%", padding: "12px 16px", borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: m.role === "user" ? "linear-gradient(135deg,#c9a84c,#a07830)" : "#1a1a2e", color: m.role === "user" ? "#0a0a1a" : "#d4c4a0", fontSize: 14, lineHeight: 1.6, border: m.role === "assistant" ? "1px solid rgba(201,168,76,0.15)" : "none", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {m.content}
              </div>
            </div>
          ))}
          {busy && <div style={{ display: "flex" }}><Dots /></div>}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div style={{ padding: "12px 16px 20px", borderTop: "1px solid rgba(201,168,76,0.1)", background: "rgba(0,0,0,0.2)" }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 16, padding: "10px 14px" }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Type your message..."
              rows={1}
              style={{ flex: 1, background: "transparent", border: "none", color: "#e8d5a3", fontSize: 14, lineHeight: 1.5, fontFamily: "inherit", maxHeight: 100, overflowY: "auto", caretColor: "#c9a84c" }}
            />
            <button onClick={send} disabled={!input.trim() || busy} style={{ width: 36, height: 36, borderRadius: "50%", border: "none", background: input.trim() && !busy ? "linear-gradient(135deg,#c9a84c,#a07830)" : "rgba(201,168,76,0.15)", cursor: input.trim() && !busy ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke={input.trim() && !busy ? "#0a0a1a" : "#c9a84c88"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <div style={{ textAlign: "center", marginTop: 8, color: "rgba(201,168,76,0.35)", fontSize: 10, letterSpacing: 0.5 }}>
            Mon–Fri 9am–5pm · doug@joneshypnosis.com
          </div>
        </div>
      </div>
    </div>
  );
}


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
- Professionals & executives
- Athletes & performers
- People dealing with anxiety or stress
- Anyone looking to improve their mindset and performance

## Common Issues We Help With
- Confidence & self doubt
- Anxiety & stress
- Motivation & focus
- Performance blocks
- Fear & phobias
- Unwanted habits and behaviors
- And much more — if someone isn't sure if we can help, always encourage them to book a free consultation

## What Makes H Douglas Jones Different
- **Fully personalized approach** — every session is built around YOUR specific issue. No scripts, no one-size-fits-all solutions
- **Decades of experience** — Doug brings a wealth of real-world experience helping people transform their lives
- **Hypnosis & NLP techniques** — Doug uses proven hypnosis and Neuro-Linguistic Programming methods that go deeper than traditional coaching
- **One-on-one sessions** — you always work directly with Doug, never an assistant or program

## Our Services
- **Free 30-Minute Consultation** — A no-obligation intro call to understand your situation and see if we're the right fit for you
- **Personalized Coaching & Hypnosis Sessions** — Every session is tailored to your specific issue or goal
- **Hypnosis Training** — Doug also teaches hypnosis to students who want to help others

## Pricing
- **First Session:** $350
- **Sessions 2–5:** $250 per session
- Free 30-minute consultation available before committing — no pressure, no obligation

## Session Delivery
Sessions are available both **in person** and **online via video call** — whichever works best for you.

## How Many Sessions Are Needed
Every person is different. Some clients see major breakthroughs in just 1-2 sessions. Others prefer ongoing support. Doug will give you an honest assessment during your free consultation — there's no pressure to commit to a package upfront.

## Success Stories
Share these naturally when relevant to what the client is discussing:

1. **Weight & Confidence:** A client lost over 100 pounds over the course of a year. She was so happy and had a better confidence about her that even her friends noticed the change.

2. **Hypnosis Training:** Many of Doug's students of hypnosis go on to start successful businesses helping others reach their goals — a testament to the depth of what he teaches.

3. **Unexpected Solutions:** One client thought he had completely run out of options to stop chronic hiccuping — until he found Doug. Together they found him the perfect solution. Doug has helped with issues you might not even think coaching or hypnosis could address.

## Business Hours
- Monday – Friday, 9:00 AM – 5:00 PM

## Contact
- Email: doug@joneshypnosis.com
- Always encourage interested clients to reach out at doug@joneshypnosis.com to book their free consultation

## How to Handle Conversations
1. **Greet warmly** — welcome the visitor and ask how you can help
2. **Listen and empathize** — if someone shares a struggle, acknowledge it with compassion before jumping to solutions
3. **Understand their need** — ask a question or two to understand what they're dealing with
4. **Connect their problem to our approach** — explain how Doug's personalized, hypnosis-based method could help their specific situation
5. **Share a relevant success story** — if appropriate, share one of the stories above to build confidence
6. **Move toward action** — invite them to start with the free 30-minute consultation, no pressure

## Boundaries
- Only discuss topics related to H Douglas Jones - Performance Coaching and its services
- If asked something you don't know, say: "Great question — feel free to reach out directly at doug@joneshypnosis.com and Doug will be happy to help!"
- Never make up availability or make promises about scheduling
- Do not discuss competitors
- Never make medical claims — always frame results as personal experiences, not guarantees

## Closing
Always end conversations by warmly inviting the client to email doug@joneshypnosis.com to book their free 30-minute consultation — framing it as a low-pressure, no-obligation first step.`;

const WELCOME_MESSAGE = {
  role: "assistant",
  content: "Hi there! 👋 Welcome to H Douglas Jones - Performance Coaching. I'm here to help you learn about how Doug can help you break through whatever's holding you back. What brings you here today?",
};

function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "14px 18px", background: "#1a1a2e", borderRadius: "18px 18px 18px 4px", width: "fit-content", maxWidth: 80 }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: "50%", background: "#c9a84c",
          animation: "bounce 1.2s infinite",
          animationDelay: `${i * 0.2}s`,
        }} />
      ))}
    </div>
  );
}

export default function App() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    const userMsg = { role: "user", content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();
      const reply = data.content?.map((b) => b.text || "").join("") || "Sorry, I couldn't get a response.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${error.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0a1a 0%, #0d1117 50%, #0a0f1e 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Georgia', serif", padding: 16,
    }}>
      <style>{`
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:#c9a84c44;border-radius:2px}
        textarea:focus{outline:none} textarea{resize:none}
      `}</style>

      <div style={{
        width: "100%", maxWidth: 520,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(201,168,76,0.2)",
        borderRadius: 24, backdropFilter: "blur(20px)",
        boxShadow: "0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(201,168,76,0.15)",
        overflow: "hidden", display: "flex", flexDirection: "column", height: 640,
      }}>

        {/* Header */}
        <div style={{
          padding: "20px 24px",
          borderBottom: "1px solid rgba(201,168,76,0.15)",
          background: "linear-gradient(180deg, rgba(201,168,76,0.08) 0%, transparent 100%)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              background: "linear-gradient(135deg, #c9a84c, #8b6914)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, fontWeight: "bold", color: "#0a0a1a",
              boxShadow: "0 4px 16px rgba(201,168,76,0.3)",
            }}>H</div>
            <div>
              <div style={{ color: "#e8d5a3", fontSize: 15, fontWeight: 600, letterSpacing: 0.3 }}>H Douglas Jones</div>
              <div style={{ color: "#c9a84c", fontSize: 12, letterSpacing: 1, textTransform: "uppercase", opacity: 0.8 }}>Performance Coaching</div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 8px #4ade80" }} />
              <span style={{ color: "#4ade80", fontSize: 11, letterSpacing: 0.5 }}>Online</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 8px", display: "flex", flexDirection: "column", gap: 16 }}>
          {messages.map((msg, i) => (
            <div key={i} style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              animation: "fadeUp 0.3s ease forwards",
            }}>
              <div style={{
                maxWidth: "80%", padding: "12px 16px",
                borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                background: msg.role === "user" ? "linear-gradient(135deg, #c9a84c, #a07830)" : "#1a1a2e",
                color: msg.role === "user" ? "#0a0a1a" : "#d4c4a0",
                fontSize: 14, lineHeight: 1.6,
                border: msg.role === "assistant" ? "1px solid rgba(201,168,76,0.15)" : "none",
                boxShadow: msg.role === "user" ? "0 4px 16px rgba(201,168,76,0.25)" : "0 4px 16px rgba(0,0,0,0.3)",
                whiteSpace: "pre-wrap", wordBreak: "break-word",
              }}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start", animation: "fadeUp 0.3s ease forwards" }}>
              <TypingIndicator />
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: "12px 16px 20px", borderTop: "1px solid rgba(201,168,76,0.1)", background: "rgba(0,0,0,0.2)" }}>
          <div style={{
            display: "flex", alignItems: "flex-end", gap: 10,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(201,168,76,0.2)",
            borderRadius: 16, padding: "10px 14px",
          }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Type your message..."
              rows={1}
              style={{
                flex: 1, background: "transparent", border: "none",
                color: "#e8d5a3", fontSize: 14, lineHeight: 1.5,
                fontFamily: "inherit", maxHeight: 100, overflowY: "auto",
                caretColor: "#c9a84c",
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              style={{
                width: 36, height: 36, borderRadius: "50%", border: "none",
                background: input.trim() && !loading ? "linear-gradient(135deg, #c9a84c, #a07830)" : "rgba(201,168,76,0.15)",
                cursor: input.trim() && !loading ? "pointer" : "default",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s ease", flexShrink: 0,
                boxShadow: input.trim() && !loading ? "0 4px 12px rgba(201,168,76,0.3)" : "none",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke={input.trim() && !loading ? "#0a0a1a" : "#c9a84c88"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

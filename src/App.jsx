import { useState, useRef, useEffect } from "react";

const EMAILJS_SERVICE_ID = "service_2093rtp";
const EMAILJS_TEMPLATE_ID = "template_cupzwvt";
const EMAILJS_PUBLIC_KEY = "BkNut2J2xqMTUJ5Hb";
const NOTIFY_EMAIL = "d.joneshypnosis@gmail.com";

const SYSTEM_PROMPT = `You are the virtual assistant for H Douglas Jones - Performance Coaching.

## Your Role
You help potential clients learn about our coaching services, answer their questions, and guide them toward booking a consultation or session.

## Your Personality
- Warm, approachable, and conversational — like talking to a knowledgeable friend
- Positive and enthusiastic about helping people find the right solution
- Never pushy or salesy — focus on being genuinely helpful

## Our Services
- **Free 30-Minute Consultation** — A no-obligation intro call to understand your situation and see if we're the right fit for you
- **Personalized Coaching Sessions** — Every session is built around your specific issue or goal. No prerecorded scripts, no generic advice — just real, tailored support
- **One-on-One Coaching** — Private, focused sessions directly with H Douglas Jones

## Pricing
- **First Session:** $350
- **Sessions 2–5:** $250 per session
- Free 30-minute consultation available before committing

## Business Hours
- Monday – Friday, 9:00 AM – 5:00 PM

## Contact
- Email: d.joneshypnosis@gmail.com
- For bookings and inquiries, direct clients to email d.joneshypnosis@gmail.com

## How to Handle Conversations
1. Greet warmly — welcome the visitor and ask how you can help
2. Understand their need — ask a question or two to understand what they're looking for
3. Highlight our approach — emphasize that everything is personalized, one-on-one, and never scripted
4. Move toward action — invite them to start with the free 30-minute consultation
5. Capture lead info — if they're interested, collect their details for follow-up

## Lead Capture
When a client shows interest, naturally collect:
- Full name
- Email address
- Phone number
- Best time to be contacted

IMPORTANT: Once you have collected ALL FOUR pieces of info (name, email, phone, best time), you MUST append this exact block at the very end of your message with no extra text after it:
<LEAD_DATA>
{"name":"FULL NAME HERE","email":"EMAIL HERE","phone":"PHONE HERE","contact_time":"BEST TIME HERE"}
</LEAD_DATA>

## Boundaries
- Only discuss topics related to H Douglas Jones - Performance Coaching and its services
- If asked something you don't know, say: "Great question — feel free to reach out directly at d.joneshypnosis@gmail.com and Doug will be happy to help!"
- Never make up availability or make promises about scheduling
- Do not discuss competitors

## Closing
Always end conversations by inviting the client to book their free 30-minute consultation as the natural, low-pressure next step, or direct them to email d.joneshypnosis@gmail.com to get started.`;

const WELCOME_MESSAGE = {
  role: "assistant",
  content: "Hi there! 👋 Welcome to H Douglas Jones - Performance Coaching. I'm here to help you learn about our services and find the right path forward. What brings you here today?",
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

function EmailSentBadge() {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
      background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)",
      borderRadius: 20, padding: "6px 14px", margin: "4px auto",
      animation: "fadeUp 0.4s ease forwards", width: "fit-content",
    }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 6px #4ade80" }} />
      <span style={{ color: "#4ade80", fontSize: 11, letterSpacing: 0.5 }}>Lead details sent to Doug ✓</span>
    </div>
  );
}

function extractLeadData(text) {
  const match = text.match(/<LEAD_DATA>([\s\S]*?)<\/LEAD_DATA>/);
  if (!match) return null;
  try { return JSON.parse(match[1].trim()); } catch { return null; }
}

function cleanMessage(text) {
  return text.replace(/<LEAD_DATA>[\s\S]*?<\/LEAD_DATA>/g, "").trim();
}

async function sendLeadEmail(leadData, conversationHistory) {
  const summary = conversationHistory
    .filter((m) => m.role !== "system")
    .map((m) => `${m.role === "user" ? "Client" : "Bot"}: ${cleanMessage(m.content)}`)
    .join("\n\n");

  return fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      user_id: EMAILJS_PUBLIC_KEY,
      template_params: {
        to_email: NOTIFY_EMAIL,
        client_name: leadData.name,
        client_email: leadData.email,
        client_phone: leadData.phone,
        contact_time: leadData.contact_time,
        conversation_summary: summary,
      },
    }),
  });
}

export default function App() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [leadSent, setLeadSent] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, leadSent]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    const userMsg = { role: "user", content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();
      const rawReply = data.content?.map((b) => b.text || "").join("") || "Sorry, I couldn't get a response.";
      const leadData = extractLeadData(rawReply);
      const cleanReply = cleanMessage(rawReply);
      const allMessages = [...updatedMessages, { role: "assistant", content: cleanReply }];
      setMessages(allMessages);

      if (leadData && !leadSent) {
        setLeadSent(true);
        try {
          await sendLeadEmail(leadData, allMessages);
        } catch (e) {
          console.error("EmailJS send failed:", e);
        }
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Something went wrong. Please try again." }]);
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
          {leadSent && <EmailSentBadge />}
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
            Mon–Fri 9am–5pm · d.joneshypnosis@gmail.com
          </div>
        </div>
      </div>
    </div>
  );
}

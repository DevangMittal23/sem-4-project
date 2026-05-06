"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Send, CheckCircle2 } from "lucide-react";
import MessageBubble from "./MessageBubble";
import { useStore } from "@/lib/store";
import { apiAssessmentChat, apiGetProfile, ChatMessage } from "@/lib/api";

/** Poll /auth/profile/ until profile_completion > 0 or is_assessment_completed, max 30s */
async function waitForPipeline(maxMs = 30000): Promise<import("@/lib/api").ApiProfile> {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    try {
      const p = await apiGetProfile();
      if (p.profile_completion > 0 || p.is_assessment_completed) return p;
    } catch {}
    await new Promise(r => setTimeout(r, 2000));
  }
  return apiGetProfile(); // final attempt
}

/* ── Typing indicator ─────────────────────────────────────────── */
function TypingIndicator() {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="flex justify-start">
      <div className="px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1.5 items-center"
        style={{ background: "rgb(var(--primary) / 0.15)", border: "1px solid rgb(var(--primary-border))" }}>
        {[0, 1, 2].map(i => (
          <motion.span key={i} animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
            className="w-1.5 h-1.5 rounded-full block"
            style={{ background: "rgb(var(--primary))" }} />
        ))}
      </div>
    </motion.div>
  );
}

/* ── Progress bar ─────────────────────────────────────────────── */
function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="px-4 py-2.5 border-b shrink-0"
      style={{ borderColor: "rgb(var(--border))", background: "rgb(var(--surface))" }}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-label">Assessment Progress</span>
        <span className="text-xs font-bold" style={{ color: "rgb(var(--primary))" }}>{percent}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgb(var(--border))" }}>
        <motion.div animate={{ width: `${percent}%` }} transition={{ duration: 0.4, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, rgb(var(--primary)), rgb(var(--accent)))" }} />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   ChatUI — Assessment chatbot (one-time onboarding)
   ════════════════════════════════════════════════════════════════ */
export default function ChatUI() {
  const router = useRouter();
  const { setProfile } = useStore();

  const [messages, setMessages] = useState<{ role: "ai" | "user"; content: string }[]>([]);
  const [history,  setHistory]  = useState<ChatMessage[]>([]);
  const [input,    setInput]    = useState("");
  const [typing,   setTyping]   = useState(false);
  const [done,     setDone]     = useState(false);
  const [locked,   setLocked]   = useState(false);
  const [progress, setProgress] = useState(0);
  const [error,    setError]    = useState("");

  const bottomRef  = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);
  const inputRef   = useRef<HTMLInputElement>(null);

  const addAI  = (text: string) => setMessages(p => [...p, { role: "ai",  content: text }]);
  const addUser = (text: string) => setMessages(p => [...p, { role: "user", content: text }]);

  /* ── Core Groq call ──────────────────────────────────────────── */
  const sendToGroq = async (userMessage: string, currentHistory: ChatMessage[]) => {
    setLocked(true);
    setTyping(true);
    setError("");
    try {
      const res = await apiAssessmentChat(userMessage, currentHistory);
      setTyping(false);
      setHistory(res.history);
      setProgress(res.profile_completion ?? 0);

      if (res.is_complete) {
        addAI(res.reply);
        addAI("🎉 Assessment complete! Processing with Adzuna market data — please wait…");
        setDone(true);

        // Wait for the pipeline (save + Adzuna + Gemini) to finish, then sync store
        try {
          const p = await waitForPipeline(35000);
          setProfile(p);
          if (p.profile_completion > 0) {
            addAI(`✅ Profile saved! Completion: ${p.profile_completion}%. Redirecting to dashboard…`);
          }
        } catch { /* non-fatal */ }

        setTimeout(() => router.push("/dashboard"), 2500);
      } else {
        addAI(res.reply);
        setLocked(false);
        setTimeout(() => inputRef.current?.focus(), 80);
      }
    } catch (e: unknown) {
      setTyping(false);
      setLocked(false);
      const status = (e as { status?: number })?.status;
      if (status === 400) {
        // Assessment already done
        addAI("✅ Your assessment is already complete! Redirecting to your dashboard...");
        setDone(true);
        setTimeout(() => router.push("/dashboard"), 1500);
      } else if (status === 401) {
        setError("Session expired — please log in again.");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setError("Connection error. Please check your internet and try again.");
      }
    }
  };

  /* ── Start on mount ──────────────────────────────────────────── */
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    addAI("👋 Hi! I'm your AI Career Mentor. I'll ask you a few questions to understand your background and goals. Let's get started!");
    // Kick off first question
    sendToGroq("", []);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Scroll ──────────────────────────────────────────────────── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  /* ── Submit ──────────────────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const msg = input.trim();
    if (!msg || locked || done) return;
    setInput("");
    addUser(msg);
    await sendToGroq(msg, history);
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <ProgressBar percent={progress} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 min-h-0"
        style={{ background: "rgb(var(--background-alt))" }}>
        {messages.map((m, i) => (
          <MessageBubble key={i} role={m.role} content={m.content} />
        ))}

        <AnimatePresence>
          {typing && <TypingIndicator key="typing" />}
        </AnimatePresence>

        {/* Error banner */}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="px-4 py-2.5 rounded-xl text-sm font-medium"
            style={{ background: "rgb(var(--danger) / 0.10)", color: "rgb(var(--danger))", border: "1px solid rgb(var(--danger) / 0.22)" }}>
            ⚠️ {error}
          </motion.div>
        )}

        {/* Completion card */}
        {done && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl p-5 text-center mt-2"
            style={{ background: "rgb(var(--accent) / 0.08)", border: "1px solid rgb(var(--accent) / 0.25)" }}>
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2" style={{ color: "rgb(var(--accent))" }} />
            <p className="text-sm font-semibold" style={{ color: "rgb(var(--foreground))" }}>Assessment Complete!</p>
            <p className="text-xs mt-1" style={{ color: "rgb(var(--foreground-muted))" }}>
              Saving your profile &amp; running Adzuna market analysis…
            </p>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {!done && (
        <form onSubmit={handleSubmit}
          className="px-4 py-3 flex gap-2 border-t shrink-0"
          style={{ borderColor: "rgb(var(--border))", background: "rgb(var(--surface))" }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={locked ? "AI is thinking…" : "Type your answer and press Enter…"}
            disabled={locked}
            autoFocus
            className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none transition-all disabled:opacity-50"
            style={{
              background: "rgb(var(--background-alt))",
              border: "1px solid rgb(var(--border))",
              color: "rgb(var(--foreground))",
            }}
            onFocus={e => {
              e.target.style.borderColor = "rgb(var(--primary-border))";
              e.target.style.boxShadow = "0 0 0 3px rgb(var(--primary) / 0.10)";
            }}
            onBlur={e => {
              e.target.style.borderColor = "rgb(var(--border))";
              e.target.style.boxShadow = "none";
            }}
          />
          <motion.button type="submit" disabled={locked || !input.trim()}
            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
            className="w-10 h-10 rounded-xl btn-primary flex items-center justify-center shrink-0 disabled:opacity-40 disabled:transform-none">
            <Send size={14} />
          </motion.button>
        </form>
      )}
    </div>
  );
}

"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState, useCallback } from "react";
import { Send } from "lucide-react";
import MessageBubble from "./MessageBubble";
import { useStore } from "@/lib/store";
import { apiProfileChat, apiGetProfile, ChatMessage } from "@/lib/api";

/* ── Typing dots ─────────────────────────────────────────────── */
function TypingDots() {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: "rgb(var(--primary) / 0.12)", border: "1px solid rgb(var(--primary-border))" }}>
        <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "rgb(var(--primary))" }} />
      </div>
      <div className="px-4 py-3 rounded-2xl flex gap-1.5 items-center"
        style={{ background: "rgb(var(--surface))", border: "1px solid rgb(var(--border))", borderTopLeftRadius: 4 }}>
        {[0, 1, 2].map(i => (
          <motion.span key={i} animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 0.75, delay: i * 0.15 }}
            className="block w-1.5 h-1.5 rounded-full"
            style={{ background: "rgb(var(--primary))" }} />
        ))}
      </div>
    </div>
  );
}

interface Props { onComplete?: () => void; }

export default function ProfileChatbot({ onComplete }: Props) {
  const { profile, setProfile } = useStore();
  const [messages, setMessages] = useState<{ role: "ai" | "user"; content: string }[]>([]);
  const [history, setHistory]   = useState<ChatMessage[]>([]);
  const [input, setInput]       = useState("");
  const [typing, setTyping]     = useState(false);
  const [done, setDone]         = useState(false);
  const [locked, setLocked]     = useState(false);
  const [error, setError]       = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);
  const initRef   = useRef(false);

  const addAI  = (text: string) => setMessages(p => [...p, { role: "ai",  content: text }]);
  const addUser = (text: string) => setMessages(p => [...p, { role: "user", content: text }]);

  /* ── Ask Groq, optionally with a user message ─────────────── */
  const ask = useCallback(async (userMsg: string, hist: ChatMessage[]) => {
    setLocked(true);
    setTyping(true);
    setError("");
    try {
      const res = await apiProfileChat(userMsg, hist);
      setTyping(false);
      setHistory(res.history);

      if (res.is_complete) {
        addAI(res.reply);
        addAI("✅ Your profile is now complete! All AI features are now unlocked.");
        setDone(true);
        try { const p = await apiGetProfile(); setProfile(p); } catch {}
        onComplete?.();
      } else {
        addAI(res.reply);
        setLocked(false);
        setTimeout(() => inputRef.current?.focus(), 80);
      }
    } catch (e: unknown) {
      setTyping(false);
      setLocked(false);
      const status = (e as { status?: number })?.status;
      if (status === 401) {
        setError("Session expired — please log in again.");
      } else if (status === 500) {
        setError("AI service error. Please try again.");
      } else {
        setError("Connection error. Please check your internet and try again.");
      }
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [onComplete, setProfile]);

  /* ── On mount: show greeting then kick off first question ──── */
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const greeting = profile?.name
      ? `Hi ${profile.name}! I need a few more details to complete your profile.`
      : "Hi! Let me help you complete your profile so I can personalise your career journey.";
    addAI(greeting);

    // Kick off first question with empty message
    ask("", []);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Scroll to bottom whenever messages change ─────────────── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  /* ── Handle user send ──────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const msg = input.trim();
    if (!msg || locked || done) return;
    setInput("");
    addUser(msg);           // show immediately in UI
    await ask(msg, history);
  };

  return (
    <div className="flex flex-col h-full min-h-0">

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 min-h-0"
        style={{ background: "rgb(var(--background-alt))" }}>
        {messages.map((m, i) => (
          <MessageBubble key={i} role={m.role} content={m.content} />
        ))}

        <AnimatePresence>
          {typing && (
            <motion.div key="typing" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <TypingDots />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error banner */}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="px-4 py-2.5 rounded-xl text-sm font-medium"
            style={{ background: "rgb(var(--danger) / 0.10)", color: "rgb(var(--danger))", border: "1px solid rgb(var(--danger) / 0.22)" }}>
            ⚠️ {error}
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      {!done && (
        <form onSubmit={handleSubmit}
          className="flex gap-2 px-4 py-3 border-t shrink-0"
          style={{ borderColor: "rgb(var(--border))", background: "rgb(var(--surface))" }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={locked ? "AI is thinking…" : "Type your answer and press Enter…"}
            disabled={locked}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none disabled:opacity-50 transition-all"
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

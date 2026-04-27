"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Send, CheckCircle2 } from "lucide-react";
import MessageBubble from "./MessageBubble";
import { useProfile } from "@/lib/profileContext";
import { apiAssessmentChat, apiGetProfile, ChatMessage } from "@/lib/api";

function TypingIndicator() {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex justify-start">
      <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-purple-600/20 border border-purple-500/20 flex gap-1.5 items-center">
        {[0, 1, 2].map((i) => (
          <motion.span key={i} animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
            className="w-1.5 h-1.5 rounded-full bg-purple-400 block" />
        ))}
      </div>
    </motion.div>
  );
}

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="px-4 py-2 border-b border-white/5">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-white/40">Assessment Progress</span>
        <span className="text-xs text-purple-400">{percent}%</span>
      </div>
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div animate={{ width: `${percent}%` }} transition={{ duration: 0.4, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" />
      </div>
    </div>
  );
}

export default function ChatUI() {
  const router = useRouter();
  const { updateProfile } = useProfile();
  const [messages, setMessages] = useState<{ role: "ai" | "user"; content: string }[]>([]);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [done, setDone] = useState(false);
  const [locked, setLocked] = useState(false);
  const [progress, setProgress] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  const addAIMessage = (content: string) => {
    setMessages((prev) => [...prev, { role: "ai", content }]);
  };

  const sendToGroq = async (userMessage: string, currentHistory: ChatMessage[]) => {
    setLocked(true);
    setTyping(true);
    try {
      const res = await apiAssessmentChat(userMessage, currentHistory);
      setTyping(false);
      setHistory(res.history);
      setProgress(res.profile_completion);

      if (res.is_complete) {
        addAIMessage(res.reply);
        addAIMessage("🎉 Assessment complete! Building your personalized career profile...");
        setDone(true);
        // Sync profile from backend then redirect
        try {
          const p = await apiGetProfile();
          updateProfile({
            name: p.name, profession: p.profession, experience: p.experience_years,
            level: p.experience_level, goal: p.goal, target_domain: p.preferred_domain,
            skills: p.skills, education: p.education, status: p.current_status,
            availability: p.availability, career_goal: p.goal, linkedin: p.linkedin, bio: p.bio,
            backend_completion: p.profile_completion,
          });
        } catch {}
        setTimeout(() => router.push("/dashboard"), 2000);
      } else {
        addAIMessage(res.reply);
        setLocked(false);
      }
    } catch {
      setTyping(false);
      addAIMessage("I'm having trouble connecting. Please check your connection and try again.");
      setLocked(false);
    }
  };

  // Boot — send empty message to get first question
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    (async () => {
      setTyping(true);
      addAIMessage("👋 Hi! I'm your AI Career Mentor. I'll ask you a few questions to understand your background and goals.");
      await new Promise((r) => setTimeout(r, 1000));
      await sendToGroq("", []);
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || locked || done) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    await sendToGroq(userMsg, history);
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <ProgressBar percent={progress} />

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 min-h-0">
        {messages.map((m, i) => (
          <MessageBubble key={i} role={m.role} content={m.content} />
        ))}

        <AnimatePresence>
          {typing && <TypingIndicator key="typing" />}
        </AnimatePresence>

        {done && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="glass glow-border rounded-2xl p-5 text-center mt-2">
            <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">Assessment Complete!</p>
            <p className="text-xs text-white/50 mt-1">Redirecting to your dashboard...</p>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {!done && (
        <form onSubmit={handleSubmit} className="px-4 pb-4 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={locked ? "AI is thinking..." : "Type your answer..."}
            disabled={locked}
            autoFocus
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 text-sm outline-none focus:border-purple-500/60 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.12)] transition-all disabled:opacity-50"
          />
          <motion.button type="submit" disabled={locked || !input.trim()}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="w-11 h-11 rounded-xl btn-primary flex items-center justify-center shrink-0 disabled:opacity-50">
            <Send size={16} />
          </motion.button>
        </form>
      )}
    </div>
  );
}

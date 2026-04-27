"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import MessageBubble from "./MessageBubble";
import { useProfile } from "@/lib/profileContext";
import { apiProfileChat, apiGetProfile, ChatMessage } from "@/lib/api";

function TypingIndicator() {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex justify-start">
      <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-purple-600/20 border border-purple-500/20 flex gap-1.5 items-center">
        {[0, 1, 2].map((i) => (
          <motion.span key={i} animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
            className="w-1.5 h-1.5 rounded-full bg-purple-400 block" />
        ))}
      </div>
    </motion.div>
  );
}

interface ProfileChatbotProps {
  onComplete?: () => void;
}

export default function ProfileChatbot({ onComplete }: ProfileChatbotProps) {
  const { profile, updateProfile } = useProfile();
  const [messages, setMessages] = useState<{ role: "ai" | "user"; content: string }[]>([]);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [done, setDone] = useState(false);
  const [locked, setLocked] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  const addAI = (content: string) => setMessages((p) => [...p, { role: "ai", content }]);

  const sendToGroq = async (userMessage: string, currentHistory: ChatMessage[]) => {
    setLocked(true);
    setTyping(true);
    try {
      const res = await apiProfileChat(userMessage, currentHistory);
      setTyping(false);
      setHistory(res.history);

      // Update backend_completion live after every turn
      if (res.profile_completion !== undefined) {
        updateProfile({ backend_completion: res.profile_completion });
      }

      if (res.is_complete) {
        addAI(res.reply);
        addAI("✅ Your profile is now complete! All features are unlocked.");
        setDone(true);
        // Final sync from backend
        try {
          const p = await apiGetProfile();
          updateProfile({
            name: p.name,
            profession: p.profession,
            experience: p.experience_years,
            level: p.experience_level,
            goal: p.goal,
            target_domain: p.preferred_domain,
            skills: Array.isArray(p.skills) ? p.skills : [],
            education: p.education,
            status: p.current_status,
            availability: p.availability,
            linkedin: p.linkedin,
            bio: p.bio,
            backend_completion: p.profile_completion,
          });
        } catch {}
        onComplete?.();
      } else {
        addAI(res.reply);
        setLocked(false);
      }
    } catch {
      setTyping(false);
      addAI("I'm having trouble connecting. Please try again.");
      setLocked(false);
    }
  };

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    (async () => {
      // Build greeting based on what's already filled
      const filled = [profile.name, profile.profession].filter(Boolean);
      const greeting = filled.length
        ? `Hi ${profile.name || "there"}! I just need a few more details to complete your profile.`
        : "Hi! Let me help you complete your profile so we can personalize your career journey.";
      addAI(greeting);
      await new Promise((r) => setTimeout(r, 600));
      await sendToGroq("", []);
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || locked || done) return;
    const msg = input.trim();
    setInput("");
    setMessages((p) => [...p, { role: "user", content: msg }]);
    await sendToGroq(msg, history);
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 min-h-0">
        {messages.map((m, i) => (
          <MessageBubble key={i} role={m.role} content={m.content} />
        ))}

        <AnimatePresence>
          {typing && <TypingIndicator key="typing" />}
        </AnimatePresence>

        {done && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="glass border border-green-500/30 rounded-2xl p-4 text-center mt-2">
            <CheckCircle2 className="w-7 h-7 text-green-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">Profile Complete!</p>
            <p className="text-xs text-white/40 mt-1">All features are now unlocked</p>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {!done && (
        <form onSubmit={handleSubmit} className="px-4 pb-4 flex gap-2 border-t border-white/5 pt-3">
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

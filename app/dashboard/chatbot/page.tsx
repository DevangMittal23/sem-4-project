"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import ProfileChatbot from "@/components/ProfileChatbot";
import { useStore } from "@/lib/store";
import { ProgressBar } from "@/components/ui";
import {
  Bot, CheckCircle2, Sparkles, Shield, Zap,
  MessageSquare, Brain,
} from "lucide-react";
import Link from "next/link";

/* ── Feature pill ────────────────────────────────────────────────────────── */
function FeaturePill({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
      style={{
        background: "rgb(var(--primary) / 0.08)",
        border: "1px solid rgb(var(--primary-border))",
        color: "rgb(var(--primary))",
      }}>
      <Icon size={11} />
      {label}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   AI CHAT PAGE
   ════════════════════════════════════════════════════════════════ */
export default function ChatbotPage() {
  const { isGated, completion } = useStore();
  const [done, setDone] = useState(false);

  const isComplete = completion >= 80;

  return (
    <div className="flex min-h-screen" style={{ background: "rgb(var(--background))" }}>
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* ── Top header bar ── */}
        <div className="shrink-0 px-6 py-4 flex items-center gap-4 border-b"
          style={{ borderColor: "rgb(var(--border))", background: "rgb(var(--surface))" }}>

          {/* Brand */}
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: "rgb(var(--primary) / 0.10)",
              border: "1px solid rgb(var(--primary-border))",
              boxShadow: "var(--primary-glow)",
            }}>
            <Bot size={18} style={{ color: "rgb(var(--primary))" }} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2.5">
              <p className="text-sm font-bold" style={{ color: "rgb(var(--foreground))" }}>
                AI Career Mentor
              </p>
              <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: "rgb(var(--accent) / 0.1)", color: "rgb(var(--accent))", border: "1px solid rgb(var(--accent) / 0.2)" }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "rgb(var(--accent))" }} />
                Online
              </span>
            </div>
            <p className="text-[11px] mt-0.5" style={{ color: "rgb(var(--foreground-faint))" }}>
              Powered by Groq · llama-3.3-70b-versatile
            </p>
          </div>

          {/* Profile progress chip */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex flex-col items-end gap-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: isComplete ? "rgb(var(--accent))" : "rgb(var(--warning))" }}>
                {isComplete ? "Profile Complete" : `${completion}% complete`}
              </p>
              <div className="w-28">
                <ProgressBar pct={completion} color={isComplete ? "accent" : "primary"} height="h-1.5" />
              </div>
            </div>
            {isComplete && (
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "rgb(var(--accent) / 0.1)", border: "1px solid rgb(var(--accent) / 0.2)" }}>
                <CheckCircle2 size={15} style={{ color: "rgb(var(--accent))" }} />
              </div>
            )}
          </div>
        </div>

        {/* ── Main 2-col layout ── */}
        <div className="flex-1 flex min-h-0">

          {/* Chat panel */}
          <div className="flex-1 flex flex-col min-h-0 min-w-0">
            {done ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-5">
                <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 3 }}
                  className="w-20 h-20 rounded-2xl flex items-center justify-center"
                  style={{
                    background: "rgb(var(--accent) / 0.1)",
                    border: "1px solid rgb(var(--accent) / 0.25)",
                    boxShadow: "var(--accent-glow)",
                  }}>
                  <CheckCircle2 size={36} style={{ color: "rgb(var(--accent))" }} />
                </motion.div>
                <div>
                  <h2 className="text-display mb-2">Profile Complete!</h2>
                  <p className="text-body max-w-xs mx-auto">
                    Your profile is fully set up. All AI features are now unlocked and personalised for you.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link href="/dashboard/roadmap" className="btn-primary">
                    <Brain size={14} /> View Roadmap
                  </Link>
                  <Link href="/dashboard" className="btn-secondary">
                    Back to Dashboard
                  </Link>
                </div>
              </motion.div>
            ) : (
              <ProfileChatbot onComplete={() => setDone(true)} />
            )}
          </div>

          {/* Right info sidebar (hidden on small screens) */}
          <div className="hidden lg:flex flex-col w-72 shrink-0 border-l p-5 gap-5 overflow-y-auto"
            style={{ borderColor: "rgb(var(--border))", background: "rgb(var(--surface))" }}>

            {/* Status */}
            <div className="rounded-2xl p-4"
              style={{
                background: isComplete ? "rgb(var(--accent) / 0.06)" : "rgb(var(--primary) / 0.06)",
                border: `1px solid ${isComplete ? "rgb(var(--accent) / 0.2)" : "rgb(var(--primary-border))"}`,
              }}>
              <p className="text-label mb-2" style={{ color: isComplete ? "rgb(var(--accent))" : "rgb(var(--primary))" }}>
                {isComplete ? "Profile Status" : "Completion Progress"}
              </p>
              <ProgressBar pct={completion} color={isComplete ? "accent" : "primary"} height="h-2.5" />
              <p className="text-xs font-semibold mt-2"
                style={{ color: isComplete ? "rgb(var(--accent))" : "rgb(var(--primary))" }}>
                {completion}% complete
              </p>
              {!isComplete && (
                <p className="text-caption mt-1">
                  {Math.ceil((100 - completion) / 14.3)} more fields needed to unlock all features.
                </p>
              )}
            </div>

            {/* Feature pills */}
            <div>
              <p className="text-label mb-3">AI will help you unlock</p>
              <div className="flex flex-col gap-2">
                <FeaturePill icon={Sparkles} label="Career Predictions" />
                <FeaturePill icon={Zap}      label="Skill Gap Analysis" />
                <FeaturePill icon={Brain}    label="12-Week Roadmap" />
                <FeaturePill icon={MessageSquare} label="Weekly Task AI" />
              </div>
            </div>

            {/* What to expect */}
            <div>
              <p className="text-label mb-3">What the AI collects</p>
              <div className="flex flex-col gap-2">
                {[
                  "Your target career role",
                  "Learning style & availability",
                  "Risk tolerance for career moves",
                  "Side income preferences",
                ].map((item, i) => (
                  <div key={i} className="flex gap-2 text-xs"
                    style={{ color: "rgb(var(--foreground-muted))" }}>
                    <span style={{ color: "rgb(var(--accent))" }}>→</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Privacy note */}
            <div className="flex gap-2.5 p-3 rounded-xl mt-auto"
              style={{ background: "rgb(var(--background-alt))", border: "1px solid rgb(var(--border-subtle))" }}>
              <Shield size={14} className="shrink-0 mt-0.5" style={{ color: "rgb(var(--foreground-faint))" }} />
              <p className="text-[11px] leading-relaxed" style={{ color: "rgb(var(--foreground-faint))" }}>
                Your answers are stored securely and only used to personalise your career journey.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

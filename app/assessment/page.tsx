"use client";
import { motion } from "framer-motion";
import ChatUI from "@/components/ChatUI";
import Link from "next/link";
import { Sparkles, Bot } from "lucide-react";

export default function AssessmentPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "rgb(var(--background))" }}>

      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: "rgb(var(--primary) / 0.05)", filter: "blur(100px)" }} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full"
          style={{ background: "rgb(var(--accent) / 0.04)", filter: "blur(80px)", transform: "translate(20%, 20%)" }} />
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "linear-gradient(rgb(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }} />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 h-16 border-b"
        style={{ borderColor: "rgb(var(--border))", background: "rgb(var(--surface) / 0.80)", backdropFilter: "blur(16px)" }}>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "rgb(var(--primary) / 0.10)", border: "1px solid rgb(var(--primary-border))" }}>
            <Sparkles size={13} style={{ color: "rgb(var(--primary))" }} />
          </div>
          <span className="text-base font-bold gradient-text">AI Career Mentor</span>
        </Link>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-full"
          style={{
            background: "rgb(var(--primary) / 0.08)",
            border: "1px solid rgb(var(--primary-border))",
            color: "rgb(var(--primary))",
          }}>
          Career Assessment
        </span>
      </header>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-[520px] flex flex-col overflow-hidden rounded-2xl"
          style={{
            height: 620,
            background: "rgb(var(--surface))",
            border: "1px solid rgb(var(--border-strong))",
            boxShadow: "var(--shadow-xl), var(--primary-glow)",
          }}>

          {/* Chat header */}
          <div className="px-5 py-4 border-b flex items-center gap-3 shrink-0"
            style={{ borderColor: "rgb(var(--border))", background: "rgb(var(--surface-raised))" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "rgb(var(--primary) / 0.12)", border: "1px solid rgb(var(--primary-border))" }}>
              <Bot size={17} style={{ color: "rgb(var(--primary))" }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: "rgb(var(--foreground))" }}>AI Career Mentor</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "rgb(var(--accent))" }} />
                <span className="text-xs" style={{ color: "rgb(var(--foreground-faint))" }}>Online · Groq LLaMA-3.3</span>
              </div>
            </div>
          </div>

          <ChatUI />
        </motion.div>
      </div>
    </div>
  );
}

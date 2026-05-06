"use client";
import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";

interface MessageBubbleProps {
  role: "ai" | "user";
  content: string;
}

export default function MessageBubble({ role, content }: MessageBubbleProps) {
  const isAI = role === "ai";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className={`flex gap-2.5 ${isAI ? "justify-start" : "justify-end"}`}
    >
      {/* AI avatar */}
      {isAI && (
        <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
          style={{
            background: "rgb(var(--primary) / 0.12)",
            border: "1px solid rgb(var(--primary-border))",
          }}>
          <Bot size={13} style={{ color: "rgb(var(--primary))" }} />
        </div>
      )}

      {/* Bubble */}
      <div
        className="max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
        style={isAI ? {
          background: "rgb(var(--surface))",
          border: "1px solid rgb(var(--border))",
          color: "rgb(var(--foreground))",
          borderTopLeftRadius: "4px",
          boxShadow: "var(--shadow-xs)",
        } : {
          background: "rgb(var(--primary))",
          color: "white",
          borderTopRightRadius: "4px",
          boxShadow: "0 2px 8px rgb(var(--primary) / 0.35)",
        }}
      >
        {content}
      </div>

      {/* User avatar */}
      {!isAI && (
        <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
          style={{
            background: "rgb(var(--primary) / 0.15)",
            border: "1px solid rgb(var(--primary-border))",
          }}>
          <User size={13} style={{ color: "rgb(var(--primary))" }} />
        </div>
      )}
    </motion.div>
  );
}

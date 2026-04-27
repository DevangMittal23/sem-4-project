"use client";
import { motion } from "framer-motion";

interface MessageBubbleProps {
  role: "ai" | "user";
  content: string;
}

export default function MessageBubble({ role, content }: MessageBubbleProps) {
  const isAI = role === "ai";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex ${isAI ? "justify-start" : "justify-end"}`}
    >
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isAI
            ? "bg-gradient-to-br from-purple-600/30 to-blue-600/20 border border-purple-500/20 text-foreground/90 rounded-tl-sm"
            : "bg-gradient-to-br from-indigo-600/40 to-purple-700/30 border border-indigo-500/20 text-foreground rounded-tr-sm"
        }`}
      >
        {content}
      </div>
    </motion.div>
  );
}

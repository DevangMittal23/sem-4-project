"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { AlertCircle, X, Bot } from "lucide-react";
import { useStore } from "@/lib/store";
import ProfileChatbot from "@/components/ProfileChatbot";

export default function CompletionModal() {
  const { isGated, completion } = useStore();
  const [dismissed, setDismissed] = useState(false);
  const [chatDone, setChatDone] = useState(false);

  // Auto-dismiss when chatbot completes
  const handleComplete = () => {
    setChatDone(true);
    setTimeout(() => setDismissed(true), 2000);
  };

  const show = isGated && !dismissed;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* backdrop — click to dismiss */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDismissed(true)} />

          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
            className="relative z-10 w-full max-w-lg glass glow-border rounded-2xl overflow-hidden flex flex-col"
            style={{ maxHeight: "90vh" }}
          >
            {/* header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                  <AlertCircle size={16} className="text-amber-400" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">Complete Your Profile</h2>
                  <p className="text-xs text-white/40">Answer a few questions to unlock all features</p>
                </div>
              </div>
              <button onClick={() => setDismissed(true)}
                className="text-white/30 hover:text-white/60 transition-colors p-1">
                <X size={16} />
              </button>
            </div>

            {/* progress bar */}
            <div className="px-5 py-3 border-b border-white/5 shrink-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-white/40">Profile completion</span>
                <span className="text-xs font-semibold text-amber-400">{completion}% — need 80% to unlock</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${completion}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                />
              </div>
            </div>

            {/* chatbot header */}
            <div className="flex items-center gap-3 px-5 py-3 border-b border-white/5 shrink-0">
              <div className="w-7 h-7 rounded-lg bg-purple-600/30 border border-purple-500/30 flex items-center justify-center">
                <Bot size={14} className="text-purple-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-white">AI Profile Assistant</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[10px] text-white/40">Asking about missing fields only</span>
                </div>
              </div>
            </div>

            {/* chatbot body */}
            <div className="flex-1 min-h-0" style={{ height: "380px" }}>
              <ProfileChatbot onComplete={handleComplete} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

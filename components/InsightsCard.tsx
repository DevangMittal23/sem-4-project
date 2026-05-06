"use client";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface InsightsCardProps {
  insights: string[];
  loading?: boolean;
}

export default function InsightsCard({ insights, loading }: InsightsCardProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-2 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 bg-white/8 rounded-xl" />
        ))}
      </div>
    );
  }

  const items = insights.length > 0
    ? insights
    : [
        "Complete your profile to receive personalized AI insights.",
        "Consistent daily practice beats occasional intense sessions.",
        "Focus on one skill at a time for maximum retention.",
      ];

  return (
    <div className="flex flex-col gap-3">
      {items.slice(0, 3).map((insight, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex gap-3 p-3 rounded-xl bg-purple-600/8 border border-purple-500/15"
        >
          <Sparkles size={14} className="text-purple-400 shrink-0 mt-0.5" />
          <p className="text-sm text-white/70 leading-relaxed">{insight}</p>
        </motion.div>
      ))}
    </div>
  );
}

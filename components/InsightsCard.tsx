"use client";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useProfile } from "@/lib/profileContext";

function getInsights(level: string, goal: string, skills: string[]): string[] {
  const insights: string[] = [];
  if (level === "Fresher" || level === "Junior")
    insights.push("Focus on building a strong portfolio with 2–3 solid projects.");
  if (level === "Mid" || level === "Senior")
    insights.push("You're ready for leadership opportunities — consider mentoring juniors.");
  if (goal === "Switch Domain")
    insights.push("Transferable skills are your biggest asset during a domain switch.");
  if (goal === "Excel in Current Domain")
    insights.push("Deep specialization will set you apart from generalists.");
  if (skills.length > 0)
    insights.push(`Your skills in ${skills.slice(0, 2).join(" & ")} are in high demand right now.`);
  insights.push("Consistent daily practice beats occasional intense sessions.");
  return insights.slice(0, 3);
}

export default function InsightsCard() {
  const { profile } = useProfile();
  const insights = getInsights(profile.level, profile.goal, profile.skills);

  return (
    <div className="flex flex-col gap-3">
      {insights.map((insight, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex gap-3 p-3 rounded-xl bg-purple-600/8 border border-purple-500/15"
        >
          <Sparkles size={14} className="text-purple-400 shrink-0 mt-0.5" />
          <p className="text-sm text-foreground/70 leading-relaxed">{insight}</p>
        </motion.div>
      ))}
    </div>
  );
}

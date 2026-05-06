"use client";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Clock } from "lucide-react";

interface Task {
  id: number;
  title: string;
  tag: string;
  status: string;
  estimated_time: string;
  difficulty: string;
}

interface TaskPreviewProps {
  tasks: Task[];
  loading?: boolean;
  maxItems?: number;
}

const TAG_COLORS: Record<string, string> = {
  Learning: "text-blue-400",
  Practice: "text-purple-400",
  Project: "text-green-400",
  Reading: "text-cyan-400",
  Career: "text-amber-400",
};

export default function TaskPreview({ tasks, loading, maxItems = 4 }: TaskPreviewProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-2 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 bg-white/8 rounded-xl" />
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <p className="text-sm text-white/30 text-center py-4">No tasks yet.</p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {tasks.slice(0, maxItems).map((t, i) => (
        <motion.div
          key={t.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06 }}
          className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
            t.status === "done"
              ? "bg-green-500/5 border-green-500/10"
              : "bg-white/2 border-white/6"
          }`}
        >
          {t.status === "done"
            ? <CheckCircle2 size={14} className="text-green-400 shrink-0" />
            : <Circle size={14} className="text-white/20 shrink-0" />}
          <span className={`text-xs flex-1 truncate ${
            t.status === "done" ? "line-through text-white/30" : "text-white/70"
          }`}>
            {t.title}
          </span>
          <span className={`text-[10px] shrink-0 ${TAG_COLORS[t.tag] || "text-white/30"}`}>
            {t.tag}
          </span>
          {t.estimated_time && (
            <span className="flex items-center gap-1 text-[10px] text-white/25 shrink-0">
              <Clock size={9} />{t.estimated_time}
            </span>
          )}
        </motion.div>
      ))}
    </div>
  );
}

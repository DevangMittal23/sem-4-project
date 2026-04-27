"use client";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Clock } from "lucide-react";

const MOCK_TASKS = [
  { id: 1, title: "Complete Python basics module", tag: "Learning", done: true, time: "45 min" },
  { id: 2, title: "Solve 2 LeetCode easy problems", tag: "Practice", done: true, time: "30 min" },
  { id: 3, title: "Read about system design basics", tag: "Reading", done: false, time: "20 min" },
  { id: 4, title: "Update LinkedIn profile summary", tag: "Career", done: false, time: "15 min" },
];

const TAG_COLORS: Record<string, string> = {
  Learning: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  Practice: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  Reading: "text-green-400 bg-green-500/10 border-green-500/20",
  Career: "text-amber-400 bg-amber-500/10 border-amber-500/20",
};

export default function TaskPreview() {
  const done = MOCK_TASKS.filter((t) => t.done).length;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-foreground/40">{done}/{MOCK_TASKS.length} completed this week</span>
        <div className="flex gap-1">
          {MOCK_TASKS.map((t) => (
            <div key={t.id} className={`w-5 h-1.5 rounded-full ${t.done ? "bg-green-500" : "bg-foreground/10"}`} />
          ))}
        </div>
      </div>

      {MOCK_TASKS.map((task, i) => (
        <motion.div
          key={task.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.07 }}
          className={`flex items-center gap-3 p-3 rounded-xl border transition-colors
            ${task.done ? "bg-green-500/5 border-green-500/10" : "bg-foreground/3 border-foreground/5 hover:border-foreground/10"}`}
        >
          {task.done
            ? <CheckCircle2 size={16} className="text-green-400 shrink-0" />
            : <Circle size={16} className="text-foreground/20 shrink-0" />}
          <span className={`text-sm flex-1 ${task.done ? "line-through text-foreground/30" : "text-foreground/70"}`}>
            {task.title}
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${TAG_COLORS[task.tag]}`}>{task.tag}</span>
          <span className="flex items-center gap-1 text-[10px] text-foreground/25 shrink-0">
            <Clock size={10} />{task.time}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

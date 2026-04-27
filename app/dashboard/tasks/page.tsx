"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import CompletionModal from "@/components/CompletionModal";
import { useProfile } from "@/lib/profileContext";
import { CheckCircle2, Circle, Clock, Lock, Filter } from "lucide-react";

interface Task {
  id: number;
  title: string;
  tag: string;
  done: boolean;
  time: string;
  difficulty: "easy" | "medium" | "hard";
  week: number;
  description: string;
}

const ALL_TASKS: Task[] = [
  { id: 1, title: "Complete Python basics module", tag: "Learning", done: true, time: "45 min", difficulty: "easy", week: 1, description: "Cover variables, loops, functions, and basic data structures." },
  { id: 2, title: "Solve 2 LeetCode easy problems", tag: "Practice", done: true, time: "30 min", difficulty: "easy", week: 1, description: "Focus on array and string manipulation problems." },
  { id: 3, title: "Read about system design basics", tag: "Reading", done: false, time: "20 min", difficulty: "medium", week: 1, description: "Read the first chapter of 'Designing Data-Intensive Applications'." },
  { id: 4, title: "Update LinkedIn profile summary", tag: "Career", done: false, time: "15 min", difficulty: "easy", week: 1, description: "Rewrite your headline and about section to reflect your target role." },
  { id: 5, title: "Build a mini CRUD app", tag: "Practice", done: false, time: "90 min", difficulty: "medium", week: 2, description: "Create a simple to-do app using your primary tech stack." },
  { id: 6, title: "Watch system design video", tag: "Learning", done: false, time: "60 min", difficulty: "medium", week: 2, description: "Watch a YouTube video on designing a URL shortener." },
  { id: 7, title: "Write a technical blog post", tag: "Career", done: false, time: "120 min", difficulty: "hard", week: 2, description: "Document something you learned this week on Medium or Dev.to." },
  { id: 8, title: "Mock interview practice", tag: "Practice", done: false, time: "60 min", difficulty: "hard", week: 2, description: "Do a mock interview on Pramp or with a peer." },
];

const TAG_COLORS: Record<string, string> = {
  Learning: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  Practice: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  Reading: "text-green-400 bg-green-500/10 border-green-500/20",
  Career: "text-amber-400 bg-amber-500/10 border-amber-500/20",
};

const DIFF_COLORS: Record<string, string> = {
  easy: "text-green-400",
  medium: "text-amber-400",
  hard: "text-red-400",
};

const ALL_TAGS = ["All", "Learning", "Practice", "Reading", "Career"];

export default function TasksPage() {
  const { isGated } = useProfile();
  const [tasks, setTasks] = useState<Task[]>(ALL_TASKS);
  const [week, setWeek] = useState(1);
  const [activeTag, setActiveTag] = useState("All");
  const [expanded, setExpanded] = useState<number | null>(null);

  const toggle = (id: number) => {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  };

  const filtered = tasks.filter(
    (t) => t.week === week && (activeTag === "All" || t.tag === activeTag)
  );
  const done = filtered.filter((t) => t.done).length;
  const pct = filtered.length ? Math.round((done / filtered.length) * 100) : 0;

  return (
    <div className="flex min-h-screen bg-[#050508]">
      <Sidebar />
      <CompletionModal />

      <main className="flex-1 overflow-y-auto">
        <div className="fixed top-0 right-0 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-3xl mx-auto px-6 py-8">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-2xl font-bold text-white">Weekly Tasks</h1>
            <p className="text-sm text-white/40 mt-1">Stay consistent — small daily actions compound into big results.</p>
          </motion.div>

          {isGated ? (
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
              className="glass glow-border rounded-2xl p-12 text-center">
              <Lock size={32} className="text-white/20 mx-auto mb-4" />
              <p className="text-white font-semibold mb-2">Complete your profile to unlock tasks</p>
              <p className="text-sm text-white/40">Your personalized weekly tasks will appear here.</p>
            </motion.div>
          ) : (
            <>
              {/* week selector + progress */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                className="glass glow-border rounded-2xl p-5 mb-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-2">
                    {[1, 2].map((w) => (
                      <button key={w} onClick={() => setWeek(w)}
                        className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all
                          ${week === w ? "btn-primary text-white" : "glass border border-white/10 text-white/50 hover:text-white"}`}>
                        Week {w}
                      </button>
                    ))}
                  </div>
                  <span className="text-xs text-white/40">{done}/{filtered.length} done</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div animate={{ width: `${pct}%` }} transition={{ duration: 0.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" />
                </div>
                <p className="text-xs text-white/30 mt-2">{pct}% complete this week</p>
              </motion.div>

              {/* tag filter */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                className="flex items-center gap-2 mb-5 flex-wrap">
                <Filter size={13} className="text-white/30" />
                {ALL_TAGS.map((tag) => (
                  <button key={tag} onClick={() => setActiveTag(tag)}
                    className={`px-3 py-1 rounded-full text-xs border transition-all
                      ${activeTag === tag
                        ? "bg-purple-600/25 border-purple-500/40 text-purple-300"
                        : "border-white/10 text-white/40 hover:text-white hover:border-white/20"}`}>
                    {tag}
                  </button>
                ))}
              </motion.div>

              {/* task list */}
              <div className="flex flex-col gap-3">
                <AnimatePresence>
                  {filtered.map((task, i) => (
                    <motion.div key={task.id}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }} transition={{ delay: i * 0.05 }}
                      className={`rounded-2xl border transition-all cursor-pointer
                        ${task.done ? "bg-green-500/5 border-green-500/15" : "glass border-white/8 hover:border-white/15"}`}
                      onClick={() => setExpanded(expanded === task.id ? null : task.id)}>
                      <div className="flex items-center gap-3 p-4">
                        <button onClick={(e) => { e.stopPropagation(); toggle(task.id); }}
                          className="shrink-0 transition-transform hover:scale-110">
                          {task.done
                            ? <CheckCircle2 size={18} className="text-green-400" />
                            : <Circle size={18} className="text-white/20 hover:text-purple-400 transition-colors" />}
                        </button>

                        <span className={`flex-1 text-sm ${task.done ? "line-through text-white/30" : "text-white/80"}`}>
                          {task.title}
                        </span>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[10px] font-medium ${DIFF_COLORS[task.difficulty]}`}>
                            {task.difficulty}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${TAG_COLORS[task.tag]}`}>
                            {task.tag}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] text-white/25">
                            <Clock size={10} />{task.time}
                          </span>
                        </div>
                      </div>

                      <AnimatePresence>
                        {expanded === task.id && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                            className="overflow-hidden">
                            <p className="px-4 pb-4 text-xs text-white/45 leading-relaxed border-t border-white/5 pt-3">
                              {task.description}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {filtered.length === 0 && (
                  <div className="text-center py-12 text-white/25 text-sm">
                    No tasks for this filter.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

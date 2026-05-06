"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import { BentoCard, SectionLabel, Skeleton, StreamingDots } from "@/components/ui";
import { useStore } from "@/lib/store";
import {
  apiGetTasks, apiUpdateTask, apiGenerateTasks,
  apiGetRoadmap, TaskResult,
} from "@/lib/api";
import {
  Sparkles, CheckCircle2, Circle, RefreshCw, Lock,
  Clock, BarChart2, ExternalLink, Brain, Zap, ListChecks, Trophy,
  Filter, Star,
} from "lucide-react";

/* ── Streaming loading experience ────────────────────────────────────────── */

const AI_THINKING_STEPS = [
  "Reading your skill profile…",
  "Scanning job market requirements…",
  "Running Gemini skill gap model…",
  "Designing optimal task sequence…",
  "Calibrating difficulty to your level…",
  "Adding resource links…",
  "Finalising weekly plan…",
];

function StreamingLoader() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(prev => (prev < AI_THINKING_STEPS.length - 1 ? prev + 1 : prev));
    }, 900);
    return () => clearInterval(interval);
  }, []);

  return (
    <BentoCard className="p-10 text-center" glass>
      {/* Animated brain */}
      <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 2 }}
        className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
        style={{ background: "rgb(var(--primary) / 0.12)", border: "1px solid rgb(var(--primary-border))" }}>
        <Brain size={28} style={{ color: "rgb(var(--primary))" }} />
      </motion.div>

      <p className="text-label mb-2" style={{ color: "rgb(var(--primary))" }}>
        AI Task Generator <StreamingDots />
      </p>
      <p className="text-heading mb-6">Crafting your personalised weekly plan</p>

      {/* Steps */}
      <div className="flex flex-col gap-2 text-left max-w-xs mx-auto">
        {AI_THINKING_STEPS.map((s, i) => (
          <motion.div key={s} initial={{ opacity: 0, x: -10 }}
            animate={i <= step ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-2.5 text-sm">
            {i < step
              ? <CheckCircle2 size={14} style={{ color: "rgb(var(--accent))" }} />
              : i === step
              ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                  <RefreshCw size={14} style={{ color: "rgb(var(--primary))" }} />
                </motion.div>
              : <Circle size={14} style={{ color: "rgb(var(--border-strong))" }} />}
            <span style={{ color: i <= step ? "rgb(var(--foreground))" : "rgb(var(--foreground-faint))" }}>{s}</span>
          </motion.div>
        ))}
      </div>
    </BentoCard>
  );
}

/* ── Task card ───────────────────────────────────────────────────────────── */

const DIFF_COLOR: Record<string, string> = {
  easy:   "rgb(var(--accent))",
  medium: "rgb(var(--warning))",
  hard:   "rgb(var(--danger))",
};

function TaskCard({ task, onToggle, index }: {
  task: TaskResult; onToggle: (id: number, status: string) => void; index: number;
}) {
  const done = task.status === "done";
  const dc = DIFF_COLOR[task.difficulty] ?? "rgb(var(--foreground-faint))";

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      className="card p-4 flex gap-4 transition-all"
      style={{ opacity: done ? 0.65 : 1 }}>
      {/* Toggle */}
      <button onClick={() => onToggle(task.id, done ? "pending" : "done")}
        className="mt-0.5 shrink-0 transition-transform hover:scale-110">
        {done
          ? <CheckCircle2 size={20} style={{ color: "rgb(var(--accent))" }} />
          : <Circle size={20} style={{ color: "rgb(var(--border-strong))" }} />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-1.5">
          <p className={`text-subheading ${done ? "line-through" : ""}`}
            style={{ color: done ? "rgb(var(--foreground-faint))" : "rgb(var(--foreground))" }}>
            {task.title}
          </p>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="badge badge-primary">{task.tag}</span>
          </div>
        </div>
        <p className="text-body text-xs leading-relaxed mb-3">{task.description}</p>

        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1 text-caption">
            <Clock size={11} /> {task.estimated_time}
          </span>
          <span className="flex items-center gap-1 text-caption" style={{ color: dc }}>
            <BarChart2 size={11} /> {task.difficulty}
          </span>
          {task.target_skill && (
            <span className="flex items-center gap-1 text-caption">
              <Star size={11} /> {task.target_skill}
            </span>
          )}
          {task.resource_url && (
            <a href={task.resource_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-medium"
              style={{ color: "rgb(var(--primary))" }}>
              Resource <ExternalLink size={10} />
            </a>
          )}
        </div>

        {task.why_assigned && (
          <div className="mt-3 px-3 py-2 rounded-lg text-xs leading-relaxed"
            style={{ background: "rgb(var(--primary) / 0.05)", color: "rgb(var(--foreground-muted))" }}>
            <Zap size={10} className="inline mr-1" style={{ color: "rgb(var(--primary))" }} />
            {task.why_assigned}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════
   TASKS PAGE
   ════════════════════════════════════════════════════════════════ */

export default function TasksPage() {
  const { isGated } = useStore();
  const [tasks, setTasks]         = useState<TaskResult[]>([]);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState<"all" | "pending" | "done">("all");

  const loadTasks = useCallback(async (week: number) => {
    setLoading(true);
    try { setTasks(await apiGetTasks(week)); } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isGated) { setLoading(false); return; }
    apiGetRoadmap()
      .then(r => { setCurrentWeek(r.current_week); loadTasks(r.current_week); })
      .catch(() => { loadTasks(1); });
  }, [isGated, loadTasks]);

  const generateTasks = async () => {
    setGenerating(true);
    try {
      const result = await apiGenerateTasks(currentWeek);
      setTasks(result.tasks);
    } catch {}
    setGenerating(false);
  };

  const toggleTask = async (id: number, status: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    try { await apiUpdateTask(id, { status }); } catch {}
  };

  const filtered = tasks.filter(t =>
    filter === "all" ? true : filter === "done" ? t.status === "done" : t.status !== "done"
  );
  const done  = tasks.filter(t => t.status === "done").length;
  const total = tasks.length;
  const pct   = total > 0 ? Math.round(done / total * 100) : 0;

  return (
    <div className="flex min-h-screen" style={{ background: "rgb(var(--background))" }}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-8">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <p className="text-label mb-1" style={{ color: "rgb(var(--accent))" }}>
              <ListChecks size={10} className="inline mr-1" />Week {currentWeek}
            </p>
            <h1 className="text-display">Weekly Tasks</h1>
            <p className="text-caption mt-1">
              AI-generated tasks tailored to your skill gaps and learning style.
            </p>
          </motion.div>

          {isGated ? (
            <BentoCard className="p-12 text-center">
              <Lock size={32} style={{ color: "rgb(var(--border-strong))" }} className="mx-auto mb-4" />
              <p className="text-heading mb-2">Profile incomplete</p>
              <p className="text-body">Complete your profile to unlock AI task generation.</p>
            </BentoCard>
          ) : (
            <>
              {/* Stats bar */}
              <AnimatePresence>
                {total > 0 && !generating && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }} className="card p-4 mb-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Trophy size={16} style={{ color: "rgb(var(--warning))" }} />
                        <span className="text-subheading">{done} / {total} completed</span>
                      </div>
                      <span className="text-2xl font-black gradient-text">{pct}%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgb(var(--border))" }}>
                      <motion.div animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ background: "linear-gradient(90deg, rgb(var(--primary)), rgb(var(--accent)))" }} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Controls */}
              <div className="flex items-center gap-2 mb-5 flex-wrap">
                {/* Filter pills */}
                <div className="flex gap-1 p-1 rounded-xl" style={{ background: "rgb(var(--surface))", border: "1px solid rgb(var(--border-subtle))" }}>
                  {(["all", "pending", "done"] as const).map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize"
                      style={filter === f
                        ? { background: "rgb(var(--primary))", color: "white" }
                        : { color: "rgb(var(--foreground-muted))" }}>
                      {f}
                    </button>
                  ))}
                </div>
                <button onClick={generateTasks} disabled={generating}
                  className="btn-primary ml-auto">
                  {generating
                    ? <RefreshCw size={14} className="animate-spin" />
                    : <Sparkles size={14} />}
                  {tasks.length > 0 ? "Regenerate" : "Generate Tasks"}
                </button>
              </div>

              {/* Content */}
              {generating && <StreamingLoader />}

              {!generating && loading && (
                <div className="flex flex-col gap-3">
                  {[1, 2, 3, 4].map(i => (
                    <BentoCard key={i} className="flex gap-4">
                      <Skeleton width="w-5" height="h-5" className="rounded-full mt-0.5 shrink-0" />
                      <div className="flex-1 flex flex-col gap-2">
                        <Skeleton width="w-3/4" height="h-4" />
                        <Skeleton height="h-3" />
                        <Skeleton width="w-1/2" height="h-3" />
                      </div>
                    </BentoCard>
                  ))}
                </div>
              )}

              {!generating && !loading && filtered.length === 0 && total === 0 && (
                <BentoCard className="p-12 text-center" glass>
                  <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 2.5 }}
                    className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
                    style={{ background: "rgb(var(--primary) / 0.1)", border: "1px solid rgb(var(--primary-border))" }}>
                    <Brain size={28} style={{ color: "rgb(var(--primary))" }} />
                  </motion.div>
                  <p className="text-heading mb-2">No tasks yet</p>
                  <p className="text-body mb-6">Click "Generate Tasks" to let Gemini create your week's learning plan.</p>
                  <button onClick={generateTasks} className="btn-primary mx-auto">
                    <Sparkles size={15} /> Generate Week {currentWeek} Tasks
                  </button>
                </BentoCard>
              )}

              {!generating && !loading && filtered.length === 0 && total > 0 && (
                <BentoCard className="p-8 text-center">
                  <p className="text-heading">{filter === "done" ? "Nothing completed yet" : "All tasks done! 🎉"}</p>
                </BentoCard>
              )}

              {!generating && !loading && filtered.length > 0 && (
                <div className="flex flex-col gap-3">
                  {filtered.map((t, i) => (
                    <TaskCard key={t.id} task={t} onToggle={toggleTask} index={i} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

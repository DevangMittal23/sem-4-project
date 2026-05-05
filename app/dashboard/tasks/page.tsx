"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import CompletionModal from "@/components/CompletionModal";
import { useProfile } from "@/lib/profileContext";
import {
  apiGetTasks, apiUpdateTask, apiCompleteWeek, apiGetRoadmap,
  apiGenerateTasks, TaskResult, RoadmapData,
} from "@/lib/api";
import {
  CheckCircle2, Circle, Clock, Lock, Filter, RefreshCw,
  ChevronDown, ChevronUp, ExternalLink, Sparkles, Trophy,
  Target, Info, Zap,
} from "lucide-react";

const TAG_COLORS: Record<string, string> = {
  Learning:  "text-blue-400 bg-blue-500/10 border-blue-500/20",
  Practice:  "text-purple-400 bg-purple-500/10 border-purple-500/20",
  Project:   "text-green-400 bg-green-500/10 border-green-500/20",
  Reading:   "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  Career:    "text-amber-400 bg-amber-500/10 border-amber-500/20",
};
const DIFF_COLORS: Record<string, string> = {
  easy: "text-green-400", medium: "text-amber-400", hard: "text-red-400",
};
const ALL_TAGS = ["All", "Learning", "Practice", "Project", "Reading", "Career"];

// ── Feedback modal ────────────────────────────────────────────────────────────
function FeedbackModal({ task, onClose, onSubmit }: {
  task: TaskResult;
  onClose: () => void;
  onSubmit: (feedback: string, time: number) => void;
}) {
  const [feedback, setFeedback] = useState("just_right");
  const [time, setTime] = useState(30);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }}
        className="relative z-10 w-full max-w-sm glass glow-border rounded-2xl p-6">
        <p className="text-sm font-semibold text-white mb-1">Task Complete! 🎉</p>
        <p className="text-xs text-white/40 mb-5 truncate">{task.title}</p>
        <div className="mb-4">
          <label className="text-xs text-white/40 mb-2 block">How was the difficulty?</label>
          <div className="flex gap-2">
            {[["too_easy","Too Easy","text-green-400"],["just_right","Just Right","text-blue-400"],["too_hard","Too Hard","text-red-400"]].map(([val,label,color]) => (
              <button key={val} onClick={() => setFeedback(val)}
                className={`flex-1 py-2 rounded-xl text-xs border transition-all ${feedback === val ? `${color} border-current bg-current/10` : "border-white/10 text-white/40 hover:border-white/20"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-5">
          <label className="text-xs text-white/40 mb-2 block">Time taken: {time} min</label>
          <input type="range" min={5} max={180} step={5} value={time}
            onChange={(e) => setTime(Number(e.target.value))} className="w-full accent-purple-500" />
        </div>
        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
          onClick={() => onSubmit(feedback, time)}
          className="w-full py-2.5 rounded-xl btn-primary text-white text-sm font-medium">
          Submit & Continue
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ── Task card ─────────────────────────────────────────────────────────────────
function TaskCard({ task, expanded, onToggle, onExpand }: {
  task: TaskResult;
  expanded: boolean;
  onToggle: () => void;
  onExpand: () => void;
}) {
  const isDone = task.status === "done";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border transition-all ${isDone ? "bg-green-500/5 border-green-500/15" : "glass border-white/8 hover:border-white/15"}`}>

      {/* Main row */}
      <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={onExpand}>
        <button onClick={(e) => { e.stopPropagation(); onToggle(); }}
          className="shrink-0 hover:scale-110 transition-transform">
          {isDone
            ? <CheckCircle2 size={18} className="text-green-400" />
            : <Circle size={18} className="text-white/20 hover:text-purple-400 transition-colors" />}
        </button>

        <div className="flex-1 min-w-0">
          <span className={`text-sm block truncate ${isDone ? "line-through text-white/30" : "text-white/85"}`}>
            {task.title}
          </span>
          {task.target_skill && !isDone && (
            <span className="inline-flex items-center gap-1 text-[10px] text-purple-300/70 mt-0.5">
              <Target size={9} /> {task.target_skill}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[10px] font-medium ${DIFF_COLORS[task.difficulty] || "text-white/30"}`}>
            {task.difficulty}
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${TAG_COLORS[task.tag] || "text-white/30 border-white/10"}`}>
            {task.tag}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-white/25">
            <Clock size={10} />{task.estimated_time}
          </span>
          {expanded ? <ChevronUp size={14} className="text-white/30" /> : <ChevronDown size={14} className="text-white/30" />}
        </div>
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-4 pb-4 border-t border-white/5 pt-3 flex flex-col gap-3">

              {/* Why assigned */}
              {task.why_assigned && (
                <div className="flex gap-2 p-2.5 rounded-xl bg-purple-600/8 border border-purple-500/15">
                  <Info size={13} className="text-purple-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-purple-200/70 leading-relaxed">{task.why_assigned}</p>
                </div>
              )}

              {/* Description */}
              <p className="text-xs text-white/60 leading-relaxed whitespace-pre-line">{task.description}</p>

              {/* Resource link */}
              {task.resource_url && (
                <a href={task.resource_url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors w-fit">
                  <ExternalLink size={11} /> Open Resource
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function TasksPage() {
  const { isGated, profile } = useProfile();
  const [tasks, setTasks] = useState<TaskResult[]>([]);
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeTag, setActiveTag] = useState("All");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [feedbackTask, setFeedbackTask] = useState<TaskResult | null>(null);
  const [completingWeek, setCompletingWeek] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [weekTheme, setWeekTheme] = useState("");
  const [weekGoals, setWeekGoals] = useState<string[]>([]);

  const currentWeek = roadmap?.current_week ?? 1;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [t, r] = await Promise.all([
        apiGetTasks(currentWeek).catch(() => [] as TaskResult[]),
        apiGetRoadmap().catch(() => null),
      ]);
      setTasks(t);
      setRoadmap(r);
      const plan = r?.weekly_plans?.find((wp) => wp.is_current);
      if (plan) { setWeekTheme(plan.theme); setWeekGoals(plan.goals); }
    } catch {}
    setLoading(false);
  }, [currentWeek]);

  useEffect(() => {
    if (!isGated) loadData();
    else setLoading(false);
  }, [isGated, loadData]);

  const handleGenerate = async () => {
    setGenerating(true);
    setStatusMsg("");
    try {
      const res = await apiGenerateTasks(currentWeek);
      setTasks(res.tasks);
      setWeekTheme(res.theme);
      setWeekGoals(res.goals);
      setStatusMsg(`✅ ${res.tasks.length} personalized tasks generated for Week ${res.week}!`);
    } catch {
      setStatusMsg("❌ Generation failed. Please try again.");
    }
    setGenerating(false);
  };

  const handleToggle = async (task: TaskResult) => {
    if (task.status === "done") {
      const updated = await apiUpdateTask(task.id, { status: "pending" });
      setTasks((prev) => prev.map((t) => t.id === task.id ? updated : t));
    } else {
      setFeedbackTask(task);
    }
  };

  const handleFeedbackSubmit = async (feedback: string, time: number) => {
    if (!feedbackTask) return;
    const updated = await apiUpdateTask(feedbackTask.id, {
      status: "done", difficulty_feedback: feedback, time_taken: time,
    });
    setTasks((prev) => prev.map((t) => t.id === feedbackTask.id ? updated : t));
    setFeedbackTask(null);
  };

  const handleCompleteWeek = async () => {
    setCompletingWeek(true);
    try {
      const res = await apiCompleteWeek();
      setStatusMsg(res.message);
      if (!res.roadmap_complete) await loadData();
    } catch {}
    setCompletingWeek(false);
  };

  const filtered = tasks.filter((t) => activeTag === "All" || t.tag === activeTag);
  const done = tasks.filter((t) => t.status === "done").length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const allDone = tasks.length > 0 && done === tasks.length;

  return (
    <div className="flex min-h-screen bg-[#050508]">
      <Sidebar />
      <CompletionModal />

      <AnimatePresence>
        {feedbackTask && (
          <FeedbackModal task={feedbackTask} onClose={() => setFeedbackTask(null)} onSubmit={handleFeedbackSubmit} />
        )}
      </AnimatePresence>

      <main className="flex-1 overflow-y-auto">
        <div className="fixed top-0 right-0 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-3xl mx-auto px-6 py-8">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <h1 className="text-2xl font-bold text-white">Weekly Tasks</h1>
            <p className="text-sm text-white/40 mt-1">
              {weekTheme || "AI-personalized tasks based on your skill gaps and goals"}
            </p>
          </motion.div>

          {isGated ? (
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
              className="glass glow-border rounded-2xl p-12 text-center">
              <Lock size={32} className="text-white/20 mx-auto mb-4" />
              <p className="text-white font-semibold mb-2">Complete your profile to unlock tasks</p>
              <p className="text-sm text-white/40">Your personalized weekly tasks will appear here.</p>
            </motion.div>
          ) : loading ? (
            <div className="flex flex-col gap-3">
              {[1,2,3,4].map((i) => (
                <div key={i} className="glass glow-border rounded-2xl p-4 animate-pulse flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/10 shrink-0 mt-0.5" />
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="h-4 bg-white/10 rounded w-3/4" />
                    <div className="h-3 bg-white/8 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Week header card */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="glass glow-border rounded-2xl p-5 mb-5">
                <div className="flex items-start justify-between mb-3 gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">Week {currentWeek}</p>
                    {weekGoals.length > 0 && (
                      <p className="text-xs text-white/40 mt-0.5 truncate">{weekGoals[0]}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-white/40">{done}/{tasks.length} done</span>
                    <motion.button onClick={handleGenerate} disabled={generating}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl glass border border-purple-500/30 text-purple-300 hover:bg-purple-600/15 transition-all disabled:opacity-50">
                      {generating
                        ? <><RefreshCw size={12} className="animate-spin" /> Generating...</>
                        : <><Zap size={12} /> {tasks.length ? "Regenerate" : "Generate Tasks"}</>}
                    </motion.button>
                  </div>
                </div>

                {tasks.length > 0 && (
                  <>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-2">
                      <motion.div animate={{ width: `${pct}%` }} transition={{ duration: 0.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" />
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-white/30">{pct}% complete</p>
                      {allDone && (
                        <motion.button onClick={handleCompleteWeek} disabled={completingWeek}
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl btn-primary text-white font-medium disabled:opacity-60">
                          {completingWeek ? <RefreshCw size={12} className="animate-spin" /> : <Trophy size={12} />}
                          {completingWeek ? "Generating next week..." : "Complete Week & Get Next Tasks"}
                        </motion.button>
                      )}
                    </div>
                  </>
                )}

                {statusMsg && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className={`text-xs mt-2 ${statusMsg.startsWith("✅") ? "text-green-400" : "text-red-400"}`}>
                    {statusMsg}
                  </motion.p>
                )}
              </motion.div>

              {/* Week goals */}
              {weekGoals.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="glass border border-purple-500/15 rounded-2xl p-4 mb-5">
                  <p className="text-[10px] text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sparkles size={10} /> This week's goals
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {weekGoals.map((g, i) => (
                      <div key={i} className="flex gap-2 text-xs text-white/65">
                        <span className="text-purple-400 shrink-0">→</span>{g}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {tasks.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="glass glow-border rounded-2xl p-12 text-center">
                  <Sparkles size={40} className="text-purple-400/40 mx-auto mb-4" />
                  <p className="text-white font-semibold mb-2">No tasks yet</p>
                  <p className="text-sm text-white/40 mb-6">
                    Click "Generate Tasks" to get a personalized week plan based on your skill gaps and goals.
                  </p>
                  <motion.button onClick={handleGenerate} disabled={generating}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl btn-primary text-white text-sm font-medium disabled:opacity-60">
                    {generating ? <RefreshCw size={15} className="animate-spin" /> : <Zap size={15} />}
                    {generating ? "Generating your plan..." : "Generate My Week 1 Plan"}
                  </motion.button>
                </motion.div>
              ) : (
                <>
                  {/* Tag filter */}
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <Filter size={13} className="text-white/30" />
                    {ALL_TAGS.map((tag) => (
                      <button key={tag} onClick={() => setActiveTag(tag)}
                        className={`px-3 py-1 rounded-full text-xs border transition-all
                          ${activeTag === tag ? "bg-purple-600/25 border-purple-500/40 text-purple-300" : "border-white/10 text-white/40 hover:text-white hover:border-white/20"}`}>
                        {tag}
                      </button>
                    ))}
                  </div>

                  {/* Task list */}
                  <div className="flex flex-col gap-3">
                    <AnimatePresence>
                      {filtered.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          expanded={expanded === task.id}
                          onToggle={() => handleToggle(task)}
                          onExpand={() => setExpanded(expanded === task.id ? null : task.id)}
                        />
                      ))}
                    </AnimatePresence>
                    {filtered.length === 0 && (
                      <p className="text-center py-10 text-white/25 text-sm">No tasks for this filter.</p>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

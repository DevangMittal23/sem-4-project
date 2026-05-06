"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import CompletionModal from "@/components/CompletionModal";
import { useStore } from "@/lib/store";
import { apiGetWeeklyPlans, WeeklyPlanData } from "@/lib/api";
import { CheckCircle2, Circle, Lock, Calendar, Sparkles } from "lucide-react";
import Link from "next/link";

export default function WeeklyActivitiesPage() {
  const { isGated } = useStore();
  const [plans, setPlans] = useState<WeeklyPlanData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isGated) { setLoading(false); return; }
    apiGetWeeklyPlans().then(setPlans).catch(() => {}).finally(() => setLoading(false));
  }, [isGated]);

  return (
    <div className="flex min-h-screen" style={{ background: "rgb(var(--background))" }}>
      <Sidebar />
      <CompletionModal />

      <main className="flex-1 overflow-y-auto">
        <div className="fixed top-0 right-0 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-3xl mx-auto px-6 py-8">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Calendar size={14} className="text-purple-400" />
              <span className="text-xs text-purple-400 uppercase tracking-wider font-medium">History</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Weekly Activities</h1>
            <p className="text-sm text-white/40 mt-1">All your weekly learning plans</p>
          </motion.div>

          {isGated ? (
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
              className="glass glow-border rounded-2xl p-12 text-center">
              <Lock size={32} className="text-white/20 mx-auto mb-4" />
              <p className="text-white font-semibold mb-2">Complete your profile to see weekly activities</p>
            </motion.div>
          ) : loading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass glow-border rounded-2xl p-5 animate-pulse flex flex-col gap-2">
                  <div className="h-4 bg-white/10 rounded w-1/4" />
                  <div className="h-3 bg-white/8 rounded w-1/2" />
                  <div className="h-2 bg-white/5 rounded-full" />
                </div>
              ))}
            </div>
          ) : plans.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="glass glow-border rounded-2xl p-12 text-center">
              <Sparkles size={40} className="text-purple-400/40 mx-auto mb-4" />
              <p className="text-white font-semibold mb-2">No weekly plans yet</p>
              <p className="text-sm text-white/40 mb-6">Generate your first week plan to get started.</p>
              <Link href="/dashboard/tasks"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl btn-primary text-white text-sm font-medium">
                Go to Tasks
              </Link>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-4">
              {plans.slice().reverse().map((plan, i) => (
                <motion.div key={plan.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className={`glass rounded-2xl border p-5 ${
                    plan.is_completed ? "border-green-500/20 bg-green-500/3"
                    : plan.is_current ? "border-purple-500/30 bg-purple-500/5 glow-border"
                    : "border-white/6"
                  }`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {plan.is_completed
                        ? <CheckCircle2 size={18} className="text-green-400 shrink-0" />
                        : plan.is_current
                        ? <div className="w-4 h-4 rounded-full border-2 border-purple-400 border-t-transparent animate-spin shrink-0" />
                        : <Circle size={18} className="text-white/15 shrink-0" />}
                      <div>
                        <p className={`text-sm font-semibold ${plan.is_current ? "text-white" : plan.is_completed ? "text-white/60" : "text-white/30"}`}>
                          Week {plan.week_number}{plan.theme ? ` — ${plan.theme}` : ""}
                        </p>
                        {plan.is_current && <span className="text-[10px] text-purple-400">Current week</span>}
                        {plan.is_completed && <span className="text-[10px] text-green-400">Completed</span>}
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${plan.is_completed ? "text-green-400" : plan.is_current ? "text-purple-400" : "text-white/20"}`}>
                      {plan.is_completed ? "100%" : plan.is_current ? `${plan.completion_pct}%` : "—"}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${plan.is_completed ? 100 : plan.completion_pct}%` }}
                      transition={{ duration: 0.6, delay: i * 0.06 }}
                      className={`h-full rounded-full ${plan.is_completed ? "bg-green-500" : "bg-gradient-to-r from-purple-500 to-blue-500"}`}
                    />
                  </div>

                  {/* Goals */}
                  {plan.goals.length > 0 && (
                    <div className="flex flex-col gap-1">
                      {plan.goals.slice(0, 2).map((g, j) => (
                        <div key={j} className="flex gap-2 text-xs text-white/40">
                          <span className="text-purple-400 shrink-0">→</span>{g}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* AI feedback */}
                  {plan.ai_feedback && (
                    <div className="mt-3 pt-3 border-t border-white/5 flex gap-2">
                      <Sparkles size={12} className="text-purple-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-white/50 italic">{plan.ai_feedback}</p>
                    </div>
                  )}

                  {/* Task count */}
                  {plan.tasks.length > 0 && (
                    <p className="text-[10px] text-white/25 mt-2">
                      {plan.tasks.filter(t => t.status === "done").length}/{plan.tasks.length} tasks completed
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

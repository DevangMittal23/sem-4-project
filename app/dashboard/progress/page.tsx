"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import CompletionModal from "@/components/CompletionModal";
import { useProfile } from "@/lib/profileContext";
import {
  apiGetRoadmap, apiGetWeeklyPlans, apiAnalyzePerformance,
  apiGetDashboardStats, apiGetActivity,
  RoadmapData, WeeklyPlanData, AnalysisResult, DashboardStats, ActivityData,
} from "@/lib/api";
import {
  CheckCircle2, Circle, Lock, Flame, Zap, Trophy, TrendingUp,
  Sparkles, RefreshCw, BarChart2,
} from "lucide-react";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function SkeletonBlock({ h = "h-4", w = "w-full" }: { h?: string; w?: string }) {
  return <div className={`${h} ${w} bg-white/8 rounded-lg animate-pulse`} />;
}

// ── GitHub-style activity calendar ───────────────────────────────────────────
function ActivityCalendar({ data }: { data: ActivityData }) {
  const { grid, streak_days, total_active_days } = data;

  // Group into weeks (rows of 7)
  const weeks: typeof grid[] = [];
  for (let i = 0; i < grid.length; i += 7) {
    weeks.push(grid.slice(i, i + 7));
  }

  const getColor = (day: typeof grid[0]) => {
    if (day.is_future) return "bg-white/4 border-white/4";
    if (day.tasks_completed === 0) return "bg-white/8 border-white/8";
    if (day.tasks_completed === 1) return "bg-purple-500/40 border-purple-500/30";
    if (day.tasks_completed <= 3) return "bg-purple-500/65 border-purple-500/50";
    return "bg-purple-500 border-purple-400/60";
  };

  const getTooltip = (day: typeof grid[0]) => {
    if (day.is_future) return "Upcoming";
    if (day.tasks_completed === 0) return `${day.date} — No activity`;
    return `${day.date} — ${day.tasks_completed} task${day.tasks_completed !== 1 ? "s" : ""} · ${day.xp_earned} XP`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-white/40 uppercase tracking-wider font-medium">
          Activity — Last 5 Weeks
        </p>
        <div className="flex items-center gap-3 text-[10px] text-white/30">
          <span>{total_active_days} active days</span>
          <span className={streak_days > 0 ? "text-orange-400 font-medium" : ""}>
            {streak_days > 0 ? `🔥 ${streak_days} day streak` : "No streak yet"}
          </span>
        </div>
      </div>

      {/* Day labels */}
      <div className="flex gap-1.5 mb-1.5 ml-0">
        {DAY_LABELS.map((d) => (
          <div key={d} className="w-8 text-center text-[9px] text-white/20">{d}</div>
        ))}
      </div>

      {/* Calendar grid — each row = one week */}
      <div className="flex flex-col gap-1.5">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex gap-1.5">
            {week.map((day, di) => (
              <div key={di} title={getTooltip(day)}
                className={`w-8 h-8 rounded-md border transition-all cursor-default ${getColor(day)}`} />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 text-[10px] text-white/25">
        <span>Less</span>
        {["bg-white/8", "bg-purple-500/40", "bg-purple-500/65", "bg-purple-500"].map((c, i) => (
          <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

export default function ProgressPage() {
  const { isGated, completion } = useProfile();
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [plans, setPlans] = useState<WeeklyPlanData[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<ActivityData | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  useEffect(() => {
    if (isGated) { setLoading(false); return; }
    Promise.all([
      apiGetRoadmap().then(setRoadmap).catch(() => {}),
      apiGetWeeklyPlans().then(setPlans).catch(() => {}),
      apiGetDashboardStats().then(setStats).catch(() => {}),
      apiGetActivity(5).then(setActivity).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [isGated]);

  const runAnalysis = async () => {
    setLoadingAnalysis(true);
    try { setAnalysis(await apiAnalyzePerformance()); } catch {}
    setLoadingAnalysis(false);
  };

  const totalTasks = stats?.tasks_total ?? 0;
  const doneTasks = stats?.tasks_done ?? 0;
  const completedWeeks = stats?.completed_weeks ?? 0;
  const overallPct = stats?.roadmap_pct ?? 0;
  const currentWeek = stats?.current_week ?? 1;
  const totalWeeks = stats?.total_weeks ?? 12;
  const streak = stats?.streak_days ?? 0;
  const totalXp = stats?.total_xp ?? 0;

  return (
    <div className="flex min-h-screen bg-[#050508]">
      <Sidebar />
      <CompletionModal />

      <main className="flex-1 overflow-y-auto">
        <div className="fixed top-0 right-0 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-3xl mx-auto px-6 py-8">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <h1 className="text-2xl font-bold text-white">Progress</h1>
            <p className="text-sm text-white/40 mt-1">Track your growth and celebrate every milestone.</p>
          </motion.div>

          {isGated ? (
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
              className="glass glow-border rounded-2xl p-12 text-center">
              <Lock size={32} className="text-white/20 mx-auto mb-4" />
              <p className="text-white font-semibold mb-2">Complete your profile to track progress</p>
              <p className="text-sm text-white/40">Your progress dashboard will unlock once your profile is complete.</p>
            </motion.div>
          ) : loading ? (
            <div className="flex flex-col gap-4">
              {[1,2,3].map((i) => (
                <div key={i} className="glass glow-border rounded-2xl p-5 flex flex-col gap-3">
                  <SkeletonBlock h="h-3" w="w-1/4" />
                  <SkeletonBlock h="h-8" w="w-1/2" />
                  <SkeletonBlock h="h-2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-5">

              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { icon: Trophy, label: "Tasks Done", value: `${doneTasks}/${totalTasks}`, color: "text-amber-400" },
                  { icon: Flame, label: "Day Streak", value: `${streak}`, color: streak >= 3 ? "text-orange-400" : "text-white/40" },
                  { icon: Zap, label: "Total XP", value: `${totalXp}`, color: "text-blue-400" },
                  { icon: TrendingUp, label: "Profile", value: `${completion}%`, color: completion >= 80 ? "text-green-400" : "text-purple-400" },
                ].map(({ icon: Icon, label, value, color }, i) => (
                  <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }} className="glass glow-border rounded-2xl p-4">
                    <Icon size={15} className={`${color} mb-2`} />
                    <p className={`text-lg font-bold ${color}`}>{value}</p>
                    <p className="text-xs text-white/35 mt-0.5">{label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Roadmap progress */}
              {roadmap && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="glass glow-border rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs text-white/40 uppercase tracking-wider font-medium">Roadmap Progress</p>
                      <p className="text-sm text-white/60 mt-0.5">{roadmap.career_title}</p>
                    </div>
                    <span className="text-2xl font-bold gradient-text">{overallPct}%</span>
                  </div>
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${overallPct}%` }}
                      transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                      className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-full" />
                  </div>
                  <p className="text-xs text-white/25 mt-2">
                    Week {currentWeek} of {totalWeeks} · {doneTasks} tasks · {completedWeeks} weeks completed
                  </p>
                </motion.div>
              )}

              {/* Weekly history */}
              {plans.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                  className="glass glow-border rounded-2xl p-5">
                  <p className="text-xs text-white/40 uppercase tracking-wider font-medium mb-4">Weekly History</p>
                  <div className="flex flex-col gap-2">
                    {plans.slice().reverse().map((plan) => (
                      <div key={plan.id} className={`flex items-center gap-3 p-3 rounded-xl border
                        ${plan.is_completed ? "bg-green-500/5 border-green-500/15"
                          : plan.is_current ? "bg-purple-500/5 border-purple-500/20"
                          : "bg-white/2 border-white/6"}`}>
                        {plan.is_completed
                          ? <CheckCircle2 size={15} className="text-green-400 shrink-0" />
                          : plan.is_current
                          ? <div className="w-3.5 h-3.5 rounded-full border-2 border-purple-400 border-t-transparent animate-spin shrink-0" />
                          : <Circle size={15} className="text-white/15 shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${plan.is_completed ? "text-white/55" : plan.is_current ? "text-white" : "text-white/30"}`}>
                            Week {plan.week_number}{plan.theme ? ` — ${plan.theme}` : ""}
                          </p>
                          {plan.is_current && (
                            <div className="mt-1.5 h-1 bg-white/5 rounded-full overflow-hidden">
                              <motion.div animate={{ width: `${plan.completion_pct}%` }}
                                transition={{ duration: 0.5 }}
                                className="h-full bg-purple-500 rounded-full" />
                            </div>
                          )}
                        </div>
                        <span className={`text-xs font-medium shrink-0 ${plan.is_completed ? "text-green-400" : plan.is_current ? "text-purple-400" : "text-white/20"}`}>
                          {plan.is_completed ? "100%" : plan.is_current ? `${plan.completion_pct}%` : "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* GitHub-style activity calendar */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="glass glow-border rounded-2xl p-5">
                {activity ? (
                  <ActivityCalendar data={activity} />
                ) : (
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-wider font-medium mb-4">Activity — Last 5 Weeks</p>
                    <p className="text-sm text-white/25 text-center py-4">Complete tasks to see your activity here.</p>
                  </div>
                )}
              </motion.div>

              {/* AI Performance Analysis */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                className="glass glow-border rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs text-white/40 uppercase tracking-wider font-medium flex items-center gap-2">
                    <BarChart2 size={13} className="text-purple-400" /> AI Performance Analysis
                  </p>
                  <motion.button onClick={runAnalysis} disabled={loadingAnalysis}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl glass border border-purple-500/25 text-purple-300 hover:bg-purple-600/15 transition-all disabled:opacity-50">
                    {loadingAnalysis ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    {loadingAnalysis ? "Analyzing..." : analysis ? "Re-analyze" : "Analyze"}
                  </motion.button>
                </div>

                {analysis ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-3xl font-bold gradient-text">{analysis.overall_score}</p>
                        <p className="text-[10px] text-white/30">/ 100</p>
                      </div>
                      <div className="flex-1">
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${analysis.overall_score}%` }}
                            transition={{ duration: 0.8 }}
                            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" />
                        </div>
                        <p className="text-xs text-white/40 mt-1">
                          {analysis.learning_pace} pace · {analysis.difficulty_adjustment} difficulty
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] text-green-400 uppercase tracking-wider mb-2">Strengths</p>
                        {analysis.strengths.map((s, i) => (
                          <div key={i} className="flex gap-1.5 text-xs text-white/60 mb-1">
                            <span className="text-green-400">✓</span>{s}
                          </div>
                        ))}
                      </div>
                      <div>
                        <p className="text-[10px] text-amber-400 uppercase tracking-wider mb-2">Improve</p>
                        {analysis.improvement_areas.map((a, i) => (
                          <div key={i} className="flex gap-1.5 text-xs text-white/60 mb-1">
                            <span className="text-amber-400">→</span>{a}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {analysis.insights.map((insight, i) => (
                        <div key={i} className="flex gap-2 p-2.5 rounded-xl bg-purple-600/8 border border-purple-500/15">
                          <Sparkles size={12} className="text-purple-400 shrink-0 mt-0.5" />
                          <p className="text-xs text-white/65">{insight}</p>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 rounded-xl bg-blue-600/8 border border-blue-500/15">
                      <p className="text-[10px] text-blue-400 uppercase tracking-wider mb-1">Next Week</p>
                      <p className="text-xs text-white/65">{analysis.next_week_recommendation}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-white/35 text-center py-4">
                    Click "Analyze" to get AI-powered insights on your performance.
                  </p>
                )}
              </motion.div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}

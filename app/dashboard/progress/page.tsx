"use client";
import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import { BentoCard, SectionLabel, Skeleton } from "@/components/ui";
import { useStore } from "@/lib/store";
import {
  apiGetRoadmap, apiGetWeeklyPlans, apiAnalyzePerformance,
  apiGetDashboardStats, apiGetActivity,
  RoadmapData, WeeklyPlanData, AnalysisResult, DashboardStats, ActivityData,
} from "@/lib/api";
import {
  CheckCircle2, Circle, Lock, Flame, Zap, Trophy, TrendingUp,
  Sparkles, RefreshCw, BarChart2, Star, ArrowRight, Activity,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/* ── GitHub-style Activity Calendar ─────────────────────────────────────── */
function ActivityCalendar({ data }: { data: ActivityData }) {
  const { grid, streak_days, total_active_days } = data;

  const weeks: typeof grid[] = [];
  for (let i = 0; i < grid.length; i += 7) weeks.push(grid.slice(i, i + 7));

  const getCellStyle = (day: typeof grid[0]) => {
    if (day.is_future) return { background: "rgb(var(--border-subtle))", border: "1px solid rgb(var(--border-subtle))" };
    if (day.tasks_completed === 0) return { background: "rgb(var(--border))", border: "1px solid rgb(var(--border))" };
    const alpha = day.tasks_completed === 1 ? "0.30" : day.tasks_completed <= 3 ? "0.55" : "1";
    return {
      background: `rgb(var(--primary) / ${alpha})`,
      border: `1px solid rgb(var(--primary) / ${parseFloat(alpha) * 0.6 + 0.15})`,
    };
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-label">Activity — Last 5 Weeks</p>
        <div className="flex items-center gap-4 text-xs" style={{ color: "rgb(var(--foreground-muted))" }}>
          <span>{total_active_days} active days</span>
          {streak_days > 0 ? (
            <span className="flex items-center gap-1 font-semibold" style={{ color: "rgb(var(--warning))" }}>
              <Flame size={11} /> {streak_days} day streak
            </span>
          ) : <span>No streak yet</span>}
        </div>
      </div>

      {/* Day labels */}
      <div className="flex gap-1.5 mb-1.5">
        {DAY_LABELS.map(d => (
          <div key={d} className="w-8 text-center text-[9px]"
            style={{ color: "rgb(var(--foreground-faint))" }}>{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div className="flex flex-col gap-1.5">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex gap-1.5">
            {week.map((day, di) => {
              const tip = day.is_future ? "Upcoming"
                : day.tasks_completed === 0 ? `${day.date} — No activity`
                : `${day.date} — ${day.tasks_completed} task${day.tasks_completed !== 1 ? "s" : ""} · ${day.xp_earned} XP`;
              return (
                <div key={di} title={tip}
                  className="w-8 h-8 rounded-md transition-all cursor-default hover:scale-110"
                  style={getCellStyle(day)} />
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 text-[10px]" style={{ color: "rgb(var(--foreground-faint))" }}>
        <span>Less</span>
        {[0.0, 0.3, 0.55, 1.0].map(a => (
          <div key={a} className="w-3 h-3 rounded-sm"
            style={{ background: a === 0 ? "rgb(var(--border))" : `rgb(var(--primary) / ${a})` }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

/* ── Weekly performance bar chart ────────────────────────────────────────── */
function WeeklyChart({ plans }: { plans: WeeklyPlanData[] }) {
  const data = useMemo(() =>
    plans.slice(-8).map(p => ({
      label: `W${p.week_number}`,
      pct: p.completion_pct ?? 0,
      done: p.is_completed,
    })), [plans]);

  if (!data.length) return null;

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: -28 }} barSize={24}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgb(var(--border))" />
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: "rgb(var(--foreground-faint))" }}
          axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: "rgb(var(--foreground-faint))" }}
          axisLine={false} tickLine={false} domain={[0, 100]} />
        <Tooltip
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;
            return (
              <div className="card px-3 py-2 text-xs">
                <p className="font-semibold mb-1" style={{ color: "rgb(var(--foreground))" }}>{label}</p>
                <p style={{ color: "rgb(var(--primary))" }}>{payload[0].value}% complete</p>
              </div>
            );
          }}
        />
        <Bar dataKey="pct" radius={[6, 6, 0, 0]}>
          {data.map((d, i) => (
            <Cell key={i}
              fill={d.done ? "rgb(var(--accent))" : d.pct > 0 ? "rgb(var(--primary))" : "rgb(var(--border))"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ── Metric card ─────────────────────────────────────────────────────────── */
function MetricCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: string; color: string;
}) {
  return (
    <div className="card p-4 flex flex-col gap-2">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ background: `${color.replace(")", " / 0.1)")}`, border: `1px solid ${color.replace(")", " / 0.2)")}` }}>
        <Icon size={16} style={{ color }} />
      </div>
      <p className="text-xl font-black" style={{ color }}>{value}</p>
      <p className="text-label">{label}</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   ANALYTICS PAGE
   ════════════════════════════════════════════════════════════════ */
export default function ProgressPage() {
  const { isGated, completion } = useStore();
  const [roadmap, setRoadmap]   = useState<RoadmapData | null>(null);
  const [plans, setPlans]       = useState<WeeklyPlanData[]>([]);
  const [stats, setStats]       = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<ActivityData | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading]   = useState(true);
  const [loadAnalysis, setLoadAnalysis] = useState(false);

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
    setLoadAnalysis(true);
    try { setAnalysis(await apiAnalyzePerformance()); } catch {}
    setLoadAnalysis(false);
  };

  const doneTasks      = stats?.tasks_done ?? 0;
  const totalTasks     = stats?.tasks_total ?? 0;
  const streak         = stats?.streak_days ?? 0;
  const totalXp        = stats?.total_xp ?? 0;
  const overallPct     = stats?.roadmap_pct ?? 0;
  const currentWeek    = stats?.current_week ?? 1;
  const totalWeeks     = stats?.total_weeks ?? 12;
  const completedWeeks = stats?.completed_weeks ?? 0;

  return (
    <div className="flex min-h-screen" style={{ background: "rgb(var(--background))" }}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">

          {/* ── Header ── */}
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-7">
            <p className="text-label mb-1 flex items-center gap-1.5" style={{ color: "rgb(var(--accent))" }}>
              <Activity size={11} /> Performance Analytics
            </p>
            <h1 className="text-display">Analytics</h1>
            <p className="text-body mt-1">Track your growth, streaks, and celebrate every milestone.</p>
          </motion.div>

          {isGated ? (
            <BentoCard className="p-12 text-center">
              <div className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center"
                style={{ background: "rgb(var(--border))" }}>
                <Lock size={24} style={{ color: "rgb(var(--foreground-faint))" }} />
              </div>
              <p className="text-heading mb-2">Complete your profile to track progress</p>
              <p className="text-body">Your analytics dashboard will unlock once your profile is complete.</p>
            </BentoCard>
          ) : loading ? (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="card p-5 flex flex-col gap-3">
                  <Skeleton width="w-1/4" height="h-3" />
                  <Skeleton width="w-1/2" height="h-8" />
                  <Skeleton height="h-2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-5">

              {/* ── 4 metric pills ── */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MetricCard icon={Trophy}     label="Tasks Done"    value={`${doneTasks}/${totalTasks}`}  color="rgb(var(--warning))" />
                <MetricCard icon={Flame}      label="Day Streak"    value={`${streak}d`}                  color={streak >= 3 ? "rgb(var(--warning))" : "rgb(var(--foreground-muted))"} />
                <MetricCard icon={Zap}        label="Total XP"      value={`${totalXp}`}                  color="rgb(var(--info))" />
                <MetricCard icon={TrendingUp} label="Profile Score" value={`${completion}%`}              color={completion >= 80 ? "rgb(var(--accent))" : "rgb(var(--primary))"} />
              </motion.div>

              {/* ── Roadmap progress ── */}
              {roadmap && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}>
                  <BentoCard>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <SectionLabel icon={BarChart2} color="rgb(var(--primary))">Roadmap Progress</SectionLabel>
                        <p className="text-subheading">{roadmap.career_title}</p>
                        <p className="text-caption mt-0.5">
                          Week {currentWeek} of {totalWeeks} · {doneTasks} tasks · {completedWeeks} weeks completed
                        </p>
                      </div>
                      <span className="text-3xl font-black gradient-text">{overallPct}%</span>
                    </div>
                    <div className="h-3 rounded-full overflow-hidden" style={{ background: "rgb(var(--border))" }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${overallPct}%` }}
                        transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                        className="h-full rounded-full"
                        style={{ background: "linear-gradient(90deg, rgb(var(--primary)), rgb(var(--accent)))" }} />
                    </div>
                  </BentoCard>
                </motion.div>
              )}

              {/* ── Weekly history + bar chart ── */}
              {plans.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
                  <BentoCard>
                    <SectionLabel icon={BarChart2} color="rgb(var(--primary))">Weekly Performance</SectionLabel>

                    {/* Bar chart */}
                    <div className="mb-5">
                      <WeeklyChart plans={plans} />
                    </div>

                    {/* Week list */}
                    <div className="flex flex-col gap-2">
                      {plans.slice().reverse().map((plan) => (
                        <div key={plan.id} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl"
                          style={{
                            background: plan.is_completed
                              ? "rgb(var(--accent) / 0.05)"
                              : plan.is_current
                              ? "rgb(var(--primary) / 0.05)"
                              : "rgb(var(--background-alt))",
                            border: `1px solid ${
                              plan.is_completed
                                ? "rgb(var(--accent) / 0.2)"
                                : plan.is_current
                                ? "rgb(var(--primary-border))"
                                : "rgb(var(--border-subtle))"
                            }`,
                          }}>
                          {plan.is_completed
                            ? <CheckCircle2 size={15} style={{ color: "rgb(var(--accent))" }} className="shrink-0" />
                            : plan.is_current
                            ? <div className="w-3.5 h-3.5 rounded-full border-2 animate-spin shrink-0"
                                style={{ borderColor: "rgb(var(--primary))", borderTopColor: "transparent" }} />
                            : <Circle size={15} style={{ color: "rgb(var(--border-strong))" }} className="shrink-0" />}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate"
                              style={{ color: plan.is_completed ? "rgb(var(--foreground-muted))"
                                : plan.is_current ? "rgb(var(--foreground))" : "rgb(var(--foreground-faint))" }}>
                              Week {plan.week_number}{plan.theme ? ` — ${plan.theme}` : ""}
                            </p>
                            {plan.is_current && (
                              <div className="mt-1.5 h-1 rounded-full overflow-hidden" style={{ background: "rgb(var(--border))" }}>
                                <motion.div animate={{ width: `${plan.completion_pct}%` }}
                                  transition={{ duration: 0.5 }}
                                  className="h-full rounded-full"
                                  style={{ background: "rgb(var(--primary))" }} />
                              </div>
                            )}
                          </div>
                          <span className="text-xs font-bold shrink-0"
                            style={{ color: plan.is_completed ? "rgb(var(--accent))"
                              : plan.is_current ? "rgb(var(--primary))" : "rgb(var(--foreground-faint))" }}>
                            {plan.is_completed ? "100%" : plan.is_current ? `${plan.completion_pct}%` : "—"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </BentoCard>
                </motion.div>
              )}

              {/* ── Activity calendar ── */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.17 }}>
                <BentoCard>
                  {activity ? (
                    <ActivityCalendar data={activity} />
                  ) : (
                    <div>
                      <SectionLabel>Activity — Last 5 Weeks</SectionLabel>
                      <p className="text-caption text-center py-6">Complete tasks to see your activity here.</p>
                    </div>
                  )}
                </BentoCard>
              </motion.div>

              {/* ── AI Performance Analysis ── */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
                <BentoCard>
                  <div className="flex items-center justify-between mb-5">
                    <SectionLabel icon={Sparkles} color="rgb(var(--primary))">AI Performance Analysis</SectionLabel>
                    <button onClick={runAnalysis} disabled={loadAnalysis} className="btn-secondary text-xs py-1.5 px-3">
                      {loadAnalysis ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />}
                      {loadAnalysis ? "Analysing…" : analysis ? "Re-analyse" : "Analyse"}
                    </button>
                  </div>

                  {analysis ? (
                    <div className="flex flex-col gap-4">
                      {/* Score */}
                      <div className="flex items-center gap-4 p-4 rounded-2xl"
                        style={{ background: "rgb(var(--primary-muted))", border: "1px solid rgb(var(--primary-border))" }}>
                        <div className="text-center">
                          <p className="text-4xl font-black gradient-text">{analysis.overall_score}</p>
                          <p className="text-label">/ 100</p>
                        </div>
                        <div className="flex-1">
                          <div className="h-3 rounded-full overflow-hidden mb-2" style={{ background: "rgb(var(--border))" }}>
                            <motion.div initial={{ width: 0 }} animate={{ width: `${analysis.overall_score}%` }}
                              transition={{ duration: 0.9 }}
                              className="h-full rounded-full"
                              style={{ background: "linear-gradient(90deg, rgb(var(--primary)), rgb(var(--accent)))" }} />
                          </div>
                          <p className="text-caption">
                            {analysis.learning_pace} pace · {analysis.difficulty_adjustment} difficulty next week
                          </p>
                        </div>
                      </div>

                      {/* Strengths / Improvements */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3.5 rounded-xl"
                          style={{ background: "rgb(var(--accent) / 0.05)", border: "1px solid rgb(var(--accent) / 0.15)" }}>
                          <p className="text-label mb-2.5" style={{ color: "rgb(var(--accent))" }}>Strengths</p>
                          <div className="flex flex-col gap-1.5">
                            {analysis.strengths.map((s, i) => (
                              <div key={i} className="flex gap-2 text-sm"
                                style={{ color: "rgb(var(--foreground-muted))" }}>
                                <span style={{ color: "rgb(var(--accent))" }}>✓</span>{s}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="p-3.5 rounded-xl"
                          style={{ background: "rgb(var(--warning-muted))", border: "1px solid rgb(var(--warning) / 0.15)" }}>
                          <p className="text-label mb-2.5" style={{ color: "rgb(var(--warning))" }}>Improve</p>
                          <div className="flex flex-col gap-1.5">
                            {analysis.improvement_areas.map((a, i) => (
                              <div key={i} className="flex gap-2 text-sm"
                                style={{ color: "rgb(var(--foreground-muted))" }}>
                                <ArrowRight size={13} className="shrink-0 mt-0.5" style={{ color: "rgb(var(--warning))" }} />{a}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Insights */}
                      {analysis.insights.length > 0 && (
                        <div className="flex flex-col gap-2">
                          {analysis.insights.map((insight, i) => (
                            <div key={i} className="flex gap-3 p-3 rounded-xl"
                              style={{ background: "rgb(var(--primary-muted))", border: "1px solid rgb(var(--primary-border))" }}>
                              <Sparkles size={12} className="shrink-0 mt-0.5" style={{ color: "rgb(var(--primary))" }} />
                              <p className="text-sm" style={{ color: "rgb(var(--foreground-muted))" }}>{insight}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Next week */}
                      <div className="p-3.5 rounded-xl"
                        style={{ background: "rgb(var(--info-muted))", border: "1px solid rgb(var(--info) / 0.15)" }}>
                        <p className="text-label mb-1.5" style={{ color: "rgb(var(--info))" }}>
                          <Star size={9} className="inline mr-1" />Next Week Recommendation
                        </p>
                        <p className="text-sm" style={{ color: "rgb(var(--foreground-muted))" }}>
                          {analysis.next_week_recommendation}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                        style={{ background: "rgb(var(--primary-muted))", border: "1px solid rgb(var(--primary-border))" }}>
                        <BarChart2 size={24} style={{ color: "rgb(var(--primary))" }} />
                      </div>
                      <p className="text-subheading mb-2">No analysis run yet</p>
                      <p className="text-body mb-4">Get AI-powered insights on your performance and next steps.</p>
                      <button onClick={runAnalysis} className="btn-primary">
                        <Sparkles size={14} /> Analyse Performance
                      </button>
                    </div>
                  )}
                </BentoCard>
              </motion.div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}

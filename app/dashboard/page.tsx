"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useProfile } from "@/lib/profileContext";
import Sidebar from "@/components/Sidebar";
import DashboardCard from "@/components/DashboardCard";
import CompletionModal from "@/components/CompletionModal";
import {
  Flame, Target, TrendingUp, Brain, Zap, ArrowRight,
  Sparkles, RefreshCw, CheckCircle2, Circle, Trophy,
} from "lucide-react";
import Link from "next/link";
import {
  apiGetDashboard, apiGetDashboardStats, apiPredictCareer,
  apiGetTasks, apiGetRoadmap,
  DashboardData, DashboardStats, CareerPathResult, TaskResult,
} from "@/lib/api";

function StatCard({ icon: Icon, label, value, sub, color, delay }: {
  icon: React.ElementType; label: string; value: string;
  sub?: string; color: string; delay: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay }} className="glass glow-border rounded-2xl p-4">
      <Icon size={16} className={`${color} mb-2`} />
      <p className={`text-lg font-bold ${color}`}>{value}</p>
      <p className="text-xs text-white/35 mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-white/20 mt-0.5">{sub}</p>}
    </motion.div>
  );
}

function StreakFlame({ streak }: { streak: number }) {
  const intensity = streak >= 7 ? "text-orange-400" : streak >= 3 ? "text-amber-400" : "text-white/30";
  return (
    <div className="flex items-center gap-1.5">
      <Flame size={16} className={intensity} />
      <span className={`text-lg font-bold ${intensity}`}>{streak}</span>
      <span className="text-xs text-white/35">day{streak !== 1 ? "s" : ""}</span>
    </div>
  );
}

export default function DashboardPage() {
  const { profile, completion, isGated, updateProfile } = useProfile();
  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [careers, setCareers] = useState<CareerPathResult[]>([]);
  const [tasks, setTasks] = useState<TaskResult[]>([]);
  const [loadingCareers, setLoadingCareers] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiGetDashboard().then((d) => {
        setDashData(d);
        if (d.profile_completion !== undefined) {
          updateProfile({
            backend_completion: d.profile_completion,
            name: d.profile?.name || "",
            profession: d.profile?.profession || "",
            level: d.profile?.experience_level || "",
            goal: d.profile?.goal || "",
            skills: d.profile?.skills || [],
          });
        }
      }).catch(() => {}),
      apiGetDashboardStats().then(setStats).catch(() => {}),
      apiGetRoadmap().then((r) => {
        apiGetTasks(r.current_week).then(setTasks).catch(() => {});
      }).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePredictCareer = async () => {
    setLoadingCareers(true);
    try { setCareers(await apiPredictCareer()); } catch {}
    setLoadingCareers(false);
  };

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  };

  const displayName = dashData?.user?.name || profile.name || "there";
  const streak = stats?.streak_days ?? 0;
  const aiScore = stats?.ai_score ?? 0;
  const roadmapPct = stats?.roadmap_pct ?? 0;
  const weekDone = stats?.week_tasks_done ?? 0;
  const weekTotal = stats?.week_tasks_total ?? 0;
  const careerTitle = stats?.career_title;

  return (
    <div className="flex min-h-screen bg-[#050508]">
      <Sidebar />
      <CompletionModal />

      <main className="flex-1 overflow-y-auto">
        <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <p className="text-sm text-white/40 mb-1">{greeting()},</p>
            <h1 className="text-2xl font-bold text-white">{displayName} 👋</h1>
            <p className="text-sm text-white/40 mt-1">
              {isGated
                ? `Complete your profile to unlock all features (${completion}% done)`
                : careerTitle
                ? `On track for: ${careerTitle}`
                : "Your career journey is on track. Keep going!"}
            </p>
          </motion.div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }} className="glass glow-border rounded-2xl p-4">
              <Flame size={16} className={streak >= 3 ? "text-orange-400 mb-2" : "text-white/30 mb-2"} />
              <StreakFlame streak={streak} />
              <p className="text-xs text-white/35 mt-0.5">Day Streak</p>
            </motion.div>

            <StatCard icon={TrendingUp} label="Profile" value={`${completion}%`}
              color={completion >= 80 ? "text-green-400" : "text-amber-400"} delay={0.07} />

            <StatCard icon={Zap} label="This Week" value={`${weekDone}/${weekTotal}`}
              sub={weekTotal > 0 ? `${Math.round(weekDone / weekTotal * 100)}% done` : undefined}
              color="text-blue-400" delay={0.14} />

            <StatCard icon={Brain} label="AI Score" value={`${aiScore}/100`}
              sub={aiScore >= 70 ? "Great progress!" : aiScore >= 40 ? "Keep going" : "Just starting"}
              color="text-purple-400" delay={0.21} />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Profile card */}
            <DashboardCard title="Your Profile" delay={0.05}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600/40 to-blue-600/30 border border-purple-500/30 flex items-center justify-center text-xl font-bold text-white">
                  {displayName[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-white">{displayName}</p>
                  <p className="text-xs text-white/40">
                    {profile.profession || "—"} · {profile.level || "—"}
                  </p>
                </div>
              </div>

              {/* XP + roadmap progress */}
              {stats && (
                <div className="mb-3 p-3 rounded-xl bg-white/3 border border-white/5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-white/40">Roadmap progress</span>
                    <span className="text-xs font-semibold text-purple-400">{roadmapPct}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
                    <motion.div animate={{ width: `${roadmapPct}%` }} transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-white/25">{stats.tasks_done} tasks done · {stats.total_xp} XP</span>
                    <span className="text-[10px] text-white/25">Week {stats.current_week}/{stats.total_weeks}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-white/40 mb-1.5">
                <span>Profile completion</span>
                <span className={completion >= 80 ? "text-green-400" : "text-amber-400"}>{completion}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div animate={{ width: `${completion}%` }} transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`h-full rounded-full ${completion >= 80 ? "bg-green-500" : "bg-gradient-to-r from-amber-500 to-orange-500"}`} />
              </div>
              {isGated && (
                <Link href="/profile" className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 mt-3 transition-colors">
                  Complete profile <ArrowRight size={11} />
                </Link>
              )}
            </DashboardCard>

            {/* Career prediction */}
            <DashboardCard title="AI Career Prediction" delay={0.1}>
              {loading ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-5 bg-white/10 rounded w-2/3" />
                  <div className="h-3 bg-white/10 rounded w-full" />
                  <div className="h-3 bg-white/10 rounded w-4/5" />
                </div>
              ) : careers.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {careers.slice(0, 2).map((c) => (
                    <div key={c.id} className="p-3 rounded-xl bg-purple-600/8 border border-purple-500/15">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold text-white">{c.title}</p>
                        <span className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">{c.match_score}%</span>
                      </div>
                      <p className="text-xs text-white/45 leading-relaxed line-clamp-2">{c.description}</p>
                    </div>
                  ))}
                  <Link href="/dashboard/roadmap" className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors">
                    View full roadmap <ArrowRight size={11} />
                  </Link>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Target size={28} className="text-purple-400/50 mx-auto mb-3" />
                  <p className="text-sm text-white/50 mb-4">Get AI-powered career predictions based on your profile</p>
                  <motion.button onClick={handlePredictCareer} disabled={loadingCareers}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 mx-auto px-4 py-2 rounded-xl btn-primary text-white text-xs font-medium disabled:opacity-60">
                    {loadingCareers ? <RefreshCw size={13} className="animate-spin" /> : <Sparkles size={13} />}
                    {loadingCareers ? "Analyzing..." : "Predict My Career"}
                  </motion.button>
                </div>
              )}
            </DashboardCard>

            {/* AI Insights */}
            <DashboardCard title="AI Insights" delay={0.15}>
              {loading ? (
                <div className="flex flex-col gap-2 animate-pulse">
                  {[1,2,3].map(i => <div key={i} className="h-10 bg-white/8 rounded-xl" />)}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {(dashData?.insights || [
                    "Complete your profile to get personalized AI insights.",
                    "Consistent daily practice beats occasional intense sessions.",
                    "Focus on one skill at a time for maximum retention.",
                  ]).slice(0, 3).map((insight, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }} className="flex gap-3 p-3 rounded-xl bg-purple-600/8 border border-purple-500/15">
                      <Sparkles size={14} className="text-purple-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-white/70 leading-relaxed">{insight}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </DashboardCard>

            {/* Weekly tasks preview */}
            <DashboardCard title="This Week's Tasks" locked={isGated} delay={0.2}>
              {loading ? (
                <div className="flex flex-col gap-2 animate-pulse">
                  {[1,2,3].map(i => <div key={i} className="h-10 bg-white/8 rounded-xl" />)}
                </div>
              ) : tasks.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {tasks.slice(0, 4).map((t) => (
                    <div key={t.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all
                      ${t.status === "done" ? "bg-green-500/5 border-green-500/10" : "bg-white/2 border-white/6"}`}>
                      {t.status === "done"
                        ? <CheckCircle2 size={14} className="text-green-400 shrink-0" />
                        : <Circle size={14} className="text-white/20 shrink-0" />}
                      <span className={`text-xs flex-1 truncate ${t.status === "done" ? "line-through text-white/30" : "text-white/70"}`}>
                        {t.title}
                      </span>
                      <span className="text-[10px] text-white/25 shrink-0">{t.estimated_time}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-white/30">{weekDone}/{weekTotal} done</span>
                    <Link href="/dashboard/tasks" className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors">
                      All tasks <ArrowRight size={10} />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Trophy size={24} className="text-white/20 mx-auto mb-2" />
                  <p className="text-xs text-white/40 mb-3">No tasks yet for this week</p>
                  <Link href="/dashboard/tasks"
                    className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl btn-primary text-white">
                    <Zap size={11} /> Generate Tasks
                  </Link>
                </div>
              )}
            </DashboardCard>
          </div>
        </div>
      </main>
    </div>
  );
}

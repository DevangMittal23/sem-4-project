"use client";
import { motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { BentoCard, Skeleton, SectionLabel, ProgressBar, StreamingDots } from "@/components/ui";
import { useStore } from "@/lib/store";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import {
  Zap, Target, CheckCircle2, Circle, TrendingUp, Brain,
  Flame, Map, ArrowRight, Sparkles, Star, BarChart3,
  ListChecks, Trophy, Activity,
} from "lucide-react";
import {
  getAccessToken, apiGetDashboardStats, apiGetCareers, apiGetTasks,
  apiGetRoadmap, DashboardStats, CareerPathResult, TaskResult,
} from "@/lib/api";

/* ── Stagger variants ─────────────────────────────────────────────────────── */

const CONTAINER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const ITEM = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeInOut" as const } },
};

/* ── Metric card ─────────────────────────────────────────────────────────── */

function MetricCard({ label, value, sub, icon: Icon, accent, loading, delay = 0 }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; accent: string; loading?: boolean; delay?: number;
}) {
  return (
    <motion.div variants={ITEM} className="card-interactive p-5 flex items-start gap-4">
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
        style={{ background: `${accent}1a`, border: `1px solid ${accent}30` }}>
        <Icon size={20} style={{ color: accent }} />
      </div>
      <div className="flex-1 min-w-0">
        {loading ? (
          <div className="flex flex-col gap-2 mt-1">
            <Skeleton width="w-16" height="h-6" />
            <Skeleton width="w-24" height="h-3" />
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold leading-none mb-1" style={{ color: "rgb(var(--foreground))" }}>
              {value}
            </div>
            <div className="text-label">{label}</div>
            {sub && <div className="text-caption mt-0.5">{sub}</div>}
          </>
        )}
      </div>
    </motion.div>
  );
}

/* ── Custom Recharts tooltip ─────────────────────────────────────────────── */

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="card px-3 py-2 text-xs" style={{ minWidth: 100 }}>
      <p className="text-label mb-1">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span style={{ color: "rgb(var(--foreground))" }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ── XP Area chart (mock weekly progression) ─────────────────────────────── */

function XPChart({ tasks }: { tasks: TaskResult[] }) {
  // Build per-day XP from tasks
  const chartData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const done = tasks.filter(t => t.status === "done").length;
    return days.map((d, i) => ({
      day: d,
      xp: Math.max(0, Math.round((done / 7) * (i + 1) * 15 + (i * 3))),
    }));
  }, [tasks]);

  return (
    <ResponsiveContainer width="100%" height={120}>
      <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id="xp-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="rgb(var(--accent))" stopOpacity={0.25} />
            <stop offset="95%" stopColor="rgb(var(--accent))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" vertical={false} />
        <XAxis dataKey="day" tick={{ fontSize: 10, fill: "rgb(var(--foreground-faint))" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: "rgb(var(--foreground-faint))" }} axisLine={false} tickLine={false} />
        <Tooltip content={<ChartTooltip />} />
        <Area type="monotone" dataKey="xp" stroke="rgb(var(--accent))" strokeWidth={2}
          fill="url(#xp-grad)" dot={{ r: 3, fill: "rgb(var(--accent))", strokeWidth: 0 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ── Skill radar ─────────────────────────────────────────────────────────── */

function SkillRadar({ profile }: { profile: any }) {
  const data = useMemo(() => {
    if (!profile?.skills?.length) return [];
    const lvlMap: Record<string, number> = { expert: 95, advanced: 80, intermediate: 60, beginner: 35 };
    return profile.skills.slice(0, 6).map((s: string) => ({
      subject: s.length > 11 ? s.slice(0, 10) + "…" : s,
      A: lvlMap[profile.skill_levels?.[s] ?? ""] || 50,
    }));
  }, [profile]);

  if (!data.length) return (
    <div className="h-full flex flex-col items-center justify-center gap-3">
      <BarChart3 size={36} style={{ color: "rgb(var(--border-strong))" }} />
      <p className="text-caption text-center">Complete your profile to see skill alignment</p>
    </div>
  );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="72%" data={data}>
        <PolarGrid stroke="rgb(var(--border))" strokeOpacity={0.6} />
        <PolarAngleAxis dataKey="subject"
          tick={{ fill: "rgb(var(--foreground-faint))", fontSize: 10 }} />
        <Radar name="You" dataKey="A" stroke="rgb(var(--primary))"
          fill="rgb(var(--primary))" fillOpacity={0.18} strokeWidth={2} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

/* ── Market readiness ring ───────────────────────────────────────────────── */

function ReadinessRing({ score }: { score: number }) {
  const R = 52;
  const circ = 2 * Math.PI * R;
  const dash = circ * (1 - score / 100);
  const color = score >= 75
    ? "rgb(var(--accent))"
    : score >= 50
    ? "rgb(var(--warning))"
    : "rgb(var(--danger))";

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg width={144} height={144} className="-rotate-90">
        <circle cx={72} cy={72} r={R} fill="none" stroke="rgb(var(--border))" strokeWidth={10} />
        <motion.circle cx={72} cy={72} r={R} fill="none" stroke={color}
          strokeWidth={10} strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: dash }}
          transition={{ duration: 1.4, ease: "easeOut" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black" style={{ color }}>{score}</span>
        <span className="text-label" style={{ color: "rgb(var(--foreground-faint))" }}>/ 100</span>
      </div>
    </div>
  );
}

/* ── Next action pill ────────────────────────────────────────────────────── */

function NextAction({ tasks, careers, isGated }: { tasks: TaskResult[]; careers: CareerPathResult[]; isGated: boolean }) {
  const { label, href, accent } = useMemo(() => {
    if (isGated) return { label: "Complete your profile to unlock features", href: "/profile", accent: "rgb(var(--warning))" };
    const pending = tasks.find(t => t.status === "pending");
    if (pending) return { label: `Resume: ${pending.title.slice(0, 50)}`, href: "/dashboard/tasks", accent: "rgb(var(--primary))" };
    if (!careers.length) return { label: "Run AI Career Prediction", href: "/dashboard/intelligence", accent: "rgb(var(--accent))" };
    return { label: "View your 12-week roadmap", href: "/dashboard/roadmap", accent: "rgb(var(--primary))" };
  }, [tasks, careers, isGated]);

  return (
    <Link href={href}
      className="group flex items-center gap-4 px-5 py-4 rounded-2xl transition-all"
      style={{ background: `${accent.replace(")", " / 0.06)")}`, border: `1px solid ${accent.replace(")", " / 0.2)")}` }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: accent.replace(")", " / 0.12)") }}>
        <Zap size={17} style={{ color: accent }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: accent }}>
          Recommended Next Action
        </p>
        <p className="text-sm font-semibold truncate" style={{ color: "rgb(var(--foreground))" }}>{label}</p>
      </div>
      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform shrink-0"
        style={{ color: accent }} />
    </Link>
  );
}

/* ════════════════════════════════════════════════════════════════
   DASHBOARD PAGE
   ════════════════════════════════════════════════════════════════ */

export default function DashboardPage() {
  const router = useRouter();
  const { profile, completion, isGated, skillGap, loadProfile } = useStore();
  const [stats, setStats]     = useState<DashboardStats | null>(null);
  const [careers, setCareers] = useState<CareerPathResult[]>([]);
  const [tasks, setTasks]     = useState<TaskResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getAccessToken()) { router.replace("/login"); return; }
    Promise.all([
      apiGetDashboardStats().then(setStats).catch(() => {}),
      apiGetCareers().then(setCareers).catch(() => {}),
      apiGetRoadmap()
        .then(r => apiGetTasks(r.current_week).then(setTasks).catch(() => {}))
        .catch(() => {}),
      loadProfile(),
    ]).finally(() => setLoading(false));

    // Poll until profile_completion > 0 (handles async post-assessment pipeline)
    let attempts = 0;
    const poll = setInterval(async () => {
      attempts++;
      if (attempts > 15) { clearInterval(poll); return; } // stop after 45s
      try {
        await loadProfile();
        const { completion: c } = useStore.getState();
        if (c > 0) {
          clearInterval(poll);
          // Also refresh careers/tasks now that pipeline is done
          apiGetCareers().then(setCareers).catch(() => {});
          apiGetRoadmap()
            .then(r => apiGetTasks(r.current_week).then(setTasks).catch(() => {}))
            .catch(() => {});
        }
      } catch {}
    }, 3000);
    return () => clearInterval(poll);
  }, []); // eslint-disable-line

  const topCareer = careers[0];
  const doneTasks  = tasks.filter(t => t.status === "done").length;
  const readiness  = stats?.ai_score ?? completion ?? 0;

  const PRIMARY  = "rgb(var(--primary))";
  const ACCENT   = "rgb(var(--accent))";
  const WARNING  = "rgb(var(--warning))";
  const DANGER   = "rgb(var(--danger))";

  return (
    <div className="flex min-h-screen" style={{ background: "rgb(var(--background))" }}>
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[1280px] mx-auto px-6 py-8">

          {/* ── Page title ── */}
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-7">
            <p className="text-caption mb-1">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
            <h1 className="text-display">
              {profile ? `Good to see you, ${profile.name || profile.username}` : "Dashboard"}
            </h1>
          </motion.div>

          {/* ── Next Action CTA (full-width) ── */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 }} className="mb-6">
            <NextAction tasks={tasks} careers={careers} isGated={isGated} />
          </motion.div>

          {/* ── 4-col metric strip ── */}
          <motion.div variants={CONTAINER} initial="hidden" animate="show"
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <MetricCard label="Market Readiness" value={readiness} sub="AI evaluated"
              icon={Brain} accent={readiness >= 75 ? ACCENT : WARNING} loading={loading} />
            <MetricCard label="Tasks Done" value={`${doneTasks} / ${tasks.length}`}
              sub="This week" icon={CheckCircle2} accent={ACCENT} loading={loading} />
            <MetricCard label="Day Streak" value={stats?.streak_days ?? 0}
              sub="Keep it going!" icon={Flame} accent={WARNING} loading={loading} />
            <MetricCard label="Roadmap" value={`${stats?.roadmap_progress ?? 0}%`}
              sub="Overall progress" icon={Map} accent={PRIMARY} loading={loading} />
          </motion.div>

          {/* ── Main Bento Grid ── */}
          <motion.div variants={CONTAINER} initial="hidden" animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* ── Market Readiness ring — 1 col ── */}
            <motion.div variants={ITEM} className="lg:col-span-1">
              <BentoCard className="h-full flex flex-col">
                <SectionLabel icon={Target} children="Market Readiness" color={ACCENT} />
                <div className="flex-1 flex flex-col items-center justify-center gap-4 py-2">
                  <ReadinessRing score={readiness} />
                  <div className="text-center">
                    <p className="text-caption">
                      {readiness >= 75 ? "You're job-ready!" : readiness >= 50 ? "Getting there" : "Keep learning"}
                    </p>
                    {!isGated && (
                      <Link href="/dashboard/intelligence"
                        className="text-xs font-semibold mt-1.5 inline-flex items-center gap-1"
                        style={{ color: "rgb(var(--primary))" }}>
                        See full analysis <ArrowRight size={11} />
                      </Link>
                    )}
                  </div>
                </div>
              </BentoCard>
            </motion.div>

            {/* ── Career Health / Skill Radar — 2 col ── */}
            <motion.div variants={ITEM} className="lg:col-span-2">
              <BentoCard className="h-full flex flex-col" glass>
                <SectionLabel icon={Activity} children="Career Health Overview" color={PRIMARY} />
                <div className="grid grid-cols-5 gap-4 flex-1">
                  {/* Radar */}
                  <div className="col-span-3 h-64">
                    <SkillRadar profile={profile} />
                  </div>
                  {/* Right — top career + others */}
                  <div className="col-span-2 flex flex-col justify-center gap-3">
                    {loading ? (
                      <>
                        <Skeleton width="w-full" height="h-24" />
                        <Skeleton width="w-full" height="h-10" />
                      </>
                    ) : topCareer ? (
                      <>
                        <div className="p-3 rounded-xl" style={{ background: "rgb(var(--primary-muted))", border: "1px solid rgb(var(--primary-border))" }}>
                          <p className="text-label mb-1" style={{ color: "rgb(var(--primary))" }}>Top AI Pick</p>
                          <p className="text-subheading leading-snug">{topCareer.title}</p>
                          <p className="text-caption mt-1 line-clamp-2">{topCareer.description}</p>
                          <span className="badge badge-accent mt-2">
                            <Star size={9} /> {topCareer.match_score}% Match
                          </span>
                        </div>
                        {careers.slice(1, 3).map(c => (
                          <div key={c.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                            style={{ background: "rgb(var(--surface))", border: "1px solid rgb(var(--border-subtle))" }}>
                            <span className="text-xs font-medium truncate" style={{ color: "rgb(var(--foreground))" }}>
                              {c.title}
                            </span>
                            <span className="text-xs font-bold ml-2 shrink-0" style={{ color: "rgb(var(--foreground-muted))" }}>
                              {c.match_score}%
                            </span>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center gap-3">
                        <Sparkles size={28} style={{ color: "rgb(var(--border-strong))" }} />
                        <p className="text-caption">No predictions yet</p>
                        <Link href="/dashboard/intelligence" className="btn-primary text-xs px-3 py-1.5">
                          <Brain size={12} /> Generate
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </BentoCard>
            </motion.div>

            {/* ── Profile Strength — 1 col ── */}
            <motion.div variants={ITEM} className="lg:col-span-1">
              <BentoCard className="h-full flex flex-col">
                <SectionLabel icon={TrendingUp} children="Profile Strength" color={ACCENT} />
                <div className="flex-1 flex flex-col items-center justify-center gap-4 py-2">
                  {/* Animated ring */}
                  <div className="relative w-28 h-28">
                    <svg width={112} height={112} className="-rotate-90">
                      <circle cx={56} cy={56} r={44} fill="none" stroke="rgb(var(--border))" strokeWidth={8} />
                      <motion.circle cx={56} cy={56} r={44} fill="none"
                        stroke={completion >= 80 ? "rgb(var(--accent))" : "rgb(var(--warning))"}
                        strokeWidth={8} strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 44}
                        initial={{ strokeDashoffset: 2 * Math.PI * 44 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 44 * (1 - completion / 100) }}
                        transition={{ duration: 1.2, ease: "easeOut" }} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-black" style={{ color: "rgb(var(--foreground))" }}>
                        {completion}%
                      </span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-caption">
                      {completion >= 80 ? "Fully activated ✓" : `${7 - Math.round(completion / 14.3)} more fields needed`}
                    </p>
                    {completion < 80 && (
                      <Link href="/profile" className="btn-primary text-xs px-4 py-1.5 mt-2 inline-flex">
                        Complete <ArrowRight size={11} />
                      </Link>
                    )}
                  </div>
                </div>
              </BentoCard>
            </motion.div>

            {/* ── Weekly XP Chart — 2 col ── */}
            <motion.div variants={ITEM} className="lg:col-span-2">
              <BentoCard>
                <div className="flex items-center justify-between mb-3">
                  <SectionLabel icon={Zap} children="Weekly XP" color={ACCENT} />
                  <span className="text-xs font-bold" style={{ color: "rgb(var(--accent))" }}>
                    {doneTasks * 25} XP earned
                  </span>
                </div>
                {loading ? <Skeleton height="h-[120px]" /> : <XPChart tasks={tasks} />}
              </BentoCard>
            </motion.div>

            {/* ── This week's tasks — 2 col ── */}
            <motion.div variants={ITEM} className="lg:col-span-2">
              <BentoCard>
                <div className="flex items-center justify-between mb-3">
                  <SectionLabel icon={ListChecks} children="This Week's Tasks" />
                  <Link href="/dashboard/tasks" className="text-xs font-semibold flex items-center gap-1"
                    style={{ color: "rgb(var(--primary))" }}>
                    View all <ArrowRight size={11} />
                  </Link>
                </div>
                {loading ? (
                  <div className="flex flex-col gap-2">
                    {[1, 2, 3].map(i => <Skeleton key={i} height="h-10" />)}
                  </div>
                ) : tasks.length > 0 ? (
                  <div className="flex flex-col gap-1.5">
                    {tasks.slice(0, 5).map((t, i) => (
                      <motion.div key={t.id}
                        initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + i * 0.05 }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                        style={{ background: "rgb(var(--background-alt))" }}>
                        {t.status === "done"
                          ? <CheckCircle2 size={15} style={{ color: "rgb(var(--accent))" }} />
                          : <Circle size={15} style={{ color: "rgb(var(--border-strong))" }} />}
                        <span className={`text-sm flex-1 truncate ${t.status === "done" ? "line-through" : ""}`}
                          style={{ color: t.status === "done" ? "rgb(var(--foreground-faint))" : "rgb(var(--foreground))" }}>
                          {t.title}
                        </span>
                        <span className="badge badge-primary shrink-0">{t.tag}</span>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ListChecks size={32} style={{ color: "rgb(var(--border-strong))" }} className="mx-auto mb-3" />
                    <p className="text-caption">
                      {isGated ? "Complete profile to unlock tasks" : "No tasks yet — generate from your roadmap"}
                    </p>
                  </div>
                )}
              </BentoCard>
            </motion.div>

            {/* ── Skill gap quick view — 1 col ── */}
            <motion.div variants={ITEM} className="lg:col-span-1">
              <BentoCard className="h-full">
                <SectionLabel icon={Trophy} children="Gap Priority" color={WARNING} />
                {skillGap?.gap_skills?.length ? (
                  <div className="flex flex-col gap-2.5">
                    {skillGap.gap_skills.slice(0, 4).map(g => (
                      <div key={g.skill} className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium truncate" style={{ color: "rgb(var(--foreground))" }}>{g.skill}</span>
                          <span className="text-[10px]" style={{ color: "rgb(var(--foreground-faint))" }}>{g.estimated_weeks}w</span>
                        </div>
                        <ProgressBar
                          pct={g.priority === "critical" ? 20 : g.priority === "high" ? 40 : 60}
                          color="primary" height="h-1" />
                      </div>
                    ))}
                    <Link href="/dashboard/intelligence"
                      className="text-xs font-semibold flex items-center gap-1 mt-1"
                      style={{ color: "rgb(var(--primary))" }}>
                      Full analysis <ArrowRight size={11} />
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 py-6">
                    <Brain size={28} style={{ color: "rgb(var(--border-strong))" }} />
                    <p className="text-caption text-center">Run skill gap analysis to see gaps</p>
                  </div>
                )}
              </BentoCard>
            </motion.div>

            {/* ── Roadmap progress — 1 col ── */}
            <motion.div variants={ITEM} className="lg:col-span-1">
              <BentoCard className="h-full flex flex-col justify-between">
                <div>
                  <SectionLabel icon={Map} children="Roadmap Engine" color={PRIMARY} />
                  {stats?.career_title ? (
                    <>
                      <p className="text-subheading mb-1">{stats.career_title}</p>
                      <p className="text-caption mb-3">
                        Week {stats.current_week ?? 1} of {stats.total_weeks ?? 12}
                      </p>
                      <ProgressBar pct={stats.roadmap_progress ?? 0} color="accent" height="h-2" />
                      <p className="text-label mt-1.5">{stats.roadmap_progress ?? 0}% complete</p>
                    </>
                  ) : (
                    <p className="text-caption">No roadmap generated yet</p>
                  )}
                </div>
                <Link href="/dashboard/roadmap" className="btn-primary mt-4 w-full justify-center">
                  <Map size={14} /> {stats?.career_title ? "Continue" : "Generate"} Roadmap
                </Link>
              </BentoCard>
            </motion.div>

          </motion.div>
        </div>
      </main>
    </div>
  );
}

"use client";
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import CompletionModal from "@/components/CompletionModal";
import { useProfile } from "@/lib/profileContext";
import { CheckCircle2, Circle, Lock, Flame, Zap, Trophy, TrendingUp } from "lucide-react";

const MILESTONES = [
  { label: "Profile Setup", done: true, points: 10 },
  { label: "Skills Assessment", done: true, points: 20 },
  { label: "Career Path Selected", done: true, points: 15 },
  { label: "Week 1 Tasks (2/4)", done: false, points: 40, progress: 50 },
  { label: "First Milestone Review", done: false, points: 25 },
  { label: "Portfolio Project", done: false, points: 50 },
  { label: "Mock Interview", done: false, points: 35 },
  { label: "Job Application (x5)", done: false, points: 30 },
];

const SKILL_SCORES = [
  { skill: "Technical Skills", score: 68, color: "from-blue-500 to-cyan-500" },
  { skill: "Problem Solving", score: 74, color: "from-purple-500 to-violet-500" },
  { skill: "Communication", score: 55, color: "from-pink-500 to-rose-500" },
  { skill: "Learning Agility", score: 82, color: "from-green-500 to-emerald-500" },
  { skill: "Domain Knowledge", score: 61, color: "from-amber-500 to-orange-500" },
];

// 5-week streak calendar mock
const WEEKS = Array.from({ length: 5 }, (_, wi) =>
  Array.from({ length: 7 }, (_, di) => {
    const total = wi * 7 + di;
    if (total > 30) return "future";
    if (total < 18) return Math.random() > 0.25 ? "done" : "missed";
    if (total < 22) return "done";
    return "future";
  })
);

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

function ActivityCell({ state }: { state: string }) {
  return (
    <div className={`w-7 h-7 rounded-md transition-all
      ${state === "done" ? "bg-purple-500/70 border border-purple-400/40"
        : state === "missed" ? "bg-white/5 border border-white/5"
        : "bg-white/3 border border-white/3"}`} />
  );
}

export default function ProgressPage() {
  const { isGated, completion } = useProfile();

  const earnedPoints = MILESTONES.filter((m) => m.done).reduce((s, m) => s + m.points, 0);
  const totalPoints = MILESTONES.reduce((s, m) => s + m.points, 0);
  const doneMilestones = MILESTONES.filter((m) => m.done).length;

  return (
    <div className="flex min-h-screen bg-[#050508]">
      <Sidebar />
      <CompletionModal />

      <main className="flex-1 overflow-y-auto">
        <div className="fixed top-0 right-0 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-3xl mx-auto px-6 py-8">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
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
          ) : (
            <div className="flex flex-col gap-5">

              {/* top stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { icon: Trophy, label: "XP Earned", value: `${earnedPoints} pts`, color: "text-amber-400" },
                  { icon: Flame, label: "Day Streak", value: "3 days", color: "text-orange-400" },
                  { icon: Zap, label: "Milestones", value: `${doneMilestones}/${MILESTONES.length}`, color: "text-blue-400" },
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

              {/* overall XP bar */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="glass glow-border rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-white/40 uppercase tracking-wider font-medium">Overall Progress</p>
                  <span className="text-sm font-bold text-white">{earnedPoints} / {totalPoints} XP</span>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }}
                    animate={{ width: `${Math.round((earnedPoints / totalPoints) * 100)}%` }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                    className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-full" />
                </div>
                <p className="text-xs text-white/25 mt-2">
                  {Math.round((earnedPoints / totalPoints) * 100)}% of total XP earned
                </p>
              </motion.div>

              {/* milestones */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="glass glow-border rounded-2xl p-5">
                <p className="text-xs text-white/40 uppercase tracking-wider font-medium mb-4">Milestones</p>
                <div className="flex flex-col gap-3">
                  {MILESTONES.map((m, i) => (
                    <motion.div key={m.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + i * 0.05 }}
                      className={`flex items-center gap-3 p-3 rounded-xl border
                        ${m.done ? "bg-green-500/5 border-green-500/15" : "bg-white/2 border-white/6"}`}>
                      {m.done
                        ? <CheckCircle2 size={16} className="text-green-400 shrink-0" />
                        : <Circle size={16} className="text-white/15 shrink-0" />}
                      <span className={`flex-1 text-sm ${m.done ? "text-white/50 line-through" : "text-white/70"}`}>
                        {m.label}
                      </span>
                      <span className={`text-xs font-medium ${m.done ? "text-amber-400" : "text-white/25"}`}>
                        +{m.points} XP
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* skill scores */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="glass glow-border rounded-2xl p-5">
                <p className="text-xs text-white/40 uppercase tracking-wider font-medium mb-4">Skill Scores</p>
                <div className="flex flex-col gap-4">
                  {SKILL_SCORES.map((s, i) => (
                    <div key={s.skill}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-white/60">{s.skill}</span>
                        <span className="text-sm font-semibold text-white">{s.score}%</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${s.score}%` }}
                          transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 + i * 0.08 }}
                          className={`h-full bg-gradient-to-r ${s.color} rounded-full`} />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* activity calendar */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                className="glass glow-border rounded-2xl p-5">
                <p className="text-xs text-white/40 uppercase tracking-wider font-medium mb-4">Activity — Last 5 Weeks</p>
                <div className="flex gap-1.5 mb-2">
                  {DAY_LABELS.map((d, i) => (
                    <div key={i} className="w-7 text-center text-[10px] text-white/25">{d}</div>
                  ))}
                </div>
                <div className="flex flex-col gap-1.5">
                  {WEEKS.map((week, wi) => (
                    <div key={wi} className="flex gap-1.5">
                      {week.map((state, di) => (
                        <ActivityCell key={di} state={state} />
                      ))}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-3 mt-4 text-[10px] text-white/30">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-purple-500/70" /> Active
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-white/5" /> Missed
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-white/3" /> Upcoming
                  </div>
                </div>
              </motion.div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}

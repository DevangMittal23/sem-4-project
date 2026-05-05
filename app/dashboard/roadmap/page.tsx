"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import CompletionModal from "@/components/CompletionModal";
import { useProfile } from "@/lib/profileContext";
import {
  apiGetSkillGap, apiRunSkillGap, apiGetRoadmap, apiGenerateRoadmap,
  apiGetUserStatus, SkillGapData, RoadmapData,
} from "@/lib/api";
import {
  Sparkles, RefreshCw, Lock, ChevronRight, CheckCircle2, Circle,
  TrendingUp, AlertTriangle, Target, BookOpen, Code2, Users, Trophy,
  DollarSign, BarChart2, Zap, ArrowRight,
} from "lucide-react";

const PHASE_ICONS = [BookOpen, Code2, Users, Trophy];
const PRIORITY_COLORS: Record<string, string> = {
  critical: "text-red-400 bg-red-500/10 border-red-500/20",
  high: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  medium: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  low: "text-green-400 bg-green-500/10 border-green-500/20",
};
const TAG_COLORS: Record<string, string> = {
  Learning: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  Practice: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  Project: "text-green-400 bg-green-500/10 border-green-500/20",
  Reading: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  Career: "text-amber-400 bg-amber-500/10 border-amber-500/20",
};

function SkeletonBlock({ h = "h-4", w = "w-full" }: { h?: string; w?: string }) {
  return <div className={`${h} ${w} bg-white/8 rounded-lg animate-pulse`} />;
}

function SkillGapSection({ gap, onSelectCareer }: { gap: SkillGapData; onSelectCareer: (title: string) => void }) {
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);

  const handleSelect = (title: string) => {
    setSelectedCareer(title);
    onSelectCareer(title);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Market data */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="glass glow-border rounded-2xl p-5">
        <p className="text-xs text-white/40 uppercase tracking-wider font-medium mb-4 flex items-center gap-2">
          <BarChart2 size={13} className="text-purple-400" /> Job Market Data
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Current Salary", value: gap.job_market_data.avg_salary_current, icon: DollarSign, color: "text-white/60" },
            { label: "Target Salary", value: gap.job_market_data.avg_salary_target, icon: TrendingUp, color: "text-green-400" },
            { label: "Market Demand", value: gap.job_market_data.demand_level, icon: Zap, color: gap.job_market_data.demand_level === "high" ? "text-green-400" : "text-amber-400" },
            { label: "Growth Rate", value: gap.job_market_data.growth_rate, icon: BarChart2, color: "text-blue-400" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white/3 border border-white/6 rounded-xl p-3">
              <Icon size={14} className={`${color} mb-1.5`} />
              <p className={`text-sm font-semibold ${color}`}>{value || "—"}</p>
              <p className="text-[10px] text-white/35 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
        {gap.job_market_data.top_hiring_companies?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="text-[10px] text-white/30">Top hiring:</span>
            {gap.job_market_data.top_hiring_companies.slice(0, 5).map((c) => (
              <span key={c} className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300">{c}</span>
            ))}
          </div>
        )}
      </motion.div>

      {/* Skill gap */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass glow-border rounded-2xl p-5">
        <p className="text-xs text-white/40 uppercase tracking-wider font-medium mb-4 flex items-center gap-2">
          <AlertTriangle size={13} className="text-amber-400" /> Skill Gap Analysis
        </p>
        <div className="flex flex-col gap-2">
          {gap.gap_skills.slice(0, 6).map((g, i) => (
            <motion.div key={g.skill} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/2 border border-white/6">
              <span className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 ${PRIORITY_COLORS[g.priority] || PRIORITY_COLORS.medium}`}>
                {g.priority}
              </span>
              <span className="text-sm text-white/80 flex-1">{g.skill}</span>
              <span className="text-[10px] text-white/30 shrink-0">{g.estimated_weeks}w</span>
              <span className="text-[10px] text-white/25 hidden md:block max-w-[200px] truncate">{g.reason}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Market insights */}
      {gap.market_insights.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="glass glow-border rounded-2xl p-5">
          <p className="text-xs text-white/40 uppercase tracking-wider font-medium mb-3 flex items-center gap-2">
            <Sparkles size={13} className="text-purple-400" /> Market Insights
          </p>
          <div className="flex flex-col gap-2">
            {gap.market_insights.slice(0, 4).map((insight, i) => (
              <div key={i} className="flex gap-2 text-sm text-white/60">
                <span className="text-purple-400 shrink-0 mt-0.5">•</span>
                {insight}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Career options */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="glass glow-border rounded-2xl p-5">
        <p className="text-xs text-white/40 uppercase tracking-wider font-medium mb-4 flex items-center gap-2">
          <Target size={13} className="text-green-400" /> Career Options — Choose Your Path
        </p>
        <div className="flex flex-col gap-3">
          {gap.career_options.map((opt, i) => (
            <motion.button key={opt.title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }} onClick={() => handleSelect(opt.title)}
              className={`text-left p-4 rounded-xl border transition-all ${
                selectedCareer === opt.title
                  ? "border-purple-500/50 bg-purple-600/15"
                  : "border-white/8 bg-white/2 hover:border-purple-500/30 hover:bg-purple-600/8"
              }`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-white">{opt.title}</p>
                  <p className="text-xs text-white/40 mt-0.5">{opt.time_to_achieve} · {opt.salary_range}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs font-bold ${opt.fit_score >= 80 ? "text-green-400" : opt.fit_score >= 60 ? "text-amber-400" : "text-white/40"}`}>
                    {opt.fit_score}% fit
                  </span>
                  {selectedCareer === opt.title && <CheckCircle2 size={16} className="text-purple-400" />}
                </div>
              </div>
              <p className="text-xs text-white/50 mb-2">{opt.reason}</p>
              {opt.required_gap_skills.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {opt.required_gap_skills.slice(0, 4).map((s) => (
                    <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/35">{s}</span>
                  ))}
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Recommendations */}
      {gap.recommendations.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="glass glow-border rounded-2xl p-5">
          <p className="text-xs text-white/40 uppercase tracking-wider font-medium mb-3">AI Recommendations</p>
          <div className="flex flex-col gap-2">
            {gap.recommendations.map((r, i) => (
              <div key={i} className="flex gap-2 text-sm text-white/65">
                <ArrowRight size={14} className="text-purple-400 shrink-0 mt-0.5" />
                {r}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function RoadmapView({ roadmap }: { roadmap: RoadmapData }) {
  const currentWeek = roadmap.current_week;
  const progress = Math.round((currentWeek - 1) / roadmap.total_weeks * 100);

  return (
    <div className="flex flex-col gap-5">
      {/* Header stats */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="glass glow-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-lg font-bold text-white">{roadmap.career_title}</p>
            <p className="text-xs text-white/40">Week {currentWeek} of {roadmap.total_weeks}</p>
          </div>
          <span className="text-2xl font-bold gradient-text">{progress}%</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" />
        </div>
      </motion.div>

      {/* Phase timeline */}
      <div className="relative">
        <div className="absolute left-7 top-10 bottom-10 w-px bg-gradient-to-b from-purple-500/50 via-white/10 to-transparent" />
        <div className="flex flex-col gap-5">
          {roadmap.phases.map((phase, i) => {
            const Icon = PHASE_ICONS[i % 4];
            const isActive = currentWeek >= phase.week_start && currentWeek <= phase.week_end;
            const isDone = currentWeek > phase.week_end;

            return (
              <motion.div key={phase.phase} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }} className="flex gap-4">
                <div className={`w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center border z-10
                  ${isDone ? "bg-green-500/20 border-green-500/40"
                    : isActive ? "bg-purple-600/25 border-purple-500/50"
                    : "bg-white/3 border-white/8"}`}>
                  {isDone ? <CheckCircle2 size={20} className="text-green-400" />
                    : <Icon size={20} className={isActive ? "text-purple-400" : "text-white/20"} />}
                </div>

                <div className={`flex-1 rounded-2xl border p-5
                  ${isDone ? "border-green-500/20 bg-green-500/3"
                    : isActive ? "border-purple-500/30 bg-purple-500/5"
                    : "border-white/6 bg-white/2"}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] text-white/25 font-mono">Phase {phase.phase_number}</span>
                        {isActive && <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300">Current</span>}
                        {isDone && <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/30 text-green-300">Complete</span>}
                      </div>
                      <h3 className={`text-base font-semibold ${isActive ? "text-white" : isDone ? "text-white/60" : "text-white/30"}`}>
                        {phase.phase}
                      </h3>
                    </div>
                    <span className="text-xs text-white/25 shrink-0">Weeks {phase.weeks}</span>
                  </div>

                  <p className={`text-sm mb-3 leading-relaxed ${isActive ? "text-white/55" : "text-white/25"}`}>{phase.goal}</p>

                  {phase.focus_skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {phase.focus_skills.map((s) => (
                        <span key={s} className={`text-[10px] px-2 py-0.5 rounded-full border
                          ${isActive ? "border-purple-500/25 text-purple-300/70 bg-purple-500/8" : "border-white/8 text-white/22"}`}>
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Current week tasks preview */}
                  {isActive && roadmap.weekly_plans.length > 0 && (() => {
                    const currentPlan = roadmap.weekly_plans.find((wp) => wp.is_current);
                    if (!currentPlan) return null;
                    return (
                      <div className="mt-3 pt-3 border-t border-white/5">
                        <p className="text-[10px] text-purple-400 uppercase tracking-wider mb-2">This week — {currentPlan.theme}</p>
                        <div className="flex flex-col gap-1.5">
                          {currentPlan.tasks.slice(0, 3).map((t, j) => (
                            <div key={j} className="flex items-center gap-2">
                              {t.status === "done"
                                ? <CheckCircle2 size={12} className="text-green-400 shrink-0" />
                                : <Circle size={12} className="text-white/20 shrink-0" />}
                              <span className={`text-xs ${t.status === "done" ? "line-through text-white/30" : "text-white/60"}`}>{t.title}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded border ml-auto shrink-0 ${TAG_COLORS[t.tag] || "text-white/30 border-white/10"}`}>{t.tag}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  <p className={`text-xs mt-3 ${isActive ? "text-white/40" : "text-white/18"}`}>
                    🎯 {phase.milestone}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function RoadmapPage() {
  const { profile, isGated } = useProfile();
  const [gap, setGap] = useState<SkillGapData | null>(null);
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
  const [loadingGap, setLoadingGap] = useState(false);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);
  const [view, setView] = useState<"gap" | "roadmap">("gap");

  useEffect(() => {
    if (isGated) return;
    // Try loading existing data
    apiGetSkillGap().then(setGap).catch(() => {});
    apiGetRoadmap().then((r) => { setRoadmap(r); setView("roadmap"); }).catch(() => {});
  }, [isGated]);

  const runGapAnalysis = async () => {
    setLoadingGap(true);
    try {
      const result = await apiRunSkillGap();
      setGap(result);
      setView("gap");
    } catch {}
    setLoadingGap(false);
  };

  const generateRoadmap = async () => {
    if (!selectedCareer) return;
    setLoadingRoadmap(true);
    try {
      const result = await apiGenerateRoadmap(selectedCareer);
      setRoadmap(result);
      setView("roadmap");
    } catch {}
    setLoadingRoadmap(false);
  };

  return (
    <div className="flex min-h-screen bg-[#050508]">
      <Sidebar />
      <CompletionModal />

      <main className="flex-1 overflow-y-auto">
        <div className="fixed top-0 right-0 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-3xl mx-auto px-6 py-8">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={14} className="text-purple-400" />
              <span className="text-xs text-purple-400 uppercase tracking-wider font-medium">AI Powered</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Career Roadmap</h1>
            <p className="text-sm text-white/40 mt-1">
              {profile.goal === "switch_domain" ? `Transition into ${profile.target_domain || "your target domain"}`
                : `Growth path for ${profile.profession || "your career"}`}
            </p>
          </motion.div>

          {isGated ? (
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
              className="glass glow-border rounded-2xl p-12 text-center">
              <Lock size={32} className="text-white/20 mx-auto mb-4" />
              <p className="text-white font-semibold mb-2">Complete your profile to unlock your roadmap</p>
              <p className="text-sm text-white/40">We need your profile to generate a personalized career path.</p>
            </motion.div>
          ) : (
            <>
              {/* Action bar */}
              <div className="flex items-center gap-3 mb-6 flex-wrap">
                {roadmap && (
                  <div className="flex gap-2">
                    <button onClick={() => setView("gap")}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${view === "gap" ? "btn-primary text-white" : "glass border border-white/10 text-white/50 hover:text-white"}`}>
                      Skill Gap
                    </button>
                    <button onClick={() => setView("roadmap")}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${view === "roadmap" ? "btn-primary text-white" : "glass border border-white/10 text-white/50 hover:text-white"}`}>
                      Roadmap
                    </button>
                  </div>
                )}
                <motion.button onClick={runGapAnalysis} disabled={loadingGap}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-purple-500/30 text-purple-300 text-sm hover:bg-purple-600/15 transition-all disabled:opacity-50 ml-auto">
                  {loadingGap ? <RefreshCw size={14} className="animate-spin" /> : <BarChart2 size={14} />}
                  {loadingGap ? "Analyzing market..." : gap ? "Re-analyze" : "Analyze Skill Gap"}
                </motion.button>
              </div>

              {/* Loading state */}
              {loadingGap && (
                <div className="flex flex-col gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="glass glow-border rounded-2xl p-5 flex flex-col gap-3">
                      <SkeletonBlock h="h-3" w="w-1/4" />
                      <SkeletonBlock h="h-5" w="w-3/4" />
                      <SkeletonBlock h="h-3" w="w-full" />
                      <SkeletonBlock h="h-3" w="w-2/3" />
                    </div>
                  ))}
                </div>
              )}

              {/* Gap analysis view */}
              {!loadingGap && gap && view === "gap" && (
                <>
                  <SkillGapSection gap={gap} onSelectCareer={setSelectedCareer} />
                  {selectedCareer && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="mt-5 p-4 glass border border-purple-500/30 rounded-2xl flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-white">Selected: {selectedCareer}</p>
                        <p className="text-xs text-white/40">Generate your personalized 12-week roadmap</p>
                      </div>
                      <motion.button onClick={generateRoadmap} disabled={loadingRoadmap}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl btn-primary text-white text-sm font-medium disabled:opacity-60">
                        {loadingRoadmap ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                        {loadingRoadmap ? "Generating..." : "Generate Roadmap"}
                      </motion.button>
                    </motion.div>
                  )}
                </>
              )}

              {/* Roadmap view */}
              {!loadingRoadmap && roadmap && view === "roadmap" && <RoadmapView roadmap={roadmap} />}

              {/* Empty state */}
              {!loadingGap && !gap && !roadmap && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="glass glow-border rounded-2xl p-12 text-center">
                  <BarChart2 size={40} className="text-purple-400/40 mx-auto mb-4" />
                  <p className="text-white font-semibold mb-2">Start with a Skill Gap Analysis</p>
                  <p className="text-sm text-white/40 mb-6">We'll analyze your skills against market requirements and suggest the best career paths for you.</p>
                  <motion.button onClick={runGapAnalysis} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl btn-primary text-white text-sm font-medium">
                    <Sparkles size={15} /> Analyze My Skills
                  </motion.button>
                </motion.div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

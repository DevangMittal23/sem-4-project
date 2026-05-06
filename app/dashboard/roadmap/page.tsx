"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { BentoCard, SectionLabel, Skeleton } from "@/components/ui";
import { useStore } from "@/lib/store";
import {
  apiGetSkillGap, apiRunSkillGap, apiGetRoadmap, apiGenerateRoadmap,
  SkillGapData, RoadmapData,
} from "@/lib/api";
import {
  Sparkles, RefreshCw, Lock, CheckCircle2, Circle,
  TrendingUp, AlertTriangle, Target, BookOpen, Code2, Users, Trophy,
  DollarSign, BarChart3, Zap, ArrowRight, ChevronDown, ChevronUp,
} from "lucide-react";

const PHASE_ICONS = [BookOpen, Code2, Users, Trophy];

/* ── Milestone Node ──────────────────────────────────────────────────────── */

function MilestoneNode({ phase, isActive, isDone, index, roadmap }: {
  phase: RoadmapData["phases"][0]; isActive: boolean; isDone: boolean;
  index: number; roadmap: RoadmapData;
}) {
  const [expanded, setExpanded] = useState(isActive);
  const Icon = PHASE_ICONS[index % 4];
  const currentPlan = isActive ? roadmap.weekly_plans.find(wp => wp.is_current) : null;

  const nodeColor = isDone
    ? "rgb(var(--accent))"
    : isActive
    ? "rgb(var(--primary))"
    : "rgb(var(--border-strong))";

  return (
    <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="flex gap-4 relative">
      {/* Node icon */}
      <div className="flex flex-col items-center shrink-0 w-12 relative">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center z-10 transition-all"
          style={{
            background: isDone
              ? "rgb(var(--accent) / 0.12)"
              : isActive
              ? "rgb(var(--primary) / 0.12)"
              : "rgb(var(--surface))",
            border: `2px solid ${nodeColor}`,
            boxShadow: isActive ? "0 0 16px rgb(var(--primary) / 0.25)" : isDone ? "0 0 12px rgb(var(--accent) / 0.2)" : "none",
          }}>
          {isDone
            ? <CheckCircle2 size={20} style={{ color: nodeColor }} />
            : <Icon size={20} style={{ color: nodeColor }} />}
        </div>
      </div>

      {/* Card */}
      <div className="flex-1 rounded-2xl overflow-hidden mb-3"
        style={{
          background: "rgb(var(--surface))",
          border: `1px solid ${isDone ? "rgb(var(--accent) / 0.2)" : isActive ? "rgb(var(--primary) / 0.25)" : "rgb(var(--border))"}`,
          boxShadow: isActive ? "0 4px 24px rgb(var(--primary) / 0.08)" : "none",
        }}>
        <button onClick={() => setExpanded(!expanded)}
          className="w-full flex items-start justify-between p-5 text-left hover:bg-[rgb(var(--primary)/0.03)] transition-colors">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono" style={{ color: "rgb(var(--foreground-faint))" }}>
                Phase {phase.phase_number}
              </span>
              {isActive && (
                <span className="badge badge-primary">Active</span>
              )}
              {isDone && (
                <span className="badge badge-accent">Complete</span>
              )}
            </div>
            <h3 className="text-heading"
              style={{ color: isDone ? "rgb(var(--foreground-muted))" : "rgb(var(--foreground))" }}>
              {phase.phase}
            </h3>
            <p className="text-caption mt-1">{phase.goal}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-caption">Wks {phase.weeks}</span>
            {expanded
              ? <ChevronUp size={14} style={{ color: "rgb(var(--foreground-faint))" }} />
              : <ChevronDown size={14} style={{ color: "rgb(var(--foreground-faint))" }} />}
          </div>
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
              <div className="px-5 pb-5 border-t" style={{ borderColor: "rgb(var(--border-subtle))" }}>
                {/* Focus skills */}
                {phase.focus_skills.length > 0 && (
                  <div className="mt-4">
                    <p className="text-label mb-2">Focus Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {phase.focus_skills.map(s => (
                        <span key={s} className="badge badge-primary">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {/* Current week */}
                {isActive && currentPlan && (
                  <div className="mt-4">
                    <p className="text-label mb-2" style={{ color: "rgb(var(--primary))" }}>
                      This Week — {currentPlan.theme}
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {currentPlan.tasks.map((t, j) => (
                        <div key={j} className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
                          style={{ background: "rgb(var(--background-alt))" }}>
                          {t.status === "done"
                            ? <CheckCircle2 size={13} style={{ color: "rgb(var(--accent))" }} />
                            : <Circle size={13} style={{ color: "rgb(var(--border-strong))" }} />}
                          <span className={`text-sm flex-1 ${t.status === "done" ? "line-through" : ""}`}
                            style={{ color: t.status === "done" ? "rgb(var(--foreground-faint))" : "rgb(var(--foreground))" }}>
                            {t.title}
                          </span>
                          <span className="badge badge-primary">{t.tag}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Milestone */}
                <div className="mt-4 flex items-center gap-2 px-3 py-2.5 rounded-xl"
                  style={{ background: "rgb(var(--warning) / 0.06)", border: "1px solid rgb(var(--warning) / 0.15)" }}>
                  <Trophy size={13} style={{ color: "rgb(var(--warning))" }} />
                  <span className="text-xs font-medium" style={{ color: "rgb(var(--foreground-muted))" }}>
                    {phase.milestone}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════
   ROADMAP PAGE
   ════════════════════════════════════════════════════════════════ */

export default function RoadmapPage() {
  const { profile, isGated } = useStore();
  const [gap, setGap]           = useState<SkillGapData | null>(null);
  const [roadmap, setRoadmap]   = useState<RoadmapData | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [loadGap, setLoadGap]   = useState(false);
  const [loadMap, setLoadMap]   = useState(false);
  const [view, setView]         = useState<"gap" | "roadmap">("gap");
  const [skillOverlay, setSkillOverlay] = useState(false);

  useEffect(() => {
    if (isGated) return;
    apiGetSkillGap().then(setGap).catch(() => {});
    apiGetRoadmap().then(r => { setRoadmap(r); setView("roadmap"); }).catch(() => {});
  }, [isGated]);

  const runGap = async () => {
    setLoadGap(true);
    try { setGap(await apiRunSkillGap()); setView("gap"); } catch {}
    setLoadGap(false);
  };
  const genRoadmap = async () => {
    if (!selected) return;
    setLoadMap(true);
    try { setRoadmap(await apiGenerateRoadmap(selected)); setView("roadmap"); } catch {}
    setLoadMap(false);
  };

  const progress = roadmap ? Math.round((roadmap.current_week - 1) / roadmap.total_weeks * 100) : 0;

  return (
    <div className="flex min-h-screen" style={{ background: "rgb(var(--background))" }}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <p className="text-label mb-1" style={{ color: "rgb(var(--primary))" }}>
              <Sparkles size={10} className="inline mr-1" />AI-Powered Career Engine
            </p>
            <h1 className="text-display">Career Roadmap</h1>
            <p className="text-caption mt-1">
              {profile?.goal === "switch_domain"
                ? `Transition into ${profile?.preferred_domain || "your target domain"}`
                : `Growth path for ${profile?.profession || "your career"}`}
            </p>
          </motion.div>

          {isGated ? (
            <BentoCard className="p-12 text-center">
              <Lock size={32} style={{ color: "rgb(var(--border-strong))" }} className="mx-auto mb-4" />
              <p className="text-heading mb-2">Complete your profile to unlock your roadmap</p>
              <p className="text-body">We need your profile data to generate a personalised career path.</p>
            </BentoCard>
          ) : (
            <>
              {/* Controls */}
              <div className="flex items-center gap-2 mb-6 flex-wrap">
                {roadmap && (
                  <div className="flex gap-2">
                    {(["gap", "roadmap"] as const).map(v => (
                      <button key={v} onClick={() => setView(v)}
                        className={view === v ? "btn-primary" : "btn-secondary"}>
                        {v === "gap" ? "Skill Gap" : "Roadmap"}
                      </button>
                    ))}
                    {view === "roadmap" && (
                      <button onClick={() => setSkillOverlay(!skillOverlay)}
                        className={skillOverlay ? "btn-primary" : "btn-secondary"}>
                        Skill Overlay
                      </button>
                    )}
                  </div>
                )}
                <button onClick={runGap} disabled={loadGap} className="btn-secondary ml-auto">
                  {loadGap ? <RefreshCw size={14} className="animate-spin" /> : <BarChart3 size={14} />}
                  {loadGap ? "Analysing…" : gap ? "Re-analyse" : "Analyse Skill Gap"}
                </button>
              </div>

              {/* Roadmap view */}
              {!loadMap && roadmap && view === "roadmap" && (
                <div className="flex flex-col gap-4">
                  {/* Progress header */}
                  <BentoCard>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-heading">{roadmap.career_title}</p>
                        <p className="text-caption">Week {roadmap.current_week} of {roadmap.total_weeks}</p>
                      </div>
                      <span className="text-3xl font-black gradient-text">{progress}%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgb(var(--border))" }}>
                      <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ background: "linear-gradient(90deg, rgb(var(--primary)), rgb(var(--accent)))" }} />
                    </div>

                    {/* Skill overlay */}
                    <AnimatePresence>
                      {skillOverlay && gap && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }} className="mt-4 pt-4 border-t overflow-hidden"
                          style={{ borderColor: "rgb(var(--border-subtle))" }}>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-label mb-2" style={{ color: "rgb(var(--accent))" }}>Current Skills</p>
                              <div className="flex flex-wrap gap-1.5">
                                {gap.current_skills.slice(0, 6).map(s => (
                                  <span key={s} className="badge badge-accent">{s}</span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-label mb-2" style={{ color: "rgb(var(--danger))" }}>Required Skills</p>
                              <div className="flex flex-wrap gap-1.5">
                                {gap.required_skills.slice(0, 6).map(s => (
                                  <span key={s} className="badge badge-danger">{s}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </BentoCard>

                  {/* SVG connector + milestone nodes */}
                  <div className="relative">
                    <div className="absolute left-6 top-6 bottom-0 w-px"
                      style={{ background: `linear-gradient(to bottom, rgb(var(--primary) / 0.4), rgb(var(--border) / 0.3), transparent)` }} />
                    <div className="flex flex-col gap-0">
                      {roadmap.phases.map((phase, i) => (
                        <MilestoneNode key={phase.phase} phase={phase} index={i}
                          isActive={roadmap.current_week >= phase.week_start && roadmap.current_week <= phase.week_end}
                          isDone={roadmap.current_week > phase.week_end}
                          roadmap={roadmap} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Skill gap view */}
              {!loadGap && gap && view === "gap" && (
                <div className="flex flex-col gap-4">
                  {/* Market data */}
                  <BentoCard>
                    <SectionLabel icon={BarChart3} children="Job Market Data" color="rgb(var(--primary))" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { l: "Current Salary", v: gap.job_market_data.avg_salary_current, c: "rgb(var(--foreground-muted))", ic: DollarSign },
                        { l: "Target Salary",  v: gap.job_market_data.avg_salary_target,  c: "rgb(var(--accent))",           ic: TrendingUp },
                        { l: "Market Demand",  v: gap.job_market_data.demand_level,        c: gap.job_market_data.demand_level === "high" ? "rgb(var(--accent))" : "rgb(var(--warning))", ic: Zap },
                        { l: "Growth Rate",    v: gap.job_market_data.growth_rate,         c: "rgb(var(--primary))",          ic: BarChart3 },
                      ].map(({ l, v, c, ic: Ic }) => (
                        <div key={l} className="p-3 rounded-xl"
                          style={{ background: "rgb(var(--background-alt))", border: "1px solid rgb(var(--border-subtle))" }}>
                          <Ic size={14} style={{ color: c }} className="mb-1.5" />
                          <p className="text-sm font-bold" style={{ color: c }}>{v || "—"}</p>
                          <p className="text-label">{l}</p>
                        </div>
                      ))}
                    </div>
                  </BentoCard>

                  {/* Gap skills */}
                  <BentoCard>
                    <SectionLabel icon={AlertTriangle} children="Skill Gaps" color="rgb(var(--warning))" />
                    <div className="flex flex-col gap-2">
                      {gap.gap_skills.slice(0, 6).map((g, i) => (
                        <motion.div key={g.skill} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                          style={{ background: "rgb(var(--background-alt))" }}>
                          <span className={`badge ${g.priority === "critical" ? "badge-danger" : "badge-warning"}`}>
                            {g.priority}
                          </span>
                          <span className="text-sm flex-1" style={{ color: "rgb(var(--foreground))" }}>{g.skill}</span>
                          <span className="text-caption">{g.estimated_weeks}w</span>
                        </motion.div>
                      ))}
                    </div>
                  </BentoCard>

                  {/* Career options */}
                  <BentoCard>
                    <SectionLabel icon={Target} children="Choose Your Path" color="rgb(var(--accent))" />
                    <div className="flex flex-col gap-3">
                      {gap.career_options.map(opt => (
                        <button key={opt.title} onClick={() => setSelected(opt.title)}
                          className="text-left p-4 rounded-xl border transition-all"
                          style={{
                            background: selected === opt.title ? "rgb(var(--primary) / 0.06)" : "rgb(var(--background-alt))",
                            borderColor: selected === opt.title ? "rgb(var(--primary-border))" : "rgb(var(--border-subtle))",
                            boxShadow: selected === opt.title ? "var(--primary-glow)" : "none",
                          }}>
                          <div className="flex items-start justify-between mb-1">
                            <p className="text-subheading">{opt.title}</p>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`badge ${opt.fit_score >= 80 ? "badge-accent" : "badge-warning"}`}>
                                {opt.fit_score}% fit
                              </span>
                              {selected === opt.title && <CheckCircle2 size={15} style={{ color: "rgb(var(--primary))" }} />}
                            </div>
                          </div>
                          <p className="text-caption">{opt.reason}</p>
                        </button>
                      ))}
                    </div>
                  </BentoCard>

                  {selected && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="card p-5 flex items-center justify-between"
                      style={{ borderColor: "rgb(var(--primary-border))", boxShadow: "var(--primary-glow)" }}>
                      <div>
                        <p className="text-subheading">{selected}</p>
                        <p className="text-caption">Generate your personalised 12-week roadmap</p>
                      </div>
                      <button onClick={genRoadmap} disabled={loadMap} className="btn-primary">
                        {loadMap ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                        {loadMap ? "Generating…" : "Generate"}
                      </button>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Empty state */}
              {!loadGap && !gap && !roadmap && (
                <BentoCard className="p-12 text-center">
                  <BarChart3 size={40} style={{ color: "rgb(var(--border-strong))" }} className="mx-auto mb-4" />
                  <p className="text-heading mb-2">Start with a Skill Gap Analysis</p>
                  <p className="text-body mb-6">We'll analyse your skills against live market requirements.</p>
                  <button onClick={runGap} className="btn-primary mx-auto">
                    <Sparkles size={15} /> Analyse My Skills
                  </button>
                </BentoCard>
              )}

              {/* Loading skeleton */}
              {(loadGap || loadMap) && (
                <div className="flex flex-col gap-4">
                  {[1, 2, 3].map(i => (
                    <BentoCard key={i} className="flex flex-col gap-3">
                      <Skeleton width="w-1/4" height="h-3" />
                      <Skeleton width="w-3/4" height="h-5" />
                      <Skeleton height="h-3" />
                      <Skeleton width="w-4/5" height="h-3" />
                    </BentoCard>
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

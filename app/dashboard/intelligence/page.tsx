"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { BentoCard, SectionLabel, Skeleton } from "@/components/ui";
import { useStore } from "@/lib/store";
import {
  apiPredictCareer, apiGetCareers, apiGetSkillGap, apiRunSkillGap, apiGetMarketSkillGap,
  CareerPathResult, SkillGapData, MarketSkillGapData,
} from "@/lib/api";
import {
  Brain, Sparkles, RefreshCw, Lock, TrendingUp, Target,
  AlertTriangle, BarChart2, DollarSign, Zap, CheckCircle2,
  ArrowRight, Star, Globe, Trophy, ChevronDown, ChevronUp,
} from "lucide-react";

/* ── Priority badge colors (CSS-variable based) ──────────────────────────── */
const PRIORITY_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  critical: { bg: "rgb(var(--danger) / 0.1)",   color: "rgb(var(--danger))",   border: "rgb(var(--danger) / 0.25)" },
  high:     { bg: "rgb(var(--warning) / 0.1)",  color: "rgb(var(--warning))",  border: "rgb(var(--warning) / 0.25)" },
  medium:   { bg: "rgb(var(--info) / 0.1)",     color: "rgb(var(--info))",     border: "rgb(var(--info) / 0.25)" },
  low:      { bg: "rgb(var(--accent) / 0.1)",   color: "rgb(var(--accent))",   border: "rgb(var(--accent) / 0.25)" },
};

/* ── Market confidence gauge ─────────────────────────────────────────────── */
function ConfidenceGauge({ score, label }: { score: number; label: string }) {
  const color = score >= 80 ? "rgb(var(--accent))" : score >= 60 ? "rgb(var(--warning))" : "rgb(var(--danger))";
  const R = 40; const circ = 2 * Math.PI * R;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-24 h-24">
        <svg width={96} height={96} className="-rotate-90" viewBox="0 0 96 96">
          <circle cx={48} cy={48} r={R} fill="none" stroke="rgb(var(--border))" strokeWidth={8} />
          <motion.circle cx={48} cy={48} r={R} fill="none" stroke={color}
            strokeWidth={8} strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ * (1 - score / 100) }}
            transition={{ duration: 1.2, ease: "easeOut" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-black" style={{ color }}>{score}</span>
        </div>
      </div>
      <p className="text-label text-center">{label}</p>
    </div>
  );
}

/* ── Career prediction card ──────────────────────────────────────────────── */
function CareerCard({ career, rank }: { career: CareerPathResult; rank: number }) {
  const [open, setOpen] = useState(rank === 0);
  const isTop = rank === 0;
  const score = career.match_score;
  const scoreColor = score >= 80 ? "rgb(var(--accent))" : score >= 60 ? "rgb(var(--warning))" : "rgb(var(--foreground-muted))";

  return (
    <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.07 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: isTop ? "rgb(var(--primary) / 0.06)" : "rgb(var(--surface))",
        border: `1px solid ${isTop ? "rgb(var(--primary-border))" : "rgb(var(--border))"}`,
        boxShadow: isTop ? "var(--primary-glow)" : "var(--shadow-xs)",
      }}>
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-4 p-4 text-left hover:bg-[rgb(var(--primary)/0.03)] transition-colors">
        {/* Rank badge */}
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm font-black"
          style={{
            background: isTop ? "rgb(var(--primary) / 0.12)" : "rgb(var(--border))",
            color: isTop ? "rgb(var(--primary))" : "rgb(var(--foreground-faint))",
          }}>
          {isTop ? <Star size={14} /> : rank + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold" style={{ color: "rgb(var(--foreground))" }}>{career.title}</p>
              {isTop && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold mt-0.5"
                  style={{ color: "rgb(var(--warning))" }}>
                  <Star size={8} /> Top AI Recommendation
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm font-black" style={{ color: scoreColor }}>{score}%</span>
              {open ? <ChevronUp size={13} style={{ color: "rgb(var(--foreground-faint))" }} />
                    : <ChevronDown size={13} style={{ color: "rgb(var(--foreground-faint))" }} />}
            </div>
          </div>
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
            <div className="px-4 pb-4 flex flex-col gap-3 border-t" style={{ borderColor: "rgb(var(--border-subtle))" }}>
              <p className="text-body text-xs leading-relaxed mt-3">{career.description}</p>
              {career.required_skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {career.required_skills.slice(0, 6).map(s => (
                    <span key={s} className="badge badge-primary">{s}</span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── Skill gap row ───────────────────────────────────────────────────────── */
function GapRow({ g, i }: { g: SkillGapData["gap_skills"][0]; i: number }) {
  const ps = PRIORITY_STYLE[g.priority] ?? PRIORITY_STYLE.medium;
  return (
    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: i * 0.04 }}
      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl"
      style={{ background: "rgb(var(--background-alt))", border: "1px solid rgb(var(--border-subtle))" }}>
      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
        style={{ background: ps.bg, color: ps.color, border: `1px solid ${ps.border}` }}>
        {g.priority}
      </span>
      <span className="text-sm flex-1 font-medium" style={{ color: "rgb(var(--foreground))" }}>{g.skill}</span>
      <span className="text-caption text-[11px] shrink-0">{g.estimated_weeks}w</span>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════
   AI INTELLIGENCE PAGE
   ════════════════════════════════════════════════════════════════ */
export default function IntelligencePage() {
  const { isGated, profile } = useStore();
  const [careers, setCareers] = useState<CareerPathResult[]>([]);
  const [gap, setGap]         = useState<SkillGapData | null>(null);
  const [market, setMarket]   = useState<MarketSkillGapData | null>(null);
  const [loadCareers, setLoadCareers] = useState(false);
  const [loadGap, setLoadGap]         = useState(false);
  const [loadMarket, setLoadMarket]   = useState(false);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    if (isGated) { setLoading(false); return; }
    Promise.all([
      apiGetCareers().then(setCareers).catch(() => {}),
      apiGetSkillGap().then(setGap).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [isGated]);

  const predictCareers = async () => {
    setLoadCareers(true);
    try { setCareers(await apiPredictCareer()); } catch {}
    setLoadCareers(false);
  };

  const runGap = async () => {
    setLoadGap(true);
    try { setGap(await apiRunSkillGap()); } catch {}
    setLoadGap(false);
  };

  const fetchMarket = async () => {
    setLoadMarket(true);
    try {
      const role = profile?.target_role || profile?.profession || "";
      setMarket(await apiGetMarketSkillGap(role || undefined));
    } catch {}
    setLoadMarket(false);
  };

  /* ── Derived market confidence ── */
  const marketConfidence = gap
    ? Math.max(10, Math.min(99,
        Math.round(100 - (gap.gap_skills.filter(g => g.priority === "critical").length * 20) - (gap.gap_skills.filter(g => g.priority === "high").length * 10))
      ))
    : 0;

  return (
    <div className="flex min-h-screen" style={{ background: "rgb(var(--background))" }}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">

          {/* ── Header ── */}
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-7">
            <p className="text-label mb-1 flex items-center gap-1.5" style={{ color: "rgb(var(--primary))" }}>
              <Brain size={11} /> Gemini Intelligence Engine
            </p>
            <h1 className="text-display">AI Intelligence</h1>
            <p className="text-body mt-1">Career predictions, skill gap analysis, and live market data — all AI-powered.</p>
          </motion.div>

          {isGated ? (
            <BentoCard className="p-12 text-center">
              <div className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center"
                style={{ background: "rgb(var(--border))" }}>
                <Lock size={24} style={{ color: "rgb(var(--foreground-faint))" }} />
              </div>
              <p className="text-heading mb-2">Complete your profile to unlock AI Intelligence</p>
              <p className="text-body">We need your profile data to generate personalised career insights.</p>
            </BentoCard>
          ) : (
            <div className="flex flex-col gap-5">

              {/* ── Career Predictions ── */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <BentoCard>
                  <div className="flex items-center justify-between mb-5">
                    <SectionLabel icon={Target} color="rgb(var(--primary))">Career Predictions</SectionLabel>
                    <button onClick={predictCareers} disabled={loadCareers} className="btn-secondary text-xs py-1.5 px-3">
                      {loadCareers ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />}
                      {loadCareers ? "Predicting…" : careers.length ? "Re-predict" : "Predict Careers"}
                    </button>
                  </div>

                  {/* Market confidence gauges (show when gap data exists) */}
                  {gap && careers.length > 0 && (
                    <div className="flex gap-6 mb-5 p-4 rounded-2xl"
                      style={{ background: "rgb(var(--background-alt))", border: "1px solid rgb(var(--border-subtle))" }}>
                      <ConfidenceGauge score={marketConfidence} label="Market Confidence" />
                      <ConfidenceGauge score={careers[0]?.match_score ?? 0} label="Top Career Fit" />
                      <div className="flex-1 flex flex-col justify-center gap-2">
                        <p className="text-subheading">{careers[0]?.title}</p>
                        <p className="text-body text-xs leading-relaxed">{careers[0]?.description?.slice(0, 120)}…</p>
                        <div className="flex gap-1.5 flex-wrap mt-1">
                          {careers[0]?.required_skills?.slice(0, 4).map(s => (
                            <span key={s} className="badge badge-primary">{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {loading || loadCareers ? (
                    <div className="flex flex-col gap-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="p-4 rounded-xl flex flex-col gap-2"
                          style={{ background: "rgb(var(--background-alt))" }}>
                          <Skeleton width="w-1/2" height="h-4" />
                          <Skeleton width="w-3/4" height="h-3" />
                        </div>
                      ))}
                    </div>
                  ) : careers.length > 0 ? (
                    <div className="flex flex-col gap-2.5">
                      {careers.map((c, i) => <CareerCard key={c.id} career={c} rank={i} />)}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                        style={{ background: "rgb(var(--primary-muted))", border: "1px solid rgb(var(--primary-border))" }}>
                        <Target size={28} style={{ color: "rgb(var(--primary))" }} />
                      </div>
                      <p className="text-subheading mb-2">No predictions yet</p>
                      <p className="text-body mb-4">Click "Predict Careers" to get AI-powered career suggestions.</p>
                      <button onClick={predictCareers} className="btn-primary">
                        <Sparkles size={14} /> Predict Careers
                      </button>
                    </div>
                  )}
                </BentoCard>
              </motion.div>

              {/* ── Skill Gap Analysis ── */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
                <BentoCard>
                  <div className="flex items-center justify-between mb-5">
                    <SectionLabel icon={AlertTriangle} color="rgb(var(--warning))">Skill Gap Analysis</SectionLabel>
                    <button onClick={runGap} disabled={loadGap} className="btn-secondary text-xs py-1.5 px-3">
                      {loadGap ? <RefreshCw size={12} className="animate-spin" /> : <BarChart2 size={12} />}
                      {loadGap ? "Analysing…" : gap ? "Re-analyse" : "Analyse Gap"}
                    </button>
                  </div>

                  {loadGap ? (
                    <div className="flex flex-col gap-2">
                      {[1, 2, 3, 4].map(i => <Skeleton key={i} height="h-10" />)}
                    </div>
                  ) : gap ? (
                    <div className="flex flex-col gap-4">

                      {/* Market numbers */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { label: "Current Salary", value: gap.job_market_data.avg_salary_current, icon: DollarSign, color: "rgb(var(--foreground-muted))" },
                          { label: "Target Salary",  value: gap.job_market_data.avg_salary_target,  icon: TrendingUp, color: "rgb(var(--accent))" },
                          { label: "Market Demand",  value: gap.job_market_data.demand_level,        icon: Zap,
                            color: gap.job_market_data.demand_level === "high" ? "rgb(var(--accent))" : "rgb(var(--warning))" },
                          { label: "Growth Rate",    value: gap.job_market_data.growth_rate,         icon: BarChart2, color: "rgb(var(--info))" },
                        ].map(({ label, value, icon: Ic, color }) => (
                          <div key={label} className="p-3.5 rounded-xl flex flex-col gap-1"
                            style={{ background: "rgb(var(--background-alt))", border: "1px solid rgb(var(--border-subtle))" }}>
                            <Ic size={14} style={{ color }} />
                            <p className="text-sm font-bold" style={{ color }}>{value || "—"}</p>
                            <p className="text-label">{label}</p>
                          </div>
                        ))}
                      </div>

                      {/* Gap skill list */}
                      <div className="flex flex-col gap-2">
                        <p className="text-label mb-1" style={{ color: "rgb(var(--warning))" }}>Priority Gaps</p>
                        {gap.gap_skills.slice(0, 8).map((g, i) => <GapRow key={g.skill} g={g} i={i} />)}
                      </div>

                      {/* AI recommendations */}
                      {gap.recommendations.length > 0 && (
                        <div className="pt-4 border-t" style={{ borderColor: "rgb(var(--border-subtle))" }}>
                          <p className="text-label mb-2.5 flex items-center gap-1.5" style={{ color: "rgb(var(--primary))" }}>
                            <Sparkles size={10} /> AI Recommendations
                          </p>
                          <div className="flex flex-col gap-2">
                            {gap.recommendations.slice(0, 3).map((r, i) => (
                              <div key={i} className="flex gap-2.5 text-sm"
                                style={{ color: "rgb(var(--foreground-muted))" }}>
                                <ArrowRight size={13} className="shrink-0 mt-0.5" style={{ color: "rgb(var(--primary))" }} />
                                {r}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                        style={{ background: "rgb(var(--warning-muted))", border: "1px solid rgb(var(--warning) / 0.2)" }}>
                        <AlertTriangle size={28} style={{ color: "rgb(var(--warning))" }} />
                      </div>
                      <p className="text-subheading mb-2">Gap analysis not run yet</p>
                      <p className="text-body mb-4">Compare your skills against live market demand.</p>
                      <button onClick={runGap} className="btn-primary">
                        <BarChart2 size={14} /> Analyse Skill Gap
                      </button>
                    </div>
                  )}
                </BentoCard>
              </motion.div>

              {/* ── Live Market Data (Adzuna) ── */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
                <BentoCard>
                  <div className="flex items-center justify-between mb-5">
                    <SectionLabel icon={Globe} color="rgb(var(--info))">Live Market Data · Adzuna</SectionLabel>
                    <button onClick={fetchMarket} disabled={loadMarket} className="btn-secondary text-xs py-1.5 px-3">
                      {loadMarket ? <RefreshCw size={12} className="animate-spin" /> : <Zap size={12} />}
                      {loadMarket ? "Fetching…" : market ? "Refresh" : "Fetch Market Data"}
                    </button>
                  </div>

                  {loadMarket ? (
                    <div className="flex flex-col gap-2">{[1, 2, 3].map(i => <Skeleton key={i} height="h-8" />)}</div>
                  ) : market ? (
                    <div className="flex flex-col gap-5">
                      {/* Meta row */}
                      <div className="flex items-center gap-4 flex-wrap p-3.5 rounded-xl"
                        style={{ background: "rgb(var(--background-alt))", border: "1px solid rgb(var(--border-subtle))" }}>
                        <div>
                          <p className="text-label">Role Searched</p>
                          <p className="text-sm font-semibold" style={{ color: "rgb(var(--foreground))" }}>{market.role}</p>
                        </div>
                        <div>
                          <p className="text-label">Jobs Analysed</p>
                          <p className="text-sm font-bold" style={{ color: "rgb(var(--info))" }}>{market.jobs_analysed}</p>
                        </div>
                        {market.salary_summary?.formatted && (
                          <div>
                            <p className="text-label">Avg Salary</p>
                            <p className="text-sm font-bold" style={{ color: "rgb(var(--accent))" }}>{market.salary_summary.formatted}</p>
                          </div>
                        )}
                      </div>

                      {/* Strengths */}
                      {market.strengths.length > 0 && (
                        <div>
                          <p className="text-label mb-2.5 flex items-center gap-1.5" style={{ color: "rgb(var(--accent))" }}>
                            <CheckCircle2 size={10} /> Your Market Strengths
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {market.strengths.map(s => (
                              <span key={s} className="badge badge-accent">{s}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Top demanded skills with bar */}
                      <div>
                        <p className="text-label mb-3" style={{ color: "rgb(var(--info))" }}>
                          Top Market Skills by Demand
                        </p>
                        <div className="flex flex-col gap-2.5">
                          {market.market_skills.slice(0, 8).map((s, i) => {
                            const pct = Math.round((s.demand / (market.market_skills[0]?.demand || 1)) * 100);
                            return (
                              <div key={s.skill} className="flex items-center gap-3">
                                <span className="text-[10px] w-4 shrink-0 text-right font-mono"
                                  style={{ color: "rgb(var(--foreground-faint))" }}>{i + 1}</span>
                                <span className="text-sm w-36 shrink-0 font-medium"
                                  style={{ color: "rgb(var(--foreground))" }}>{s.skill}</span>
                                <div className="flex-1 h-2 rounded-full overflow-hidden"
                                  style={{ background: "rgb(var(--border))" }}>
                                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                                    transition={{ duration: 0.6, delay: i * 0.04 }}
                                    className="h-full rounded-full"
                                    style={{ background: "linear-gradient(90deg, rgb(var(--info)), rgb(var(--primary)))" }} />
                                </div>
                                <span className="text-[11px] font-bold w-8 text-right shrink-0"
                                  style={{ color: "rgb(var(--foreground-faint))" }}>{s.demand}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                        style={{ background: "rgb(var(--info-muted))", border: "1px solid rgb(var(--info) / 0.2)" }}>
                        <Globe size={28} style={{ color: "rgb(var(--info))" }} />
                      </div>
                      <p className="text-subheading mb-2">No market data yet</p>
                      <p className="text-body mb-4">Fetch live Adzuna job data for your target role.</p>
                      <button onClick={fetchMarket} className="btn-primary">
                        <Zap size={14} /> Fetch Live Data
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

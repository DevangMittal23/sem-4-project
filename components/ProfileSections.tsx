"use client";
import { motion } from "framer-motion";
import {
  CheckCircle2, XCircle, Brain, Sparkles, TrendingUp,
  Target, GraduationCap, Briefcase, Clock, BarChart2,
  BookOpen, Star, Award, Zap, ArrowRight, AlertCircle,
} from "lucide-react";

// ── Label helpers ─────────────────────────────────────────────────────────────

export const CODE_LABELS: Record<string, string> = {
  switch_domain: "Switch Domain", excel_current: "Excel in Current Domain",
  get_job: "Get a Job", promotion: "Promotion", side_income: "Side Income",
  student: "Student", employed: "Employed", freelance: "Freelance",
  unemployed: "Unemployed", career_break: "Career Break",
  high_school: "High School", diploma: "Diploma", bachelors: "Bachelor's",
  masters: "Master's", phd: "PhD", self_taught: "Self-taught",
  fresher: "Fresher", junior: "Junior", mid: "Mid-level", senior: "Senior", lead: "Lead / Principal",
  lt5: "< 5 hrs/week", "5_10": "5–10 hrs/week", "10_20": "10–20 hrs/week", gt20: "20+ hrs/week",
  low: "Low — Prefer stability", medium: "Medium — Balanced", high: "High — Embrace challenges",
  visual: "Visual learner", "hands-on": "Hands-on / Project-based",
  reading: "Reading / Docs", mixed: "Mixed",
};

export function lbl(val: unknown): string {
  if (!val) return "";
  if (Array.isArray(val)) return val.join(", ");
  const s = String(val);
  return CODE_LABELS[s] ?? s;
}

// ── Completion ring ───────────────────────────────────────────────────────────

export function CompletionRing({ pct }: { pct: number }) {
  const r = 38, circ = 2 * Math.PI * r;
  const color = pct >= 80 ? "#22c55e" : pct >= 50 ? "#a78bfa" : "#f59e0b";
  return (
    <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
      <svg width="96" height="96" className="-rotate-90">
        <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="7" />
        <motion.circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="7"
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (pct / 100) * circ }}
          transition={{ duration: 1.4, ease: "easeOut" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-white">{pct}%</span>
        <span className="text-[9px] text-white/40 uppercase tracking-wider">complete</span>
      </div>
    </div>
  );
}

// ── Missing field pill ────────────────────────────────────────────────────────

const FIELD_LABELS: Record<string, string> = {
  name: "Name", profession: "Profession", level: "Experience Level",
  education: "Education", status: "Current Status", availability: "Availability", goal: "Goal",
};

export function MissingPill({ field, onClick }: { field: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 hover:bg-amber-500/20 transition-colors">
      <AlertCircle size={9} />
      {FIELD_LABELS[field] ?? field} missing
    </button>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────

export function Section({ title, icon: Icon, iconColor = "text-purple-400", delay = 0, children, span2 = false }: {
  title: string; icon: React.ElementType; iconColor?: string; delay?: number; children: React.ReactNode; span2?: boolean;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`glass glow-border rounded-2xl p-5 ${span2 ? "md:col-span-2" : ""}`}>
      <p className="text-xs text-white/35 uppercase tracking-wider font-medium mb-4 flex items-center gap-2">
        <Icon size={12} className={iconColor} />{title}
      </p>
      {children}
    </motion.div>
  );
}

// ── AI Summary ────────────────────────────────────────────────────────────────

export function AISummarySection({ summary, loading }: { summary: string; loading: boolean }) {
  return (
    <Section title="AI Profile Summary" icon={Brain} iconColor="text-purple-400" delay={0.08} span2>
      {loading ? (
        <div className="flex flex-col gap-2">
          <div className="h-3 bg-white/8 rounded animate-pulse w-3/4" />
          <div className="h-3 bg-white/8 rounded animate-pulse w-full" />
          <div className="h-3 bg-white/8 rounded animate-pulse w-2/3" />
        </div>
      ) : summary ? (
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles size={14} className="text-purple-400" />
          </div>
          <p className="text-sm text-white/70 leading-relaxed">{summary}</p>
        </div>
      ) : (
        <p className="text-sm text-white/30 italic">Complete your profile to generate your AI summary.</p>
      )}
    </Section>
  );
}

// ── Background section ────────────────────────────────────────────────────────

function InfoRow({ icon: Icon, label, value, color = "text-purple-400" }: {
  icon: React.ElementType; label: string; value: string; color?: string;
}) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/6">
      <Icon size={14} className={color} />
      <div>
        <p className="text-[10px] text-white/35 uppercase tracking-wider">{label}</p>
        <p className="text-sm text-white/80">{value}</p>
      </div>
    </div>
  );
}

export function BackgroundSection({ education, status, level, years, delay }: {
  education: string; status: string; level: string; years: string; delay: number;
}) {
  const hasAny = education || status || level || years;
  return (
    <Section title="Background" icon={GraduationCap} iconColor="text-blue-400" delay={delay}>
      {hasAny ? (
        <div className="grid grid-cols-2 gap-2">
          <InfoRow icon={GraduationCap} label="Education" value={lbl(education)} color="text-blue-400" />
          <InfoRow icon={Briefcase} label="Status" value={lbl(status)} color="text-green-400" />
          <InfoRow icon={TrendingUp} label="Level" value={lbl(level)} color="text-purple-400" />
          <InfoRow icon={Star} label="Experience" value={years ? `${years} years` : ""} color="text-amber-400" />
        </div>
      ) : (
        <p className="text-sm text-white/30 italic">No background info yet.</p>
      )}
    </Section>
  );
}

// ── Behavioral Profile ────────────────────────────────────────────────────────

export function BehavioralSection({ thinkingStyle, learningStyle, interests, delay }: {
  thinkingStyle: string; learningStyle: string; interests: string[]; delay: number;
}) {
  const hasAny = thinkingStyle || learningStyle || interests.length > 0;
  return (
    <Section title="Behavioral Profile" icon={Brain} iconColor="text-pink-400" delay={delay}>
      {hasAny ? (
        <div className="flex flex-col gap-4">
          {thinkingStyle && (
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Thinking Style</p>
              <span className="text-xs px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300">{thinkingStyle}</span>
            </div>
          )}
          {learningStyle && (
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <BookOpen size={9} /> Learning Style
              </p>
              <span className="text-xs px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300">{lbl(learningStyle)}</span>
            </div>
          )}
          {interests.length > 0 && (
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Interests</p>
              <div className="flex flex-wrap gap-1.5">
                {interests.map((i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-white/50">{i}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-white/30 italic">Complete the assessment to populate your behavioral profile.</p>
      )}
    </Section>
  );
}

// ── Skills section ────────────────────────────────────────────────────────────

function SkillBar({ skill, level }: { skill: string; level?: string }) {
  const pct = level === "expert" ? 90 : level === "advanced" ? 75 : level === "intermediate" ? 55 : 35;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-white/70 w-28 shrink-0 truncate">{skill}</span>
      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500" />
      </div>
      {level && <span className="text-[10px] text-white/30 w-20 shrink-0">{level}</span>}
    </div>
  );
}

export function SkillsSection({ skills, skillLevels, certifications, delay }: {
  skills: string[]; skillLevels: Record<string, string>; certifications: string[]; delay: number;
}) {
  if (skills.length === 0) return null;
  return (
    <Section title="Skills Assessment" icon={BarChart2} iconColor="text-purple-400" delay={delay} span2>
      <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
        {skills.map((s) => <SkillBar key={s} skill={s} level={skillLevels[s]} />)}
      </div>
      {certifications.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Award size={9} /> Certifications
          </p>
          <div className="flex flex-wrap gap-1.5">
            {certifications.map((c) => (
              <span key={c} className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300">{c}</span>
            ))}
          </div>
        </div>
      )}
    </Section>
  );
}

// ── Skill Gap section ─────────────────────────────────────────────────────────

interface GapSkill { skill: string; priority: string; estimated_weeks: number; reason: string; }

const PRIORITY_COLOR: Record<string, string> = {
  critical: "text-red-400 bg-red-500/10 border-red-500/20",
  high: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  medium: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  low: "text-green-400 bg-green-500/10 border-green-500/20",
};

export function SkillGapSection({ userSkills, gapSkills, loading, delay }: {
  userSkills: string[]; gapSkills: GapSkill[]; loading: boolean; delay: number;
}) {
  return (
    <Section title="Skill Gap Analysis" icon={Target} iconColor="text-amber-400" delay={delay} span2>
      {loading ? (
        <div className="flex flex-col gap-2">
          {[1,2,3,4].map(i => <div key={i} className="h-8 bg-white/5 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {/* Strengths */}
          <div>
            <p className="text-[10px] text-green-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle2 size={9} /> Your Strengths
            </p>
            <div className="flex flex-col gap-1.5">
              {userSkills.length > 0 ? userSkills.slice(0, 6).map((s) => (
                <div key={s} className="flex items-center gap-2 text-xs text-white/70">
                  <CheckCircle2 size={12} className="text-green-400 shrink-0" />{s}
                </div>
              )) : <p className="text-xs text-white/25 italic">No skills mapped yet.</p>}
            </div>
          </div>
          {/* Gaps */}
          <div>
            <p className="text-[10px] text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <XCircle size={9} /> Missing Skills
            </p>
            <div className="flex flex-col gap-1.5">
              {gapSkills.length > 0 ? gapSkills.slice(0, 6).map((g) => (
                <div key={g.skill} className="flex items-center gap-2">
                  <XCircle size={12} className="text-red-400 shrink-0" />
                  <span className="text-xs text-white/70 flex-1">{g.skill}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${PRIORITY_COLOR[g.priority] ?? PRIORITY_COLOR.medium}`}>
                    {g.priority}
                  </span>
                </div>
              )) : <p className="text-xs text-white/25 italic">Run skill gap analysis to see gaps.</p>}
            </div>
          </div>
        </div>
      )}
    </Section>
  );
}

// ── Career Direction section ──────────────────────────────────────────────────

export function CareerDirectionSection({ careers, goalCode, targetRole, delay }: {
  careers: { id: number; title: string; description: string; required_skills: string[]; match_score: number }[];
  goalCode: string; targetRole: string; delay: number;
}) {
  const top = careers[0];
  return (
    <Section title="Career Direction" icon={TrendingUp} iconColor="text-green-400" delay={delay} span2>
      {/* Goal badge */}
      {goalCode && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/6 mb-3">
          <Target size={14} className="text-purple-400 shrink-0" />
          <div>
            <p className="text-[10px] text-white/35 uppercase tracking-wider">Primary Goal</p>
            <p className="text-sm text-white/80">{lbl(goalCode)}</p>
          </div>
          {targetRole && (
            <>
              <ArrowRight size={12} className="text-white/20 shrink-0" />
              <div>
                <p className="text-[10px] text-white/35 uppercase tracking-wider">Target Role</p>
                <p className="text-sm text-white/80">{targetRole}</p>
              </div>
            </>
          )}
        </div>
      )}
      {/* Top career recommendation */}
      {top ? (
        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-600/10 to-blue-600/8 border border-purple-500/20">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-sm font-semibold text-white">{top.title}</p>
              <span className="text-[10px] text-amber-400 flex items-center gap-1 mt-0.5">
                <Star size={9} /> Top AI Recommendation
              </span>
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
              top.match_score >= 80 ? "text-green-400 bg-green-500/10 border-green-500/20"
              : "text-amber-400 bg-amber-500/10 border-amber-500/20"
            }`}>{top.match_score}% fit</span>
          </div>
          <p className="text-xs text-white/50 leading-relaxed mb-3">{top.description}</p>
          {top.required_skills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {top.required_skills.slice(0, 5).map((s) => (
                <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/35">{s}</span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-white/2 border border-white/6 text-center">
          <TrendingUp size={24} className="text-white/15 mx-auto mb-2" />
          <p className="text-xs text-white/30">Go to <span className="text-purple-400">AI Intelligence</span> to generate career predictions.</p>
        </div>
      )}
      {/* Other paths */}
      {careers.length > 1 && (
        <div className="flex flex-col gap-2 mt-3">
          {careers.slice(1, 3).map((c) => (
            <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/2 border border-white/5">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white/70">{c.title}</p>
              </div>
              <span className="text-[10px] text-white/40 shrink-0">{c.match_score}% fit</span>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

// ── Availability bar ──────────────────────────────────────────────────────────

export function AvailabilitySection({ availability, riskTolerance, delay }: {
  availability: string; riskTolerance: string; delay: number;
}) {
  const avMap: Record<string, number> = { lt5: 15, "5_10": 40, "10_20": 70, gt20: 100 };
  const riskSteps = ["low", "medium", "high"];
  const riskIdx = riskSteps.indexOf(riskTolerance);
  const riskColors = ["bg-green-500", "bg-amber-500", "bg-red-500"];

  return (
    <Section title="Availability & Risk" icon={Clock} iconColor="text-blue-400" delay={delay}>
      <div className="flex flex-col gap-5">
        {availability && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] text-white/30 uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={9} /> Weekly Availability
              </p>
              <span className="text-xs text-blue-400">{lbl(availability)}</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${avMap[availability] ?? 0}%` }}
                transition={{ duration: 0.8 }} className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" />
            </div>
          </div>
        )}
        {riskTolerance && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] text-white/30 uppercase tracking-wider">Risk Tolerance</p>
              <span className={`text-xs font-medium ${riskTolerance === "high" ? "text-red-400" : riskTolerance === "medium" ? "text-amber-400" : "text-green-400"}`}>
                {lbl(riskTolerance)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {riskSteps.map((s, i) => (
                <div key={s} className={`h-2 flex-1 rounded-full transition-all ${i <= riskIdx ? riskColors[riskIdx] : "bg-white/8"}`} />
              ))}
            </div>
          </div>
        )}
        {!availability && !riskTolerance && (
          <p className="text-sm text-white/30 italic">Complete the assessment to fill this section.</p>
        )}
        <div className="pt-3 border-t border-white/5">
          <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles size={9} className="text-purple-400" /> Mentor Readiness
          </p>
          {[
            { label: "Profile 80%+ complete", check: "completion" },
            { label: "Goal defined", check: "goal" },
            { label: "Availability set", check: "availability" },
            { label: "Risk assessed", check: "risk" },
          ].map(({ label }) => (
            <div key={label} className="flex items-center gap-2 mb-1.5">
              <Zap size={10} className="text-purple-400/50 shrink-0" />
              <span className="text-xs text-white/40">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

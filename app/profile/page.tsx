"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useProfile, REQUIRED_FIELDS, ProfileData } from "@/lib/profileContext";
import Sidebar from "@/components/Sidebar";
import ProfileChatbot from "@/components/ProfileChatbot";
import {
  CheckCircle2, AlertCircle, Sparkles, Bot, ChevronDown, ChevronUp,
  User, Briefcase, GraduationCap, Target, Clock, Brain, TrendingUp,
  Shield, Zap, BookOpen, Star, Award, Globe, ArrowRight, BarChart2,
} from "lucide-react";
import { apiGetProfile } from "@/lib/api";

const CODE_LABELS: Record<string, string> = {
  switch_domain: "Switch Domain", excel_current: "Excel in Current Domain",
  get_job: "Get a Job", promotion: "Promotion", side_income: "Side Income",
  student: "Student", employed: "Employed", freelance: "Freelance",
  unemployed: "Unemployed", career_break: "Career Break",
  high_school: "High School", diploma: "Diploma", bachelors: "Bachelor's",
  masters: "Master's", phd: "PhD", self_taught: "Self-taught",
  fresher: "Fresher", junior: "Junior", mid: "Mid-level", senior: "Senior", lead: "Lead / Principal",
  lt5: "< 5 hrs/week", "5_10": "5–10 hrs/week", "10_20": "10–20 hrs/week", gt20: "20+ hrs/week",
  low: "Low — Prefer stability", medium: "Medium — Balanced", high: "High — Embrace challenges",
  visual: "Visual learner", "hands-on": "Hands-on / Project-based", reading: "Reading / Docs", mixed: "Mixed",
};

function label(val: unknown): string {
  if (!val) return "";
  if (Array.isArray(val)) return val.join(", ");
  const s = String(val);
  return CODE_LABELS[s] ?? s;
}

function CompletionRing({ pct }: { pct: number }) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const color = pct >= 80 ? "#22c55e" : pct >= 50 ? "#a78bfa" : "#f59e0b";
  return (
    <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
      <svg width="96" height="96" className="-rotate-90">
        <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        <motion.circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (pct / 100) * circ }}
          transition={{ duration: 1.2, ease: "easeOut" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-white">{pct}%</span>
        <span className="text-[9px] text-white/40 uppercase tracking-wider">complete</span>
      </div>
    </div>
  );
}

function StatPill({ icon: Icon, label, value, color = "text-purple-400" }: {
  icon: React.ElementType; label: string; value: string; color?: string;
}) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/3 border border-white/6">
      <Icon size={14} className={color} />
      <div className="min-w-0">
        <p className="text-[10px] text-white/35 uppercase tracking-wider">{label}</p>
        <p className="text-sm text-white/80 truncate">{value}</p>
      </div>
    </div>
  );
}

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

function GoalBadge({ goal }: { goal: string }) {
  const config: Record<string, { color: string; bg: string; border: string; icon: React.ElementType; desc: string }> = {
    switch_domain: { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/25", icon: ArrowRight, desc: "Transitioning to a new field" },
    excel_current: { color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/25", icon: TrendingUp, desc: "Growing in current domain" },
    get_job: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/25", icon: Briefcase, desc: "Seeking employment" },
    promotion: { color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/25", icon: Star, desc: "Aiming for a higher role" },
    side_income: { color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/25", icon: Zap, desc: "Building additional income stream" },
  };
  const c = config[goal] ?? { color: "text-white/50", bg: "bg-white/5", border: "border-white/10", icon: Target, desc: "" };
  const Icon = c.icon;
  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl border ${c.bg} ${c.border}`}>
      <div className={`w-9 h-9 rounded-lg ${c.bg} border ${c.border} flex items-center justify-center shrink-0`}>
        <Icon size={16} className={c.color} />
      </div>
      <div>
        <p className={`text-sm font-semibold ${c.color}`}>{label(goal)}</p>
        <p className="text-xs text-white/40">{c.desc}</p>
      </div>
    </div>
  );
}

function RiskMeter({ level }: { level: string }) {
  const steps = ["low", "medium", "high"];
  const idx = steps.indexOf(level);
  const colors = ["bg-green-500", "bg-amber-500", "bg-red-500"];
  return (
    <div className="flex items-center gap-1.5">
      {steps.map((s, i) => (
        <div key={s} className={`h-2 flex-1 rounded-full transition-all ${i <= idx ? colors[idx] : "bg-white/8"}`} />
      ))}
    </div>
  );
}

function AvailabilityBar({ code }: { code: string }) {
  const map: Record<string, number> = { lt5: 15, "5_10": 40, "10_20": 70, gt20: 100 };
  const pct = map[code] ?? 0;
  return (
    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8 }} className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" />
    </div>
  );
}

export default function ProfilePage() {
  const { profile, completion, isGated, updateProfile } = useProfile();
  const [chatDone, setChatDone] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [apiProfile, setApiProfile] = useState<ReturnType<typeof Object.assign> | null>(null);

  // Fetch full profile from backend to get rich fields
  useEffect(() => {
    apiGetProfile().then((p) => {
      setApiProfile(p);
      // Sync rich fields into context
      updateProfile({
        thinking_style: p.thinking_style || "",
        interests: p.interests || [],
        skill_levels: p.skill_levels || {},
        certifications: p.certifications || [],
        target_role: p.target_role || "",
        risk_tolerance: p.risk_tolerance || "",
        learning_style: p.learning_style || "",
        side_income_type: p.side_income_type || "",
        experience_years: p.experience_years || "",
        backend_completion: p.profile_completion,
      });
    }).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const missing = REQUIRED_FIELDS.filter((f: keyof ProfileData) => {
    const v = profile[f];
    return Array.isArray(v) ? v.length === 0 : String(v ?? "").trim() === "";
  });

  // Use apiProfile for rich fields, fall back to context
  const ap = apiProfile;
  const skillLevels: Record<string, string> = ap?.skill_levels || profile.skill_levels || {};
  const skills: string[] = ap?.skills || profile.skills || [];
  const certifications: string[] = ap?.certifications || profile.certifications || [];
  const interests: string[] = ap?.interests || profile.interests || [];
  const thinkingStyle = ap?.thinking_style || profile.thinking_style || "";
  const targetRole = ap?.target_role || profile.target_role || "";
  const riskTolerance = ap?.risk_tolerance || profile.risk_tolerance || "";
  const learningStyle = ap?.learning_style || profile.learning_style || "";
  const sideIncomeType = ap?.side_income_type || profile.side_income_type || "";
  const experienceYears = ap?.experience_years || profile.experience_years || "";

  const displayName = profile.name || ap?.name || "—";
  const goalCode = profile.goal || ap?.goal || "";

  return (
    <div className="flex min-h-screen bg-[#050508]">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="fixed top-0 right-0 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 py-8">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-1">Career Profile</h1>
            <p className="text-sm text-white/40">
              {isGated ? "Complete your profile to unlock all features." : "Your full mentor-view profile — everything your AI needs to guide you."}
            </p>
          </motion.div>

          {/* ── Header card ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="glass glow-border rounded-2xl p-6 mb-5">
            <div className="flex items-start gap-5 flex-wrap">
              <CompletionRing pct={completion} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h2 className="text-xl font-bold text-white">{displayName}</h2>
                  {completion >= 80 && <CheckCircle2 size={16} className="text-green-400" />}
                </div>
                <p className="text-sm text-white/50 mb-1">
                  {label(profile.level || ap?.experience_level)} {profile.profession || ap?.profession ? `· ${profile.profession || ap?.profession}` : ""}
                  {experienceYears ? ` · ${experienceYears} yrs exp` : ""}
                </p>
                {profile.bio || ap?.bio ? (
                  <p className="text-xs text-white/40 leading-relaxed max-w-lg">{profile.bio || ap?.bio}</p>
                ) : null}
                {missing.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {missing.map((f) => (
                      <span key={f as string} className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
                        {String(f)} missing
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {(profile.linkedin || ap?.linkedin) && (
                <a href={profile.linkedin || ap?.linkedin} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors shrink-0">
                  <Globe size={13} /> LinkedIn
                </a>
              )}
            </div>
          </motion.div>

          {/* ── AI Chatbot (shown when incomplete) ── */}
          <AnimatePresence>
            {(isGated || (!chatDone && missing.length > 0)) && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }} transition={{ delay: 0.08 }}
                className="glass glow-border rounded-2xl overflow-hidden mb-5">
                <button onClick={() => setShowChat((p) => !p)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/3 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-600/30 border border-purple-500/30 flex items-center justify-center">
                      <Bot size={15} className="text-purple-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-white">AI Profile Assistant</p>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-xs text-white/40">
                          {missing.length > 0 ? `${missing.length} fields to complete` : "Collecting goal details"}
                        </span>
                      </div>
                    </div>
                  </div>
                  {showChat ? <ChevronUp size={15} className="text-white/40" /> : <ChevronDown size={15} className="text-white/40" />}
                </button>
                <AnimatePresence>
                  {showChat && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 420 }} exit={{ height: 0 }}
                      className="overflow-hidden border-t border-white/5">
                      <ProfileChatbot onComplete={() => { setChatDone(true); setShowChat(false); }} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Main grid ── */}
          <div className="grid md:grid-cols-2 gap-4">

            {/* Career Goal */}
            {goalCode && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }} className="glass glow-border rounded-2xl p-5">
                <p className="text-xs text-white/35 uppercase tracking-wider font-medium mb-3 flex items-center gap-2">
                  <Target size={12} className="text-purple-400" /> Career Goal
                </p>
                <GoalBadge goal={goalCode} />
                {targetRole && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-white/60">
                    <ArrowRight size={13} className="text-purple-400 shrink-0" />
                    <span>Target: <span className="text-white/80 font-medium">{targetRole}</span></span>
                  </div>
                )}
                {sideIncomeType && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-white/60">
                    <Zap size={13} className="text-cyan-400 shrink-0" />
                    <span>Via: <span className="text-white/80 font-medium">{sideIncomeType}</span></span>
                  </div>
                )}
              </motion.div>
            )}

            {/* Background */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }} className="glass glow-border rounded-2xl p-5">
              <p className="text-xs text-white/35 uppercase tracking-wider font-medium mb-3 flex items-center gap-2">
                <User size={12} className="text-purple-400" /> Background
              </p>
              <div className="grid grid-cols-2 gap-2">
                <StatPill icon={GraduationCap} label="Education" value={label(profile.education || ap?.education)} color="text-blue-400" />
                <StatPill icon={Briefcase} label="Status" value={label(profile.status || ap?.current_status)} color="text-green-400" />
                <StatPill icon={TrendingUp} label="Level" value={label(profile.level || ap?.experience_level)} color="text-purple-400" />
                <StatPill icon={Star} label="Experience" value={experienceYears ? `${experienceYears} years` : ""} color="text-amber-400" />
              </div>
            </motion.div>

            {/* Skills */}
            {skills.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.14 }} className="glass glow-border rounded-2xl p-5 md:col-span-2">
                <p className="text-xs text-white/35 uppercase tracking-wider font-medium mb-4 flex items-center gap-2">
                  <BarChart2 size={12} className="text-purple-400" /> Skills Assessment
                </p>
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
                  {skills.map((s) => (
                    <SkillBar key={s} skill={s} level={skillLevels[s]} />
                  ))}
                </div>
                {certifications.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Award size={10} /> Certifications
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {certifications.map((c) => (
                        <span key={c} className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300">{c}</span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Behavioral & Learning Profile */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }} className="glass glow-border rounded-2xl p-5">
              <p className="text-xs text-white/35 uppercase tracking-wider font-medium mb-4 flex items-center gap-2">
                <Brain size={12} className="text-purple-400" /> Behavioral Profile
              </p>
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
                      <BookOpen size={10} /> Learning Style
                    </p>
                    <span className="text-xs px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300">{label(learningStyle)}</span>
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
            </motion.div>

            {/* Risk & Availability */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }} className="glass glow-border rounded-2xl p-5">
              <p className="text-xs text-white/35 uppercase tracking-wider font-medium mb-4 flex items-center gap-2">
                <Shield size={12} className="text-purple-400" /> Risk & Availability
              </p>
              <div className="flex flex-col gap-5">
                {riskTolerance && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] text-white/30 uppercase tracking-wider">Risk Tolerance</p>
                      <span className={`text-xs font-medium ${riskTolerance === "high" ? "text-red-400" : riskTolerance === "medium" ? "text-amber-400" : "text-green-400"}`}>
                        {label(riskTolerance)}
                      </span>
                    </div>
                    <RiskMeter level={riskTolerance} />
                  </div>
                )}
                {(profile.availability || ap?.availability) && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] text-white/30 uppercase tracking-wider flex items-center gap-1.5">
                        <Clock size={10} /> Weekly Availability
                      </p>
                      <span className="text-xs text-blue-400">{label(profile.availability || ap?.availability)}</span>
                    </div>
                    <AvailabilityBar code={profile.availability || ap?.availability} />
                  </div>
                )}
                {/* Mentor readiness summary */}
                <div className="pt-3 border-t border-white/5">
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sparkles size={10} className="text-purple-400" /> Mentor Readiness
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {[
                      { label: "Profile complete", done: completion >= 80 },
                      { label: "Goal defined", done: !!goalCode },
                      { label: "Skills mapped", done: skills.length > 0 },
                      { label: "Risk assessed", done: !!riskTolerance },
                      { label: "Learning style set", done: !!learningStyle },
                    ].map(({ label: l, done }) => (
                      <div key={l} className="flex items-center gap-2">
                        {done
                          ? <CheckCircle2 size={12} className="text-green-400 shrink-0" />
                          : <AlertCircle size={12} className="text-white/20 shrink-0" />}
                        <span className={`text-xs ${done ? "text-white/60" : "text-white/25"}`}>{l}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

          </div>

          {/* ── Unlock banner ── */}
          <AnimatePresence>
            {!isGated && (
              <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                className="glass border border-green-500/30 rounded-2xl p-5 mt-5 flex items-center gap-4">
                <CheckCircle2 size={22} className="text-green-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">All features unlocked</p>
                  <p className="text-xs text-white/40 mt-0.5">Roadmap, Weekly Tasks & Progress tracking are active.</p>
                </div>
                <a href="/dashboard/roadmap" className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors shrink-0">
                  View Roadmap <ArrowRight size={12} />
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

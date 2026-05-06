"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import Sidebar from "@/components/Sidebar";
import ProfileChatbot from "@/components/ProfileChatbot";
import {
  CheckCircle2, AlertCircle, Bot, ChevronDown, ChevronUp,
  User, Briefcase, GraduationCap, Target, Clock, Brain, TrendingUp,
  Shield, Zap, BookOpen, Star, Award, Globe, ArrowRight, BarChart3, XCircle,
} from "lucide-react";
import {
  apiGetProfile, apiGetSkillGap, apiGetCareers,
  getAccessToken, ApiProfile, SkillGapData, CareerPathResult,
} from "@/lib/api";

const REQUIRED = ["name","profession","experience_level","education","current_status","availability","goal"] as const;
const FIELD_LABELS: Record<string, { label: string; icon: React.ElementType }> = {
  name: { label: "Full Name", icon: User },
  profession: { label: "Profession", icon: Briefcase },
  experience_level: { label: "Experience Level", icon: TrendingUp },
  education: { label: "Education", icon: GraduationCap },
  current_status: { label: "Current Status", icon: Shield },
  availability: { label: "Availability", icon: Clock },
  goal: { label: "Career Goal", icon: Target },
};

const CODE_LABELS: Record<string, string> = {
  switch_domain:"Switch Domain", excel_current:"Excel in Current Domain",
  get_job:"Get a Job", promotion:"Promotion", side_income:"Side Income",
  student:"Student", employed:"Employed", freelance:"Freelance",
  unemployed:"Unemployed", career_break:"Career Break",
  high_school:"High School", diploma:"Diploma", bachelors:"Bachelor's",
  masters:"Master's", phd:"PhD", self_taught:"Self-taught",
  fresher:"Fresher", junior:"Junior", mid:"Mid-level", senior:"Senior", lead:"Lead / Principal",
  lt5:"< 5 hrs/week", "5_10":"5–10 hrs/week", "10_20":"10–20 hrs/week", gt20:"20+ hrs/week",
  low:"Low — Stable", medium:"Medium — Balanced", high:"High — Embrace risk",
  visual:"Visual learner", "hands-on":"Hands-on / Project-based", reading:"Reading / Docs", mixed:"Mixed",
};
const lbl = (v: unknown) => { if (!v) return ""; const s = String(v); return CODE_LABELS[s] ?? s; };

/* ── Shared section card ─────────────────────────────────────── */
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl p-5 ${className}`}
      style={{
        background: "rgb(var(--surface))",
        border: "1px solid rgb(var(--border-strong))",
        boxShadow: "var(--shadow-sm)",
      }}>
      {children}
    </div>
  );
}

/* ── Section label ───────────────────────────────────────────── */
function SLabel({ icon: Icon, text, color }: { icon: React.ElementType; text: string; color?: string }) {
  return (
    <p className="text-label flex items-center gap-2 mb-4"
      style={{ color: color || "rgb(var(--primary))" }}>
      <Icon size={11} /> {text}
    </p>
  );
}

/* ── Info tile ───────────────────────────────────────────────── */
function Tile({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
  if (!value) return null;
  return (
    <div className="p-3.5 rounded-xl flex flex-col gap-1.5"
      style={{ background: "rgb(var(--background-alt))", border: "1px solid rgb(var(--border))" }}>
      <div className="w-7 h-7 rounded-lg flex items-center justify-center"
        style={{ background: `${color.replace(")", " / 0.12)")}`, border: `1px solid ${color.replace(")", " / 0.2)")}` }}>
        <Icon size={13} style={{ color }} />
      </div>
      <p className="text-[10px] font-semibold uppercase tracking-wider"
        style={{ color: "rgb(var(--foreground-faint))" }}>{label}</p>
      <p className="text-sm font-bold" style={{ color: "rgb(var(--foreground))" }}>{value}</p>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { profile: storeProfile, completion, isGated } = useStore();
  const [ap, setAp]       = useState<ApiProfile | null>(null);
  const [gap, setGap]     = useState<SkillGapData | null>(null);
  const [careers, setCareers] = useState<CareerPathResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [chatDone, setChatDone] = useState(false);

  useEffect(() => {
    if (!getAccessToken()) { router.replace("/login"); return; }
    Promise.all([
      apiGetProfile().then(setAp).catch(() => {}),
      apiGetSkillGap().then(setGap).catch(() => {}),
      apiGetCareers().then(setCareers).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []); // eslint-disable-line

  const handleChatComplete = async () => {
    setChatDone(true); setShowChat(false);
    try { setAp(await apiGetProfile()); } catch {}
  };

  const p = ap;
  const comp = p?.profile_completion ?? completion;
  const missing = REQUIRED.filter(f => { const v = p?.[f]; return !v || String(v).trim() === ""; });
  const filled  = REQUIRED.filter(f => { const v = p?.[f]; return v && String(v).trim() !== ""; });
  const skills: string[] = p?.skills ?? [];
  const skillLevels = p?.skill_levels ?? {};
  const topCareer = careers[0];
  const initials  = (p?.name || storeProfile?.username || "U").charAt(0).toUpperCase();
  const compColor = comp >= 80 ? "rgb(var(--accent))" : "rgb(var(--warning))";

  const summary = (() => {
    if (!p?.name) return "";
    let s = `${p.name} is a ${lbl(p.experience_level) || ""} ${p.profession || "professional"}`;
    if (p.goal) s += ` ${p.goal === "get_job" ? "seeking employment" : p.goal === "promotion" ? "aiming for promotion" : p.goal === "switch_domain" ? "transitioning domains" : "growing in their field"}`;
    if (p.target_role) s += ` targeting ${p.target_role}`;
    s += ".";
    if (skills.length) s += ` Core strengths: ${skills.slice(0, 3).join(", ")}.`;
    if (gap?.gap_skills?.length) s += ` Priority gaps: ${gap.gap_skills.slice(0, 2).map(g => g.skill).join(", ")}.`;
    return s;
  })();

  return (
    <div className="flex min-h-screen" style={{ background: "rgb(var(--background))" }}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-7">
            <p className="text-label mb-1 flex items-center gap-1.5" style={{ color: "rgb(var(--primary))" }}>
              <User size={11} /> Career Profile
            </p>
            <h1 className="text-display">Your Profile</h1>
            <p className="text-body mt-1">
              {isGated ? "Complete your profile to unlock all AI features." : "Your AI mentor profile — everything is real and dynamic."}
            </p>
          </motion.div>

          {/* ── Hero card ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card className="mb-5">
              <div className="flex items-start gap-6 flex-wrap">

                {/* Avatar + ring */}
                <div className="relative shrink-0">
                  {/* Progress ring */}
                  <svg width={96} height={96} className="-rotate-90 absolute inset-0">
                    <circle cx={48} cy={48} r={42} fill="none" stroke="rgb(var(--border))" strokeWidth={5} />
                    <motion.circle cx={48} cy={48} r={42} fill="none"
                      stroke={compColor} strokeWidth={5} strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 42}
                      initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - comp / 100) }}
                      transition={{ duration: 1.2, ease: "easeOut" }} />
                  </svg>
                  {/* Avatar */}
                  <div className="w-24 h-24 rounded-full flex items-center justify-center text-2xl font-black relative z-10 m-0"
                    style={{
                      background: "rgb(var(--primary) / 0.14)",
                      border: "3px solid rgb(var(--primary) / 0.25)",
                      color: "rgb(var(--primary))",
                    }}>
                    {initials}
                  </div>
                  {/* % badge */}
                  <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[10px] font-black z-20"
                    style={{ background: compColor, color: "white" }}>
                    {comp}%
                  </div>
                </div>

                {/* Name + fields */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-heading text-xl">{p?.name || storeProfile?.username || "—"}</h2>
                    {comp >= 80 && <CheckCircle2 size={16} style={{ color: "rgb(var(--accent))" }} />}
                  </div>
                  <p className="text-caption mb-1">
                    {lbl(p?.experience_level)}{p?.profession ? ` · ${p.profession}` : ""}
                    {p?.experience_years ? ` · ${p.experience_years} yrs exp` : ""}
                  </p>
                  {p?.target_role && (
                    <p className="text-xs font-semibold mb-3" style={{ color: "rgb(var(--primary))" }}>
                      → Targeting: {p.target_role}
                    </p>
                  )}

                  {/* Field audit chips */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {filled.map(f => {
                      const cfg = FIELD_LABELS[f];
                      return (
                        <span key={f} className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full font-semibold"
                          style={{ background: "rgb(var(--accent) / 0.10)", color: "rgb(var(--accent))", border: "1px solid rgb(var(--accent) / 0.22)" }}>
                          <CheckCircle2 size={9} />{cfg?.label}
                        </span>
                      );
                    })}
                    {missing.map(f => {
                      const cfg = FIELD_LABELS[f];
                      return (
                        <button key={f} onClick={() => setShowChat(true)}
                          className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full font-semibold transition-all hover:scale-105"
                          style={{ background: "rgb(var(--warning) / 0.12)", color: "rgb(var(--warning))", border: "1px solid rgb(var(--warning) / 0.28)" }}>
                          <AlertCircle size={9} />{cfg?.label} missing
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* LinkedIn + complete CTA */}
                <div className="flex flex-col gap-2 shrink-0">
                  {p?.linkedin && (
                    <a href={p.linkedin} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:scale-105"
                      style={{ background: "rgb(var(--primary) / 0.10)", color: "rgb(var(--primary))", border: "1px solid rgb(var(--primary-border))" }}>
                      <Globe size={12} /> LinkedIn
                    </a>
                  )}
                  {missing.length > 0 && (
                    <button onClick={() => setShowChat(p2 => !p2)}
                      className="btn-primary text-xs py-1.5 px-3">
                      <Bot size={12} /> {showChat ? "Close AI" : "Complete Profile"}
                    </button>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* ── AI Chat accordion ── */}
          <AnimatePresence>
            {(isGated || (!chatDone && missing.length > 0)) && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }} className="mb-5">
                <Card className="overflow-hidden !p-0">
                  <button onClick={() => setShowChat(p2 => !p2)}
                    className="w-full flex items-center justify-between px-5 py-4 transition-colors hover:bg-[rgb(var(--primary)/0.03)]"
                    style={{ borderBottom: showChat ? "1px solid rgb(var(--border))" : "none" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: "rgb(var(--primary) / 0.12)", border: "1px solid rgb(var(--primary-border))" }}>
                        <Bot size={16} style={{ color: "rgb(var(--primary))" }} />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold" style={{ color: "rgb(var(--foreground))" }}>AI Profile Assistant</p>
                        <p className="text-[11px]" style={{ color: "rgb(var(--foreground-muted))" }}>
                          {missing.length} field{missing.length !== 1 ? "s" : ""} missing — click to complete with AI
                        </p>
                      </div>
                    </div>
                    {showChat
                      ? <ChevronUp size={15} style={{ color: "rgb(var(--foreground-faint))" }} />
                      : <ChevronDown size={15} style={{ color: "rgb(var(--foreground-faint))" }} />}
                  </button>
                  <AnimatePresence>
                    {showChat && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 420 }} exit={{ height: 0 }}
                        className="overflow-hidden">
                        <ProfileChatbot onComplete={handleChatComplete} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── AI Summary ── */}
          {summary && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
              className="mb-5">
              <Card>
                <SLabel icon={Brain} text="AI Profile Summary" color="rgb(var(--primary))" />
                <div className="flex gap-3 items-start p-4 rounded-xl"
                  style={{ background: "rgb(var(--primary) / 0.05)", border: "1px solid rgb(var(--primary-border))" }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "rgb(var(--primary) / 0.12)", border: "1px solid rgb(var(--primary-border))" }}>
                    <Zap size={14} style={{ color: "rgb(var(--primary))" }} />
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "rgb(var(--foreground))" }}>{summary}</p>
                </div>
              </Card>
            </motion.div>
          )}

          {/* ── 2-col grid ── */}
          <div className="grid md:grid-cols-2 gap-4">

            {/* Background */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.10 }}>
              <Card>
                <SLabel icon={GraduationCap} text="Background" color="rgb(var(--primary))" />
                <div className="grid grid-cols-2 gap-2.5">
                  <Tile icon={GraduationCap} label="Education"   value={lbl(p?.education)}        color="rgb(var(--primary))" />
                  <Tile icon={Briefcase}     label="Status"      value={lbl(p?.current_status)}   color="rgb(var(--accent))" />
                  <Tile icon={TrendingUp}    label="Level"       value={lbl(p?.experience_level)} color="rgb(var(--primary))" />
                  <Tile icon={Star}          label="Experience"  value={p?.experience_years ? `${p.experience_years} yrs` : ""} color="rgb(var(--warning))" />
                </div>
              </Card>
            </motion.div>

            {/* Behavioral */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
              <Card>
                <SLabel icon={Brain} text="Behavioral Profile" color="rgb(var(--primary))" />
                {(p?.thinking_style || p?.learning_style) ? (
                  <div className="flex flex-col gap-4">
                    {p?.thinking_style && (
                      <div>
                        <p className="text-label mb-2">Thinking Style</p>
                        <span className="badge badge-primary">{p.thinking_style}</span>
                      </div>
                    )}
                    {p?.learning_style && (
                      <div>
                        <p className="text-label mb-2 flex items-center gap-1"><BookOpen size={9} />Learning Style</p>
                        <span className="badge badge-accent">{lbl(p.learning_style)}</span>
                      </div>
                    )}
                    {p?.interests && p.interests.length > 0 && (
                      <div>
                        <p className="text-label mb-2">Interests</p>
                        <div className="flex flex-wrap gap-1.5">
                          {p.interests.map(i => (
                            <span key={i} className="badge"
                              style={{ background: "rgb(var(--background-alt))", color: "rgb(var(--foreground-muted))", border: "1px solid rgb(var(--border))" }}>
                              {i}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-caption italic">Complete the assessment to populate this section.</p>
                )}
              </Card>
            </motion.div>

            {/* Skills */}
            {skills.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
                className="md:col-span-2">
                <Card>
                  <SLabel icon={BarChart3} text="Skills Assessment" color="rgb(var(--primary))" />
                  <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
                    {skills.map(s => {
                      const lvl = skillLevels[s];
                      const pct = lvl === "expert" ? 92 : lvl === "advanced" ? 76 : lvl === "intermediate" ? 56 : 34;
                      const barColor = pct >= 75 ? "rgb(var(--accent))" : pct >= 50 ? "rgb(var(--primary))" : "rgb(var(--warning))";
                      return (
                        <div key={s} className="flex items-center gap-3">
                          <span className="text-xs font-medium w-28 shrink-0 truncate" style={{ color: "rgb(var(--foreground))" }}>{s}</span>
                          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgb(var(--border))" }}>
                            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8 }} className="h-full rounded-full"
                              style={{ background: barColor }} />
                          </div>
                          {lvl && (
                            <span className="text-[10px] font-semibold w-20 shrink-0"
                              style={{ color: barColor }}>{lvl}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Skill Gap */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
              className="md:col-span-2">
              <Card>
                <SLabel icon={Target} text="Skill Gap Analysis" color="rgb(var(--warning))" />
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-label mb-3 flex items-center gap-1.5" style={{ color: "rgb(var(--accent))" }}>
                      <CheckCircle2 size={9} /> Your Strengths
                    </p>
                    <div className="flex flex-col gap-2">
                      {skills.length > 0 ? skills.slice(0, 6).map(s => (
                        <div key={s} className="flex items-center gap-2.5 px-3 py-2 rounded-lg"
                          style={{ background: "rgb(var(--accent) / 0.06)", border: "1px solid rgb(var(--accent) / 0.15)" }}>
                          <CheckCircle2 size={12} style={{ color: "rgb(var(--accent))" }} />
                          <span className="text-sm font-medium" style={{ color: "rgb(var(--foreground))" }}>{s}</span>
                        </div>
                      )) : <p className="text-caption italic">No skills mapped yet.</p>}
                    </div>
                  </div>
                  <div>
                    <p className="text-label mb-3 flex items-center gap-1.5" style={{ color: "rgb(var(--danger))" }}>
                      <XCircle size={9} /> Missing Skills
                    </p>
                    <div className="flex flex-col gap-2">
                      {gap?.gap_skills?.length ? gap.gap_skills.slice(0, 6).map(g => (
                        <div key={g.skill} className="flex items-center gap-2.5 px-3 py-2 rounded-lg"
                          style={{ background: "rgb(var(--danger) / 0.06)", border: "1px solid rgb(var(--danger) / 0.15)" }}>
                          <XCircle size={12} style={{ color: "rgb(var(--danger))" }} />
                          <span className="flex-1 text-sm font-medium" style={{ color: "rgb(var(--foreground))" }}>{g.skill}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{
                              background: g.priority === "critical" ? "rgb(var(--danger) / 0.12)" : "rgb(var(--warning) / 0.12)",
                              color: g.priority === "critical" ? "rgb(var(--danger))" : "rgb(var(--warning))",
                              border: `1px solid ${g.priority === "critical" ? "rgb(var(--danger) / 0.25)" : "rgb(var(--warning) / 0.25)"}`,
                            }}>{g.priority}</span>
                        </div>
                      )) : <p className="text-caption italic">Run skill gap analysis to see gaps.</p>}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Career Direction */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
              className="md:col-span-2">
              <Card>
                <SLabel icon={TrendingUp} text="Career Direction" color="rgb(var(--accent))" />
                {topCareer ? (
                  <div className="p-4 rounded-xl"
                    style={{ background: "rgb(var(--primary) / 0.05)", border: "1px solid rgb(var(--primary-border))" }}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-heading">{topCareer.title}</p>
                        <span className="text-[10px] flex items-center gap-1 mt-0.5" style={{ color: "rgb(var(--warning))" }}>
                          <Star size={9} /> Top AI Recommendation
                        </span>
                      </div>
                      <span className="text-sm font-black px-3 py-1 rounded-full"
                        style={{ background: "rgb(var(--accent) / 0.10)", color: "rgb(var(--accent))", border: "1px solid rgb(var(--accent-border))" }}>
                        {topCareer.match_score}% match
                      </span>
                    </div>
                    <p className="text-caption leading-relaxed">{topCareer.description}</p>
                    <div className="flex gap-3 mt-3">
                      <a href="/dashboard/intelligence" className="btn-primary text-xs py-1.5 px-3">
                        <TrendingUp size={12} /> View All Paths
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                      style={{ background: "rgb(var(--primary-muted))", border: "1px solid rgb(var(--primary-border))" }}>
                      <TrendingUp size={24} style={{ color: "rgb(var(--primary))" }} />
                    </div>
                    <p className="text-body mb-3">Go to AI Intelligence to generate career predictions.</p>
                    <a href="/dashboard/intelligence" className="btn-primary">
                      <Award size={14} /> Predict Careers
                    </a>
                  </div>
                )}
              </Card>
            </motion.div>

          </div>

          {/* Unlock banner */}
          {!isGated && (
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
              className="mt-4 rounded-2xl p-4 flex items-center gap-4"
              style={{ background: "rgb(var(--accent) / 0.07)", border: "1px solid rgb(var(--accent) / 0.22)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgb(var(--accent) / 0.12)", border: "1px solid rgb(var(--accent-border))" }}>
                <CheckCircle2 size={18} style={{ color: "rgb(var(--accent))" }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold" style={{ color: "rgb(var(--foreground))" }}>All features unlocked</p>
                <p className="text-caption mt-0.5">Roadmap, Tasks & Analytics are active.</p>
              </div>
              <a href="/dashboard/roadmap" className="btn-primary text-xs py-1.5 px-3 shrink-0">
                View Roadmap <ArrowRight size={12} />
              </a>
            </motion.div>
          )}

        </div>
      </main>
    </div>
  );
}

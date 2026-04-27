"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useProfile, REQUIRED_FIELDS, ProfileData } from "@/lib/profileContext";
import Sidebar from "@/components/Sidebar";
import ProfileChatbot from "@/components/ProfileChatbot";
import { CheckCircle2, AlertCircle, Sparkles, Bot, ChevronDown, ChevronUp } from "lucide-react";

const FIELD_LABELS: Record<string, string> = {
  name: "Full Name", profession: "Profession", level: "Role Level",
  goal: "Primary Goal", education: "Education", status: "Current Status",
  availability: "Weekly Availability",
};

const CODE_LABELS: Record<string, string> = {
  switch_domain: "Switch Domain", excel_current: "Excel in Current Domain",
  get_job: "Get a Job", promotion: "Promotion", side_income: "Side Income",
  student: "Student", employed: "Employed", freelance: "Freelance",
  unemployed: "Unemployed", career_break: "Career Break",
  high_school: "High School", diploma: "Diploma", bachelors: "Bachelor's",
  masters: "Master's", phd: "PhD", self_taught: "Self-taught",
  fresher: "Fresher", junior: "Junior", mid: "Mid", senior: "Senior", lead: "Lead",
  lt5: "< 5 hrs/week", "5_10": "5–10 hrs/week", "10_20": "10–20 hrs/week", gt20: "20+ hrs/week",
};

function displayVal(val: unknown): string {
  if (!val) return "";
  if (Array.isArray(val)) return val.join(", ");
  const s = String(val);
  return CODE_LABELS[s] ?? s;
}

function CompletionRing({ pct }: { pct: number }) {
  const r = 36;
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

export default function ProfilePage() {
  const { profile, completion, isGated } = useProfile();
  const [chatDone, setChatDone] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const missing = REQUIRED_FIELDS.filter((f: keyof ProfileData) => {
    const v = profile[f];
    return Array.isArray(v) ? v.length === 0 : String(v ?? "").trim() === "";
  });

  const filled = REQUIRED_FIELDS.filter((f: keyof ProfileData) => {
    const v = profile[f];
    return Array.isArray(v) ? v.length > 0 : String(v ?? "").trim() !== "";
  });

  return (
    <div className="flex min-h-screen bg-[#050508]">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="fixed top-0 right-0 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-3xl mx-auto px-6 py-8">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-1">Your Profile</h1>
            <p className="text-sm text-white/40">
              {isGated ? "Complete your profile to unlock all features." : "Your profile is complete — all features are unlocked."}
            </p>
          </motion.div>

          {/* Completion header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="glass glow-border rounded-2xl p-6 mb-5 flex items-center gap-6">
            <CompletionRing pct={completion} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {completion >= 80
                  ? <CheckCircle2 size={15} className="text-green-400" />
                  : <AlertCircle size={15} className="text-amber-400" />}
                <span className="text-sm font-semibold text-white">
                  {completion >= 80 ? "Profile complete!" : `${missing.length} field${missing.length !== 1 ? "s" : ""} remaining`}
                </span>
              </div>
              <p className="text-xs text-white/40 mb-3">
                {completion >= 80
                  ? "All features are unlocked. Your roadmap is fully personalized."
                  : "Chat with AI below to fill in the missing details."}
              </p>
              {missing.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {missing.map((f) => (
                    <span key={f as string} className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
                      {FIELD_LABELS[f as string] ?? f}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {profile.skills.length > 0 && (
              <div className="hidden md:flex flex-col gap-1.5 shrink-0">
                <p className="text-[10px] text-white/30 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={10} /> Skills
                </p>
                <div className="flex flex-wrap gap-1.5 max-w-[160px]">
                  {profile.skills.slice(0, 4).map((s) => (
                    <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* AI Chatbot — shown when profile is incomplete */}
          <AnimatePresence>
            {isGated && !chatDone && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }} transition={{ delay: 0.1 }}
                className="glass glow-border rounded-2xl overflow-hidden mb-5">
                {/* chatbot header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-purple-600/30 border border-purple-500/30 flex items-center justify-center">
                    <Bot size={16} className="text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">AI Profile Assistant</p>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-xs text-white/40">Online — asking about missing fields only</span>
                    </div>
                  </div>
                </div>
                {/* chatbot body */}
                <div className="h-[420px]">
                  <ProfileChatbot onComplete={() => setChatDone(true)} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Profile complete success banner */}
          <AnimatePresence>
            {(chatDone || !isGated) && (
              <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                className="glass border border-green-500/30 rounded-2xl p-5 mb-5 flex items-center gap-4">
                <CheckCircle2 size={24} className="text-green-400 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-white">Profile Complete!</p>
                  <p className="text-xs text-white/40 mt-0.5">Roadmap, Tasks & Progress are now unlocked.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filled fields summary — collapsible */}
          {filled.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="glass glow-border rounded-2xl overflow-hidden">
              <button onClick={() => setShowDetails((p) => !p)}
                className="w-full flex items-center justify-between px-5 py-4 text-sm font-medium text-white hover:bg-white/3 transition-colors">
                <span className="flex items-center gap-2">
                  <Sparkles size={14} className="text-purple-400" />
                  Your Profile Details
                </span>
                {showDetails ? <ChevronUp size={15} className="text-white/40" /> : <ChevronDown size={15} className="text-white/40" />}
              </button>

              <AnimatePresence>
                {showDetails && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                    className="overflow-hidden border-t border-white/5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-5">
                      {REQUIRED_FIELDS.map((f) => {
                        const val = displayVal(profile[f as keyof ProfileData]);
                        return (
                          <div key={f as string} className="flex flex-col gap-1">
                            <span className="text-[10px] text-white/35 uppercase tracking-wider">{FIELD_LABELS[f as string] ?? f}</span>
                            <span className={`text-sm px-3 py-2 rounded-xl border ${val ? "text-white/80 bg-white/3 border-white/8" : "text-white/20 italic bg-white/2 border-white/5"}`}>
                              {val || "Not set"}
                            </span>
                          </div>
                        );
                      })}
                      {/* Extra fields */}
                      {[
                        { key: "target_domain", label: "Target Domain" },
                        { key: "experience", label: "Years of Experience" },
                        { key: "linkedin", label: "LinkedIn" },
                        { key: "bio", label: "Bio" },
                      ].map(({ key, label }) => {
                        const val = displayVal(profile[key as keyof ProfileData]);
                        if (!val) return null;
                        return (
                          <div key={key} className="flex flex-col gap-1">
                            <span className="text-[10px] text-white/35 uppercase tracking-wider">{label}</span>
                            <span className="text-sm px-3 py-2 rounded-xl border text-white/80 bg-white/3 border-white/8 truncate">{val}</span>
                          </div>
                        );
                      })}
                      {profile.skills.length > 0 && (
                        <div className="flex flex-col gap-1 sm:col-span-2">
                          <span className="text-[10px] text-white/35 uppercase tracking-wider">Skills</span>
                          <div className="flex flex-wrap gap-1.5">
                            {profile.skills.map((s) => (
                              <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300">{s}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}

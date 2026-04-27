"use client";
import { motion } from "framer-motion";
import { useProfile, REQUIRED_FIELDS, ProfileData } from "@/lib/profileContext";
import Sidebar from "@/components/Sidebar";
import ProfileForm from "@/components/ProfileForm";
import { CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

const FIELD_LABELS: Record<string, string> = {
  name: "Full name", profession: "Profession", experience: "Experience",
  level: "Role level", goal: "Goal", education: "Education",
  status: "Current status", availability: "Availability", career_goal: "Career objective",
};

function CompletionRing({ pct }: { pct: number }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pct >= 80 ? "#22c55e" : pct >= 50 ? "#a78bfa" : "#f59e0b";

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg width="96" height="96" className="-rotate-90">
        <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        <motion.circle
          cx="48" cy="48" r={r} fill="none"
          stroke={color} strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-foreground">{pct}%</span>
        <span className="text-[9px] text-foreground/40 uppercase tracking-wider">complete</span>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { profile, completion, isGated } = useProfile();

  const missing = REQUIRED_FIELDS.filter((f: keyof ProfileData) => {
    const v = profile[f];
    return Array.isArray(v) ? v.length === 0 : String(v).trim() === "";
  });

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="fixed top-0 right-0 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-3xl mx-auto px-6 py-8">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-1">Your Profile</h1>
            <p className="text-sm text-foreground/40">Keep your profile updated to get better career recommendations.</p>
          </motion.div>

          {/* completion header card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="glass glow-border rounded-2xl p-6 mb-6 flex items-center gap-6"
          >
            <CompletionRing pct={completion} />

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {completion >= 80
                  ? <CheckCircle2 size={16} className="text-green-400" />
                  : <AlertCircle size={16} className="text-amber-400" />}
                <span className="text-sm font-semibold text-foreground">
                  {completion >= 80 ? "Profile complete!" : "Profile incomplete"}
                </span>
              </div>
              <p className="text-xs text-foreground/40 mb-3">
                {completion >= 80
                  ? "All features are unlocked. Your roadmap is fully personalized."
                  : `Fill ${missing.length} more field${missing.length !== 1 ? "s" : ""} to unlock Roadmap, Tasks & Progress.`}
              </p>

              {missing.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {missing.map((f: keyof ProfileData) => (
                    <span key={f as string}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
                      {FIELD_LABELS[f as string] ?? f}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* skills from assessment */}
            {profile.skills.length > 0 && (
              <div className="hidden md:flex flex-col gap-1.5 shrink-0">
                <p className="text-[10px] text-foreground/30 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={10} /> From Assessment
                </p>
                <div className="flex flex-wrap gap-1.5 max-w-[160px]">
                  {profile.skills.slice(0, 4).map((s) => (
                    <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* editable sections */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
            <ProfileForm />
          </motion.div>
        </div>
      </main>
    </div>
  );
}

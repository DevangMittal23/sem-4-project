"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, X } from "lucide-react";
import { useProfile, REQUIRED_FIELDS, ProfileData } from "@/lib/profileContext";
import { useState } from "react";

const FIELD_LABELS: Record<string, string> = {
  name: "Full name",
  profession: "Current profession",
  experience: "Years of experience",
  level: "Role level",
  goal: "Career goal",
  education: "Education level",
  status: "Current status",
  availability: "Weekly availability",
  career_goal: "Career objective",
};

export default function CompletionModal() {
  const { profile, isGated, completion } = useProfile();
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);

  const missing = REQUIRED_FIELDS.filter((f: keyof ProfileData) => {
    const v = profile[f];
    return Array.isArray(v) ? v.length === 0 : String(v).trim() === "";
  });

  const show = isGated && !dismissed;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setDismissed(true)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", bounce: 0.25, duration: 0.4 }}
            className="relative z-10 w-full max-w-md glass glow-border rounded-2xl p-7"
          >
            <button
              onClick={() => setDismissed(true)}
              className="absolute top-4 right-4 text-foreground/30 hover:text-foreground/60 transition-colors"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                <AlertCircle size={18} className="text-amber-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">Complete Your Profile</h2>
                <p className="text-xs text-foreground/40">to unlock all features</p>
              </div>
            </div>

            {/* progress ring area */}
            <div className="mb-5 p-4 rounded-xl bg-foreground/3 border border-foreground/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-foreground/50">Profile completion</span>
                <span className="text-sm font-bold text-amber-400">{completion}%</span>
              </div>
              <div className="h-2 bg-foreground/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completion}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                />
              </div>
              <p className="text-xs text-foreground/30 mt-2">Need 80% to unlock Roadmap, Tasks & Progress</p>
            </div>

            <p className="text-sm text-foreground/50 mb-4">
              We need a bit more information to personalize your career path.
            </p>

            {missing.length > 0 && (
              <div className="mb-5">
                <p className="text-xs text-foreground/30 mb-2 uppercase tracking-wider">Missing fields</p>
                <div className="flex flex-col gap-1.5">
                  {missing.map((f: keyof ProfileData) => (
                    <div key={f} className="flex items-center gap-2 text-xs text-foreground/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400/60 shrink-0" />
                      {FIELD_LABELS[f] ?? f}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/profile")}
              className="w-full py-3 rounded-xl btn-primary text-foreground text-sm font-semibold flex items-center justify-center gap-2"
            >
              Complete Profile <ArrowRight size={15} />
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

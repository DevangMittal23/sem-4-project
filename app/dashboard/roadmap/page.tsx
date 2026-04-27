"use client";
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import CompletionModal from "@/components/CompletionModal";
import { useProfile } from "@/lib/profileContext";
import {
  CheckCircle2, Circle, Lock, ChevronRight,
  Sparkles, BookOpen, Code2, Users, Trophy,
} from "lucide-react";

const PHASE_ICONS = [BookOpen, Code2, Users, Trophy];

function buildPhases(goal: string, domain: string) {
  const isSwitch = goal === "Switch Domain";
  const target = domain || "Software Engineering";

  if (isSwitch) {
    return [
      {
        phase: "Foundation", duration: "4–6 weeks", status: "active",
        description: `Build core fundamentals of ${target}`,
        milestones: [
          `Complete an introductory course in ${target}`,
          "Understand key concepts and terminology",
          "Set up your development environment",
          "Build your first small project",
        ],
        skills: ["Core concepts", "Basic tooling", "Industry vocabulary"],
      },
      {
        phase: "Skill Building", duration: "8–12 weeks", status: "locked",
        description: "Develop hands-on expertise through projects",
        milestones: [
          "Complete 2 guided projects",
          "Contribute to an open-source project",
          "Build a portfolio piece",
          "Get peer code reviews",
        ],
        skills: ["Project experience", "Version control", "Problem solving"],
      },
      {
        phase: "Transition", duration: "4–6 weeks", status: "locked",
        description: "Bridge your old experience with the new domain",
        milestones: [
          `Update resume and LinkedIn for ${target}`,
          `Network with professionals in ${target}`,
          "Apply to 10+ relevant positions",
          "Prepare domain-specific interview answers",
        ],
        skills: ["Personal branding", "Networking", "Interview prep"],
      },
      {
        phase: "Landing", duration: "Ongoing", status: "locked",
        description: "Secure your first role in the new domain",
        milestones: [
          "Pass technical screening",
          "Complete take-home assignment",
          "Ace the final interview",
          "Negotiate and accept offer",
        ],
        skills: ["Interview skills", "Negotiation", "Onboarding"],
      },
    ];
  }

  return [
    {
      phase: "Solidify", duration: "2–4 weeks", status: "active",
      description: "Identify and close skill gaps in your current role",
      milestones: [
        "Audit your current skill set",
        "Identify top 3 gaps vs. next level",
        "Create a focused learning plan",
        "Set measurable weekly goals",
      ],
      skills: ["Self-assessment", "Goal setting", "Learning strategy"],
    },
    {
      phase: "Deepen", duration: "6–10 weeks", status: "locked",
      description: "Master advanced topics in your domain",
      milestones: [
        "Complete an advanced course or certification",
        "Lead or contribute to a complex project",
        "Write a technical blog post or talk",
        "Mentor a junior colleague",
      ],
      skills: ["Advanced techniques", "Leadership", "Communication"],
    },
    {
      phase: "Demonstrate", duration: "4–6 weeks", status: "locked",
      description: "Make your expertise visible inside and outside your org",
      milestones: [
        "Present work at a team or company meeting",
        "Publish a case study or project write-up",
        "Speak at a meetup or conference",
        "Build a public portfolio or GitHub presence",
      ],
      skills: ["Public speaking", "Writing", "Personal brand"],
    },
    {
      phase: "Advance", duration: "Ongoing", status: "locked",
      description: "Move to the next level in your career",
      milestones: [
        "Request a performance review",
        "Negotiate promotion or raise",
        "Take on a leadership responsibility",
        "Define your 12-month vision",
      ],
      skills: ["Negotiation", "Leadership", "Strategic thinking"],
    },
  ];
}

export default function RoadmapPage() {
  const { profile, isGated } = useProfile();
  const phases = buildPhases(profile.goal, profile.target_domain);

  return (
    <div className="flex min-h-screen bg-[#050508]">
      <Sidebar />
      <CompletionModal />

      <main className="flex-1 overflow-y-auto">
        <div className="fixed top-0 right-0 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-3xl mx-auto px-6 py-8">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={14} className="text-purple-400" />
              <span className="text-xs text-purple-400 uppercase tracking-wider font-medium">AI Generated</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Your Career Roadmap</h1>
            <p className="text-sm text-white/40 mt-1">
              {profile.goal === "Switch Domain"
                ? `Transition path into ${profile.target_domain || "your target domain"}`
                : `Growth path for ${profile.profession || "your current field"}`}
            </p>
          </motion.div>

          {isGated ? (
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
              className="glass glow-border rounded-2xl p-12 text-center">
              <Lock size={32} className="text-white/20 mx-auto mb-4" />
              <p className="text-white font-semibold mb-2">Complete your profile to unlock your roadmap</p>
              <p className="text-sm text-white/40">We need more information to generate a personalized career path.</p>
            </motion.div>
          ) : (
            <div className="relative">
              <div className="absolute left-7 top-10 bottom-10 w-px bg-gradient-to-b from-purple-500/50 via-white/10 to-transparent" />

              <div className="flex flex-col gap-5">
                {phases.map((phase, i) => {
                  const Icon = PHASE_ICONS[i];
                  const isActive = phase.status === "active";
                  const isDone = phase.status === "done";

                  return (
                    <motion.div key={phase.phase} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }} className="flex gap-4">
                      <div className={`w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center border z-10
                        ${isDone ? "bg-green-500/20 border-green-500/40"
                          : isActive ? "bg-purple-600/25 border-purple-500/50"
                          : "bg-white/3 border-white/8"}`}>
                        {isDone
                          ? <CheckCircle2 size={20} className="text-green-400" />
                          : <Icon size={20} className={isActive ? "text-purple-400" : "text-white/20"} />}
                      </div>

                      <div className={`flex-1 rounded-2xl border p-5
                        ${isDone ? "border-green-500/30 bg-green-500/5"
                          : isActive ? "border-purple-500/30 bg-purple-500/5"
                          : "border-white/6 bg-white/2"}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-[10px] text-white/25 font-mono">Phase {i + 1}</span>
                              {isActive && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300">
                                  Current
                                </span>
                              )}
                            </div>
                            <h3 className={`text-base font-semibold ${isActive ? "text-white" : isDone ? "text-white/70" : "text-white/35"}`}>
                              {phase.phase}
                            </h3>
                          </div>
                          <span className="text-xs text-white/25 shrink-0">{phase.duration}</span>
                        </div>

                        <p className={`text-sm mb-4 leading-relaxed ${isActive ? "text-white/55" : "text-white/25"}`}>
                          {phase.description}
                        </p>

                        <div className="flex flex-col gap-2 mb-4">
                          {phase.milestones.map((m, j) => (
                            <div key={j} className="flex items-start gap-2">
                              {isDone
                                ? <CheckCircle2 size={12} className="text-green-400 shrink-0 mt-0.5" />
                                : isActive && j === 0
                                ? <ChevronRight size={12} className="text-purple-400 shrink-0 mt-0.5" />
                                : <Circle size={12} className="text-white/12 shrink-0 mt-0.5" />}
                              <span className={`text-xs leading-relaxed ${isActive ? "text-white/55" : "text-white/22"}`}>{m}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {phase.skills.map((s) => (
                            <span key={s} className={`text-[10px] px-2 py-0.5 rounded-full border
                              ${isActive ? "border-purple-500/25 text-purple-300/70 bg-purple-500/8" : "border-white/8 text-white/22"}`}>
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

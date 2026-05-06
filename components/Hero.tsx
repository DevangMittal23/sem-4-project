"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Brain, BarChart3, Target, CheckCircle2, Sparkles } from "lucide-react";
import { useRef } from "react";

const STATS = [
  { value: "12K+", label: "Professionals Guided" },
  { value: "94%", label: "Career Match Accuracy" },
  { value: "3×", label: "Faster Job Placement" },
];

const BADGES = [
  { icon: Brain, text: "AI-Powered Analysis" },
  { icon: BarChart3, text: "Live Market Data" },
  { icon: Target, text: "Personalised Roadmap" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.13, duration: 0.55, ease: "easeOut" as const } }),
};

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y    = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const fade = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">

      {/* ── Dual-theme gradient blobs ── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Light mode visible gradient */}
        <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full opacity-30 dark:opacity-0 transition-opacity"
          style={{ background: "radial-gradient(circle, rgb(var(--primary) / 0.12) 0%, transparent 70%)", transform: "translate(20%, -20%)" }} />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-20 dark:opacity-0 transition-opacity"
          style={{ background: "radial-gradient(circle, rgb(var(--accent) / 0.10) 0%, transparent 70%)", transform: "translate(-20%, 20%)" }} />
        {/* Dark mode blobs */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-0 dark:opacity-100 transition-opacity"
          style={{ background: "rgb(var(--primary) / 0.08)", filter: "blur(120px)" }} />
      </div>

      {/* ── Grid pattern ── */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.025] dark:opacity-[0.04]"
        style={{
          backgroundImage: "linear-gradient(rgb(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }} />

      {/* ── Content ── */}
      <motion.div style={{ y, opacity: fade }} className="relative z-10 text-center px-6 max-w-4xl mx-auto">

        {/* Badge row */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show"
          className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {BADGES.map(({ icon: Icon, text }) => (
            <span key={text}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{
                background: "rgb(var(--primary) / 0.08)",
                border: "1px solid rgb(var(--primary-border))",
                color: "rgb(var(--primary))",
              }}>
              <Icon size={11} />{text}
            </span>
          ))}
        </motion.div>

        {/* Headline */}
        <motion.h1 custom={1} variants={fadeUp} initial="hidden" animate="show"
          className="text-5xl md:text-7xl font-black leading-[1.08] tracking-tight mb-6"
          style={{ color: "rgb(var(--foreground))" }}>
          Find Your{" "}
          <span className="gradient-text">Perfect Career</span>
          <br />Path with AI
        </motion.h1>

        {/* Subheading */}
        <motion.p custom={2} variants={fadeUp} initial="hidden" animate="show"
          className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{ color: "rgb(var(--foreground-muted))" }}>
          Personalised career roadmaps built from your skills, behaviour, and goals —
          powered by <span className="font-semibold" style={{ color: "rgb(var(--foreground))" }}>live Adzuna market data</span>.
        </motion.p>

        {/* CTA buttons */}
        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="show"
          className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
          <Link href="/signup"
            className="btn-primary text-base px-8 py-3.5 flex items-center justify-center gap-2 group">
            Start for Free
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/login"
            className="text-base px-8 py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
            style={{
              background: "rgb(var(--surface))",
              border: "1px solid rgb(var(--border-strong))",
              color: "rgb(var(--foreground))",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgb(var(--primary-border))";
              (e.currentTarget as HTMLElement).style.boxShadow = "var(--primary-glow)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgb(var(--border-strong))";
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
          >
            Sign In
          </Link>
        </motion.div>

        {/* Stats row */}
        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="show"
          className="flex flex-wrap items-center justify-center gap-8">
          {STATS.map((s, i) => (
            <div key={s.label} className="text-center flex items-center gap-4">
              {i > 0 && <div className="w-px h-8 hidden sm:block" style={{ background: "rgb(var(--border))" }} />}
              <div>
                <p className="text-2xl font-black gradient-text">{s.value}</p>
                <p className="text-xs font-medium mt-0.5" style={{ color: "rgb(var(--foreground-faint))" }}>{s.label}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Trust line */}
        <motion.div custom={5} variants={fadeUp} initial="hidden" animate="show"
          className="flex items-center justify-center gap-2 mt-8">
          <CheckCircle2 size={13} style={{ color: "rgb(var(--accent))" }} />
          <span className="text-xs font-medium" style={{ color: "rgb(var(--foreground-faint))" }}>
            No credit card required · Powered by Groq + Gemini AI
          </span>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5">
        <div className="w-5 h-8 rounded-full border-2 flex items-start justify-center pt-1"
          style={{ borderColor: "rgb(var(--border-strong))" }}>
          <div className="w-1 h-2 rounded-full" style={{ background: "rgb(var(--primary))" }} />
        </div>
        <span className="text-[10px] font-medium" style={{ color: "rgb(var(--foreground-faint))" }}>Scroll</span>
      </motion.div>
    </section>
  );
}

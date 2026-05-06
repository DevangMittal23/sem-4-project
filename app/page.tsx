import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Link from "next/link";
import { Metadata } from "next";
import {
  Brain, Map, BookOpen, Zap, Target, TrendingUp,
  ArrowRight, BarChart3, Shield, Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "AI Career Mentor — Find Your Perfect Career Path",
  description: "Personalized AI-powered career guidance using real Adzuna market data, Groq AI, and Gemini.",
};

const features = [
  {
    icon: Brain,
    color: "rgb(var(--primary))",
    bg: "rgb(var(--primary) / 0.08)",
    border: "rgb(var(--primary-border))",
    title: "AI Career Prediction",
    description: "Our AI analyses your behaviour patterns, skills, and personality to predict the most suitable career paths with live market validation.",
  },
  {
    icon: Map,
    color: "rgb(var(--accent))",
    bg: "rgb(var(--accent) / 0.08)",
    border: "rgb(var(--accent-border))",
    title: "Personalised Roadmaps",
    description: "Get a step-by-step career roadmap tailored to your goals, current skills, and target role — updated weekly as you grow.",
  },
  {
    icon: BookOpen,
    color: "rgb(var(--warning))",
    bg: "rgb(var(--warning) / 0.08)",
    border: "rgb(var(--warning) / 0.22)",
    title: "Adaptive Weekly Tasks",
    description: "Receive curated learning tasks that adapt to your progress and evolve with your growing skill set every single week.",
  },
  {
    icon: BarChart3,
    color: "rgb(var(--primary))",
    bg: "rgb(var(--primary) / 0.08)",
    border: "rgb(var(--primary-border))",
    title: "Live Market Intelligence",
    description: "Real Adzuna job listings analysed in real-time so your roadmap reflects actual employer demand, not outdated data.",
  },
  {
    icon: Shield,
    color: "rgb(var(--accent))",
    bg: "rgb(var(--accent) / 0.08)",
    border: "rgb(var(--accent-border))",
    title: "Skill Gap Analysis",
    description: "Instantly see the gap between your current skills and what the market demands, with prioritised recommendations.",
  },
  {
    icon: TrendingUp,
    color: "rgb(var(--warning))",
    bg: "rgb(var(--warning) / 0.08)",
    border: "rgb(var(--warning) / 0.22)",
    title: "Performance Analytics",
    description: "Track your weekly XP, streaks, and AI score — with performance insights that adapt your plan automatically.",
  },
];

const steps = [
  { icon: Zap,      num: "01", title: "Take the Assessment",     desc: "Answer a few AI-guided questions about your skills, interests, and goals." },
  { icon: Brain,    num: "02", title: "AI Builds Your Profile",   desc: "Groq AI extracts your profile and Adzuna fetches live job market data." },
  { icon: Target,   num: "03", title: "Get Your Roadmap",         desc: "Receive a personalised, actionable career roadmap with weekly milestones." },
  { icon: TrendingUp, num: "04", title: "Track & Adapt",          desc: "Weekly check-ins keep your plan updated as you grow and learn." },
];

export default function Home() {
  return (
    <main className="min-h-screen" style={{ background: "rgb(var(--background))" }}>
      <Navbar />
      <Hero />

      {/* ── Features ── */}
      <section id="features" className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-label flex items-center justify-center gap-1.5 mb-3"
              style={{ color: "rgb(var(--primary))" }}>
              <Sparkles size={11} /> Features
            </span>
            <h2 className="text-display mb-4">
              Everything you need to{" "}
              <span className="gradient-text">succeed</span>
            </h2>
            <p className="text-body max-w-xl mx-auto">
              A complete AI career intelligence suite — from assessment to weekly adaptive learning.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {features.map(f => (
              <div key={f.title}
                className="rounded-2xl p-6 group transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: "rgb(var(--surface))",
                  border: "1px solid rgb(var(--border))",
                  boxShadow: "var(--shadow-sm)",
                }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: f.bg, border: `1px solid ${f.border}` }}>
                  <f.icon size={20} style={{ color: f.color }} />
                </div>
                <h3 className="text-subheading mb-2">{f.title}</h3>
                <p className="text-body text-sm">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-28 px-6 relative">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, rgb(var(--primary) / 0.03), transparent)" }} />
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-16">
            <span className="text-label flex items-center justify-center gap-1.5 mb-3"
              style={{ color: "rgb(var(--primary))" }}>
              <Zap size={11} /> Process
            </span>
            <h2 className="text-display mb-4">
              Four steps to your{" "}
              <span className="gradient-text">dream career</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-5">
            {steps.map((s, i) => (
              <div key={s.title} className="relative">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-9 left-[calc(50%+24px)] right-[-50%] h-px"
                    style={{ background: "linear-gradient(90deg, rgb(var(--border)), transparent)" }} />
                )}
                <div className="rounded-2xl p-5 text-center"
                  style={{
                    background: "rgb(var(--surface))",
                    border: "1px solid rgb(var(--border))",
                    boxShadow: "var(--shadow-sm)",
                  }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: "rgb(var(--primary) / 0.08)", border: "1px solid rgb(var(--primary-border))" }}>
                    <s.icon size={20} style={{ color: "rgb(var(--primary))" }} />
                  </div>
                  <div className="text-xs font-black mb-2 font-mono" style={{ color: "rgb(var(--primary))" }}>{s.num}</div>
                  <h3 className="text-subheading text-sm mb-1.5">{s.title}</h3>
                  <p className="text-caption">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" className="py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-label flex items-center justify-center gap-1.5 mb-3"
            style={{ color: "rgb(var(--primary))" }}>
            <Brain size={11} /> About
          </span>
          <h2 className="text-display mb-5">
            Built for the{" "}
            <span className="gradient-text">next generation</span>
          </h2>
          <p className="text-body leading-relaxed mb-8">
            AI Career Mentor combines Groq&apos;s lightning-fast LLMs with Gemini&apos;s reasoning and live Adzuna job market data to deliver career guidance that actually reflects what employers want — not what was true two years ago.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Groq LLaMA-3.3", sub: "Assessment AI" },
              { label: "Gemini 2.0 Flash", sub: "Career Intelligence" },
              { label: "Adzuna API", sub: "Live Market Data" },
            ].map(t => (
              <div key={t.label} className="rounded-xl p-4"
                style={{ background: "rgb(var(--surface))", border: "1px solid rgb(var(--border))" }}>
                <p className="text-sm font-bold" style={{ color: "rgb(var(--foreground))" }}>{t.label}</p>
                <p className="text-xs mt-1" style={{ color: "rgb(var(--foreground-faint))" }}>{t.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-28 px-6">
        <div className="max-w-3xl mx-auto text-center rounded-3xl p-12 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgb(var(--primary) / 0.08), rgb(var(--accent) / 0.05))",
            border: "1px solid rgb(var(--primary-border))",
            boxShadow: "var(--primary-glow)",
          }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(circle at 50% 0%, rgb(var(--primary) / 0.08), transparent 70%)" }} />
          <div className="relative z-10">
            <span className="text-label flex items-center justify-center gap-1.5 mb-4"
              style={{ color: "rgb(var(--primary))" }}>
              <Sparkles size={11} /> Get Started Today
            </span>
            <h2 className="text-display mb-4">
              Start your AI-powered<br />career journey today
            </h2>
            <p className="text-body mb-8">
              Join thousands of professionals who found their path with AI Career Mentor.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup"
                className="btn-primary text-base px-10 py-4 flex items-center justify-center gap-2 group">
                Get Started — It&apos;s Free
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/login"
                className="text-base px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                style={{
                  background: "rgb(var(--surface))",
                  border: "1px solid rgb(var(--border-strong))",
                  color: "rgb(var(--foreground))",
                }}>
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-10 px-6"
        style={{ borderColor: "rgb(var(--border))" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "rgb(var(--primary) / 0.10)", border: "1px solid rgb(var(--primary-border))" }}>
              <Sparkles size={12} style={{ color: "rgb(var(--primary))" }} />
            </div>
            <span className="font-bold text-sm gradient-text">AI Career Mentor</span>
          </div>
          <p className="text-caption">© 2025 AI Career Mentor. All rights reserved.</p>
          <div className="flex gap-4 text-sm" style={{ color: "rgb(var(--foreground-faint))" }}>
            <Link href="/login" className="hover:underline">Login</Link>
            <Link href="/signup" className="hover:underline">Sign Up</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

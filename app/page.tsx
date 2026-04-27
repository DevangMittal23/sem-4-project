import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeatureCard from "@/components/FeatureCard";
import { Brain, Map, BookOpen, Zap, Target, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = { title: "AI Career Mentor — Find Your Perfect Career Path" };

const features = [
  { icon: <Brain size={22} className="text-purple-400" />, title: "AI Career Prediction", description: "Our AI analyzes your behavior patterns, skills, and personality to predict the most suitable career paths for you.", delay: 0 },
  { icon: <Map size={22} className="text-purple-400" />, title: "Personalized Roadmaps", description: "Get a step-by-step career roadmap tailored specifically to your goals, current skills, and target role.", delay: 0.1 },
  { icon: <BookOpen size={22} className="text-purple-400" />, title: "Weekly Adaptive Learning", description: "Receive curated learning resources that adapt to your progress and evolve with your growing skill set.", delay: 0.2 },
];

const steps = [
  { icon: Zap, title: "Take the Assessment", desc: "Answer a few AI-guided questions about your skills, interests, and goals." },
  { icon: Brain, title: "AI Analyzes Your Profile", desc: "Our model processes your responses to identify your ideal career trajectory." },
  { icon: Target, title: "Get Your Roadmap", desc: "Receive a personalized, actionable career roadmap with milestones." },
  { icon: TrendingUp, title: "Track & Adapt", desc: "Weekly check-ins keep your plan updated as you grow and learn." },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-medium text-purple-400 uppercase tracking-widest">Features</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3">
              Everything you need to{" "}
              <span className="gradient-text">succeed</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto relative">
          <div className="text-center mb-14">
            <span className="text-xs font-medium text-purple-400 uppercase tracking-widest">How It Works</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3">
              Four steps to your{" "}
              <span className="gradient-text">dream career</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={s.title} className="glass glow-border rounded-2xl p-5 text-center">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-3">
                  <s.icon size={18} className="text-purple-400" />
                </div>
                <div className="text-xs text-purple-400/60 font-mono mb-2">0{i + 1}</div>
                <h3 className="text-sm font-semibold text-foreground mb-1.5">{s.title}</h3>
                <p className="text-xs text-foreground/40 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-xs font-medium text-purple-400 uppercase tracking-widest">About</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3 mb-5">
            Built for the <span className="gradient-text">next generation</span>
          </h2>
          <p className="text-foreground/50 leading-relaxed">
            AI Career Mentor combines cutting-edge machine learning with behavioral psychology to deliver career guidance that actually works. We've helped thousands of professionals find clarity and direction in their careers.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center glass glow-border rounded-3xl p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-blue-600/5 pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Start your AI-powered career journey today
            </h2>
            <p className="text-foreground/50 mb-8">Join thousands of professionals who found their path with AI Career Mentor.</p>
            <Link
              href="/signup"
              className="inline-block px-10 py-4 rounded-xl btn-primary text-foreground font-semibold text-base"
            >
              Get Started — It's Free
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-foreground/5 py-8 px-6 text-center text-sm text-foreground/25">
        © 2025 AI Career Mentor. All rights reserved.
      </footer>
    </main>
  );
}

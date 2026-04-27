"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef } from "react";

function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: { x: number; y: number; vx: number; vy: number; r: number; alpha: number }[] = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
      });
    }

    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 92, 246, ${p.alpha})`;
        ctx.fill();
      });

      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach((b) => {
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(139, 92, 246, ${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animId = requestAnimationFrame(draw);
    };
    draw();

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" as const } }),
};

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <AnimatedBackground />

      <div className="absolute inset-0 bg-gradient-radial from-purple-900/20 via-transparent to-transparent" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show">
          <span className="inline-block px-4 py-1.5 text-xs font-medium rounded-full glass border border-purple-500/30 text-purple-300 mb-6">
            ✨ AI-Powered Career Guidance
          </span>
        </motion.div>

        <motion.h1
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="text-5xl md:text-7xl font-bold leading-tight mb-6"
        >
          Find Your{" "}
          <span className="gradient-text">Perfect Career</span>
          <br />Path with AI
        </motion.h1>

        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="text-lg md:text-xl text-foreground/60 max-w-2xl mx-auto mb-10"
        >
          Personalized career roadmap based on your behavior, skills, and goals
        </motion.p>

        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/signup"
            className="px-8 py-3.5 rounded-xl btn-primary text-foreground font-semibold text-base"
          >
            Get Started →
          </Link>
          <Link
            href="/login"
            className="px-8 py-3.5 rounded-xl border border-foreground/20 text-foreground/80 hover:border-purple-500/50 hover:text-foreground transition-all font-medium text-base"
          >
            Login
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

"use client";
import { motion } from "framer-motion";
import ChatUI from "@/components/ChatUI";
import Link from "next/link";
import { useEffect, useRef } from "react";

function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pts = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() + 0.5,
    }));

    let id: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(139,92,246,0.35)";
        ctx.fill();
      });
      pts.forEach((a, i) => pts.slice(i + 1).forEach((b) => {
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 100) {
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(139,92,246,${0.07 * (1 - d / 100)})`;
          ctx.lineWidth = 0.5; ctx.stroke();
        }
      }));
      id = requestAnimationFrame(draw);
    };
    draw();

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(id); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none" />;
}

export default function AssessmentPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ParticleBackground />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/8 rounded-full blur-[120px] pointer-events-none" />

      <header className="relative z-10 flex items-center justify-between px-6 h-16 border-b border-foreground/5 glass">
        <Link href="/" className="text-lg font-bold gradient-text">AI Career Mentor</Link>
        <span className="text-xs text-foreground/40 glass px-3 py-1.5 rounded-full border border-foreground/10">Career Assessment</span>
      </header>

      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-[500px] h-[600px] glass glow-border rounded-2xl flex flex-col overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-foreground/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-600/30 border border-purple-500/30 flex items-center justify-center text-sm">🤖</div>
            <div>
              <p className="text-sm font-semibold text-foreground">AI Career Mentor</p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-foreground/40">Online</span>
              </div>
            </div>
          </div>

          <ChatUI />
        </motion.div>
      </div>
    </div>
  );
}

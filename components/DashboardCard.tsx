"use client";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { ReactNode } from "react";

interface DashboardCardProps {
  title?: string;
  children: ReactNode;
  locked?: boolean;
  className?: string;
  delay?: number;
}

export default function DashboardCard({ title, children, locked, className = "", delay = 0 }: DashboardCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={!locked ? { y: -2 } : {}}
      className={`glass glow-border rounded-2xl p-5 relative overflow-hidden ${className}`}
    >
      {title && (
        <p className="text-xs text-foreground/40 uppercase tracking-wider mb-4 font-medium">{title}</p>
      )}
      <div className={locked ? "blur-[2px] pointer-events-none select-none" : ""}>{children}</div>
      {locked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[1px] rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-foreground/5 border border-foreground/10 flex items-center justify-center mb-2">
            <Lock size={16} className="text-foreground/40" />
          </div>
          <p className="text-xs text-foreground/40">Complete profile to unlock</p>
        </div>
      )}
    </motion.div>
  );
}

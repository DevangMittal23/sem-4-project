import { cn } from "@/lib/utils";

// ── Skeleton ──────────────────────────────────────────────────────────────────

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

export function Skeleton({ className = "", width = "w-full", height = "h-4" }: SkeletonProps) {
  return <div className={cn("skeleton", width, height, className)} />;
}

export function CardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="card p-5 flex flex-col gap-3">
      <Skeleton width="w-1/3" height="h-3" />
      <Skeleton width="w-2/3" height="h-6" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} width={i % 2 === 0 ? "w-full" : "w-4/5"} height="h-3" />
      ))}
    </div>
  );
}

// ── Bento card wrapper ────────────────────────────────────────────────────────

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
  noPad?: boolean;
}

export function BentoCard({ children, className = "", glass = false, noPad = false }: BentoCardProps) {
  return (
    <div className={cn(glass ? "card-glass" : "card", noPad ? "" : "p-5", className)}>
      {children}
    </div>
  );
}

// ── Section label ─────────────────────────────────────────────────────────────

interface LabelProps {
  icon?: React.ElementType;
  children: React.ReactNode;
  color?: string;
}

export function SectionLabel({ icon: Icon, children, color }: LabelProps) {
  return (
    <p className="text-label flex items-center gap-1.5 mb-3" style={color ? { color } : undefined}>
      {Icon && <Icon size={11} />}
      {children}
    </p>
  );
}

// ── Stat pill ─────────────────────────────────────────────────────────────────

interface StatPillProps {
  value: string | number;
  label: string;
  icon?: React.ElementType;
  accent?: "primary" | "accent" | "warning" | "danger";
}

export function StatPill({ value, label, icon: Icon, accent = "primary" }: StatPillProps) {
  const colors: Record<string, string> = {
    primary: "rgb(var(--primary))",
    accent:  "rgb(var(--accent))",
    warning: "rgb(var(--warning))",
    danger:  "rgb(var(--danger))",
  };
  const c = colors[accent];
  return (
    <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl"
      style={{ background: `${c.replace("rgb", "rgb").replace(")", " / 0.07)")}`, border: `1px solid ${c.replace(")", " / 0.15)")}` }}>
      {Icon && <Icon size={16} style={{ color: c }} />}
      <div>
        <div className="text-lg font-bold leading-none mb-0.5" style={{ color: c }}>{value}</div>
        <div className="text-label leading-none" style={{ color: c, opacity: 0.75 }}>{label}</div>
      </div>
    </div>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────────

interface ProgressBarProps {
  pct: number;
  color?: "primary" | "accent";
  height?: string;
  animated?: boolean;
}

export function ProgressBar({ pct, color = "accent", height = "h-2", animated = true }: ProgressBarProps) {
  const c = color === "accent" ? "rgb(var(--accent))" : "rgb(var(--primary))";
  return (
    <div className={`w-full rounded-full overflow-hidden ${height}`} style={{ background: "rgb(var(--border))" }}>
      <div
        className={`h-full rounded-full ${animated ? "transition-all duration-1000 ease-out" : ""}`}
        style={{ width: `${Math.min(pct, 100)}%`, background: c }}
      />
    </div>
  );
}

// ── Streaming dots (loading indicator) ───────────────────────────────────────

export function StreamingDots() {
  return (
    <span className="inline-flex items-center gap-1 px-1">
      {[0, 1, 2].map((i) => (
        <span key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
          style={{
            background: "rgb(var(--primary))",
            animationDelay: `${i * 0.15}s`,
            animationDuration: "0.8s",
          }} />
      ))}
    </span>
  );
}

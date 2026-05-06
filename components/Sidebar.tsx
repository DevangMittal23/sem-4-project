"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { useStore } from "@/lib/store";
import { useState, useEffect } from "react";
import { clearTokens } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, User, Map, ListChecks, BarChart3, Brain,
  MessageSquare, LogOut, ChevronLeft, ChevronRight, Sun, Moon,
  Compass, Lock,
} from "lucide-react";

/* ── Nav items ─────────────────────────────────────────────────────────────── */

const NAV_ITEMS = [
  { href: "/dashboard",                label: "Dashboard",   icon: LayoutDashboard, public: true  },
  { href: "/profile",                  label: "Profile",     icon: User,            public: true  },
  { href: "/dashboard/roadmap",        label: "Roadmap",     icon: Map,             public: false },
  { href: "/dashboard/tasks",          label: "Weekly Tasks",icon: ListChecks,      public: false },
  { href: "/dashboard/intelligence",   label: "Intelligence",icon: Brain,           public: false },
  { href: "/dashboard/progress",       label: "Analytics",   icon: BarChart3,       public: false },
  { href: "/dashboard/chatbot",        label: "AI Chat",     icon: MessageSquare,   public: true  },
] as const;

/* ── Sidebar width constants ───────────────────────────────────────────────── */

const OPEN_W  = 260;
const CLOSE_W = 68;

/* ── NavItem ───────────────────────────────────────────────────────────────── */

function NavItem({
  href, label, icon: Icon, active, locked, collapsed,
}: {
  href: string; label: string; icon: React.ElementType;
  active: boolean; locked: boolean; collapsed: boolean;
}) {
  const content = (
    <motion.span
      animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto" }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden whitespace-nowrap text-sm font-medium flex items-center gap-2 flex-1"
    >
      {label}
      {locked && !collapsed && (
        <Lock size={10} className="opacity-50" />
      )}
    </motion.span>
  );

  const itemCls = cn(
    "relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 w-full group",
    active
      ? "font-semibold"
      : "font-medium hover:text-[rgb(var(--foreground))]",
    locked && "opacity-40 cursor-not-allowed",
  );
  const itemColor = active
    ? "rgb(var(--primary))"
    : "rgb(var(--foreground-muted))";

  if (locked) {
    return (
      <div className={itemCls} style={{ color: itemColor }}>
        {active && (
          <motion.div layoutId="nav-active-bg" className="absolute inset-0 rounded-xl"
            style={{ background: "rgb(var(--primary) / 0.12)" }}
            transition={{ type: "spring", bounce: 0.18, duration: 0.35 }} />
        )}
        {active && (
          <motion.div layoutId="nav-active-bar"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full"
            style={{ background: "rgb(var(--primary))", boxShadow: "0 0 8px rgb(var(--primary) / 0.7)" }}
            transition={{ type: "spring", bounce: 0.18, duration: 0.35 }} />
        )}
        <Icon size={18} className="shrink-0 z-10" style={{ color: itemColor }} />
        {content}
      </div>
    );
  }

  return (
    <Link href={href} className={itemCls} style={{ color: itemColor }}>
      {/* Hover fill */}
      <div className={cn(
        "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity",
        !active && "group-hover:opacity-100"
      )} style={{ background: "rgb(var(--primary) / 0.07)" }} />
      {/* Active fill */}
      {active && (
        <motion.div layoutId="nav-active-bg" className="absolute inset-0 rounded-xl"
          style={{ background: "rgb(var(--primary) / 0.12)" }}
          transition={{ type: "spring", bounce: 0.15, duration: 0.3 }} />
      )}
      {/* Active bar */}
      {active && (
        <motion.div layoutId="nav-active-bar"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
          style={{ background: "rgb(var(--primary))", boxShadow: "0 0 10px rgb(var(--primary) / 0.8)" }}
          transition={{ type: "spring", bounce: 0.15, duration: 0.3 }} />
      )}
      <Icon size={18} className="shrink-0 z-10" style={{ color: itemColor }} />
      {content}
    </Link>
  );
}

/* ── Sidebar ───────────────────────────────────────────────────────────────── */

export default function Sidebar() {
  const pathname  = usePathname();
  const router    = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const { completion, isGated, sidebarOpen, setSidebarOpen, profile } = useStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleSignOut = () => { clearTokens(); router.push("/login"); };

  const collapsed = !sidebarOpen;
  const w = collapsed ? CLOSE_W : OPEN_W;

  return (
    <motion.aside
      animate={{ width: w }}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      className="sticky top-0 h-screen flex flex-col shrink-0 z-40 overflow-hidden"
      style={{
        background: "rgb(var(--sidebar-bg))",
        borderRight: "1px solid rgb(var(--sidebar-border))",
        boxShadow: "4px 0 16px rgba(0,0,0,0.06)",
      }}
    >
      {/* ── Brand ── */}
      <div className="h-16 flex items-center px-4 shrink-0"
        style={{ borderBottom: "1px solid rgb(var(--border-subtle))" }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "rgb(var(--primary) / 0.12)", border: "1px solid rgb(var(--primary-border))" }}>
          <Compass size={17} style={{ color: "rgb(var(--primary))" }} />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }} transition={{ duration: 0.18 }}
              className="ml-3 overflow-hidden">
              <p className="text-sm font-bold tracking-tight" style={{ color: "rgb(var(--foreground))" }}>
                CareerMentor
              </p>
              <p className="text-[10px]" style={{ color: "rgb(var(--foreground-faint))" }}>AI-Powered Platform</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Profile strength strip ── */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} className="mx-3 mt-3 px-3 py-2.5 rounded-xl overflow-hidden"
            style={{ background: "rgb(var(--surface))", border: "1px solid rgb(var(--border-subtle))" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-label">Profile Strength</span>
              <span className="text-xs font-bold"
                style={{ color: completion >= 80 ? "rgb(var(--accent))" : "rgb(var(--warning))" }}>
                {completion}%
              </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgb(var(--border))" }}>
              <motion.div animate={{ width: `${completion}%` }} transition={{ duration: 0.9, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{
                  background: completion >= 80
                    ? "rgb(var(--accent))"
                    : "linear-gradient(90deg, rgb(var(--warning)), rgb(var(--primary)))",
                }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ href, label, icon, public: pub }) => {
          const active = pathname === href || (pathname?.startsWith(href + "/") && href !== "/dashboard");
          const locked = !pub && isGated;
          return (
            <NavItem key={href} href={href} label={label} icon={icon}
              active={active} locked={locked} collapsed={collapsed} />
          );
        })}
      </nav>

      {/* ── Footer actions ── */}
      <div className="px-2 py-3 flex flex-col gap-0.5 shrink-0"
        style={{ borderTop: "1px solid rgb(var(--border-subtle))" }}>

        {/* Theme toggle — use mounted guard to prevent SSR/client hydration mismatch */}
        <button onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="btn-ghost w-full justify-start">
          {/* Render a neutral placeholder icon until client is mounted */}
          {mounted
            ? resolvedTheme === "dark" ? <Sun size={16} /> : <Moon size={16} />
            : <Sun size={16} />}
          <AnimatePresence>
            {!collapsed && mounted && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-xs font-medium">
                {resolvedTheme === "dark" ? "Light Mode" : "Dark Mode"}
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* Collapse toggle */}
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="btn-ghost w-full justify-start">
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-xs font-medium">Collapse</motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* Sign out */}
        <button onClick={handleSignOut} className="btn-ghost w-full justify-start">
          <LogOut size={16} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-xs font-medium">Sign Out</motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* User chip */}
        <AnimatePresence>
          {!collapsed && profile && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2.5 px-2.5 py-2 mt-1 rounded-xl"
              style={{ background: "rgb(var(--surface))", border: "1px solid rgb(var(--border-subtle))" }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: "rgb(var(--primary) / 0.15)", color: "rgb(var(--primary))" }}>
                {(profile.name || profile.username || "U").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold truncate" style={{ color: "rgb(var(--foreground))" }}>
                  {profile.name || profile.username}
                </p>
                <p className="text-[10px] truncate" style={{ color: "rgb(var(--foreground-faint))" }}>
                  {profile.email}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}

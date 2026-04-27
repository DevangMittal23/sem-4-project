"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, User, Map, CheckSquare, TrendingUp, LogOut, Sparkles } from "lucide-react";
import { useProfile } from "@/lib/profileContext";
import { clearTokens } from "@/lib/api";
import { EMPTY_PROFILE } from "@/lib/profileContext";

const NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/profile", icon: User, label: "Profile" },
  { href: "/dashboard/roadmap", icon: Map, label: "Roadmap", gated: true },
  { href: "/dashboard/tasks", icon: CheckSquare, label: "Weekly Tasks", gated: true },
  { href: "/dashboard/progress", icon: TrendingUp, label: "Progress", gated: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { completion, isGated, setProfile } = useProfile();

  const handleSignOut = () => {
    clearTokens();
    setProfile(EMPTY_PROFILE);
    localStorage.removeItem("acm_profile");
    router.push("/login");
  };

  return (
    <aside className="w-60 shrink-0 h-screen sticky top-0 flex flex-col glass border-r border-foreground/5 px-4 py-6">
      <Link href="/" className="flex items-center gap-2 mb-8 px-2">
        <Sparkles size={18} className="text-purple-400" />
        <span className="text-base font-bold gradient-text">AI Career Mentor</span>
      </Link>

      {/* completion mini bar */}
      <div className="mb-6 px-2">
        <div className="flex justify-between text-xs text-foreground/40 mb-1.5">
          <span>Profile</span>
          <span className={completion >= 80 ? "text-green-400" : "text-purple-400"}>{completion}%</span>
        </div>
        <div className="h-1 bg-foreground/5 rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${completion}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`h-full rounded-full ${completion >= 80 ? "bg-green-500" : "bg-gradient-to-r from-purple-500 to-blue-500"}`}
          />
        </div>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {NAV.map(({ href, icon: Icon, label, gated }) => {
          const locked = gated && isGated;
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={locked ? "/profile" : href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all relative group
                ${active ? "bg-purple-600/20 text-foreground border border-purple-500/30" : "text-foreground/50 hover:text-foreground hover:bg-foreground/5"}
                ${locked ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Icon size={16} />
              <span>{label}</span>
              {locked && (
                <span className="ml-auto text-[10px] text-foreground/30 border border-foreground/10 rounded px-1">🔒</span>
              )}
              {active && (
                <motion.div layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-purple-600/10 -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }} />
              )}
            </Link>
          );
        })}
      </nav>

      <button onClick={handleSignOut} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/30 hover:text-white/60 transition-colors mt-4">
        <LogOut size={16} />
        <span>Sign out</span>
      </button>
    </aside>
  );
}

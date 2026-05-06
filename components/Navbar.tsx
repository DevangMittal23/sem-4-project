"use client";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, Sparkles, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function Navbar() {
  const [open, setOpen]       = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted]  = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <motion.nav
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgb(var(--surface) / 0.95)" : "rgb(var(--surface) / 0.70)",
        backdropFilter: "blur(16px)",
        borderBottom: `1px solid rgb(var(--border))`,
        boxShadow: scrolled ? "var(--shadow-md)" : "none",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "rgb(var(--primary) / 0.12)", border: "1px solid rgb(var(--primary-border))" }}>
            <Sparkles size={15} style={{ color: "rgb(var(--primary))" }} />
          </div>
          <span className="text-lg font-bold gradient-text">AI Career Mentor</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8 text-sm">
          {["Features", "How It Works", "About"].map(label => (
            <a key={label}
              href={`#${label.toLowerCase().replace(/ /g, "-")}`}
              className="font-medium transition-colors"
              style={{ color: "rgb(var(--foreground-muted))" }}
              onMouseEnter={e => (e.currentTarget.style.color = "rgb(var(--foreground))")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgb(var(--foreground-muted))")}
            >{label}</a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme toggle */}
          {mounted && (
            <button onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
              style={{ background: "rgb(var(--surface-raised))", border: "1px solid rgb(var(--border))", color: "rgb(var(--foreground-muted))" }}>
              {resolvedTheme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          )}
          <Link href="/login"
            className="px-4 py-2 text-sm rounded-xl font-medium transition-all"
            style={{
              border: "1px solid rgb(var(--border-strong))",
              color: "rgb(var(--foreground))",
              background: "rgb(var(--surface))",
            }}>
            Login
          </Link>
          <Link href="/signup" className="btn-primary text-sm px-4 py-2">
            Get Started
          </Link>
        </div>

        {/* Mobile toggle */}
        <div className="flex md:hidden items-center gap-2">
          {mounted && (
            <button onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "rgb(var(--surface-raised))", border: "1px solid rgb(var(--border))", color: "rgb(var(--foreground-muted))" }}>
              {resolvedTheme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          )}
          <button className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ color: "rgb(var(--foreground-muted))", background: "rgb(var(--surface-raised))", border: "1px solid rgb(var(--border))" }}
            onClick={() => setOpen(!open)}>
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden"
            style={{ borderTop: "1px solid rgb(var(--border))", background: "rgb(var(--surface) / 0.98)" }}>
            <div className="px-6 py-4 flex flex-col gap-4">
              {["Features", "How It Works", "About"].map(label => (
                <a key={label} href={`#${label.toLowerCase().replace(/ /g, "-")}`}
                  className="text-sm font-medium"
                  style={{ color: "rgb(var(--foreground-muted))" }}
                  onClick={() => setOpen(false)}>{label}</a>
              ))}
              <div className="flex gap-3 pt-2">
                <Link href="/login" onClick={() => setOpen(false)}
                  className="flex-1 text-center px-4 py-2 text-sm rounded-xl font-medium"
                  style={{ border: "1px solid rgb(var(--border-strong))", color: "rgb(var(--foreground))" }}>Login</Link>
                <Link href="/signup" onClick={() => setOpen(false)}
                  className="flex-1 text-center btn-primary text-sm px-4 py-2">Get Started</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

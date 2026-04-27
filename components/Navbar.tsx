"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5"
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold gradient-text">
          AI Career Mentor
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm text-white/70">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="#about" className="hover:text-white transition-colors">About</a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm rounded-xl border border-white/20 text-white/80 hover:border-purple-500/50 hover:text-white transition-all"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 text-sm rounded-xl btn-primary text-white font-medium"
          >
            Get Started
          </Link>
        </div>

        <button className="md:hidden text-white/70" onClick={() => setOpen(!open)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden glass border-t border-white/5 px-6 py-4 flex flex-col gap-4"
        >
          <a href="#features" className="text-white/70 hover:text-white text-sm" onClick={() => setOpen(false)}>Features</a>
          <a href="#how-it-works" className="text-white/70 hover:text-white text-sm" onClick={() => setOpen(false)}>How It Works</a>
          <a href="#about" className="text-white/70 hover:text-white text-sm" onClick={() => setOpen(false)}>About</a>
          <div className="flex gap-3 pt-2">
            <Link href="/login" className="flex-1 text-center px-4 py-2 text-sm rounded-xl border border-white/20 text-white/80">Login</Link>
            <Link href="/signup" className="flex-1 text-center px-4 py-2 text-sm rounded-xl btn-primary text-white font-medium">Get Started</Link>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}

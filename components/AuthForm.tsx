"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Eye, EyeOff, Loader2, User, Mail, Lock, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRegister, apiLogin, apiGetProfile, saveTokens } from "@/lib/api";
import { useStore } from "@/lib/store";

interface LoginForm  { username: string; password: string; }
interface SignupForm { email: string; username: string; password: string; confirmPassword: string; }

/* ── Reusable input ──────────────────────────────────────────── */
function InputField({ label, icon: Icon, type, value, onChange, error, placeholder, rightSlot }: {
  label: string; icon: React.ElementType; type: string; value: string;
  onChange: (v: string) => void; error?: string; placeholder?: string; rightSlot?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-label">{label}</label>
      <div className="relative">
        <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors"
          style={{ color: focused ? "rgb(var(--primary))" : "rgb(var(--foreground-faint))" }} />
        <input
          type={type} value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder ?? label}
          onFocus={e => { setFocused(true); e.target.style.borderColor = "rgb(var(--primary-border))"; e.target.style.boxShadow = "0 0 0 3px rgb(var(--primary) / 0.10)"; }}
          onBlur={e => { setFocused(false); e.target.style.borderColor = error ? "rgb(var(--danger) / 0.5)" : "rgb(var(--border-strong))"; e.target.style.boxShadow = "none"; }}
          className="w-full pl-10 pr-10 py-3 rounded-xl text-sm outline-none transition-all"
          style={{
            background: "rgb(var(--background-alt))",
            border: `1px solid ${error ? "rgb(var(--danger) / 0.5)" : "rgb(var(--border-strong))"}`,
            color: "rgb(var(--foreground))",
          }}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</div>
      </div>
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-xs flex items-center gap-1" style={{ color: "rgb(var(--danger))" }}>
            <span className="w-1 h-1 rounded-full inline-block" style={{ background: "rgb(var(--danger))" }} />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function EyeToggle({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle} className="p-0.5 transition-colors"
      style={{ color: "rgb(var(--foreground-faint))" }}
      onMouseEnter={e => (e.currentTarget.style.color = "rgb(var(--foreground-muted))")}
      onMouseLeave={e => (e.currentTarget.style.color = "rgb(var(--foreground-faint))")}
      tabIndex={-1}>
      {show ? <EyeOff size={15} /> : <Eye size={15} />}
    </button>
  );
}

/* ── Login form ──────────────────────────────────────────────── */
function LoginFormUI({ onSubmit, loading, serverError }: {
  onSubmit: (u: string, p: string) => void; loading: boolean; serverError: string;
}) {
  const [form, setForm] = useState<LoginForm>({ username: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginForm>>({});
  const set = (f: keyof LoginForm) => (v: string) => { setForm(p => ({ ...p, [f]: v })); setErrors(p => ({ ...p, [f]: "" })); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Partial<LoginForm> = {};
    if (form.username.trim().length < 3) errs.username = "Enter your username";
    if (form.password.length < 6) errs.password = "Password must be at least 6 characters";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSubmit(form.username.trim(), form.password);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <InputField label="Username" icon={User} type="text" value={form.username} onChange={set("username")} error={errors.username} placeholder="your_username" />
      <InputField label="Password" icon={Lock} type={showPass ? "text" : "password"} value={form.password} onChange={set("password")} error={errors.password} placeholder="••••••••" rightSlot={<EyeToggle show={showPass} onToggle={() => setShowPass(p => !p)} />} />
      <AnimatePresence>
        {serverError && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="px-4 py-3 rounded-xl text-sm"
            style={{ background: "rgb(var(--danger) / 0.08)", border: "1px solid rgb(var(--danger) / 0.22)", color: "rgb(var(--danger))" }}>
            {serverError}
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
        className="mt-1 w-full py-3 rounded-xl btn-primary font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={15} />}
        {loading ? "Signing in…" : "Sign In"}
      </motion.button>
    </form>
  );
}

/* ── Signup form ─────────────────────────────────────────────── */
function SignupFormUI({ onSubmit, loading, serverError }: {
  onSubmit: (email: string, username: string, password: string) => void; loading: boolean; serverError: string;
}) {
  const [form, setForm] = useState<SignupForm>({ email: "", username: "", password: "", confirmPassword: "" });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Partial<SignupForm>>({});
  const set = (f: keyof SignupForm) => (v: string) => { setForm(p => ({ ...p, [f]: v })); setErrors(p => ({ ...p, [f]: "" })); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Partial<SignupForm> = {};
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = "Enter a valid email address";
    if (form.username.trim().length < 3) errs.username = "Username must be at least 3 characters";
    if (form.password.length < 6) errs.password = "Password must be at least 6 characters";
    if (form.confirmPassword !== form.password) errs.confirmPassword = "Passwords do not match";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSubmit(form.email.trim(), form.username.trim(), form.password);
  };

  const strength = (() => {
    const p = form.password;
    if (!p) return null;
    if (p.length < 6) return { label: "Too short", color: "rgb(var(--danger))", width: "25%" };
    if (p.length < 8 || !/[0-9]/.test(p)) return { label: "Weak", color: "rgb(var(--warning))", width: "50%" };
    if (!/[^a-zA-Z0-9]/.test(p)) return { label: "Good", color: "rgb(var(--primary))", width: "75%" };
    return { label: "Strong", color: "rgb(var(--accent))", width: "100%" };
  })();

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <InputField label="Email" icon={Mail} type="email" value={form.email} onChange={set("email")} error={errors.email} placeholder="you@example.com" />
      <InputField label="Username" icon={User} type="text" value={form.username} onChange={set("username")} error={errors.username} placeholder="your_username" />
      <div className="flex flex-col gap-1.5">
        <InputField label="Password" icon={Lock} type={showPass ? "text" : "password"} value={form.password} onChange={set("password")} error={errors.password} placeholder="••••••••" rightSlot={<EyeToggle show={showPass} onToggle={() => setShowPass(p => !p)} />} />
        {strength && (
          <div className="flex items-center gap-2 px-1">
            <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "rgb(var(--border))" }}>
              <motion.div animate={{ width: strength.width }} transition={{ duration: 0.3 }}
                className="h-full rounded-full" style={{ background: strength.color }} />
            </div>
            <span className="text-[10px] font-semibold" style={{ color: strength.color }}>{strength.label}</span>
          </div>
        )}
      </div>
      <InputField label="Confirm Password" icon={Lock} type={showConfirm ? "text" : "password"} value={form.confirmPassword} onChange={set("confirmPassword")} error={errors.confirmPassword} placeholder="••••••••" rightSlot={<EyeToggle show={showConfirm} onToggle={() => setShowConfirm(p => !p)} />} />
      <AnimatePresence>
        {serverError && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="px-4 py-3 rounded-xl text-sm"
            style={{ background: "rgb(var(--danger) / 0.08)", border: "1px solid rgb(var(--danger) / 0.22)", color: "rgb(var(--danger))" }}>
            {serverError}
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
        className="mt-1 w-full py-3 rounded-xl btn-primary font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={15} />}
        {loading ? "Creating account…" : "Create Account"}
      </motion.button>
    </form>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Main AuthForm
═══════════════════════════════════════════════════════════════ */
export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const { setProfile } = useStore();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const nav = (path: string) => setTimeout(() => router.push(path), 0);

  const handleLogin = async (username: string, password: string) => {
    setServerError(""); setLoading(true);
    try {
      const res = await apiLogin(username, password);
      saveTokens(res.tokens.access, res.tokens.refresh);
      if (res.is_assessment_completed) {
        try { const p = await apiGetProfile(); setProfile(p); } catch { /* non-fatal */ }
        nav("/dashboard");
      } else {
        nav("/assessment");
      }
    } catch (err: unknown) {
      const e = err as { data?: { error?: string } };
      setServerError(e?.data?.error ?? "Invalid username or password.");
    } finally { setLoading(false); }
  };

  const handleSignup = async (email: string, username: string, password: string) => {
    setServerError(""); setLoading(true);
    try {
      const res = await apiRegister(username, email, password);
      saveTokens(res.tokens.access, res.tokens.refresh);
      nav("/assessment");
    } catch (err: unknown) {
      const e = err as { data?: { error?: string; email?: string[]; username?: string[] } };
      setServerError(e?.data?.error ?? e?.data?.email?.[0] ?? e?.data?.username?.[0] ?? "Registration failed. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: "rgb(var(--background))" }}>

      {/* Blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgb(var(--primary) / 0.07) 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgb(var(--accent) / 0.05) 0%, transparent 70%)", transform: "translate(-30%, 30%)" }} />

      {/* Card */}
      <motion.div initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md">
        <div className="rounded-2xl p-8"
          style={{
            background: "rgb(var(--surface))",
            border: "1px solid rgb(var(--border-strong))",
            boxShadow: "var(--shadow-xl)",
          }}>

          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "rgb(var(--primary) / 0.10)", border: "1px solid rgb(var(--primary-border))" }}>
                <Sparkles size={16} style={{ color: "rgb(var(--primary))" }} />
              </div>
              <span className="text-lg font-bold gradient-text">AI Career Mentor</span>
            </Link>
            <h1 className="text-2xl font-black mb-1.5" style={{ color: "rgb(var(--foreground))" }}>
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-sm" style={{ color: "rgb(var(--foreground-muted))" }}>
              {mode === "login" ? "Sign in to continue your career journey" : "Start your AI-powered career journey today"}
            </p>
          </div>

          {/* Form */}
          {mode === "login"
            ? <LoginFormUI onSubmit={handleLogin} loading={loading} serverError={serverError} />
            : <SignupFormUI onSubmit={handleSignup} loading={loading} serverError={serverError} />}

          {/* Toggle link */}
          <p className="text-center text-sm mt-6" style={{ color: "rgb(var(--foreground-faint))" }}>
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <Link href={mode === "login" ? "/signup" : "/login"}
              className="font-semibold transition-colors"
              style={{ color: "rgb(var(--primary))" }}>
              {mode === "login" ? "Sign up" : "Sign in"}
              <ArrowRight size={11} className="inline ml-0.5" />
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

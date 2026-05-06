"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Eye, EyeOff, Loader2, User, Mail, Lock, Sparkles, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRegister, apiLogin, apiGoogleAuth, apiGetProfile, saveTokens } from "@/lib/api";
import { useStore } from "@/lib/store";
import { useGoogleLogin } from "@react-oauth/google";

interface LoginForm  { username: string; password: string; }
interface SignupForm { email: string; username: string; password: string; confirmPassword: string; }

/* ── Toast notification ─────────────────────────────────────── */
function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className="fixed top-6 right-6 z-50 px-5 py-3.5 rounded-xl flex items-center gap-3 shadow-2xl backdrop-blur-xl max-w-sm"
      style={{
        background: type === "success"
          ? "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(16,185,129,0.10))"
          : "linear-gradient(135deg, rgba(239,68,68,0.15), rgba(220,38,38,0.10))",
        border: `1px solid ${type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
        color: type === "success" ? "#4ade80" : "#f87171",
      }}
    >
      {type === "success" ? <CheckCircle size={18} /> : <span className="text-lg">⚠</span>}
      <span className="text-sm font-medium">{message}</span>
    </motion.div>
  );
}

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

/* ── Google Icon SVG ─────────────────────────────────────────── */
function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

/* ── Divider ─────────────────────────────────────────────────── */
function OrDivider() {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px" style={{ background: "rgb(var(--border-strong))" }} />
      <span className="text-xs font-medium tracking-wider uppercase" style={{ color: "rgb(var(--foreground-faint))" }}>
        or
      </span>
      <div className="flex-1 h-px" style={{ background: "rgb(var(--border-strong))" }} />
    </div>
  );
}

/* ── Google Sign-In Button ───────────────────────────────────── */
function GoogleSignInButton({ onSuccess, loading }: {
  onSuccess: (token: string) => void;
  loading: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  const googleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      // useGoogleLogin with implicit flow gives access_token
      // We need the id_token, so we use the credential flow instead
      // Let's fetch userinfo and pass the access token
      onSuccess(tokenResponse.access_token);
    },
    onError: () => {
      // Error is handled at the parent level
    },
    flow: "implicit",
  });

  return (
    <motion.button
      type="button"
      onClick={() => googleLogin()}
      disabled={loading}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
      style={{
        background: hovered
          ? "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))"
          : "rgba(255,255,255,0.03)",
        border: `1px solid ${hovered ? "rgba(255,255,255,0.18)" : "rgb(var(--border-strong))"}`,
        color: "rgb(var(--foreground))",
        boxShadow: hovered
          ? "0 0 20px rgba(66,133,244,0.10), 0 0 40px rgba(66,133,244,0.05)"
          : "none",
      }}
    >
      {/* Glow effect on hover */}
      <motion.div
        className="absolute inset-0 rounded-xl pointer-events-none"
        animate={{
          opacity: hovered ? 1 : 0,
        }}
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(66,133,244,0.06) 0%, transparent 70%)",
        }}
      />
      {loading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <GoogleIcon size={18} />
      )}
      <span className="relative z-10">
        {loading ? "Connecting…" : "Continue with Google"}
      </span>
    </motion.button>
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
  const [googleLoading, setGoogleLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const nav = (path: string) => setTimeout(() => router.push(path), 0);

  const handleLogin = async (username: string, password: string) => {
    setServerError(""); setLoading(true);
    try {
      const res = await apiLogin(username, password);
      saveTokens(res.tokens.access, res.tokens.refresh);
      setToast({ message: "Welcome back! Redirecting…", type: "success" });
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
      setToast({ message: "Account created! Starting assessment…", type: "success" });
      nav("/assessment");
    } catch (err: unknown) {
      const e = err as { data?: { error?: string; email?: string[]; username?: string[] } };
      setServerError(e?.data?.error ?? e?.data?.email?.[0] ?? e?.data?.username?.[0] ?? "Registration failed. Please try again.");
    } finally { setLoading(false); }
  };

  /* ── Google auth handler ──────────────────────────────────── */
  const handleGoogleAuth = async (accessToken: string) => {
    setServerError("");
    setGoogleLoading(true);
    try {
      // The implicit flow gives us an access_token, not an id_token.
      // We need to exchange it for user info and pass the access_token to backend.
      // Our backend will handle verification using the access_token.
      const res = await apiGoogleAuth(accessToken);
      saveTokens(res.tokens.access, res.tokens.refresh);

      if (res.is_assessment_completed) {
        setToast({ message: "Welcome back! Redirecting to dashboard…", type: "success" });
        try { const p = await apiGetProfile(); setProfile(p); } catch { /* non-fatal */ }
        nav("/dashboard");
      } else {
        setToast({
          message: res.is_new_user
            ? "Account created with Google! Let's start your assessment."
            : "Welcome back! Let's complete your assessment.",
          type: "success",
        });
        nav("/assessment");
      }
    } catch (err: unknown) {
      const e = err as { data?: { error?: string } };
      const msg = e?.data?.error ?? "Google authentication failed. Please try again.";
      setServerError(msg);
      setToast({ message: msg, type: "error" });
    } finally {
      setGoogleLoading(false);
    }
  };

  const isAnyLoading = loading || googleLoading;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: "rgb(var(--background))" }}>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

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

          {/* Google Sign-In */}
          <GoogleSignInButton onSuccess={handleGoogleAuth} loading={googleLoading} />

          {/* Divider */}
          <OrDivider />

          {/* Form */}
          {mode === "login"
            ? <LoginFormUI onSubmit={handleLogin} loading={isAnyLoading} serverError={serverError} />
            : <SignupFormUI onSubmit={handleSignup} loading={isAnyLoading} serverError={serverError} />}

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

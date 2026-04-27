"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Eye, EyeOff, Loader2, User, Mail, Lock, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRegister, apiLogin, apiGetProfile, saveTokens } from "@/lib/api";
import { useProfile } from "@/lib/profileContext";

interface AuthFormProps {
  mode: "login" | "signup";
}

interface LoginForm {
  username: string;
  password: string;
}

interface SignupForm {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

function InputField({
  label,
  icon: Icon,
  type,
  value,
  onChange,
  error,
  placeholder,
  rightSlot,
}: {
  label: string;
  icon: React.ElementType;
  type: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  rightSlot?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-white/50 uppercase tracking-wider">{label}</label>
      <div className="relative group">
        <Icon
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 group-focus-within:text-purple-400 transition-colors pointer-events-none"
        />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? label}
          className={`w-full pl-10 pr-10 py-3 rounded-xl bg-transparent border text-white placeholder-white/20 text-sm outline-none transition-all autofill-transparent
            focus:border-purple-500/60 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.12)]
            ${error ? "border-red-500/50" : "border-white/10 hover:border-white/20"}`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {rightSlot ?? <span className="w-4" />}
        </div>
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-xs text-red-400 flex items-center gap-1"
          >
            <span className="w-1 h-1 rounded-full bg-red-400 inline-block" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function EyeToggle({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="text-white/30 hover:text-white/70 transition-colors p-0.5"
      tabIndex={-1}
    >
      {show ? <EyeOff size={15} /> : <Eye size={15} />}
    </button>
  );
}

// ── Login form ────────────────────────────────────────────────────────────────

function LoginFormUI({
  onSubmit,
  loading,
  serverError,
}: {
  onSubmit: (username: string, password: string) => void;
  loading: boolean;
  serverError: string;
}) {
  const [form, setForm] = useState<LoginForm>({ username: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginForm>>({});

  const set = (field: keyof LoginForm) => (v: string) => {
    setForm((p) => ({ ...p, [field]: v }));
    setErrors((p) => ({ ...p, [field]: "" }));
  };

  const validate = () => {
    const e: Partial<LoginForm> = {};
    if (form.username.trim().length < 3) e.username = "Enter your username";
    if (form.password.length < 6) e.password = "Password must be at least 6 characters";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSubmit(form.username.trim(), form.password);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <InputField
        label="Username"
        icon={User}
        type="text"
        value={form.username}
        onChange={set("username")}
        error={errors.username}
        placeholder="your_username"
      />
      <InputField
        label="Password"
        icon={Lock}
        type={showPass ? "text" : "password"}
        value={form.password}
        onChange={set("password")}
        error={errors.password}
        placeholder="••••••••"
        rightSlot={<EyeToggle show={showPass} onToggle={() => setShowPass((p) => !p)} />}
      />

      <AnimatePresence>
        {serverError && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            {serverError}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="submit"
        disabled={loading}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="mt-1 w-full py-3 rounded-xl btn-primary text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={15} />}
        {loading ? "Signing in..." : "Sign In"}
      </motion.button>
    </form>
  );
}

// ── Signup form ───────────────────────────────────────────────────────────────

function SignupFormUI({
  onSubmit,
  loading,
  serverError,
}: {
  onSubmit: (email: string, username: string, password: string) => void;
  loading: boolean;
  serverError: string;
}) {
  const [form, setForm] = useState<SignupForm>({ email: "", username: "", password: "", confirmPassword: "" });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Partial<SignupForm>>({});

  const set = (field: keyof SignupForm) => (v: string) => {
    setForm((p) => ({ ...p, [field]: v }));
    setErrors((p) => ({ ...p, [field]: "" }));
  };

  const validate = () => {
    const e: Partial<SignupForm> = {};
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = "Enter a valid email address";
    if (form.username.trim().length < 3) e.username = "Username must be at least 3 characters";
    if (form.password.length < 6) e.password = "Password must be at least 6 characters";
    if (form.confirmPassword !== form.password) e.confirmPassword = "Passwords do not match";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSubmit(form.email.trim(), form.username.trim(), form.password);
  };

  const passwordStrength = (() => {
    const p = form.password;
    if (!p) return null;
    if (p.length < 6) return { label: "Too short", color: "bg-red-500", width: "25%" };
    if (p.length < 8 || !/[0-9]/.test(p)) return { label: "Weak", color: "bg-amber-500", width: "50%" };
    if (!/[^a-zA-Z0-9]/.test(p)) return { label: "Good", color: "bg-blue-500", width: "75%" };
    return { label: "Strong", color: "bg-green-500", width: "100%" };
  })();

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <InputField
        label="Email"
        icon={Mail}
        type="email"
        value={form.email}
        onChange={set("email")}
        error={errors.email}
        placeholder="you@example.com"
      />
      <InputField
        label="Username"
        icon={User}
        type="text"
        value={form.username}
        onChange={set("username")}
        error={errors.username}
        placeholder="your_username"
      />
      <div className="flex flex-col gap-1.5">
        <InputField
          label="Password"
          icon={Lock}
          type={showPass ? "text" : "password"}
          value={form.password}
          onChange={set("password")}
          error={errors.password}
          placeholder="••••••••"
          rightSlot={<EyeToggle show={showPass} onToggle={() => setShowPass((p) => !p)} />}
        />
        {passwordStrength && (
          <div className="flex items-center gap-2 px-1">
            <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: passwordStrength.width }}
                transition={{ duration: 0.3 }}
                className={`h-full rounded-full ${passwordStrength.color}`}
              />
            </div>
            <span className={`text-[10px] font-medium ${
              passwordStrength.label === "Strong" ? "text-green-400"
              : passwordStrength.label === "Good" ? "text-blue-400"
              : passwordStrength.label === "Weak" ? "text-amber-400"
              : "text-red-400"
            }`}>
              {passwordStrength.label}
            </span>
          </div>
        )}
      </div>
      <InputField
        label="Confirm Password"
        icon={Lock}
        type={showConfirm ? "text" : "password"}
        value={form.confirmPassword}
        onChange={set("confirmPassword")}
        error={errors.confirmPassword}
        placeholder="••••••••"
        rightSlot={<EyeToggle show={showConfirm} onToggle={() => setShowConfirm((p) => !p)} />}
      />

      <AnimatePresence>
        {serverError && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            {serverError}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="submit"
        disabled={loading}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="mt-1 w-full py-3 rounded-xl btn-primary text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={15} />}
        {loading ? "Creating account..." : "Create Account"}
      </motion.button>
    </form>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { updateProfile } = useProfile();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleLogin = async (username: string, password: string) => {
    setServerError("");
    setLoading(true);
    try {
      const res = await apiLogin(username, password);
      saveTokens(res.tokens.access, res.tokens.refresh);

      if (res.is_assessment_completed) {
        try {
          const p = await apiGetProfile();
          updateProfile({
            name: p.name,
            profession: p.profession,
            experience: p.experience_years,
            level: p.experience_level,
            goal: p.goal,
            target_domain: p.preferred_domain,
            skills: Array.isArray(p.skills) ? p.skills : [],
            education: p.education,
            status: p.current_status,
            availability: p.availability,
            career_goal: p.goal,
            linkedin: p.linkedin,
            bio: p.bio,
            // store backend's authoritative completion so isGated is correct
            backend_completion: p.profile_completion,
          });
        } catch {}
        router.push("/dashboard");
      } else {
        updateProfile({ name: res.user.username, backend_completion: null });
        router.push("/assessment");
      }
    } catch (err: unknown) {
      const e = err as { data?: { error?: string } };
      setServerError(e?.data?.error ?? "Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (email: string, username: string, password: string) => {
    setServerError("");
    setLoading(true);
    try {
      const res = await apiRegister(username, email, password);
      saveTokens(res.tokens.access, res.tokens.refresh);
      updateProfile({ name: res.user.username });
      router.push("/assessment");
    } catch (err: unknown) {
      const e = err as { data?: { error?: string; email?: string[]; username?: string[] } };
      setServerError(
        e?.data?.error ?? e?.data?.email?.[0] ?? e?.data?.username?.[0] ?? "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-[#050508]">
      {/* background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-blue-600/5 rounded-full blur-[80px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        {/* card */}
        <div className="glass glow-border rounded-2xl p-8">
          {/* header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-5">
              <Sparkles size={18} className="text-purple-400" />
              <span className="text-lg font-bold gradient-text">AI Career Mentor</span>
            </Link>
            <h1 className="text-2xl font-bold text-white mb-1.5">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-sm text-white/40">
              {mode === "login"
                ? "Sign in to continue your career journey"
                : "Start your AI-powered career journey today"}
            </p>
          </div>

          {/* form */}
          {mode === "login" ? (
            <LoginFormUI onSubmit={handleLogin} loading={loading} serverError={serverError} />
          ) : (
            <SignupFormUI onSubmit={handleSignup} loading={loading} serverError={serverError} />
          )}

          {/* footer link */}
          <p className="text-center text-sm text-white/35 mt-6">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <Link
              href={mode === "login" ? "/signup" : "/login"}
              className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

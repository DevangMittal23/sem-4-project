"use client";
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";

export interface ProfileData {
  name: string;
  profession: string;
  experience: string;
  level: string;
  goal: string;
  target_domain: string;
  skills: string[];
  education: string;
  status: string;
  availability: string;
  career_goal: string;
  linkedin: string;
  bio: string;
  // authoritative completion from backend — overrides local calc when set
  backend_completion: number | null;
}

export const EMPTY_PROFILE: ProfileData = {
  name: "", profession: "", experience: "", level: "", goal: "",
  target_domain: "", skills: [],
  education: "", status: "", availability: "", career_goal: "", linkedin: "", bio: "",
  backend_completion: null,
};

// Mirrors backend PROFILE_REQUIRED_FIELDS exactly (7 fields → 100% when all filled)
export const REQUIRED_FIELDS: (keyof ProfileData)[] = [
  "name", "profession", "level",
  "education", "status", "availability", "goal",
];

export function calcCompletion(p: ProfileData): number {
  // Always trust the backend value when available
  if (p.backend_completion !== null && p.backend_completion !== undefined) {
    return p.backend_completion;
  }
  const filled = REQUIRED_FIELDS.filter((f) => {
    const v = p[f];
    return Array.isArray(v) ? v.length > 0 : String(v ?? "").trim() !== "";
  }).length;
  return Math.round((filled / REQUIRED_FIELDS.length) * 100);
}

function persist(p: ProfileData) {
  try { localStorage.setItem("acm_profile", JSON.stringify(p)); } catch {}
}

function load(): ProfileData | null {
  try {
    const raw = localStorage.getItem("acm_profile");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ProfileData;
    // ensure new field exists on old saved data
    if (parsed.backend_completion === undefined) parsed.backend_completion = null;
    return parsed;
  } catch { return null; }
}

interface ProfileCtx {
  profile: ProfileData;
  setProfile: (p: ProfileData) => void;
  updateProfile: (partial: Partial<ProfileData>) => void;
  completion: number;
  isGated: boolean;
}

const Ctx = createContext<ProfileCtx | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<ProfileData>(EMPTY_PROFILE);

  useEffect(() => {
    const saved = load();
    if (saved) setProfileState(saved);
  }, []);

  const setProfile = useCallback((p: ProfileData) => {
    persist(p);
    setProfileState(p);
  }, []);

  const updateProfile = useCallback((partial: Partial<ProfileData>) => {
    setProfileState((prev) => {
      const next = { ...prev, ...partial };
      persist(next);
      return next;
    });
  }, []);

  const completion = calcCompletion(profile);
  const isGated = completion < 80;

  return (
    <Ctx.Provider value={{ profile, setProfile, updateProfile, completion, isGated }}>
      {children}
    </Ctx.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useProfile must be used inside ProfileProvider");
  return ctx;
}

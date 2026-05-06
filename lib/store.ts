import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiGetProfile, apiGetSkillGap, apiGetCareers, apiGetDashboardStats, ApiProfile, SkillGapData, CareerPathResult, DashboardStats } from "./api";

// ── Required fields (mirrors Django PROFILE_REQUIRED_FIELDS) ──────────────────

const REQUIRED_FIELDS = ["name", "profession", "experience_level", "education", "current_status", "availability", "goal"] as const;

function calcCompletion(p: Partial<ApiProfile>): number {
  if (p.profile_completion != null) return p.profile_completion;
  const filled = REQUIRED_FIELDS.filter((f) => {
    const v = p[f as keyof ApiProfile];
    return v != null && String(v).trim() !== "";
  }).length;
  return Math.round((filled / REQUIRED_FIELDS.length) * 100);
}

// ── Store shape ───────────────────────────────────────────────────────────────

export interface ProfileState {
  // Profile
  profile: ApiProfile | null;
  completion: number;
  isGated: boolean;
  missing: string[];

  // Intelligence
  skillGap: SkillGapData | null;
  careers: CareerPathResult[];
  stats: DashboardStats | null;

  // UI
  loading: boolean;
  syncing: boolean;
  sidebarOpen: boolean;

  // Actions
  loadProfile: () => Promise<void>;
  loadIntelligence: () => Promise<void>;
  loadStats: () => Promise<void>;
  syncAll: () => Promise<void>;
  setProfile: (p: ApiProfile) => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      // Defaults
      profile: null,
      completion: 0,
      isGated: true,
      missing: REQUIRED_FIELDS.map(String),
      skillGap: null,
      careers: [],
      stats: null,
      loading: true,
      syncing: false,
      sidebarOpen: true,

      // ── Load profile from backend ───────────────────────────────────────
      loadProfile: async () => {
        try {
          const p = await apiGetProfile();
          const comp = calcCompletion(p);
          const miss = REQUIRED_FIELDS.filter((f) => {
            const v = p[f as keyof ApiProfile];
            return v == null || String(v).trim() === "";
          }).map(String);
          set({
            profile: p,
            completion: comp,
            isGated: comp < 80,
            missing: miss,
            loading: false,
          });
        } catch {
          set({ loading: false });
        }
      },

      // ── Load intelligence data ──────────────────────────────────────────
      loadIntelligence: async () => {
        try {
          const [gap, careers] = await Promise.all([
            apiGetSkillGap().catch(() => null),
            apiGetCareers().catch(() => []),
          ]);
          set({
            skillGap: gap,
            careers: careers as CareerPathResult[],
          });
        } catch {}
      },

      // ── Load dashboard stats ────────────────────────────────────────────
      loadStats: async () => {
        try {
          const stats = await apiGetDashboardStats();
          set({ stats });
        } catch {}
      },

      // ── Sync everything ─────────────────────────────────────────────────
      syncAll: async () => {
        set({ syncing: true });
        const { loadProfile, loadIntelligence, loadStats } = get();
        await Promise.all([loadProfile(), loadIntelligence(), loadStats()]);
        set({ syncing: false });
      },

      // ── Optimistic set ──────────────────────────────────────────────────
      setProfile: (p: ApiProfile) => {
        const comp = calcCompletion(p);
        const miss = REQUIRED_FIELDS.filter((f) => {
          const v = p[f as keyof ApiProfile];
          return v == null || String(v).trim() === "";
        }).map(String);
        set({ profile: p, completion: comp, isGated: comp < 80, missing: miss });
      },

      setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
    }),
    {
      name: "acm-store",
      partialize: (s) => ({ sidebarOpen: s.sidebarOpen }),
    }
  )
);

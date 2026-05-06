// Resilient BASE URL: auto-append /api if the env var is set but missing the suffix
const _rawBase = (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api").replace(/\/+$/, "");
const BASE = _rawBase.endsWith("/api") ? _rawBase : `${_rawBase}/api`;

// ── Token helpers ─────────────────────────────────────────────────────────────

export function saveTokens(access: string, refresh: string) {
  localStorage.setItem("acm_access", access);
  localStorage.setItem("acm_refresh", refresh);
}

export function getAccessToken(): string | null {
  return typeof window !== "undefined" ? localStorage.getItem("acm_access") : null;
}

export function getRefreshToken(): string | null {
  return typeof window !== "undefined" ? localStorage.getItem("acm_refresh") : null;
}

export function clearTokens() {
  localStorage.removeItem("acm_access");
  localStorage.removeItem("acm_refresh");
}

// ── Core fetch ────────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options: RequestInit = {}, authenticated = true): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (authenticated) {
    const token = getAccessToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  const url = `${BASE}${path}`;
  
  // Add timeout for slow Render free-tier cold starts
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000); // 60s timeout
  
  try {
    const res = await fetch(url, { ...options, headers, signal: controller.signal });
    clearTimeout(timeout);
    
    if (!res.ok) {
      let err: Record<string, unknown>;
      try {
        err = await res.json();
      } catch {
        // Response isn't JSON (e.g., HTML 404 page) — build a useful error
        err = { error: `API error ${res.status}: ${res.statusText}`, url };
      }
      throw { status: res.status, data: err };
    }
    if (res.status === 204) return {} as T;
    return res.json();
  } catch (e: unknown) {
    clearTimeout(timeout);
    if (e && typeof e === "object" && "status" in e) throw e; // re-throw API errors
    // Network / timeout error
    const msg = e instanceof Error ? e.message : "Network error";
    throw { status: 0, data: { error: msg.includes("aborted") ? "Request timed out. The server may be starting up — please try again." : msg } };
  }
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  message: string;
  tokens: { access: string; refresh: string };
  user: { id: number; email: string; username: string };
  is_assessment_completed?: boolean;
  profile_completion?: number;
}

export async function apiRegister(username: string, email: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/register/", { method: "POST", body: JSON.stringify({ username, email, password }) }, false);
}

export async function apiLogin(username: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/login/", { method: "POST", body: JSON.stringify({ username, password }) }, false);
}

export async function apiLogout(refresh: string) {
  return apiFetch("/auth/logout/", { method: "POST", body: JSON.stringify({ refresh }) });
}

// ── User status ───────────────────────────────────────────────────────────────

export interface UserStatus {
  is_authenticated: boolean;
  is_assessment_completed: boolean;
  profile_completion: number;
  user_id: number;
  email: string;
  username: string;
}

export async function apiGetUserStatus(): Promise<UserStatus> {
  return apiFetch<UserStatus>("/auth/user/status/");
}

// ── Profile ───────────────────────────────────────────────────────────────────

export interface ApiProfile {
  id: number;
  email: string;
  username: string;
  name: string;
  profession: string;
  thinking_style: string;
  interests: string[];
  skills: string[];
  skill_levels: Record<string, string>;
  certifications: string[];
  preferred_domain: string;
  experience_level: string;
  experience_years: string;
  education: string;
  current_status: string;
  availability: string;
  goal: string;
  target_role: string;
  risk_tolerance: string;
  learning_style: string;
  side_income_type: string;
  target_salary: string;
  linkedin: string;
  bio: string;
  profile_completion: number;
  is_assessment_completed: boolean;
}

export async function apiGetProfile(): Promise<ApiProfile> {
  return apiFetch<ApiProfile>("/auth/profile/");
}

export async function apiUpdateProfile(data: Partial<ApiProfile>): Promise<ApiProfile> {
  return apiFetch<ApiProfile>("/auth/profile/update/", { method: "PUT", body: JSON.stringify(data) });
}

// ── Assessment ────────────────────────────────────────────────────────────────

export interface AnswerPayload {
  question_id: string;
  question_text: string;
  answer: string;
  answer_type?: string;
  section?: string;
}

export async function apiSubmitAssessment(answers: AnswerPayload[]) {
  return apiFetch("/assessment/submit/", { method: "POST", body: JSON.stringify({ answers }) });
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export interface DashboardData {
  user: { id: number; email: string; username: string; name: string };
  profile: ApiProfile;
  profile_completion: number;
  is_assessment_completed: boolean;
  career_prediction: { career: string; match: number; reason: string };
  insights: string[];
  tasks: { title: string; tag: string; status: string; estimated_time: string; difficulty: string }[];
  stats: { tasks_done: number; tasks_total: number; streak_days: number; ai_score: number };
}

export async function apiGetDashboard(): Promise<DashboardData> {
  return apiFetch<DashboardData>("/dashboard/");
}

// ── AI — Groq (chatbot) ───────────────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AssessmentChatResponse {
  reply: string;
  is_complete: boolean;
  history: ChatMessage[];
  profile_completion: number;
}

export async function apiAssessmentChat(message: string, history: ChatMessage[]): Promise<AssessmentChatResponse> {
  return apiFetch<AssessmentChatResponse>("/ai/assessment/chat/", {
    method: "POST",
    body: JSON.stringify({ message, history }),
  });
}

export interface ProfileChatResponse {
  reply: string;
  is_complete: boolean;
  history: ChatMessage[];
  missing_fields: string[];
  profile_completion: number;
}

export async function apiProfileChat(message: string, history: ChatMessage[]): Promise<ProfileChatResponse> {
  return apiFetch<ProfileChatResponse>("/ai/profile/chat/", {
    method: "POST",
    body: JSON.stringify({ message, history }),
  });
}

// ── AI — Gemini (intelligence) ────────────────────────────────────────────────

export interface CareerPathResult {
  id: number;
  title: string;
  description: string;
  required_skills: string[];
  match_score: number;
  is_selected: boolean;
  created_at: string;
}

export async function apiGetCareers(): Promise<CareerPathResult[]> {
  return apiFetch<CareerPathResult[]>("/ai/career/");
}

/** Regenerates career paths via Gemini — deletes existing paths first. Use only on explicit user action. */
export async function apiPredictCareer(): Promise<CareerPathResult[]> {
  return apiFetch<CareerPathResult[]>("/ai/career/", { method: "POST", body: JSON.stringify({}) });
}

// ── AI — Skill Gap + Roadmap + Tasks ────────────────────────────────────────

export interface SkillGapData {
  id: number;
  current_skills: string[];
  required_skills: string[];
  gap_skills: { skill: string; priority: string; estimated_weeks: number; reason: string }[];
  market_insights: string[];
  job_market_data: {
    avg_salary_current: string;
    avg_salary_target: string;
    demand_level: string;
    top_hiring_companies: string[];
    growth_rate: string;
  };
  recommendations: string[];
  career_options: {
    title: string; fit_score: number; time_to_achieve: string;
    salary_range: string; required_gap_skills: string[];
    reason: string; difficulty: string;
  }[];
  // Raw Adzuna data
  adzuna_jobs: {
    title: string; company: string; location: string;
    description: string; salary_min: number | null;
    salary_max: number | null; redirect_url: string;
  }[];
  adzuna_market_skills: { skill: string; demand: number }[];
  adzuna_salary: { avg_min: number; avg_max: number; formatted: string; sample_size: number };
  adzuna_role_searched: string;
  adzuna_jobs_count: number;
  created_at: string;
  updated_at: string;
}

export async function apiGetSkillGap(): Promise<SkillGapData> {
  return apiFetch<SkillGapData>("/ai/skill-gap/");
}

export async function apiRunSkillGap(): Promise<SkillGapData> {
  return apiFetch<SkillGapData>("/ai/skill-gap/", { method: "POST", body: JSON.stringify({}) });
}

export interface MarketSkillGapData {
  role: string;
  jobs_analysed: number;
  market_skills: { skill: string; demand: number }[];
  user_skills: string[];
  missing_skills: string[];
  strengths: string[];
  salary_summary: { avg_min: number; avg_max: number; formatted: string; sample_size: number };
}

export async function apiGetMarketSkillGap(role?: string): Promise<MarketSkillGapData> {
  const q = role ? `?role=${encodeURIComponent(role)}` : "";
  return apiFetch<MarketSkillGapData>(`/ai/market-skill-gap/${q}`);
}

export interface RoadmapPhase {
  phase: string;
  phase_number: number;
  weeks: string;
  week_start: number;
  week_end: number;
  goal: string;
  focus_skills: string[];
  milestone: string;
  resources: string[];
  weekly_plans: {
    week: number;
    theme: string;
    goals: string[];
    tasks: { title: string; description: string; tag: string; difficulty: string; estimated_time: string; resource_url: string; order: number }[];
  }[];
}

export interface RoadmapData {
  id: number;
  career_title: string;
  total_weeks: number;
  current_week: number;
  phases: RoadmapPhase[];
  is_active: boolean;
  weekly_plans: WeeklyPlanData[];
  created_at: string;
  updated_at: string;
}

export interface WeeklyPlanData {
  id: number;
  week_number: number;
  theme: string;
  goals: string[];
  is_current: boolean;
  is_completed: boolean;
  completion_pct: number;
  ai_feedback: string;
  tasks: TaskResult[];
  created_at: string;
}

export async function apiGetRoadmap(): Promise<RoadmapData> {
  return apiFetch<RoadmapData>("/ai/roadmap/");
}

export async function apiGenerateRoadmap(career_title: string): Promise<RoadmapData> {
  return apiFetch<RoadmapData>("/ai/roadmap/", { method: "POST", body: JSON.stringify({ career_title }) });
}

export async function apiCompleteWeek(): Promise<{ message: string; adaptation_note?: string; week?: WeeklyPlanData; roadmap_complete?: boolean }> {
  return apiFetch("/ai/weekly-plan/", { method: "POST", body: JSON.stringify({}) });
}

export async function apiGetWeeklyPlans(week?: number): Promise<WeeklyPlanData[]> {
  const q = week ? `?week=${week}` : "";
  return apiFetch<WeeklyPlanData[]>(`/ai/weekly-plan/${q}`);
}

export interface TaskResult {
  id: number;
  title: string;
  description: string;
  resource_url: string;
  difficulty: string;
  estimated_time: string;
  tag: string;
  status: string;
  week_number: number;
  order: number;
  target_skill: string;
  why_assigned: string;
}

export interface GenerateTasksResponse {
  week: number;
  theme: string;
  goals: string[];
  tasks: TaskResult[];
  plan: WeeklyPlanData;
}

export async function apiGenerateTasks(week_number = 1): Promise<GenerateTasksResponse> {
  return apiFetch<GenerateTasksResponse>("/ai/tasks/generate/", {
    method: "POST",
    body: JSON.stringify({ week_number }),
  });
}

export interface AnalysisResult {
  overall_score: number;
  learning_pace: string;
  strengths: string[];
  improvement_areas: string[];
  insights: string[];
  next_week_recommendation: string;
  difficulty_adjustment: string;
  weekly_summary: string;
}

export async function apiGetTasks(week?: number): Promise<TaskResult[]> {
  const q = week ? `?week=${week}` : "";
  return apiFetch<TaskResult[]>(`/ai/tasks/${q}`);
}

export async function apiUpdateTask(id: number, data: {
  status?: string; time_taken?: number; difficulty_feedback?: string; notes?: string;
}): Promise<TaskResult> {
  return apiFetch<TaskResult>(`/ai/tasks/${id}/`, { method: "PATCH", body: JSON.stringify(data) });
}

export async function apiAnalyzePerformance(): Promise<AnalysisResult> {
  return apiFetch<AnalysisResult>("/ai/analysis/", { method: "POST", body: JSON.stringify({}) });
}

// ── Dashboard Stats (live) ────────────────────────────────────────────────────

export interface DashboardStats {
  streak_days: number;
  ai_score: number;
  total_xp: number;
  tasks_done: number;
  tasks_total: number;
  week_tasks_done: number;
  week_tasks_total: number;
  completed_weeks: number;
  current_week: number;
  total_weeks: number;
  career_title: string | null;
  profile_completion: number;
  roadmap_pct: number;
  roadmap_progress: number;   // alias for roadmap_pct
}

export async function apiGetDashboardStats(): Promise<DashboardStats> {
  return apiFetch<DashboardStats>("/dashboard/stats/");
}

// ── Activity Log (GitHub-style calendar) ─────────────────────────────────────

export interface ActivityDay {
  date: string;
  tasks_completed: number;
  xp_earned: number;
  is_future: boolean;
}

export interface ActivityData {
  grid: ActivityDay[];
  streak_days: number;
  total_active_days: number;
}

export async function apiGetActivity(weeks = 5): Promise<ActivityData> {
  return apiFetch<ActivityData>(`/dashboard/activity/?weeks=${weeks}`);
}

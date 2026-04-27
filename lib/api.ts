const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";

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
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw { status: res.status, data: err };
  }
  if (res.status === 204) return {} as T;
  return res.json();
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
  preferred_domain: string;
  experience_level: string;
  experience_years: string;
  education: string;
  current_status: string;
  availability: string;
  goal: string;
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

export async function apiPredictCareer(): Promise<CareerPathResult[]> {
  return apiFetch<CareerPathResult[]>("/ai/career/", { method: "POST", body: JSON.stringify({}) });
}

export interface RoadmapPhase {
  phase: string;
  weeks: string;
  goal: string;
  topics: string[];
  resources: string[];
  milestone: string;
}

export interface RoadmapResult {
  title: string;
  total_weeks: number;
  phases: RoadmapPhase[];
}

export async function apiGenerateRoadmap(career_title: string): Promise<RoadmapResult> {
  return apiFetch<RoadmapResult>("/ai/roadmap/", { method: "POST", body: JSON.stringify({ career_title }) });
}

export interface TaskResult {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  estimated_time: string;
  tag: string;
  status: string;
  week_number: number;
}

export async function apiGenerateTasks(week_number: number, roadmap: RoadmapResult | null): Promise<TaskResult[]> {
  return apiFetch<TaskResult[]>("/ai/tasks/", { method: "POST", body: JSON.stringify({ week_number, roadmap }) });
}

export interface AnalysisResult {
  overall_score: number;
  learning_pace: string;
  strengths: string[];
  improvement_areas: string[];
  insights: string[];
  next_week_recommendation: string;
  difficulty_adjustment: string;
}

export async function apiAnalyzePerformance(): Promise<AnalysisResult> {
  return apiFetch<AnalysisResult>("/ai/analysis/", { method: "POST", body: JSON.stringify({}) });
}

// ── Tasks ─────────────────────────────────────────────────────────────────────

export async function apiGetTasks(week?: number): Promise<TaskResult[]> {
  const q = week ? `?week=${week}` : "";
  return apiFetch<TaskResult[]>(`/tasks/${q}`);
}

export async function apiUpdateTask(id: number, data: Partial<TaskResult>): Promise<TaskResult> {
  return apiFetch<TaskResult>(`/tasks/${id}/`, { method: "PATCH", body: JSON.stringify(data) });
}

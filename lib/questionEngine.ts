import questionsData from "@/data/questions.json";

export interface QuestionOption {
  value: string;
  label: string;
}

export interface Question {
  id: string;
  section?: string;
  type: "text" | "card_select" | "slider" | "completion";
  text: string;
  field?: string;
  options?: QuestionOption[];
  branching?: Record<string, string>;
  next_question?: string;
  skill_category?: string;
  evaluate?: boolean;
  min?: number;
  max?: number;
}

export interface UserState {
  name: string;
  profession: string;
  experience: string;
  level: string;
  goal: string;
  target_domain: string;
  switch_motivation: string;
  transferable_skills: string;
  domain_exploration: string;
  technical_skills: string;
  project_description: string;
  problem_solving_confidence: string;
  learning_experience: string;
  five_year_vision: string;
  career_priority: string;
  work_environment: string;
  skills: string[];
  scores: Record<string, number>;
  currentQuestionId: string;
  answers: Record<string, string>;
  completedSections: string[];
}

export const initialState: UserState = {
  name: "", profession: "", experience: "", level: "", goal: "",
  target_domain: "", switch_motivation: "", transferable_skills: "",
  domain_exploration: "", technical_skills: "", project_description: "",
  problem_solving_confidence: "", learning_experience: "", five_year_vision: "",
  career_priority: "", work_environment: "",
  skills: [], scores: {}, currentQuestionId: "S1Q1", answers: {}, completedSections: [],
};

const questions = questionsData.questions as Record<string, Question>;
const sections = questionsData.sections as Record<string, { id: string; name: string; description: string }>;

export function getQuestion(id: string): Question | null {
  return questions[id] ?? null;
}

export function getSection(id: string) {
  return sections[id] ?? null;
}

export function getNextQuestion(
  state: UserState,
  answer: string
): { nextId: string; updatedState: UserState } {
  const current = questions[state.currentQuestionId];
  if (!current) return { nextId: "COMPLETE", updatedState: state };

  const updatedState: UserState = {
    ...state,
    answers: { ...state.answers, [current.id]: answer },
  };

  if (current.field && current.field in updatedState) {
    (updatedState as unknown as Record<string, unknown>)[current.field] = answer;
  }

  if (current.field === "technical_skills") {
    updatedState.skills = answer.split(/[,\s]+/).map((s) => s.trim()).filter(Boolean);
  }

  const nextId = resolveNext(current, answer);

  const prevSection = current.section;
  const nextSection = questions[nextId]?.section;
  if (prevSection && nextSection && nextSection !== prevSection) {
    if (!updatedState.completedSections.includes(prevSection)) {
      updatedState.completedSections = [...updatedState.completedSections, prevSection];
    }
  }

  updatedState.currentQuestionId = nextId;
  return { nextId, updatedState };
}

function resolveNext(question: Question, answer: string): string {
  if (question.branching && answer in question.branching) {
    return question.branching[answer];
  }
  return question.next_question ?? "COMPLETE";
}

export function getOverallProgress(state: UserState): { current: number; total: number; percent: number } {
  const TOTAL = 12;
  const answered = Object.keys(state.answers).length;
  const current = Math.min(answered, TOTAL);
  return { current, total: TOTAL, percent: Math.round((current / TOTAL) * 100) };
}

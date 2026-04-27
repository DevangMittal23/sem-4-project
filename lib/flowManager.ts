import { UserState, getQuestion, getSection } from "./questionEngine";

export interface ProfileSummary {
  name: string;
  profession: string;
  experience: string;
  level: string;
  goal: string;
}

export function buildProfile(state: UserState): ProfileSummary {
  return {
    name: state.name || "Unknown",
    profession: state.profession || "Not specified",
    experience: state.experience ? `${state.experience} years` : "Not specified",
    level: state.level || "Not specified",
    goal: state.goal || "Not specified",
  };
}

export function formatProfileForDisplay(profile: ProfileSummary): string {
  return [
    `👤 ${profile.name}`,
    `💼 ${profile.profession}`,
    `📅 Experience: ${profile.experience}`,
    `🏷️ Level: ${profile.level}`,
    `🎯 Goal: ${profile.goal}`,
  ].join("\n");
}

export function getCurrentSectionName(state: UserState): string {
  const q = getQuestion(state.currentQuestionId);
  if (!q?.section) return "";
  return getSection(q.section)?.name ?? q.section;
}

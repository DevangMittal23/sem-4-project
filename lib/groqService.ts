export interface GroqEvaluationResult {
  score: number;
  difficulty: "easier" | "same" | "harder";
  feedback: string;
  skillCategory: string;
  followUpQuestion?: string;
}

export async function evaluateAnswer(
  answer: string,
  questionText: string,
  skillCategory: string = "general"
): Promise<GroqEvaluationResult> {
  try {
    const response = await fetch("/api/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answer, questionText, skillCategory }),
    });

    if (!response.ok) {
      throw new Error(`Evaluation failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Groq evaluation error:", error);
    return {
      score: 5,
      difficulty: "same",
      feedback: "Unable to evaluate at this time.",
      skillCategory,
    };
  }
}

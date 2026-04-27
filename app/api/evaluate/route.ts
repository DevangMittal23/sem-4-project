import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const { answer, questionText, skillCategory } = await req.json();

  if (!answer || !questionText) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({
      score: 5,
      difficulty: "same",
      feedback: "Groq API key not configured.",
      skillCategory: skillCategory ?? "general",
    });
  }

  try {
    const prompt = `You are an expert career assessment evaluator. Evaluate the following answer to a career assessment question.

Question: "${questionText}"
Answer: "${answer}"
Skill Category: ${skillCategory}

Respond ONLY with a valid JSON object in this exact format:
{
  "score": <number 0-10>,
  "difficulty": "<easier|same|harder>",
  "feedback": "<one concise sentence of constructive feedback>",
  "followUpQuestion": "<one targeted follow-up question OR null>",
  "skillCategory": "${skillCategory}"
}

Scoring guide:
- 0-3: Vague, off-topic, or very basic answer
- 4-6: Adequate answer with some relevant details
- 7-8: Good answer with clear examples and structure
- 9-10: Excellent, detailed, well-structured answer

difficulty should reflect whether the next question should be:
- "easier" if score < 4
- "harder" if score > 7
- "same" otherwise

followUpQuestion rules:
- If score >= 7: ask a deeper, more specific follow-up to explore their expertise further (e.g. "Can you walk me through the specific technical decisions you made?")
- If score >= 4 and score < 7: ask a clarifying follow-up to get more detail (e.g. "Could you give a concrete example of that?")
- If score < 4: ask a simpler, more guided follow-up to help them elaborate (e.g. "What was the main problem you were trying to solve?")
- Always return a follow-up question string, never null`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 300,
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");

    const parsed = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      score: Math.min(10, Math.max(0, Number(parsed.score) || 5)),
      difficulty: ["easier", "same", "harder"].includes(parsed.difficulty) ? parsed.difficulty : "same",
      feedback: parsed.feedback || "Good response.",
      followUpQuestion: typeof parsed.followUpQuestion === "string" && parsed.followUpQuestion.trim()
        ? parsed.followUpQuestion.trim()
        : null,
      skillCategory: skillCategory ?? "general",
    });
  } catch (err) {
    console.error("Groq API error:", err);
    return NextResponse.json({
      score: 5,
      difficulty: "same",
      feedback: "Evaluation completed.",
      followUpQuestion: null,
      skillCategory: skillCategory ?? "general",
    });
  }
}

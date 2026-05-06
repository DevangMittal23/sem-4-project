import json
import logging
from groq import Groq
from django.conf import settings

logger = logging.getLogger("ai_engine")

FIELD_LABELS = {
    "name": "full name",
    "profession": "current profession or job title",
    "experience_level": "experience level — one of: Fresher, Junior, Mid, Senior, Lead",
    "education": "education level — one of: High School, Diploma, Bachelor's, Master's, PhD, Self-taught",
    "current_status": "current status — one of: Student, Employed, Freelance, Unemployed, Career Break",
    "availability": "weekly availability — one of: less than 5 hours, 5 to 10 hours, 10 to 20 hours, more than 20 hours per week",
    "goal": "primary career goal — one of: Switch Domain, Excel in Current Domain, Get a Job, Promotion, Side Income",
    # Extended goal-detail fields
    "target_role": "specific target role or job title they want to reach",
    "risk_tolerance": "risk tolerance — one of: Low (prefer stability), Medium (balanced), High (embrace challenges)",
    "learning_style": "preferred learning style — one of: visual, hands-on, reading, mixed",
    "side_income_type": "type of side income they want — e.g. freelancing, content creation, consulting, teaching",
}

FIELD_CODES = {
    "experience_level": {"fresher": "fresher", "junior": "junior", "mid": "mid", "senior": "senior", "lead": "lead"},
    "education": {"high school": "high_school", "diploma": "diploma", "bachelor": "bachelors", "master": "masters", "phd": "phd", "self": "self_taught"},
    "current_status": {"student": "student", "employed": "employed", "freelance": "freelance", "unemployed": "unemployed", "career break": "career_break"},
    "availability": {"less than 5": "lt5", "< 5": "lt5", "5 to 10": "5_10", "5-10": "5_10", "10 to 20": "10_20", "10-20": "10_20", "more than 20": "gt20", "20+": "gt20"},
    "goal": {"switch": "switch_domain", "excel": "excel_current", "get a job": "get_job", "promotion": "promotion", "side income": "side_income"},
    "risk_tolerance": {"low": "low", "stability": "low", "medium": "medium", "balanced": "medium", "high": "high", "challenge": "high"},
    "learning_style": {"visual": "visual", "hands-on": "hands-on", "hands on": "hands-on", "reading": "reading", "mixed": "mixed"},
}


def _normalize(field: str, value: str) -> str:
    """Normalize a free-text answer to a backend choice code."""
    if field not in FIELD_CODES:
        return value.strip()
    lower = value.lower().strip()
    for key, code in FIELD_CODES[field].items():
        if key in lower:
            return code
    return value.strip()


def _groq_client():
    return Groq(api_key=settings.GROQ_API_KEY)


def _extract_field_value(field: str, conversation_history: list[dict]) -> str:
    """Ask Groq to extract a specific field value from the last exchange."""
    if not conversation_history:
        return ""
    last_user = next((m["content"] for m in reversed(conversation_history) if m["role"] == "user"), "")
    if not last_user:
        return ""

    prompt = f"""From this user message, extract the value for: {FIELD_LABELS.get(field, field)}

User message: "{last_user}"

Reply with ONLY the extracted value as a single short phrase. If not found, reply with exactly: NOT_FOUND"""

    try:
        client = _groq_client()
        resp = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=30,
        )
        val = resp.choices[0].message.content.strip()
        if val == "NOT_FOUND" or not val:
            return ""
        return _normalize(field, val)
    except Exception:
        return ""


def profile_completion_chat(missing_fields: list[str], conversation_history: list[dict], user_message: str) -> dict:
    """
    Targeted chatbot that asks only about missing profile fields one at a time.
    Extracts and saves values after each user reply.
    Extended to also collect goal-detail fields (target_role, risk_tolerance, learning_style, side_income_type).
    """
    if not missing_fields:
        return {"reply": "Your profile is already complete!", "is_complete": True, "collected": {}, "history": conversation_history}

    # Build updated history with the new user message
    updated_history = list(conversation_history)
    collected = {}

    if user_message:
        updated_history.append({"role": "user", "content": user_message})
        # Try to extract the value for the field we just asked about
        target_field = missing_fields[0]
        extracted = _extract_field_value(target_field, updated_history)
        if extracted:
            collected[target_field] = extracted
            remaining = missing_fields[1:]
        else:
            remaining = missing_fields
    else:
        remaining = missing_fields

    # If all fields collected, mark complete
    if not remaining:
        # Check if these were the extended fields (goal-detail phase)
        extended_fields = ["target_role", "risk_tolerance", "learning_style", "side_income_type"]
        is_extended_phase = all(f in extended_fields for f in missing_fields)
        if is_extended_phase:
            completion_reply = (
                "Excellent! I now have a complete picture of your career goals and learning preferences. "
                "Your personalized roadmap will be tailored to your risk tolerance and learning style. "
                "Head to the Roadmap page to generate your AI-powered career plan! 🚀"
            )
        else:
            completion_reply = "Perfect! I have everything I need. Your profile is now complete! 🎉"
        updated_history.append({"role": "assistant", "content": completion_reply})
        return {
            "reply": completion_reply,
            "is_complete": True,
            "collected": collected,
            "history": updated_history,
        }

    # Ask about the next missing field
    next_field = remaining[0]

    # Context-aware prompts for goal-detail fields
    goal_detail_context = ""
    if next_field == "target_role":
        goal_detail_context = "The user has already told us their primary goal. Now ask specifically what role or position they want to reach."
    elif next_field == "risk_tolerance":
        goal_detail_context = "Ask about their comfort with career risk — are they risk-averse (prefer stability), balanced, or willing to take bold leaps?"
    elif next_field == "learning_style":
        goal_detail_context = "Ask how they prefer to learn: watching videos/visual content, hands-on projects, reading docs/books, or a mix."
    elif next_field == "side_income_type":
        goal_detail_context = "Ask what type of side income they're interested in — freelancing, content creation, consulting, teaching, etc."

    system_prompt = f"""You are a friendly AI career assistant helping a user complete their profile.

You need to ask about: {FIELD_LABELS.get(next_field, next_field)}
{f'Context: {goal_detail_context}' if goal_detail_context else ''}

Rules:
- Ask ONE natural, conversational question about this specific field
- Be warm and encouraging
- Keep it short (1-2 sentences max)
- Do NOT ask about anything else
- Do NOT explain what you're doing, just ask the question"""

    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(updated_history[-4:])

    try:
        client = _groq_client()
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            temperature=0.7,
            max_tokens=120,
        )
        reply = response.choices[0].message.content.strip()
        updated_history.append({"role": "assistant", "content": reply})

        return {
            "reply": reply,
            "is_complete": False,
            "collected": collected,
            "history": updated_history,
        }
    except Exception as e:
        logger.error("Groq profile_chat error: %s", e)
        fallback = f"Could you tell me your {FIELD_LABELS.get(next_field, next_field)}?"
        updated_history.append({"role": "assistant", "content": fallback})
        return {
            "reply": fallback,
            "is_complete": False,
            "collected": collected,
            "history": updated_history,
        }


def assessment_chat(conversation_history: list[dict], user_message: str) -> dict:
    system_prompt = """You are an expert AI career interviewer conducting a structured onboarding assessment.

Your goal is to understand the user's:
1. Name and current profession
2. Years of experience and role level (Fresher/Junior/Mid/Senior/Lead)
3. Primary goal (Switch Domain / Excel in Current Domain / Get a Job / Promotion / Side Income)
4. Target domain or current domain
5. Top 3 technical skills
6. Thinking style (Analytical/Creative/Collaborative/Structured)
7. Education level (High School/Diploma/Bachelor's/Master's/PhD/Self-taught)
8. Current status (Student/Employed/Freelance/Unemployed/Career Break)
9. Weekly availability (< 5 hrs / 5-10 hrs / 10-20 hrs / 20+ hrs)
10. Career objective

Rules:
- Ask ONE question at a time
- Be conversational and encouraging
- Adapt follow-up questions based on answers
- After collecting all 10 data points, respond with EXACTLY this JSON on its own line (no markdown, no code fences):
  {"assessment_complete": true, "summary": "brief summary of the user"}
- Until complete, respond with just your next question as plain text
- Do NOT number your questions
- Keep questions concise and natural"""

    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(conversation_history)
    if user_message:
        messages.append({"role": "user", "content": user_message})

    try:
        client = _groq_client()
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            temperature=0.7,
            max_tokens=300,
        )
        reply = response.choices[0].message.content.strip()

        # Strip markdown fences before checking for completion JSON
        clean = reply.replace("```json", "").replace("```", "").strip()

        is_complete = False
        try:
            parsed = json.loads(clean)
            if parsed.get("assessment_complete"):
                is_complete = True
                reply = clean  # use clean version so extract_profile works
        except (json.JSONDecodeError, AttributeError):
            # Also check if JSON is embedded anywhere in the reply
            if '"assessment_complete": true' in reply or "'assessment_complete': true" in reply:
                is_complete = True

        updated_history = list(conversation_history)
        if user_message:
            updated_history.append({"role": "user", "content": user_message})
        updated_history.append({"role": "assistant", "content": reply})

        return {"reply": reply, "is_complete": is_complete, "history": updated_history}
    except Exception as e:
        logger.error("Groq assessment_chat error: %s", e)
        return {
            "reply": "I'm having trouble connecting. Could you tell me your name to get started?",
            "is_complete": False,
            "history": conversation_history,
        }


def extract_profile_from_history(conversation_history: list[dict]) -> dict:
    """Extract structured profile data from the full conversation transcript."""
    transcript = "\n".join(
        f"{m['role'].upper()}: {m['content']}"
        for m in conversation_history
        if m["role"] != "system"
    )

    prompt = f"""Extract structured profile data from this career assessment conversation.

Conversation:
{transcript}

Return ONLY a valid JSON object — no markdown, no code fences, just raw JSON:
{{
  "name": "",
  "profession": "",
  "experience_years": "",
  "experience_level": "",
  "goal": "",
  "preferred_domain": "",
  "skills": [],
  "thinking_style": "",
  "education": "",
  "current_status": "",
  "availability": "",
  "interests": []
}}

For experience_level use one of: fresher, junior, mid, senior, lead
For goal use one of: switch_domain, excel_current, get_job, promotion, side_income
For current_status use one of: student, employed, freelance, unemployed, career_break
For availability use one of: lt5, 5_10, 10_20, gt20
Fill every field you can find from the conversation. Do not leave fields empty if the answer is in the conversation."""

    try:
        client = _groq_client()
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=500,
            response_format={"type": "json_object"},
        )
        raw = response.choices[0].message.content.strip()

        # Strip markdown fences
        raw = raw.replace("```json", "").replace("```", "").strip()

        # Extract JSON object
        start = raw.find("{")
        end   = raw.rfind("}") + 1
        if start == -1 or end == 0:
            logger.warning("extract_profile: no JSON found in response")
            return {}

        result = json.loads(raw[start:end])

        # Normalize choice fields so they match Django model choices
        choice_fields = {
            "experience_level": {"fresher": "fresher", "junior": "junior", "mid": "mid", "senior": "senior", "lead": "lead"},
            "education": {"high school": "high_school", "diploma": "diploma", "bachelor": "bachelors", "master": "masters", "phd": "phd", "self": "self_taught"},
            "current_status": {"student": "student", "employed": "employed", "freelance": "freelance", "unemployed": "unemployed", "career break": "career_break"},
            "availability": {"less than 5": "lt5", "< 5": "lt5", "5 to 10": "5_10", "5-10": "5_10", "10 to 20": "10_20", "10-20": "10_20", "more than 20": "gt20", "20+": "gt20"},
            "goal": {"switch": "switch_domain", "excel": "excel_current", "get a job": "get_job", "get job": "get_job", "promotion": "promotion", "side income": "side_income"},
        }
        for field, mapping in choice_fields.items():
            raw_val = result.get(field, "")
            if raw_val:
                lower_val = str(raw_val).lower().strip()
                for key, code in mapping.items():
                    if key in lower_val:
                        result[field] = code
                        break

        logger.info("extract_profile success: %s", {k: v for k, v in result.items() if v})
        return result
    except Exception as e:
        logger.error("Groq extract_profile error: %s", e)
        return {}

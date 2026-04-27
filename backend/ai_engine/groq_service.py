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
}

FIELD_CODES = {
    "experience_level": {"fresher": "fresher", "junior": "junior", "mid": "mid", "senior": "senior", "lead": "lead"},
    "education": {"high school": "high_school", "diploma": "diploma", "bachelor": "bachelors", "master": "masters", "phd": "phd", "self": "self_taught"},
    "current_status": {"student": "student", "employed": "employed", "freelance": "freelance", "unemployed": "unemployed", "career break": "career_break"},
    "availability": {"less than 5": "lt5", "< 5": "lt5", "5 to 10": "5_10", "5-10": "5_10", "10 to 20": "10_20", "10-20": "10_20", "more than 20": "gt20", "20+": "gt20"},
    "goal": {"switch": "switch_domain", "excel": "excel_current", "get a job": "get_job", "promotion": "promotion", "side income": "side_income"},
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
    """
    if not missing_fields:
        return {"reply": "Your profile is already complete!", "is_complete": True, "collected": {}, "history": conversation_history}

    # Build updated history with the new user message
    updated_history = list(conversation_history)
    collected = {}

    if user_message:
        updated_history.append({"role": "user", "content": user_message})
        # Try to extract the value for the field we just asked about
        # The field we were asking about is the first missing field
        target_field = missing_fields[0]
        extracted = _extract_field_value(target_field, updated_history)
        if extracted:
            collected[target_field] = extracted
            # Remove from missing since we got it
            remaining = missing_fields[1:]
        else:
            remaining = missing_fields
    else:
        remaining = missing_fields

    # If all fields collected, mark complete
    if not remaining:
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
    system_prompt = f"""You are a friendly AI career assistant helping a user complete their profile.

You need to ask about: {FIELD_LABELS.get(next_field, next_field)}

Rules:
- Ask ONE natural, conversational question about this specific field
- Be warm and encouraging
- Keep it short (1-2 sentences max)
- Do NOT ask about anything else
- Do NOT explain what you're doing, just ask the question"""

    messages = [{"role": "system", "content": system_prompt}]
    # Add last 4 exchanges for context
    messages.extend(updated_history[-4:])

    try:
        client = _groq_client()
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
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
3. Primary goal (Switch Domain / Excel in Current Domain)
4. Target domain (if switching) or current domain
5. Top 3 technical skills
6. Thinking style (Analytical/Creative/Collaborative/Structured)
7. Education level
8. Current status (Student/Employed/Freelance/Unemployed)
9. Weekly availability (hours)
10. Career objective

Rules:
- Ask ONE question at a time
- Be conversational and encouraging
- Adapt follow-up questions based on answers
- After collecting all 10 data points, respond with EXACTLY this JSON:
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
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.7,
            max_tokens=300,
        )
        reply = response.choices[0].message.content.strip()

        is_complete = False
        try:
            parsed = json.loads(reply)
            if parsed.get("assessment_complete"):
                is_complete = True
        except (json.JSONDecodeError, AttributeError):
            pass

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
    transcript = "\n".join(
        f"{m['role'].upper()}: {m['content']}"
        for m in conversation_history
        if m["role"] != "system"
    )

    prompt = f"""Extract structured profile data from this career assessment conversation.

Conversation:
{transcript}

Return ONLY a valid JSON object with these exact keys (use empty string if not found):
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
For availability use one of: lt5, 5_10, 10_20, gt20"""

    try:
        client = _groq_client()
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=400,
        )
        raw = response.choices[0].message.content.strip()
        json_match = raw[raw.find("{"):raw.rfind("}") + 1]
        return json.loads(json_match)
    except Exception as e:
        logger.error("Groq extract_profile error: %s", e)
        return {}

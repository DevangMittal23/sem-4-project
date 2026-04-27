import json
import logging
from groq import Groq
from django.conf import settings

logger = logging.getLogger("ai_engine")


def _groq_client():
    return Groq(api_key=settings.GROQ_API_KEY)


def assessment_chat(conversation_history: list[dict], user_message: str) -> dict:
    """
    Drive the assessment chatbot. Returns next AI question + updated history.
    conversation_history: list of {"role": "user"|"assistant", "content": str}
    """
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

        # Check if assessment is complete
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

        return {
            "reply": reply,
            "is_complete": is_complete,
            "history": updated_history,
        }
    except Exception as e:
        logger.error("Groq assessment_chat error: %s", e)
        return {
            "reply": "I'm having trouble connecting. Could you tell me your name to get started?",
            "is_complete": False,
            "history": conversation_history,
        }


def profile_completion_chat(missing_fields: list[str], conversation_history: list[dict], user_message: str) -> dict:
    """
    Targeted chatbot to fill only missing profile fields.
    """
    field_labels = {
        "education": "education level (High School / Diploma / Bachelor's / Master's / PhD / Self-taught)",
        "current_status": "current status (Student / Employed / Freelance / Unemployed)",
        "availability": "weekly availability in hours (< 5 / 5-10 / 10-20 / 20+)",
        "goal": "primary career goal (Switch Domain / Excel in Current Domain / Get a Job / Promotion / Side Income)",
        "thinking_style": "thinking style (Analytical / Creative / Collaborative / Structured)",
        "preferred_domain": "preferred career domain",
        "experience_level": "experience level (Fresher / Junior / Mid / Senior / Lead)",
    }

    missing_desc = ", ".join(field_labels.get(f, f) for f in missing_fields)
    system_prompt = f"""You are a friendly AI career assistant helping complete a user's profile.

Missing information needed: {missing_desc}

Ask for ONE missing piece of information at a time in a natural, conversational way.
Once you have collected all missing information, respond with EXACTLY this JSON:
{{"profile_complete": true, "collected": {{"field_name": "value"}}}}

Until complete, ask your next question as plain text only."""

    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(conversation_history)
    if user_message:
        messages.append({"role": "user", "content": user_message})

    try:
        client = _groq_client()
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.6,
            max_tokens=200,
        )
        reply = response.choices[0].message.content.strip()

        is_complete = False
        collected = {}
        try:
            parsed = json.loads(reply)
            if parsed.get("profile_complete"):
                is_complete = True
                collected = parsed.get("collected", {})
        except (json.JSONDecodeError, AttributeError):
            pass

        updated_history = list(conversation_history)
        if user_message:
            updated_history.append({"role": "user", "content": user_message})
        updated_history.append({"role": "assistant", "content": reply})

        return {
            "reply": reply,
            "is_complete": is_complete,
            "collected": collected,
            "history": updated_history,
        }
    except Exception as e:
        logger.error("Groq profile_chat error: %s", e)
        return {
            "reply": "Let's continue filling your profile. " + (f"What is your {field_labels.get(missing_fields[0], missing_fields[0])}?" if missing_fields else ""),
            "is_complete": False,
            "collected": {},
            "history": conversation_history,
        }


def extract_profile_from_history(conversation_history: list[dict]) -> dict:
    """Use Groq to extract structured profile data from conversation history."""
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

from fastapi import APIRouter

router = APIRouter()

@router.get("/readiness-score")
def get_readiness_score():
    return {"status": "AI module not integrated yet", "message": "ML-based readiness scoring will be available in future releases"}

@router.get("/career-recommendation")
def get_ai_career_recommendation():
    return {"status": "AI module not integrated yet", "message": "AI-powered career recommendations will be available in future releases"}

@router.get("/explain-roadmap")
def explain_roadmap():
    return {"status": "AI module not integrated yet", "message": "AI-powered roadmap explanations will be available in future releases"}

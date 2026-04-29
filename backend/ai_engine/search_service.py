import requests
import logging
from django.conf import settings

logger = logging.getLogger("ai_engine")


def search_job_market(query: str, num_results: int = 5) -> list[dict]:
    """Search Google via Serper API for job market data."""
    api_key = getattr(settings, "SERPER_API_KEY", "")
    if not api_key:
        return _fallback_search(query)

    try:
        response = requests.post(
            "https://google.serper.dev/search",
            headers={"X-API-KEY": api_key, "Content-Type": "application/json"},
            json={"q": query, "num": num_results},
            timeout=8,
        )
        data = response.json()
        results = []
        for item in data.get("organic", [])[:num_results]:
            results.append({
                "title": item.get("title", ""),
                "snippet": item.get("snippet", ""),
                "link": item.get("link", ""),
            })
        return results
    except Exception as e:
        logger.warning("Serper search failed for '%s': %s", query, e)
        return _fallback_search(query)


def get_market_data(role: str, domain: str, goal: str) -> dict:
    """Fetch comprehensive market data for a role/domain."""
    queries = {
        "demand": f"{role} {domain} job demand 2024 2025",
        "salary": f"{role} {domain} average salary 2024",
        "skills": f"top skills required {role} {domain} 2024",
        "trends": f"{domain} industry trends growth 2024 2025",
    }

    market_data = {}
    for key, query in queries.items():
        results = search_job_market(query, num_results=3)
        market_data[key] = results

    return market_data


def _fallback_search(query: str) -> list[dict]:
    """Return structured fallback data when Serper is unavailable."""
    fallbacks = {
        "demand": [{"title": "High demand for tech professionals", "snippet": "The tech industry continues to show strong hiring demand across software engineering, data science, and cloud roles.", "link": ""}],
        "salary": [{"title": "Competitive salaries in tech", "snippet": "Software engineers earn $80,000–$150,000+ depending on experience and location.", "link": ""}],
        "skills": [{"title": "In-demand technical skills", "snippet": "Python, JavaScript, cloud platforms (AWS/GCP/Azure), and system design are consistently top-requested skills.", "link": ""}],
        "trends": [{"title": "AI and cloud driving growth", "snippet": "AI/ML, cloud computing, and cybersecurity are the fastest-growing areas in tech for 2024-2025.", "link": ""}],
    }
    for key, data in fallbacks.items():
        if any(word in query.lower() for word in key.split()):
            return data
    return [{"title": "Market data unavailable", "snippet": "Configure SERPER_API_KEY for live market data.", "link": ""}]

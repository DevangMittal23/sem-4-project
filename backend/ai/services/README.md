# AI Services Module

This directory contains AI/ML services for the platform.

## Structure

- `recommendation_engine.py` - Rule-based recommendation system (to be replaced with ML)
- Future additions:
  - `ml_predictor.py` - ML-based career predictions
  - `llm_service.py` - LLM integration for personalized guidance
  - `rag_service.py` - RAG pipeline for contextual recommendations

## Current Implementation

Currently using rule-based logic. Designed for easy replacement with:
- TensorFlow/PyTorch models
- OpenAI/Anthropic APIs
- LangChain/LlamaIndex RAG pipelines

## Data Collection

User behavior data is being collected in `user_behavior_events` table for future ML training.

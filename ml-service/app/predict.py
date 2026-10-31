import os
import json
import joblib
import pandas as pd
from typing import Dict, Any, Tuple

from features import extract_features_from_dict
from schemas import PredictionRequest, PredictionResponse

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
MODELS_DIR = os.path.join(PROJECT_ROOT, "models")
MODEL_PATH = os.path.join(MODELS_DIR, "best_model.joblib")
METADATA_PATH = os.path.join(MODELS_DIR, "model_metadata.json")

_cached_model = None
_cached_metadata = None

def get_model():
    global _cached_model, _cached_metadata
    if _cached_model is not None:
        return _cached_model, _cached_metadata

    if not os.path.exists(MODEL_PATH):
        # Auto-train if model doesn't exist yet
        from train import train_and_evaluate_models
        train_and_evaluate_models()

    if os.path.exists(MODEL_PATH):
        _cached_model = joblib.load(MODEL_PATH)
    if os.path.exists(METADATA_PATH):
        with open(METADATA_PATH, "r") as f:
            _cached_metadata = json.load(f)

    return _cached_model, _cached_metadata

def analyze_factors(req: PredictionRequest, prob: float) -> Tuple[list, list]:
    top_factors = []
    risk_factors = []

    # Historical pass rate
    if req.historical_pass_rate >= 0.80:
        top_factors.append(f"Strong historical test pass rate ({round(req.historical_pass_rate * 100)}%) across recent problems")
    elif req.historical_pass_rate < 0.45:
        risk_factors.append(f"Low historical test pass rate ({round(req.historical_pass_rate * 100)}%) indicates frequent unhandled edge cases")

    # Topic accuracy
    if req.topic_historical_accuracy >= 0.75:
        top_factors.append(f"High domain confidence on topic '{req.topic}' ({round(req.topic_historical_accuracy * 100)}%)")
    elif req.topic_historical_accuracy < 0.40:
        risk_factors.append(f"Candidate historically struggles on '{req.topic}' problems ({round(req.topic_historical_accuracy * 100)}% accuracy)")

    # Difficulty alignment
    diff = req.difficulty.lower()
    if diff == "hard":
        risk_factors.append("Hard difficulty problems require advanced optimization and edge case coverage")
    elif diff == "easy" and prob >= 0.70:
        top_factors.append("Problem difficulty (Easy) aligns comfortably with candidate baseline skills")

    # Failed tests ratio
    if req.past_failed_tests_ratio > 0.40:
        risk_factors.append(f"High recent test failure ratio ({round(req.past_failed_tests_ratio * 100)}%)")
    elif req.past_failed_tests_ratio <= 0.15:
        top_factors.append("Consistently resolves sample and hidden test cases on early attempts")

    # Hints & attempts
    if req.hints_used >= 2:
        risk_factors.append(f"Requested {req.hints_used} hints, reflecting conceptual hurdles")
    if req.past_attempts_count >= 3:
        top_factors.append(f"Candidate demonstrated persistence over {req.past_attempts_count} prior attempts")

    return top_factors, risk_factors

def predict_coding_performance(req: PredictionRequest) -> PredictionResponse:
    model, metadata = get_model()
    if model is None:
        raise RuntimeError("Machine learning model is not available or trained.")

    df = extract_features_from_dict(req.model_dump())
    prob = float(model.predict_proba(df)[:, 1][0])

    if prob >= 0.72:
        category = "High Likelihood of Success"
        confidence = round(prob, 3)
    elif prob >= 0.45:
        category = "Moderate Likelihood"
        confidence = round(1.0 - abs(prob - 0.5) * 2, 3)
    else:
        category = "Needs Practice / Review"
        confidence = round(1.0 - prob, 3)

    top_factors, risk_factors = analyze_factors(req, prob)
    version = metadata.get("model_version", "1.0.0") if metadata else "1.0.0"
    limitations = metadata.get("limitations", "Evaluated against held-out validation set. Novel problem paradigms may differ.") if metadata else "Model trained on calibrated problem sets."

    return PredictionResponse(
        success_probability=round(prob, 4),
        predicted_category=category,
        confidence=confidence,
        top_factors=top_factors,
        risk_factors=risk_factors,
        model_version=version,
        limitations=limitations,
    )

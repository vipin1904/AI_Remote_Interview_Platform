import numpy as np
import pandas as pd
from typing import Dict, Any

NUMERIC_FEATURES = [
    "historical_pass_rate",
    "past_failed_tests_ratio",
    "past_attempts_count",
    "time_spent_minutes",
    "hints_used",
    "topic_historical_accuracy",
    "difficulty_level",
]

CATEGORICAL_FEATURES = [
    "language",
    "topic",
]

DIFFICULTY_MAP = {
    "easy": 1.0,
    "medium": 2.0,
    "hard": 3.0,
}

def extract_features_from_dict(data: Dict[str, Any]) -> pd.DataFrame:
    """
    Transforms a single input dictionary into a formatted pandas DataFrame
    matching the training schema.
    """
    difficulty_str = str(data.get("difficulty", "Medium")).strip().lower()
    difficulty_level = DIFFICULTY_MAP.get(difficulty_str, 2.0)

    row = {
        "historical_pass_rate": float(data.get("historical_pass_rate", 0.5)),
        "past_failed_tests_ratio": float(data.get("past_failed_tests_ratio", 0.0)),
        "past_attempts_count": int(data.get("past_attempts_count", 0)),
        "time_spent_minutes": float(data.get("time_spent_minutes", 5.0)),
        "hints_used": int(data.get("hints_used", 0)),
        "topic_historical_accuracy": float(data.get("topic_historical_accuracy", 0.5)),
        "difficulty_level": difficulty_level,
        "language": str(data.get("language", "javascript")).strip().lower(),
        "topic": str(data.get("topic", "arrays")).strip().lower(),
    }

    return pd.DataFrame([row])

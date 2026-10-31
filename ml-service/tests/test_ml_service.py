import os
import sys
import pytest
from fastapi.testclient import TestClient

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
SERVICE_DIR = os.path.dirname(CURRENT_DIR)
APP_DIR = os.path.join(SERVICE_DIR, "app")

if APP_DIR not in sys.path:
    sys.path.insert(0, APP_DIR)

from main import app
from schemas import PredictionRequest, RecommendPracticeRequest
from features import extract_features_from_dict
from evaluation import evaluate_classifier

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "ml-service"
    assert "timestamp" in data

def test_model_status_endpoint():
    response = client.get("/model/status")
    assert response.status_code == 200
    data = response.json()
    assert "model_name" in data
    assert "algorithm" in data
    assert "model_version" in data

def test_feature_extraction():
    sample = {
        "historical_pass_rate": 0.85,
        "past_failed_tests_ratio": 0.1,
        "past_attempts_count": 2,
        "difficulty": "Medium",
        "time_spent_minutes": 14.5,
        "language": "python",
        "hints_used": 1,
        "topic": "two-pointers",
        "topic_historical_accuracy": 0.8,
    }
    df = extract_features_from_dict(sample)
    assert len(df) == 1
    assert df["difficulty_level"].iloc[0] == 2.0
    assert df["language"].iloc[0] == "python"
    assert df["topic"].iloc[0] == "two-pointers"

def test_evaluation_metrics():
    y_true = [1, 0, 1, 1, 0, 1, 0, 0]
    y_pred = [1, 0, 1, 0, 0, 1, 0, 1]
    y_prob = [0.9, 0.1, 0.8, 0.4, 0.2, 0.85, 0.3, 0.6]

    metrics = evaluate_classifier(y_true, y_pred, y_prob)
    assert "accuracy" in metrics
    assert "precision" in metrics
    assert "recall" in metrics
    assert "f1_score" in metrics
    assert "roc_auc" in metrics
    assert "confusion_matrix" in metrics
    assert 0.0 <= metrics["accuracy"] <= 1.0

def test_predict_performance_high_success():
    payload = {
        "historical_pass_rate": 0.95,
        "past_failed_tests_ratio": 0.05,
        "past_attempts_count": 1,
        "difficulty": "Easy",
        "time_spent_minutes": 8.0,
        "language": "javascript",
        "hints_used": 0,
        "topic": "arrays",
        "topic_historical_accuracy": 0.90,
    }
    response = client.post("/predict-performance", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "success_probability" in data
    assert "predicted_category" in data
    assert data["success_probability"] >= 0.50
    assert len(data["top_factors"]) > 0

def test_predict_performance_low_success():
    payload = {
        "historical_pass_rate": 0.15,
        "past_failed_tests_ratio": 0.85,
        "past_attempts_count": 0,
        "difficulty": "Hard",
        "time_spent_minutes": 45.0,
        "language": "java",
        "hints_used": 3,
        "topic": "dynamic-programming",
        "topic_historical_accuracy": 0.20,
    }
    response = client.post("/predict-performance", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "success_probability" in data
    assert data["success_probability"] <= 0.60
    assert len(data["risk_factors"]) > 0

def test_recommend_practice():
    payload = {
        "current_topic": "two-pointers",
        "difficulty": "Medium",
        "success_probability": 0.85,
        "weak_topics": ["dynamic-programming"],
        "pass_rate": 0.90,
    }
    response = client.post("/recommend-practice", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "recommended_difficulty" in data
    assert "recommended_problems" in data
    assert len(data["recommended_problems"]) > 0
    assert len(data["suggested_study_path"]) == 4
    assert "ml_rationale" in data

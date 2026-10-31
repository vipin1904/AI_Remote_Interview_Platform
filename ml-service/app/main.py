import os
import sys
from datetime import datetime, timezone
from contextlib import asynccontextmanager
from typing import List, Dict, Any
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

# Ensure app package is importable
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from schemas import (
    PredictionRequest,
    PredictionResponse,
    RecommendPracticeRequest,
    RecommendPracticeResponse,
    RecommendedProblem,
    ModelStatusResponse,
)
from predict import predict_coding_performance, get_model

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        model, metadata = get_model()
        print("ML Service successfully initialized with model:", metadata.get("algorithm") if metadata else "Unknown")
    except Exception as e:
        print(f"Warning during model initialization: {e}")
    yield

app = FastAPI(
    title="TalentIQ Machine Learning Service",
    description="Production-grade ML Service for Coding Performance Prediction and Adaptive Practice Recommendations",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Catalog of available problems mapped to topics and difficulty
PROBLEM_CATALOG = [
    {
        "slug": "two-sum",
        "title": "Two Sum",
        "difficulty": "Easy",
        "topic": "arrays",
        "description": "Hash map lookup for complement indices in O(n) time."
    },
    {
        "slug": "reverse-string",
        "title": "Reverse String",
        "difficulty": "Easy",
        "topic": "strings",
        "description": "In-place two-pointer string manipulation."
    },
    {
        "slug": "valid-palindrome",
        "title": "Valid Palindrome",
        "difficulty": "Easy",
        "topic": "two-pointers",
        "description": "Two-pointer alphanumeric boundary checking."
    },
    {
        "slug": "maximum-subarray",
        "title": "Maximum Subarray (Kadane's Algorithm)",
        "difficulty": "Medium",
        "topic": "dynamic-programming",
        "description": "Dynamic programming optimal contiguous subarray sum."
    },
    {
        "slug": "container-with-most-water",
        "title": "Container With Most Water",
        "difficulty": "Medium",
        "topic": "two-pointers",
        "description": "Greedy two-pointer area maximization."
    },
]

@app.get("/", status_code=status.HTTP_200_OK)
def root():
    model, metadata = get_model()
    return {
        "service": "TalentIQ Machine Learning Service",
        "status": "online",
        "version": "1.0.0",
        "algorithm": metadata.get("algorithm", "LogisticRegression") if metadata else "LogisticRegression",
        "model_version": metadata.get("model_version", "1.0.0") if metadata else "1.0.0",
        "endpoints": {
            "health": "/health",
            "model_status": "/model/status",
            "predict_performance": "POST /predict-performance",
            "recommend_practice": "POST /recommend-practice",
            "swagger_docs": "/docs",
            "redoc": "/redoc",
        },
        "test_metrics": metadata.get("test_metrics") if metadata else None,
        "message": "TalentIQ ML Inference Service is active and ready for performance prediction & practice recommendation requests.",
    }

@app.get("/health", status_code=status.HTTP_200_OK)
def health():
    return {
        "status": "healthy",
        "service": "ml-service",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "python_version": sys.version.split(" ")[0],
    }

@app.get("/model/status", response_model=ModelStatusResponse)
def model_status():
    model, metadata = get_model()
    if model is None or metadata is None:
        return ModelStatusResponse(
            status="uninitialized",
            model_name="CodingPerformancePredictor",
            model_version="1.0.0",
            algorithm="None",
            train_date=None,
            metrics={},
            feature_names=[],
            dataset_sample_size=0,
        )

    return ModelStatusResponse(
        status=metadata.get("status", "ready"),
        model_name=metadata.get("model_name", "CodingPerformancePredictor"),
        model_version=metadata.get("model_version", "1.0.0"),
        algorithm=metadata.get("algorithm", "Unknown"),
        train_date=metadata.get("train_date"),
        metrics=metadata.get("test_metrics", {}),
        feature_names=metadata.get("feature_names", []),
        dataset_sample_size=metadata.get("dataset_sample_size", 0),
    )

@app.post("/predict-performance", response_model=PredictionResponse)
def predict_performance(request: PredictionRequest):
    try:
        response = predict_coding_performance(request)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference error: {str(e)}"
        )

@app.post("/recommend-practice", response_model=RecommendPracticeResponse)
def recommend_practice(request: RecommendPracticeRequest):
    prob = request.success_probability
    curr_diff = request.difficulty.capitalize()
    curr_topic = request.current_topic.lower()
    weak_topics = [t.lower() for t in (request.weak_topics or [])]

    # Determine recommended target difficulty
    if prob is not None:
        if prob >= 0.75:
            rec_difficulty = "Medium" if curr_diff == "Easy" else "Hard"
            rationale = "High confidence and strong pass rate indicate readiness for increased difficulty."
        elif prob <= 0.40:
            rec_difficulty = "Easy" if curr_diff != "Easy" else "Easy"
            rationale = "Current error patterns suggest reinforcing foundational patterns at a comfortable difficulty level."
        else:
            rec_difficulty = curr_diff
            rationale = "Moderate confidence suggests continuing practice within current difficulty before advancing."
    else:
        rec_difficulty = curr_diff
        rationale = "Practice recommendations aligned to current progress track."

    # Identify target focus topics
    focus_topics = list(dict.fromkeys(weak_topics + [curr_topic]))
    if not focus_topics:
        focus_topics = ["arrays", "two-pointers"]

    # Match problems from catalog
    matching_problems = []
    for p in PROBLEM_CATALOG:
        is_focus_topic = p["topic"].lower() in focus_topics
        is_target_diff = p["difficulty"] == rec_difficulty
        
        if is_focus_topic or is_target_diff:
            reason = f"Strengthens {p['topic']} skills at {p['difficulty']} difficulty."
            if p["topic"].lower() in weak_topics:
                reason = f"Targeted remediation for identified challenge area: {p['topic']}."
            
            matching_problems.append(
                RecommendedProblem(
                    slug=p["slug"],
                    title=p["title"],
                    difficulty=p["difficulty"],
                    topic=p["topic"],
                    rationale=reason
                )
            )

    # If no specific matches, return curated set
    if not matching_problems:
        matching_problems = [
            RecommendedProblem(
                slug=p["slug"],
                title=p["title"],
                difficulty=p["difficulty"],
                topic=p["topic"],
                rationale="Essential pattern mastery for technical interviews."
            ) for p in PROBLEM_CATALOG[:3]
        ]

    study_path = [
        f"Day 1-2: Master fundamentals on {focus_topics[0]} with targeted test case analysis.",
        f"Day 3-4: Progress to {rec_difficulty} problems focusing on optimal time complexity.",
        f"Day 5-6: Conduct timed mock sessions without hints to build independent execution speed.",
        f"Day 7: Review missed edge cases and complexity analysis notes.",
    ]

    return RecommendPracticeResponse(
        recommended_difficulty=rec_difficulty,
        focus_topics=focus_topics,
        recommended_problems=matching_problems[:4],
        suggested_study_path=study_path,
        ml_rationale=rationale,
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

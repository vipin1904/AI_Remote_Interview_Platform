from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class PredictionRequest(BaseModel):
    historical_pass_rate: float = Field(..., ge=0.0, le=1.0, description="Past test pass rate ratio across attempts [0.0, 1.0]")
    past_failed_tests_ratio: float = Field(0.0, ge=0.0, le=1.0, description="Ratio of failed tests in recent attempts [0.0, 1.0]")
    past_attempts_count: int = Field(0, ge=0, description="Number of prior attempts on similar or current problems")
    difficulty: str = Field("Medium", description="Problem difficulty: Easy, Medium, Hard")
    time_spent_minutes: float = Field(5.0, ge=0.0, description="Estimated or observed time spent coding in minutes")
    language: str = Field("javascript", description="Programming language: javascript, python, java")
    hints_used: int = Field(0, ge=0, description="Number of hints accessed")
    topic: str = Field("arrays", description="Problem topic/category: arrays, strings, two-pointers, dynamic-programming, sliding-window, general")
    topic_historical_accuracy: float = Field(0.5, ge=0.0, le=1.0, description="Historical accuracy on this topic")

class PredictionResponse(BaseModel):
    success_probability: float = Field(..., description="Calibrated probability of successful submission (>=80% tests passed)")
    predicted_category: str = Field(..., description="High Likelihood of Success | Moderate Likelihood | Needs Practice")
    confidence: float = Field(..., description="Confidence score [0.0, 1.0]")
    top_factors: List[str] = Field(default_factory=list, description="Key driving factors for the prediction")
    risk_factors: List[str] = Field(default_factory=list, description="Potential areas of risk identified")
    model_version: str = Field("1.0.0", description="Active model version")
    limitations: str = Field(..., description="Model assumptions and data constraints")

class RecommendPracticeRequest(BaseModel):
    current_topic: str = Field("arrays", description="Current or most recent topic")
    difficulty: str = Field("Medium", description="Current difficulty")
    success_probability: Optional[float] = Field(None, ge=0.0, le=1.0, description="Predicted success probability if available")
    weak_topics: Optional[List[str]] = Field(default_factory=list, description="List of identified weak areas")
    pass_rate: Optional[float] = Field(None, ge=0.0, le=1.0, description="Observed pass rate")

class RecommendedProblem(BaseModel):
    slug: str
    title: str
    difficulty: str
    topic: str
    rationale: str

class RecommendPracticeResponse(BaseModel):
    recommended_difficulty: str
    focus_topics: List[str]
    recommended_problems: List[RecommendedProblem]
    suggested_study_path: List[str]
    ml_rationale: str

class ModelStatusResponse(BaseModel):
    status: str
    model_name: str
    model_version: str
    algorithm: str
    train_date: Optional[str] = None
    metrics: Dict[str, Any] = Field(default_factory=dict)
    feature_names: List[str] = Field(default_factory=list)
    dataset_sample_size: int = 0

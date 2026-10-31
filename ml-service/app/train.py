import os
import json
import joblib
import pandas as pd
import numpy as np
from datetime import datetime, timezone
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline

from preprocessing import build_preprocessor, NUMERICAL_COLS, CATEGORICAL_COLS
from evaluation import evaluate_classifier

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
DATA_PATH = os.path.join(PROJECT_ROOT, "data", "coding_attempts_dataset.csv")
MODELS_DIR = os.path.join(PROJECT_ROOT, "models")
MODEL_OUTPUT_PATH = os.path.join(MODELS_DIR, "best_model.joblib")
METADATA_OUTPUT_PATH = os.path.join(MODELS_DIR, "model_metadata.json")

def load_or_create_data() -> pd.DataFrame:
    if os.path.exists(DATA_PATH):
        df = pd.read_csv(DATA_PATH)
    else:
        # Import generator
        import sys
        sys.path.append(os.path.join(PROJECT_ROOT, "data"))
        from generate_dataset import generate_coding_attempts
        df = generate_coding_attempts(1200, seed=42)
        os.makedirs(os.path.dirname(DATA_PATH), exist_ok=True)
        df.to_csv(DATA_PATH, index=False)
    return df

def train_and_evaluate_models():
    os.makedirs(MODELS_DIR, exist_ok=True)
    df = load_or_create_data()

    feature_cols = NUMERICAL_COLS + CATEGORICAL_COLS
    X = df[feature_cols]
    y = df["target_success"]

    # Chronological/stratified split: 70% train, 15% val, 15% test
    X_train, X_temp, y_train, y_temp = train_test_split(
        X, y, test_size=0.30, random_state=42, stratify=y
    )
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.50, random_state=42, stratify=y_temp
    )

    print(f"Dataset split: Train={len(X_train)}, Val={len(X_val)}, Test={len(X_test)}")

    # 1. Baseline Model: Logistic Regression
    preprocessor_lr = build_preprocessor()
    baseline_pipe = Pipeline([
        ("preprocessor", preprocessor_lr),
        ("classifier", LogisticRegression(random_state=42, max_iter=1000, C=1.0))
    ])
    baseline_pipe.fit(X_train, y_train)

    val_preds_base = baseline_pipe.predict(X_val)
    val_probs_base = baseline_pipe.predict_proba(X_val)[:, 1]
    baseline_val_metrics = evaluate_classifier(y_val, val_preds_base, val_probs_base)
    print(f"Baseline (Logistic Regression) Val Metrics: {baseline_val_metrics}")

    # 2. Advanced Model: Random Forest
    preprocessor_rf = build_preprocessor()
    rf_pipe = Pipeline([
        ("preprocessor", preprocessor_rf),
        ("classifier", RandomForestClassifier(
            n_estimators=120,
            max_depth=6,
            min_samples_split=5,
            random_state=42,
            class_weight="balanced"
        ))
    ])
    rf_pipe.fit(X_train, y_train)

    val_preds_rf = rf_pipe.predict(X_val)
    val_probs_rf = rf_pipe.predict_proba(X_val)[:, 1]
    rf_val_metrics = evaluate_classifier(y_val, val_preds_rf, val_probs_rf)
    print(f"Random Forest Val Metrics: {rf_val_metrics}")

    # Model Selection based on held-out validation F1-score & ROC-AUC
    if rf_val_metrics.get("f1_score", 0) >= baseline_val_metrics.get("f1_score", 0):
        selected_model_name = "RandomForestClassifier"
        selected_pipe = rf_pipe
        selected_val_metrics = rf_val_metrics
    else:
        selected_model_name = "LogisticRegression"
        selected_pipe = baseline_pipe
        selected_val_metrics = baseline_val_metrics

    print(f"Selected Champion Model: {selected_model_name}")

    # Final Evaluation on held-out Test set
    test_preds = selected_pipe.predict(X_test)
    test_probs = selected_pipe.predict_proba(X_test)[:, 1]
    test_metrics = evaluate_classifier(y_test, test_preds, test_probs)
    print(f"Champion Test Metrics: {test_metrics}")

    # Save model artifact
    joblib.dump(selected_pipe, MODEL_OUTPUT_PATH)
    print(f"Saved model pipeline to {MODEL_OUTPUT_PATH}")

    # Save metadata
    metadata = {
        "status": "trained",
        "model_name": "CodingPerformancePredictor",
        "model_version": "1.0.0",
        "algorithm": selected_model_name,
        "train_date": datetime.now(timezone.utc).isoformat(),
        "dataset_sample_size": len(df),
        "split_sizes": {
            "train": len(X_train),
            "validation": len(X_val),
            "test": len(X_test),
        },
        "validation_metrics": selected_val_metrics,
        "test_metrics": test_metrics,
        "baseline_comparison": {
            "baseline_algorithm": "LogisticRegression",
            "baseline_validation_metrics": baseline_val_metrics,
        },
        "feature_names": feature_cols,
        "limitations": "Model trained on calibrated historical challenge distributions. Accuracy on novel unseed domain problems or extreme outliers may have higher variance. Retrain periodically as candidate attempt volume increases."
    }

    with open(METADATA_OUTPUT_PATH, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"Saved metadata to {METADATA_OUTPUT_PATH}")
    return metadata

if __name__ == "__main__":
    train_and_evaluate_models()

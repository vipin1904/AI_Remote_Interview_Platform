import numpy as np
import pandas as pd
import os

def generate_coding_attempts(n_samples: int = 1000, seed: int = 42) -> pd.DataFrame:
    """
    Generates a realistic development dataset of coding interview attempts
    for model training and evaluation.
    """
    np.random.seed(seed)

    questions = [
        {"slug": "two-sum", "difficulty": "Easy", "level": 1.0, "topic": "arrays"},
        {"slug": "reverse-string", "difficulty": "Easy", "level": 1.0, "topic": "strings"},
        {"slug": "valid-palindrome", "difficulty": "Easy", "level": 1.0, "topic": "two-pointers"},
        {"slug": "maximum-subarray", "difficulty": "Medium", "level": 2.0, "topic": "dynamic-programming"},
        {"slug": "container-with-most-water", "difficulty": "Medium", "level": 2.0, "topic": "two-pointers"},
        {"slug": "trapping-rain-water", "difficulty": "Hard", "level": 3.0, "topic": "two-pointers"},
        {"slug": "merge-k-sorted-lists", "difficulty": "Hard", "level": 3.0, "topic": "arrays"},
    ]

    languages = ["javascript", "python", "java"]
    lang_weights = [0.45, 0.40, 0.15]

    data = []
    for i in range(n_samples):
        q = np.random.choice(questions)
        lang = np.random.choice(languages, p=lang_weights)

        # Candidate skill prior
        skill = np.clip(np.random.normal(0.6, 0.2), 0.1, 0.98)
        
        historical_pass_rate = np.clip(np.random.normal(skill, 0.12), 0.05, 1.0)
        past_failed_tests_ratio = np.clip(np.random.normal(1.0 - historical_pass_rate, 0.15), 0.0, 1.0)
        past_attempts = int(np.random.exponential(1.5))
        past_attempts = min(past_attempts, 8)
        
        # Topic specific accuracy
        topic_acc = np.clip(np.random.normal(skill, 0.15), 0.05, 1.0)
        
        # Time spent & hints
        base_time = 12.0 * q["level"]
        time_spent = np.clip(np.random.normal(base_time, 6.0), 3.0, 60.0)
        hints = np.random.choice([0, 1, 2, 3], p=[0.60, 0.25, 0.10, 0.05])

        # Realistic log-odds outcome model
        z = (
            3.2 * historical_pass_rate
            - 1.4 * q["level"]
            - 2.0 * past_failed_tests_ratio
            + 1.5 * topic_acc
            - 0.35 * hints
            + 0.15 * min(past_attempts, 4)
            - 0.02 * (time_spent - base_time)
            + np.random.normal(0, 0.35)
        )
        prob = 1.0 / (1.0 + np.exp(-z))
        target_success = 1 if prob >= 0.50 else 0

        data.append({
            "attempt_id": f"att_{i+1:04d}",
            "user_id": f"user_{(i % 150) + 1:03d}",
            "question_slug": q["slug"],
            "difficulty": q["difficulty"],
            "difficulty_level": q["level"],
            "topic": q["topic"],
            "language": lang,
            "historical_pass_rate": round(float(historical_pass_rate), 4),
            "past_failed_tests_ratio": round(float(past_failed_tests_ratio), 4),
            "past_attempts_count": past_attempts,
            "time_spent_minutes": round(float(time_spent), 1),
            "hints_used": hints,
            "topic_historical_accuracy": round(float(topic_acc), 4),
            "target_success": target_success,
        })

    df = pd.DataFrame(data)
    return df

if __name__ == "__main__":
    out_dir = os.path.dirname(os.path.abspath(__file__))
    df = generate_coding_attempts(1200, seed=42)
    csv_path = os.path.join(out_dir, "coding_attempts_dataset.csv")
    df.to_csv(csv_path, index=False)
    print(f"Generated {len(df)} samples saved to {csv_path}")
    print("Class distribution:")
    print(df["target_success"].value_counts(normalize=True))

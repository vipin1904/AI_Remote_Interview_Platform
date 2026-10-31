from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.pipeline import Pipeline

NUMERICAL_COLS = [
    "historical_pass_rate",
    "past_failed_tests_ratio",
    "past_attempts_count",
    "time_spent_minutes",
    "hints_used",
    "topic_historical_accuracy",
    "difficulty_level",
]

CATEGORICAL_COLS = [
    "language",
    "topic",
]

def build_preprocessor() -> ColumnTransformer:
    """
    Builds a scikit-learn ColumnTransformer that standardizes numerical features
    and one-hot encodes categorical features with handle_unknown='ignore'.
    """
    numeric_transformer = Pipeline(steps=[
        ("scaler", StandardScaler())
    ])

    categorical_transformer = Pipeline(steps=[
        ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, NUMERICAL_COLS),
            ("cat", categorical_transformer, CATEGORICAL_COLS),
        ],
        remainder="drop"
    )

    return preprocessor

# TalentIQ Machine Learning Service

A standalone, production-ready machine learning service built with FastAPI, scikit-learn, pandas, and NumPy for technical interview performance prediction and adaptive practice recommendations.

---

## Architecture

```
ml-service/
├── app/
│   ├── main.py            # FastAPI application routes (/health, /model/status, /predict-performance, /recommend-practice)
│   ├── schemas.py         # Strict Pydantic v2 data transfer schemas
│   ├── features.py        # Feature extraction and encoding pipeline
│   ├── preprocessing.py   # Scikit-learn ColumnTransformer (StandardScaler + OneHotEncoder)
│   ├── train.py           # Training pipeline comparing Logistic Regression vs. Random Forest
│   ├── predict.py         # Model inference and explainability factor analysis
│   └── evaluation.py      # Standard metrics (Accuracy, Precision, Recall, F1, ROC-AUC, Confusion Matrix)
├── data/
│   ├── generate_dataset.py # Calibrated coding attempt generator
│   └── coding_attempts_dataset.csv
├── models/
│   ├── best_model.joblib  # Serialized winning pipeline artifact
│   └── model_metadata.json# Model validation, metrics, hyperparameters, and lineage
├── tests/
│   └── test_ml_service.py # Unit and integration tests (pytest + HTTPX)
├── requirements.txt
└── README.md
```

---

## Machine Learning Modeling & Training

### 1. Objective & Target
Predicts whether a candidate will successfully solve a technical coding problem (>=80% test cases passed) based on pre-attempt signals:
- Historical pass rate
- Failed test ratio on prior attempts
- Prior attempts count
- Target problem difficulty
- Time spent
- Programming language
- Hint usage
- Topic historical accuracy

### 2. Leakage-Free Stratified Split
- **70% Training Set**: Used for model optimization.
- **15% Validation Set**: Used for hyperparameter tuning and model selection.
- **15% Held-out Test Set**: Final unbiased evaluation.

### 3. Model Comparison
- **Baseline**: Logistic Regression with standardized numerical features and one-hot encoded categorical features.
- **Advanced Model**: Random Forest Classifier with balanced class weights, depth constraints (`max_depth=6`), and ensemble trees.
- The pipeline selects the superior model based on validation F1-Score and ROC-AUC.

---

## API Endpoints

### `GET /health`
Returns service status, uptime, and Python version.

### `GET /model/status`
Returns metadata regarding the currently loaded model, training timestamp, test metrics, and feature names.

### `POST /predict-performance`
Accepts candidate history and target problem metadata; returns calibrated success probability, confidence score, category, top drivers, and risk factors.

### `POST /recommend-practice`
Accepts current performance and topic weak points; returns curated practice problems from the question bank and a 7-day adaptive study path.

---

## Running the Service

```bash
# 1. Train or re-train models
python ml-service/app/train.py

# 2. Run unit and integration tests
python -m pytest ml-service/tests/ -v

# 3. Start the FastAPI service
python -m uvicorn ml-service.app.main:app --host 0.0.0.0 --port 8000 --reload
```

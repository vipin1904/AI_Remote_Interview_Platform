import numpy as np
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report
)
from typing import Dict, Any

def evaluate_classifier(y_true, y_pred, y_prob=None) -> Dict[str, Any]:
    """
    Computes standard classification metrics for model evaluation.
    """
    metrics = {
        "accuracy": round(float(accuracy_score(y_true, y_pred)), 4),
        "precision": round(float(precision_score(y_true, y_pred, zero_division=0)), 4),
        "recall": round(float(recall_score(y_true, y_pred, zero_division=0)), 4),
        "f1_score": round(float(f1_score(y_true, y_pred, zero_division=0)), 4),
    }

    if y_prob is not None:
        try:
            metrics["roc_auc"] = round(float(roc_auc_score(y_true, y_prob)), 4)
        except Exception:
            metrics["roc_auc"] = None
    else:
        metrics["roc_auc"] = None

    cm = confusion_matrix(y_true, y_pred).tolist()
    metrics["confusion_matrix"] = {
        "true_negative": cm[0][0] if len(cm) > 1 else 0,
        "false_positive": cm[0][1] if len(cm) > 1 and len(cm[0]) > 1 else 0,
        "false_negative": cm[1][0] if len(cm) > 1 else 0,
        "true_positive": cm[1][1] if len(cm) > 1 and len(cm[1]) > 1 else 0,
    }

    return metrics

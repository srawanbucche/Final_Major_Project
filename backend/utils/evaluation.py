import json
from pathlib import Path
from typing import Dict, Any, Optional

import numpy as np
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix
)


class ModelEvaluator:
    """Evaluate and store model performance metrics."""
    
    def __init__(self, metrics_file: str = "models/evaluation_metrics.json"):
        """
        Initialize the evaluator.
        
        Args:
            metrics_file: Path to store evaluation metrics
        """
        backend_dir = Path(__file__).parent.parent
        self.metrics_file = backend_dir / "models" / "evaluation_metrics.json"
        self.metrics_file.parent.mkdir(parents=True, exist_ok=True)
    
    def calculate_metrics(
        self,
        y_true: np.ndarray,
        y_pred: np.ndarray,
        labels: Optional[list] = None
    ) -> Dict[str, Any]:
        """
        Calculate comprehensive evaluation metrics.
        
        Args:
            y_true: True labels
            y_pred: Predicted labels
            labels: List of label names for confusion matrix
            
        Returns:
            Dictionary containing all metrics
        """
        if labels is None:
            labels = ['non-suicidal', 'suicidal']
        
        # Calculate basic metrics
        accuracy = accuracy_score(y_true, y_pred)
        precision = precision_score(y_true, y_pred, average='binary', pos_label='suicidal')
        recall = recall_score(y_true, y_pred, average='binary', pos_label='suicidal')
        f1 = f1_score(y_true, y_pred, average='binary', pos_label='suicidal')
        
        # Calculate confusion matrix
        cm = confusion_matrix(y_true, y_pred, labels=labels)
        
        # Extract confusion matrix components
        tn, fp, fn, tp = cm.ravel() if cm.size == 4 else (0, 0, 0, 0)
        
        metrics = {
            "accuracy": float(accuracy),
            "precision": float(precision),
            "recall": float(recall),
            "f1_score": float(f1),
            "confusion_matrix": {
                "true_negative": int(tn),
                "false_positive": int(fp),
                "false_negative": int(fn),
                "true_positive": int(tp)
            },
            "confusion_matrix_raw": cm.tolist()
        }
        
        return metrics
    
    def save_metrics(self, metrics: Dict[str, Any], model_name: str = "Naive Bayes"):
        """
        Save evaluation metrics to file.
        
        Args:
            metrics: Dictionary of metrics to save
            model_name: Name of the model being evaluated
        """
        metrics_with_metadata = {
            "model_name": model_name,
            "metrics": metrics,
            "saved_at": str(Path.cwd())
        }
        
        with open(self.metrics_file, 'w') as f:
            json.dump(metrics_with_metadata, f, indent=2)
    
    def load_metrics(self) -> Optional[Dict[str, Any]]:
        """
        Load evaluation metrics from file.
        
        Returns:
            Dictionary containing metrics if file exists, None otherwise
        """
        if not self.metrics_file.exists():
            return None
        
        with open(self.metrics_file, 'r') as f:
            return json.load(f)
    
    def print_metrics(self, metrics: Dict[str, Any]):
        """
        Print evaluation metrics in a readable format.
        
        Args:
            metrics: Dictionary of metrics to print
        """
        print("\n" + "="*50)
        print("MODEL EVALUATION METRICS")
        print("="*50)
        print(f"Accuracy:  {metrics['accuracy']:.4f}")
        print(f"Precision: {metrics['precision']:.4f}")
        print(f"Recall:    {metrics['recall']:.4f}")
        print(f"F1 Score:  {metrics['f1_score']:.4f}")
        print("\nConfusion Matrix:")
        cm = metrics['confusion_matrix']
        print(f"  True Negative:  {cm['true_negative']}")
        print(f"  False Positive: {cm['false_positive']}")
        print(f"  False Negative: {cm['false_negative']}")
        print(f"  True Positive:  {cm['true_positive']}")
        print("="*50 + "\n")
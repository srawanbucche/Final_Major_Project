import json
from pathlib import Path
from typing import Dict, Any, List, Optional

import joblib
import numpy as np

from preprocessing.text_preprocessor import get_preprocessor


class PredictionService:
    """Service for making predictions using the trained Naive Bayes model."""
    
    def __init__(self):
        """Initialize the prediction service."""
        self.preprocessor = get_preprocessor()
        self.model = None
        self.vectorizer = None
        # Get the directory containing this file (backend/services/)
        backend_dir = Path(__file__).parent.parent
        self.model_path = backend_dir / "models" / "naive_bayes_model.pkl"
        self.vectorizer_path = backend_dir / "models" / "tfidf_vectorizer.pkl"
    
    def load_model(self) -> bool:
        """
        Load the trained model and vectorizer.
        
        Returns:
            True if loading was successful, False otherwise
        """
        try:
            if not self.model_path.exists():
                print(f"Model file not found: {self.model_path}")
                return False
            
            if not self.vectorizer_path.exists():
                print(f"Vectorizer file not found: {self.vectorizer_path}")
                return False
            
            self.model = joblib.load(self.model_path)
            self.vectorizer = joblib.load(self.vectorizer_path)
            print("Model and vectorizer loaded successfully")
            return True
        except Exception as e:
            print(f"Error loading model: {str(e)}")
            return False
    
    def is_model_loaded(self) -> bool:
        """Check if the model is loaded."""
        return self.model is not None and self.vectorizer is not None
    
    def predict_single(self, text: str) -> Dict[str, Any]:
        """
        Make a prediction for a single text.
        
        Args:
            text: Input text to classify
            
        Returns:
            Dictionary containing prediction and confidence
        """
        if not self.is_model_loaded():
            if not self.load_model():
                raise RuntimeError("Naive Bayes model is not trained yet.")
        
        # Preprocess text
        cleaned_text = self.preprocessor.preprocess(text)
        
        if not cleaned_text.strip():
            return {
                "success": False,
                "error": "Empty text after preprocessing"
            }
        
        # Transform using TF-IDF
        text_tfidf = self.vectorizer.transform([cleaned_text])
        
        # Make prediction
        prediction = self.model.predict(text_tfidf)[0]
        
        # Get prediction probability
        probabilities = self.model.predict_proba(text_tfidf)[0]
        
        # Get confidence for the predicted class
        class_indices = {cls: idx for idx, cls in enumerate(self.model.classes_)}
        confidence = float(probabilities[class_indices[prediction]])
        
        return {
            "success": True,
            "prediction": prediction,
            "confidence": confidence,
            "model": "Naive Bayes"
        }
    
    def predict_batch(self, messages: List[str]) -> Dict[str, Any]:
        """
        Make predictions for multiple texts.
        
        Args:
            messages: List of input texts to classify
            
        Returns:
            Dictionary containing predictions for all messages
        """
        if not self.is_model_loaded():
            if not self.load_model():
                raise RuntimeError("Naive Bayes model is not trained yet.")
        
        results = []
        
        for message in messages:
            try:
                prediction_result = self.predict_single(message)
                if prediction_result["success"]:
                    results.append({
                        "text": message,
                        "prediction": prediction_result["prediction"],
                        "confidence": prediction_result["confidence"]
                    })
                else:
                    results.append({
                        "text": message,
                        "prediction": "error",
                        "confidence": 0.0,
                        "error": prediction_result.get("error", "Unknown error")
                    })
            except Exception as e:
                results.append({
                    "text": message,
                    "prediction": "error",
                    "confidence": 0.0,
                    "error": str(e)
                })
        
        return {
            "success": True,
            "model": "Naive Bayes",
            "results": results
        }


# Singleton instance for reuse
_prediction_service_instance: Optional[PredictionService] = None


def get_prediction_service() -> PredictionService:
    """Get or create the singleton prediction service instance."""
    global _prediction_service_instance
    if _prediction_service_instance is None:
        _prediction_service_instance = PredictionService()
    return _prediction_service_instance
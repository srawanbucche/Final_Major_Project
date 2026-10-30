import sys
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import MultinomialNB

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from preprocessing.text_preprocessor import get_preprocessor
from utils.evaluation import ModelEvaluator


def train_naive_bayes():
    """Train a Naive Bayes model for suicidal text classification."""
    
    print("Starting Naive Bayes training pipeline...")
    print("="*50)
    
    # Paths
    backend_dir = Path(__file__).parent.parent
    dataset_path = backend_dir / "data" / "dataset.csv"
    model_path = backend_dir / "models" / "naive_bayes_model.pkl"
    vectorizer_path = backend_dir / "models" / "tfidf_vectorizer.pkl"
    
    # Initialize components
    preprocessor = get_preprocessor()
    evaluator = ModelEvaluator(str(backend_dir / "models" / "evaluation_metrics.json"))
    
    # Create models directory if it doesn't exist
    model_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Step 1: Load dataset
    print(f"Loading dataset from {dataset_path}...")
    if not dataset_path.exists():
        raise FileNotFoundError(f"Dataset not found at {dataset_path}")
    
    df = pd.read_csv(dataset_path)
    print(f"Dataset loaded: {len(df)} rows")
    
    # Step 2: Validate columns
    print("Validating dataset columns...")
    required_columns = ['text', 'label']
    missing_columns = [col for col in required_columns if col not in df.columns]
    if missing_columns:
        raise ValueError(f"Missing required columns: {missing_columns}")
    
    # Step 3: Remove missing values
    print("Removing missing values...")
    df = df.dropna(subset=['text', 'label'])
    print(f"Rows after removing missing values: {len(df)}")
    
    if len(df) == 0:
        raise ValueError("No valid data remaining after removing missing values")
    
    # Step 4: Clean text
    print("Preprocessing text...")
    df['cleaned_text'] = df['text'].apply(preprocessor.preprocess)
    
    # Remove empty cleaned texts
    df = df[df['cleaned_text'].str.strip() != '']
    print(f"Rows after removing empty cleaned texts: {len(df)}")
    
    if len(df) == 0:
        raise ValueError("No valid data remaining after text preprocessing")
    
    # Step 5: Split dataset with stratification
    print("Splitting dataset into train/test...")
    X = df['cleaned_text']
    y = df['label']
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=0.2,
        random_state=42,
        stratify=y
    )
    
    print(f"Training set: {len(X_train)} samples")
    print(f"Test set: {len(X_test)} samples")
    
    # Step 6: Fit TF-IDF on training data only
    print("Fitting TF-IDF vectorizer on training data...")
    tfidf_vectorizer = TfidfVectorizer(
        max_features=5000,
        ngram_range=(1, 2),
        min_df=2,
        max_df=0.8
    )
    
    X_train_tfidf = tfidf_vectorizer.fit_transform(X_train)
    print(f"TF-IDF features: {X_train_tfidf.shape[1]}")
    
    # Step 7: Transform test data
    print("Transforming test data...")
    X_test_tfidf = tfidf_vectorizer.transform(X_test)
    
    # Step 8: Train Multinomial Naive Bayes
    print("Training Multinomial Naive Bayes model...")
    nb_model = MultinomialNB(alpha=1.0)
    nb_model.fit(X_train_tfidf, y_train)
    
    # Step 9: Generate predictions
    print("Generating predictions...")
    y_pred = nb_model.predict(X_test_tfidf)
    
    # Step 10: Calculate evaluation metrics
    print("Calculating evaluation metrics...")
    metrics = evaluator.calculate_metrics(y_test, y_pred)
    evaluator.print_metrics(metrics)
    
    # Step 11: Save model and vectorizer
    print(f"Saving model to {model_path}...")
    joblib.dump(nb_model, model_path)
    
    print(f"Saving TF-IDF vectorizer to {vectorizer_path}...")
    joblib.dump(tfidf_vectorizer, vectorizer_path)
    
    # Step 12: Save evaluation metrics
    print("Saving evaluation metrics...")
    evaluator.save_metrics(metrics, model_name="Naive Bayes")
    
    print("="*50)
    print("Training completed successfully!")
    print(f"Model saved: {model_path}")
    print(f"Vectorizer saved: {vectorizer_path}")
    print("="*50)


if __name__ == "__main__":
    try:
        train_naive_bayes()
    except Exception as e:
        print(f"\nError during training: {str(e)}")
        sys.exit(1)
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from services.prediction_service import get_prediction_service


def test_predictions():
    """Test the trained model with sample messages."""
    
    print("Testing Naive Bayes Model Predictions")
    print("="*60)
    
    # Test messages
    test_messages = [
        "I had a great day at work today",
        "I feel so happy and grateful",
        "I want to die",
        "I just want to die",
        "I wish I could die",
        "I'm going to die",
        "I need to die",
        "I should just die",
        "I will suicide and die today",
        "I'm going to suicide today",
        "I will commit suicide today",
        "I feel hopeless",
        "I am feeling good",
        "I don't know what to do anymore",
        "Life is wonderful",
        "I am so tired of everything",
        "I love my family",
        "I feel like ending it all"
    ]
    
    # Get prediction service
    service = get_prediction_service()
    
    # Load model
    if not service.load_model():
        print("Error: Could not load model. Make sure training has been completed.")
        return
    
    # Make predictions
    results = service.predict_batch(test_messages)
    
    # Display results
    print(f"\n{'Message':<40} {'Prediction':<15} {'Confidence':<10}")
    print("-"*60)
    
    for result in results['results']:
        message = result['text'][:38] + '..' if len(result['text']) > 38 else result['text']
        prediction = result['prediction']
        confidence = f"{result['confidence']:.2%}"
        
        print(f"{message:<40} {prediction:<15} {confidence:<10}")
    
    print("="*60)
    print(f"Model: {results['model']}")
    print(f"Total predictions: {len(results['results'])}")


if __name__ == "__main__":
    test_predictions()

import io
import json
from pathlib import Path
from typing import Dict, Any

from flask import Flask, jsonify, request
from flask_cors import CORS

from services.prediction_service import get_prediction_service
from utils.file_parser import FileParser

app = Flask(__name__)
CORS(app)

# Initialize services
prediction_service = get_prediction_service()


@app.route("/api/health", methods=["GET"])
def health():
    """Health check endpoint."""
    model_loaded = prediction_service.is_model_loaded()
    return jsonify({
        "status": "ok",
        "model": "Naive Bayes",
        "model_loaded": model_loaded
    })


@app.route("/api/predict", methods=["POST"])
def predict():
    """
    Predict endpoint for single text classification.
    
    Request body:
    {
        "text": "user message here"
    }
    
    Response:
    {
        "success": true,
        "prediction": "suicidal",
        "confidence": 0.87,
        "model": "Naive Bayes"
    }
    """
    try:
        data = request.get_json()
        
        if not data or "text" not in data:
            return jsonify({
                "success": False,
                "error": "Missing 'text' field in request body"
            }), 400
        
        text = data["text"]
        
        if not text or not isinstance(text, str):
            return jsonify({
                "success": False,
                "error": "Text must be a non-empty string"
            }), 400
        
        result = prediction_service.predict_single(text)
        
        if not result["success"]:
            return jsonify(result), 400
        
        return jsonify(result)
    
    except RuntimeError as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 503
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Prediction error: {str(e)}"
        }), 500


@app.route("/api/predict/batch", methods=["POST"])
def predict_batch():
    """
    Batch prediction endpoint for multiple texts.
    
    Request body:
    {
        "texts": [
            "message one",
            "message two",
            "message three"
        ]
    }
    
    Response:
    {
        "model": "Naive Bayes",
        "total_messages": 3,
        "results": [
            {
                "text": "message one",
                "prediction": "...",
                "confidence": 0.91
            }
        ]
    }
    """
    try:
        data = request.get_json()
        
        # Support both "texts" and "messages" for compatibility
        texts_key = "texts" if "texts" in data else "messages"
        
        if not data or texts_key not in data:
            return jsonify({
                "success": False,
                "error": f"Missing '{texts_key}' field in request body"
            }), 400
        
        messages = data[texts_key]
        
        if not isinstance(messages, list):
            return jsonify({
                "success": False,
                "error": f"'{texts_key}' must be an array"
            }), 400
        
        if not messages:
            return jsonify({
                "success": False,
                "error": f"'{texts_key}' array cannot be empty"
            }), 400
        
        result = prediction_service.predict_batch(messages)
        
        # Add total_messages to response
        result["total_messages"] = len(messages)
        
        return jsonify(result)
    
    except RuntimeError as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 503
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Batch prediction error: {str(e)}"
        }), 500


@app.route("/api/analyze-file", methods=["POST"])
def analyze_file():
    """
    Analyze uploaded chat/text file (TXT, CSV, JSON).
    
    Supported file types: TXT, CSV, JSON
    """
    try:
        if "file" not in request.files:
            return jsonify({
                "success": False,
                "error": "No file provided"
            }), 400
        
        file = request.files["file"]
        
        if file.filename == "":
            return jsonify({
                "success": False,
                "error": "No file selected"
            }), 400
        
        # Validate file size
        file_size = len(file.read())
        file.seek(0)  # Reset file pointer
        
        size_valid, size_error = FileParser.validate_file_size(file_size)
        if not size_valid:
            return jsonify({
                "success": False,
                "error": size_error
            }), 400
        
        # Check file extension
        file_ext = Path(file.filename).suffix.lower()
        
        if file_ext not in ['.txt', '.csv', '.json']:
            return jsonify({
                "success": False,
                "error": f"Unsupported file type: {file_ext}. Supported types: .txt, .csv, .json"
            }), 400
        
        # Read file content
        file_content = file.read().decode('utf-8')
        
        # Parse file based on type
        messages, metadata, parse_error = FileParser.parse_file(file_content, file_ext)
        
        if parse_error:
            return jsonify({
                "success": False,
                "error": parse_error
            }), 400
        
        if not messages:
            return jsonify({
                "success": False,
                "error": "No messages found in file"
            }), 400
        
        # Analyze messages
        result = prediction_service.predict_batch(messages)
        
        if not result["success"]:
            return jsonify(result), 500
        
        # Calculate statistics
        analyzed_results = [r for r in result["results"] if r["prediction"] != "error"]
        failed_results = [r for r in result["results"] if r["prediction"] == "error"]
        
        # Count classes
        class_counts = {}
        for r in analyzed_results:
            prediction = r["prediction"]
            class_counts[prediction] = class_counts.get(prediction, 0) + 1
        
        # Calculate average confidence
        total_confidence = sum(r["confidence"] for r in analyzed_results)
        average_confidence = total_confidence / len(analyzed_results) if analyzed_results else 0.0
        
        # Calculate percentages
        class_percentages = {}
        total_analyzed = len(analyzed_results)
        for class_name, count in class_counts.items():
            class_percentages[class_name] = (count / total_analyzed * 100) if total_analyzed > 0 else 0
        
        return jsonify({
            "success": True,
            "model": "Naive Bayes",
            "total_messages": len(messages),
            "analyzed_messages": len(analyzed_results),
            "failed_messages": len(failed_results),
            "results": result["results"],
            "summary": {
                "class_counts": class_counts,
                "class_percentages": class_percentages,
                "average_confidence": round(average_confidence, 4)
            }
        })
    
    except RuntimeError as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 503
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"File analysis error: {str(e)}"
        }), 500


if __name__ == "__main__":
    # Try to load model on startup
    prediction_service.load_model()
    app.run(host="0.0.0.0", port=5000, debug=True)
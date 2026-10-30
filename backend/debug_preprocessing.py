import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from preprocessing.text_preprocessor import get_preprocessor

preprocessor = get_preprocessor()

test_phrases = [
    "I want to die",
    "I want to die tonight",
    "I want to kill myself",
    "I feel hopeless",
    "I am happy",
    "I love my life"
]

print("Preprocessing Debug:")
print("="*60)
for phrase in test_phrases:
    processed = preprocessor.preprocess(phrase)
    print(f"Original: '{phrase}'")
    print(f"Processed: '{processed}'")
    print()

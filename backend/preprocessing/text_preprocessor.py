import re
import string
from typing import Optional

import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from nltk.tokenize import word_tokenize


class TextPreprocessor:
    """Reusable text preprocessing for NLP tasks."""
    
    def __init__(self):
        """Initialize the preprocessor and download required NLTK data."""
        self._download_nltk_data()
        self.lemmatizer = WordNetLemmatizer()
        # Use a conservative stop word list for mental health detection
        # Keep words that are important for detecting suicidal intent
        all_stop_words = set(stopwords.words('english'))
        # Remove words that are important for suicidal detection
        important_words = {'i', 'me', 'my', 'myself', 'to', 'not', 'no', 'never'}
        self.stop_words = all_stop_words - important_words
    
    def _download_nltk_data(self):
        """Download required NLTK data if not already present."""
        required_packages = ['punkt', 'stopwords', 'wordnet']
        for package in required_packages:
            try:
                nltk.data.find(f'tokenizers/{package}')
            except LookupError:
                try:
                    nltk.download(package, quiet=True)
                except:
                    pass
    
    def clean_text(self, text: Optional[str]) -> str:
        """
        Clean and preprocess text for NLP analysis.
        
        Args:
            text: Input text to clean
            
        Returns:
            Cleaned text string
        """
        if text is None:
            return ""
        
        if not isinstance(text, str):
            text = str(text)
        
        # Convert to lowercase
        text = text.lower()
        
        # Remove URLs
        text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
        
        # Remove punctuation
        text = text.translate(str.maketrans('', '', string.punctuation))
        
        # Remove numbers (optional - can be adjusted based on requirements)
        text = re.sub(r'\d+', '', text)
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
    
    def tokenize_and_lemmatize(self, text: str) -> str:
        """
        Tokenize, remove stop words, and lemmatize text.
        
        Args:
            text: Input text to process
            
        Returns:
            Processed text string
        """
        if not text or not isinstance(text, str):
            return ""
        
        # Tokenize
        tokens = word_tokenize(text)
        
        # Remove stop words and lemmatize
        processed_tokens = [
            self.lemmatizer.lemmatize(token)
            for token in tokens
            if token not in self.stop_words and len(token) > 1
        ]
        
        return ' '.join(processed_tokens)
    
    def preprocess(self, text: Optional[str]) -> str:
        """
        Complete preprocessing pipeline: clean, tokenize, remove stop words, lemmatize.
        
        Args:
            text: Input text to preprocess
            
        Returns:
            Fully preprocessed text string
        """
        if text is None:
            return ""
        
        # Step 1: Clean text
        cleaned = self.clean_text(text)
        
        # Step 2: Tokenize and lemmatize
        processed = self.tokenize_and_lemmatize(cleaned)
        
        return processed


# Singleton instance for reuse
_preprocessor_instance: Optional[TextPreprocessor] = None


def get_preprocessor() -> TextPreprocessor:
    """Get or create the singleton preprocessor instance."""
    global _preprocessor_instance
    if _preprocessor_instance is None:
        _preprocessor_instance = TextPreprocessor()
    return _preprocessor_instance
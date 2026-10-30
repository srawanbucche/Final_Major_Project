import io
import json
from typing import Dict, Any, List, Tuple, Optional

import pandas as pd


class FileParser:
    """Parse and extract messages from various file formats."""
    
    # Common text column names (case-insensitive)
    TEXT_COLUMNS = [
        'text', 'message', 'messages', 'content', 'body', 
        'chat', 'post', 'comment', 'msg', 'conversation'
    ]
    
    # Maximum file size in bytes (10MB)
    MAX_FILE_SIZE = 10 * 1024 * 1024
    
    @staticmethod
    def validate_file_size(file_size: int) -> Tuple[bool, str]:
        """Validate file size."""
        if file_size == 0:
            return False, "File is empty"
        if file_size > FileParser.MAX_FILE_SIZE:
            return False, f"File size exceeds maximum of {FileParser.MAX_FILE_SIZE / (1024*1024)}MB"
        return True, ""
    
    @staticmethod
    def parse_txt(content: str) -> List[str]:
        """Parse TXT file - each line is a message."""
        messages = [line.strip() for line in content.split('\n') if line.strip()]
        return messages
    
    @staticmethod
    def parse_csv(content: str) -> Tuple[List[str], Optional[Dict[str, Any]]]:
        """
        Parse CSV file and extract text column.
        
        Returns:
            Tuple of (messages list, metadata dict)
        """
        df = pd.read_csv(io.StringIO(content))
        
        # Find text column (case-insensitive)
        text_column = None
        df_columns_lower = {col.lower(): col for col in df.columns}
        
        for col_name in FileParser.TEXT_COLUMNS:
            if col_name in df_columns_lower:
                text_column = df_columns_lower[col_name]
                break
        
        if text_column is None:
            # Try to find first string column
            for col in df.columns:
                if df[col].dtype == 'object':
                    text_column = col
                    break
        
        if text_column is None:
            return [], None
        
        # Extract messages
        messages = df[text_column].dropna().astype(str).tolist()
        
        # Extract metadata if available
        metadata = {}
        for col in df.columns:
            if col != text_column and col.lower() in ['timestamp', 'sender', 'username', 'platform', 'date']:
                metadata[col] = df[col].tolist()
        
        return messages, metadata
    
    @staticmethod
    def parse_json(content: str) -> List[str]:
        """Parse JSON file and extract messages."""
        json_data = json.loads(content)
        messages = []
        
        if isinstance(json_data, list):
            # Array of objects
            for item in json_data:
                if isinstance(item, dict):
                    # Look for common message fields (case-insensitive)
                    item_lower = {k.lower(): v for k, v in item.items()}
                    for field in FileParser.TEXT_COLUMNS:
                        if field in item_lower and item_lower[field]:
                            messages.append(str(item_lower[field]))
                            break
                elif isinstance(item, str):
                    messages.append(item)
        
        elif isinstance(json_data, dict):
            # Single object with messages array
            for field in ['messages', 'texts', 'data', 'items', 'conversations']:
                if field in json_data and isinstance(json_data[field], list):
                    for item in json_data[field]:
                        if isinstance(item, dict):
                            item_lower = {k.lower(): v for k, v in item.items()}
                            for msg_field in FileParser.TEXT_COLUMNS:
                                if msg_field in item_lower and item_lower[msg_field]:
                                    messages.append(str(item_lower[msg_field]))
                                    break
                        elif isinstance(item, str):
                            messages.append(item)
                    break
        
        return messages
    
    @staticmethod
    def parse_file(file_content: str, file_extension: str) -> Tuple[List[str], Optional[Dict[str, Any]], Optional[str]]:
        """
        Parse file based on extension.
        
        Returns:
            Tuple of (messages list, metadata dict, error message)
        """
        try:
            if file_extension == '.txt':
                messages = FileParser.parse_txt(file_content)
                return messages, None, None
            
            elif file_extension == '.csv':
                messages, metadata = FileParser.parse_csv(file_content)
                if not messages:
                    return [], None, "No text/message column found in the uploaded CSV"
                return messages, metadata, None
            
            elif file_extension == '.json':
                messages = FileParser.parse_json(file_content)
                if not messages:
                    return [], None, "No message/text field found in the uploaded JSON"
                return messages, None, None
            
            else:
                return [], None, f"Unsupported file type: {file_extension}"
        
        except Exception as e:
            return [], None, f"Error parsing file: {str(e)}"
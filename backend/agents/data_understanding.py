import pandas as pd
from core.db import get_db_connection
from core.llm import call_llm
import json

def analyze_table_schema(table_name: str) -> dict:
    """Extracts schema, sample data, and basic stats from a DuckDB table."""
    conn = get_db_connection()
    try:
        # Get schema
        schema_df = conn.execute(f"DESCRIBE {table_name}").df()
        columns = schema_df.to_dict(orient="records")
        
        # Get sample rows
        sample_df = conn.execute(f"SELECT * FROM {table_name} LIMIT 5").df()
        
        # Basic stats logic could go here
        
        return {
            "table_name": table_name,
            "schema": columns,
            "sample_data": sample_df.to_dict(orient="records")
        }
    except Exception as e:
        return {"error": str(e)}

def extract_data_understanding(table_name: str) -> str:
    """Uses LLM to generate an understanding of the data in the table."""
    metadata = analyze_table_schema(table_name)
    if "error" in metadata:
        return f"Error analyzing data: {metadata['error']}"
        
    prompt = f"""
    You are an expert Data Analyst. Analyze the following data table metadata:
    Table Name: {metadata['table_name']}
    Schema:
    {json.dumps(metadata['schema'], indent=2)}
    
    Sample Data:
    {json.dumps(metadata['sample_data'], indent=2)}
    
    Please provide:
    1. A brief overview of what this data likely represents.
    2. Key metrics or features present.
    3. Potential data quality issues or anomalies (if any are apparent from the sample).
    4. 3 suggested analytical questions an executive might ask about this data.
    """
    
    messages = [
        {"role": "system", "content": "You are a highly capable analytical AI that understands raw data structures."},
        {"role": "user", "content": prompt}
    ]
    
    response = call_llm(messages)
    return response.get("choices", [{}])[0].get("message", {}).get("content", "Failed to generate understanding.")

import json
import pandas as pd
import numpy as np
from core.db import get_db_connection
from core.llm import call_llm

def get_available_tables():
    conn = get_db_connection()
    try:
        tables = conn.execute("SELECT table_name FROM uploads").fetchall()
        return [t[0] for t in tables]
    except:
        return []

def generate_insights(user_query: str) -> dict:
    """
    High-level reasoning engine. 
    1. Chooses relevant table
    2. Writes SQL
    3. Interprets Result
    4. Suggests Chart Type
    """
    tables = get_available_tables()
    if not tables:
        return {"reply": "I don't have any uploaded data to analyze yet. Please upload a dataset first.", "insights": None}
    
    # In a full LangGraph implementation, this would be nodes. 
    # For now, chaining via a prompt that requests JSON out.
    
    # Let's just pass the schema of all tables (simplification)
    conn = get_db_connection()
    schemas = {}
    for t in tables:
        try:
            schemas[t] = conn.execute(f"DESCRIBE {t}").fetchall()
        except:
            pass
            
    prompt = f"""
    You are an autonomous AI Business Intelligence Agent. 
    The user asked: "{user_query}"
    
    Available data tables and their schemas:
    {json.dumps(schemas, indent=2)}
    
    Perform the following tasks:
    1. Identify the EXACT SQL query needed to answer this question. Use PostgreSQL/DuckDB syntax. 
       - IMPORTANT: ONLY use column names that exist in the schema provided above.
       - Use 'AS' to give clear names to aggregated columns.
    2. Provide a narrative explanation addressing the user's question based on the query results.
    3. If the user asks for a chart or if the data is visualizable, provide a "chart_config" object.
    
    Rules for "chart_config":
    - "type": One of "bar", "line", "pie", "donut", "scatter", "area".
    - "xKey": MUST be a column name that IS present in your SQL SELECT statement.
    - "yKey": MUST be a column name that IS present in your SQL SELECT statement.
    - If it's a count/pie chart, ensure the yKey identifies the numeric count column.
    
    Respond in this JSON format:
    {{
      "sql_query": "SELECT ...",
      "narrative": "The data shows...",
      "chart_config": {{
        "title": "...",
        "type": "bar",
        "xKey": "column_a",
        "yKey": "column_b"
      }}
    }}
    """
    
    messages = [{"role": "system", "content": "You output JSON strictly."}, {"role": "user", "content": prompt}]
    response = call_llm(messages)
    content = response.get("choices", [{}])[0].get("message", {}).get("content", "{}")
    
    # Attempt to parse json
    try:
        # Improved JSON extraction from markdown or raw text
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
        
        parsed = json.loads(content)
    except:
        parsed = {"error": "Failed to parse AI structural response", "raw": content}
        
    # Execute SQL if present
    data_result = []
    chart_data = None
    if parsed.get("sql_query"):
        try:
            df = conn.execute(parsed["sql_query"]).df()
            data_result = df.to_dict(orient="records")
            parsed["execution_success"] = True
            
            # If we have a chart config, attach the actual data to it
            if parsed.get("chart_config"):
                chart_data = {
                    **parsed["chart_config"],
                    "data": _clean_records(df.head(50)) # Limit chat data for performance
                }
        except Exception as e:
            parsed["execution_success"] = False
            parsed["execution_error"] = str(e)
            
    return {
        "reply": parsed.get("narrative", "Generated insights."),
        "insights": {
            "sql": parsed.get("sql_query"),
            "data": data_result,
            "chart": chart_data
        }
    }


def _clean_records(df: pd.DataFrame) -> list:
    """Convert DataFrame to list of dicts with JSON-safe values."""
    import numpy as np
    records = df.to_dict(orient="records")
    cleaned = []
    for record in records:
        clean = {}
        for k, v in record.items():
            if pd.isna(v):
                clean[k] = 0
            elif isinstance(v, (np.integer,)):
                clean[k] = int(v)
            elif isinstance(v, (np.floating,)):
                clean[k] = round(float(v), 2)
            else:
                clean[k] = v
        cleaned.append(clean)
    return cleaned

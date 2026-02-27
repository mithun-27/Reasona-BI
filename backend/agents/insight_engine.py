import json
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
    1. Identify the SQL query needed to answer this question. Use PostgreSQL/DuckDB syntax. Return only valid SQL, or null if it cannot be answered.
    2. Provide a narrative explanation addressing the user's question, assuming the query returns relevant data.
    3. Suggest the most appropriate chart type to visualize this (line, bar, pie, scatter, etc.).
    
    Respond STRICTLY in JSON format with keys:
    "sql_query", "narrative", "recommended_chart"
    """
    
    messages = [{"role": "system", "content": "You output JSON strictly."}, {"role": "user", "content": prompt}]
    response = call_llm(messages)
    content = response.get("choices", [{}])[0].get("message", {}).get("content", "{}")
    
    # Attempt to parse json
    try:
        # Find json block if fenced
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        parsed = json.loads(content)
    except:
        parsed = {"error": "Failed to parse AI structural response", "raw": content}
        
    # Execute SQL if present
    data_result = []
    if parsed.get("sql_query"):
        try:
            df = conn.execute(parsed["sql_query"]).df()
            data_result = df.to_dict(orient="records")
            parsed["execution_success"] = True
        except Exception as e:
            parsed["execution_success"] = False
            parsed["execution_error"] = str(e)
            
    return {
        "reply": parsed.get("narrative", "Generated insights."),
        "insights": {
            "sql": parsed.get("sql_query"),
            "data": data_result,
            "chart": parsed.get("recommended_chart")
        }
    }

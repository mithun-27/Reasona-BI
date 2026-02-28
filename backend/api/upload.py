from fastapi import APIRouter, UploadFile, File, HTTPException
import shutil
import os
import uuid
import pandas as pd
from core.db import get_db_connection
from agents.analysis import analyze_table

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    if not file.filename.endswith(('.csv', '.xlsx')):
        raise HTTPException(status_code=400, detail="Only CSV and Excel files are supported.")
        
    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Normalize path for DuckDB (needs forward slashes even on Windows)
    file_path_normalized = file_path.replace("\\", "/")
        
    # Simple data ingestion pipeline
    try:
        table_name = f"data_{file_id[:8]}"
        conn = get_db_connection()
        if file.filename.endswith('.csv'):
            conn.execute(f"CREATE TABLE {table_name} AS SELECT * FROM read_csv_auto('{file_path_normalized}')")
        elif file.filename.endswith('.xlsx'):
            df = pd.read_excel(file_path)
            conn.execute(f"CREATE TABLE {table_name} AS SELECT * FROM df")
            
        conn.execute(
            "INSERT INTO uploads (id, filename, upload_time, table_name) VALUES (?, ?, CURRENT_TIMESTAMP, ?)", 
            (file_id, file.filename, table_name)
        )
        
        # Auto-analyze the uploaded data
        analysis = analyze_table(table_name)
        
        return {
            "message": "File uploaded and ingested successfully",
            "file_id": file_id,
            "table_name": table_name,
            "analysis": analysis
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to ingest file: {str(e)}")

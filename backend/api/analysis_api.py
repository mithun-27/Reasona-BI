from fastapi import APIRouter, HTTPException
from agents.analysis import analyze_table

router = APIRouter()

@router.get("/analysis/{table_name}")
async def get_analysis(table_name: str):
    """Returns auto-generated analysis for a given table."""
    result = analyze_table(table_name)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result

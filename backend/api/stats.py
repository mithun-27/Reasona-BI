from fastapi import APIRouter, HTTPException
from core.db import get_db_connection

router = APIRouter()

@router.get("/dashboard-stats")
async def get_dashboard_stats():
    """Returns dynamic stats for the dashboard."""
    try:
        conn = get_db_connection()
        
        # Count total active agents (for now, simply hardcoded logic representing our 3 core agents)
        active_agents = 3
        
        # Count total data sources uploaded
        result = conn.execute("SELECT COUNT(*) FROM uploads").fetchone()
        data_sources_count = result[0] if result else 0
        
        # We can mock Insights Generated loosely based on Data Sources count for now, 
        # or implement an insights log table later.
        insights_generated = data_sources_count * 15 # mock multiplier
        
        return {
            "active_agents": active_agents,
            "data_sources": data_sources_count,
            "insights_generated": insights_generated
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch stats: {str(e)}")

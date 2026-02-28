from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from dotenv import load_dotenv

from api.chat import router as chat_router
from api.upload import router as upload_router
from api.stats import router as stats_router
from api.analysis_api import router as analysis_router

load_dotenv()

app = FastAPI(title="Reasona_BI API", description="Agentic Business Intelligence API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router, prefix="/api", tags=["chat"])
app.include_router(upload_router, prefix="/api", tags=["upload"])
app.include_router(stats_router, prefix="/api", tags=["stats"])
app.include_router(analysis_router, prefix="/api", tags=["analysis"])

@app.get("/health")
def health_check():
    return {"status": "ok", "version": "1.0.0"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

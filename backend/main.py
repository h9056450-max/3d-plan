"""
FastAPI Server for Teju AI FloorPlan 3D.
Provides REST API endpoints for blueprint analysis and project persistence.
"""

import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from dotenv import load_dotenv

from backend.ai_service import analyze_floor_plan
from backend.database import list_projects, save_or_update_project, get_project_by_id, delete_project_by_id

load_dotenv()

app = FastAPI(
    title="Teju AI FloorPlan 3D API",
    description="Backend API for 2D to 3D architectural floor plan conversion.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    imageBase64: str
    knownDimensionMeters: Optional[float] = 12.0
    drawingType: Optional[str] = "residential"
    projectName: Optional[str] = "Analyzed Floor Plan"
    clientName: Optional[str] = None


@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "app": "Teju AI FloorPlan 3D",
        "has_gemini_key": bool(os.getenv("GEMINI_API_KEY"))
    }


@app.post("/api/analyze-plan")
def api_analyze_plan(req: AnalyzeRequest):
    if not req.imageBase64:
        raise HTTPException(status_code=400, detail="Missing imageBase64 payload")

    result = analyze_floor_plan(
        image_base64=req.imageBase64,
        known_dimension_meters=req.knownDimensionMeters or 12.0,
        project_name=req.projectName or "Analyzed Floor Plan",
        client_name=req.clientName
    )
    return result


@app.get("/api/projects")
def api_list_projects():
    projects = list_projects()
    return {"success": True, "projects": projects}


@app.get("/api/projects/{project_id}")
def api_get_project(project_id: str):
    project = get_project_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"success": True, "project": project}


@app.post("/api/projects")
def api_save_project(project: Dict[str, Any]):
    if not project or "id" not in project:
        raise HTTPException(status_code=400, detail="Invalid project object")
    save_or_update_project(project)
    return {"success": True, "project": project}


@app.delete("/api/projects/{project_id}")
def api_delete_project(project_id: str):
    delete_project_by_id(project_id)
    return {"success": True, "deletedId": project_id}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)

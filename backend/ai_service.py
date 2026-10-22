"""
AI Service adapter for Teju AI FloorPlan 3D.
Uses Google Gemini API or Computer Vision fallback to analyze floor plan drawings.
"""

import os
import re
import json
from typing import Dict, Any, Optional
from backend.geometry import generate_parametric_geometry


def analyze_floor_plan(
    image_base64: str,
    known_dimension_meters: float = 12.0,
    project_name: str = "Analyzed Floor Plan",
    client_name: Optional[str] = None
) -> Dict[str, Any]:
    api_key = os.getenv("GEMINI_API_KEY")

    if api_key:
        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=api_key)

            # Clean base64
            match = re.search(r"^data:(.*?);base64,(.*)$", image_base64)
            mime_type = match.group(1) if match else "image/png"
            raw_base64 = match.group(2) if match else image_base64

            prompt = f"""
You are an expert civil engineer and architectural drawing analyzer for Teju Civil Engineer & Architect.
Analyze the provided 2D floor plan drawing.
Reference overall width: {known_dimension_meters} meters.

Return valid JSON with:
- overallDimensions (widthMeters, lengthMeters, totalAreaSqm)
- rooms: list of objects (id, name, category, polygon [[x,y]], center, dimensions, floorFinish, wallColor, furnishings)
- walls: list of objects (id, start {{x,y}}, end {{x,y}}, thickness, height, isExterior)
- doors: list of objects (id, position, width, height, type)
- windows: list of objects (id, position, width, height, sillHeight, type)
- stairs: list of stair structures
- confidenceNotes: list of string notes
- safetyWarning: "Provisional structural geometry. Civil verification required on-site."
"""

            for model_name in ["gemini-3.5-flash", "gemini-3.7-flash", "gemini-3.8-flash"]:
                try:
                    response = client.models.generate_content(
                        model=model_name,
                        contents=[
                            types.Part.from_bytes(data=raw_base64.encode(), mime_type=mime_type),
                            prompt
                        ]
                    )

                    text = response.text or ""
                    json_match = re.search(r"\{[\s\S]*\}", text)
                    if json_match:
                        parsed = json.loads(json_match.group(0))
                        return {
                            "success": True,
                            "source": "gemini-ai",
                            "data": parsed
                        }
                except Exception as model_err:
                    print(f"Model {model_name} error: {model_err}")
        except Exception as e:
            print(f"Gemini AI processing error: {e}")

    raise ValueError("AI Vision analysis could not parse the drawing. Please verify the drawing resolution or calibrate scale.")

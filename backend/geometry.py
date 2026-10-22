"""
Architectural Geometry and Spatial Analysis Engine for Teju AI FloorPlan 3D.
Performs room compartment partitioning, wall classification, and boundary vector calculations.
"""

from typing import Dict, Any, List


def generate_parametric_geometry(width: float = 12.0, length: float = 10.0, project_name: str = "Architectural Project") -> Dict[str, Any]:
    w = round(width, 2)
    l = round(length, 2)
    area = round(w * l, 2)

    rooms: List[Dict[str, Any]] = [
        {
            "id": "room-living",
            "name": "Living & Dining Lounge",
            "category": "living_room",
            "polygon": [
                {"x": 0, "y": 0},
                {"x": round(w * 0.55, 2), "y": 0},
                {"x": round(w * 0.55, 2), "y": round(l * 0.55, 2)},
                {"x": 0, "y": round(l * 0.55, 2)},
            ],
            "center": {"x": round(w * 0.275, 2), "y": round(l * 0.275, 2)},
            "dimensions": {
                "width": round(w * 0.55, 2),
                "length": round(l * 0.55, 2),
                "areaSqm": round(w * 0.55 * l * 0.55, 2),
            },
            "floorFinish": "light_oak_wood",
            "wallColor": "warm_ivory",
            "furnishings": ["sofa", "coffee_table", "dining_table"],
        },
        {
            "id": "room-kitchen",
            "name": "Modular Kitchen & Utility",
            "category": "kitchen",
            "polygon": [
                {"x": round(w * 0.55, 2), "y": 0},
                {"x": w, "y": 0},
                {"x": w, "y": round(l * 0.38, 2)},
                {"x": round(w * 0.55, 2), "y": round(l * 0.38, 2)},
            ],
            "center": {"x": round(w * 0.775, 2), "y": round(l * 0.19, 2)},
            "dimensions": {
                "width": round(w * 0.45, 2),
                "length": round(l * 0.38, 2),
                "areaSqm": round(w * 0.45 * l * 0.38, 2),
            },
            "floorFinish": "ceramic_tile",
            "wallColor": "classic_white",
            "furnishings": ["kitchen_counter", "sink"],
        },
        {
            "id": "room-master",
            "name": "Master Suite",
            "category": "master_bedroom",
            "polygon": [
                {"x": 0, "y": round(l * 0.55, 2)},
                {"x": round(w * 0.48, 2), "y": round(l * 0.55, 2)},
                {"x": round(w * 0.48, 2), "y": l},
                {"x": 0, "y": l},
            ],
            "center": {"x": round(w * 0.24, 2), "y": round(l * 0.775, 2)},
            "dimensions": {
                "width": round(w * 0.48, 2),
                "length": round(l * 0.45, 2),
                "areaSqm": round(w * 0.48 * l * 0.45, 2),
            },
            "floorFinish": "dark_walnut_wood",
            "wallColor": "sandstone",
            "furnishings": ["bed", "wardrobe"],
        },
        {
            "id": "room-bath",
            "name": "Toilet & Sanitary Suite",
            "category": "bathroom",
            "polygon": [
                {"x": round(w * 0.48, 2), "y": round(l * 0.65, 2)},
                {"x": round(w * 0.72, 2), "y": round(l * 0.65, 2)},
                {"x": round(w * 0.72, 2), "y": l},
                {"x": round(w * 0.48, 2), "y": l},
            ],
            "center": {"x": round(w * 0.60, 2), "y": round(l * 0.825, 2)},
            "dimensions": {
                "width": round(w * 0.24, 2),
                "length": round(l * 0.35, 2),
                "areaSqm": round(w * 0.24 * l * 0.35, 2),
            },
            "floorFinish": "white_carrara_marble",
            "wallColor": "classic_white",
            "furnishings": ["toilet", "bathtub", "sink"],
        },
        {
            "id": "room-bed2",
            "name": "Guest Suite / Study",
            "category": "bedroom",
            "polygon": [
                {"x": round(w * 0.72, 2), "y": round(l * 0.48, 2)},
                {"x": w, "y": round(l * 0.48, 2)},
                {"x": w, "y": l},
                {"x": round(w * 0.72, 2), "y": l},
            ],
            "center": {"x": round(w * 0.86, 2), "y": round(l * 0.74, 2)},
            "dimensions": {
                "width": round(w * 0.28, 2),
                "length": round(l * 0.52, 2),
                "areaSqm": round(w * 0.28 * l * 0.52, 2),
            },
            "floorFinish": "light_oak_wood",
            "wallColor": "warm_ivory",
            "furnishings": ["bed", "wardrobe", "desk"],
        },
    ]

    walls = [
        {"id": "w-ext-1", "start": {"x": 0, "y": 0}, "end": {"x": w, "y": 0}, "thickness": 0.23, "height": 2.8, "isExterior": True},
        {"id": "w-ext-2", "start": {"x": w, "y": 0}, "end": {"x": w, "y": l}, "thickness": 0.23, "height": 2.8, "isExterior": True},
        {"id": "w-ext-3", "start": {"x": w, "y": l}, "end": {"x": 0, "y": l}, "thickness": 0.23, "height": 2.8, "isExterior": True},
        {"id": "w-ext-4", "start": {"x": 0, "y": l}, "end": {"x": 0, "y": 0}, "thickness": 0.23, "height": 2.8, "isExterior": True},
        {"id": "w-int-1", "start": {"x": round(w * 0.55, 2), "y": 0}, "end": {"x": round(w * 0.55, 2), "y": round(l * 0.55, 2)}, "thickness": 0.12, "height": 2.8, "isExterior": False},
        {"id": "w-int-2", "start": {"x": 0, "y": round(l * 0.55, 2)}, "end": {"x": w, "y": round(l * 0.55, 2)}, "thickness": 0.15, "height": 2.8, "isExterior": False},
        {"id": "w-int-3", "start": {"x": round(w * 0.48, 2), "y": round(l * 0.55, 2)}, "end": {"x": round(w * 0.48, 2), "y": l}, "thickness": 0.12, "height": 2.8, "isExterior": False},
        {"id": "w-int-4", "start": {"x": round(w * 0.72, 2), "y": round(l * 0.48, 2)}, "end": {"x": round(w * 0.72, 2), "y": l}, "thickness": 0.12, "height": 2.8, "isExterior": False},
    ]

    doors = [
        {"id": "d-main", "position": {"x": 0, "y": round(l * 0.25, 2)}, "width": 1.0, "height": 2.2, "type": "single"},
        {"id": "d-kitchen", "position": {"x": round(w * 0.55, 2), "y": round(l * 0.2, 2)}, "width": 0.9, "height": 2.1, "type": "single"},
        {"id": "d-master", "position": {"x": round(w * 0.24, 2), "y": round(l * 0.55, 2)}, "width": 0.9, "height": 2.1, "type": "single"},
        {"id": "d-bath", "position": {"x": round(w * 0.60, 2), "y": round(l * 0.65, 2)}, "width": 0.75, "height": 2.1, "type": "single"},
        {"id": "d-bed2", "position": {"x": round(w * 0.72, 2), "y": round(l * 0.6, 2)}, "width": 0.9, "height": 2.1, "type": "single"},
    ]

    windows = [
        {"id": "win-living", "position": {"x": round(w * 0.25, 2), "y": 0}, "width": 1.8, "height": 1.4, "sillHeight": 0.8, "type": "casement"},
        {"id": "win-kitchen", "position": {"x": round(w * 0.8, 2), "y": 0}, "width": 1.5, "height": 1.2, "sillHeight": 0.9, "type": "sliding"},
        {"id": "win-master", "position": {"x": 0, "y": round(l * 0.8, 2)}, "width": 1.8, "height": 1.4, "sillHeight": 0.8, "type": "casement"},
        {"id": "win-bed2", "position": {"x": w, "y": round(l * 0.8, 2)}, "width": 1.6, "height": 1.4, "sillHeight": 0.8, "type": "casement"},
    ]

    return {
        "name": project_name,
        "overallDimensions": {
            "widthMeters": w,
            "lengthMeters": l,
            "totalAreaSqm": area,
        },
        "rooms": rooms,
        "walls": walls,
        "doors": doors,
        "windows": windows,
        "stairs": [],
        "confidenceNotes": [
            "Rooms segmented into load-bearing envelope and internal partitions.",
            "Scale calibrated to input reference width: " + str(w) + "m.",
        ],
        "safetyWarning": "Provisional structural geometry. Civil verification required on-site."
    }

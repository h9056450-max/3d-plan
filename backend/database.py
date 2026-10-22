"""
Database module for Teju AI FloorPlan 3D.
Provides SQLite persistence for architectural projects.
"""

import sqlite3
import json
import os
from typing import List, Optional, Dict, Any

DB_PATH = os.path.join(os.path.dirname(__file__), "floorplan.db")


def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            client_name TEXT,
            overall_width REAL,
            overall_length REAL,
            total_area REAL,
            payload_json TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()


def list_projects() -> List[Dict[str, Any]]:
    init_db()
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT payload_json FROM projects ORDER BY updated_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [json.loads(row["payload_json"]) for row in rows]


def get_project_by_id(project_id: str) -> Optional[Dict[str, Any]]:
    init_db()
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT payload_json FROM projects WHERE id = ?", (project_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return json.loads(row["payload_json"])
    return None


def save_or_update_project(project: Dict[str, Any]):
    init_db()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    pid = project.get("id")
    name = project.get("name", "Untitled Plan")
    client = project.get("clientName", "General Client")
    dims = project.get("overallDimensions", {})
    w = dims.get("widthMeters", 12.0)
    l = dims.get("lengthMeters", 10.0)
    area = dims.get("totalAreaSqm", 120.0)
    payload_json = json.dumps(project)

    cursor.execute("""
        INSERT INTO projects (id, name, client_name, overall_width, overall_length, total_area, payload_json, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            client_name = excluded.client_name,
            overall_width = excluded.overall_width,
            overall_length = excluded.overall_length,
            total_area = excluded.total_area,
            payload_json = excluded.payload_json,
            updated_at = CURRENT_TIMESTAMP
    """, (pid, name, client, w, l, area, payload_json))

    conn.commit()
    conn.close()


def delete_project_by_id(project_id: str):
    init_db()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM projects WHERE id = ?", (project_id,))
    conn.commit()
    conn.close()

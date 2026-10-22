# Teju AI FloorPlan 3D - 2D to Interactive 3D Floor Plan Converter

**Firm:** Teju Civil Engineer & Architect  
**Tagline:** Transform 2D Plans into Interactive 3D Spaces

---

## 🏛️ Overview

**Teju AI FloorPlan 3D** is a professional architectural web application engineered for civil engineers, architects, and builders. It converts 2D residential blueprints, CAD drawings, and floor plans (in JPG, JPEG, PNG, or PDF format) into accurate, interactive 3D spatial models powered by Three.js and Google Gemini Multimodal AI.

---

## ✨ Core Features

1. **2D Blueprint Ingestion & Scale Calibration**
   - Supports JPG, JPEG, PNG, and PDF floor plans.
   - Drag-and-drop upload zone with high-resolution drawing preview.
   - User-defined scale calibration (specify known reference dimensions e.g. 12.0m width without guessing).
   - Pre-loaded sample architectural blueprints (Modern 2BHK Villa, Luxury 3BHK Duplex) for 1-click testing.

2. **AI Floor Plan Analysis & Structural Segmentation**
   - Multimodal Gemini 2.5 Flash vision pipeline to inspect drawings.
   - Detects exterior load-bearing walls (230mm) and interior partition walls (120mm/150mm).
   - Identifies functional rooms (Living room, Master suite, Kitchen, Bathrooms, Dining, Balcony, Stairs).
   - Identifies doors with swing clearances and windows with sill elevations.
   - Built-in deterministic architectural fallback engine for offline or low-connectivity environments.

3. **Parametric 3D Model Generation**
   - Parametric walls with adjustable height (2.2m to 4.5m) and thickness.
   - Wall openings cut for doors and windows with lintels and frames.
   - Individual room floor plates with PBR materials (Light Oak Wood, Dark Walnut, Carrara Marble, Ceramic Tile, Granite, Polished Concrete).
   - Composite procedural 3D furniture: beds with pillows and duvets, sectional sofas, dining sets with chairs, kitchen counters with sinks, sanitary fixtures, and staircases.

4. **Interactive 3D Workspace**
   - **Camera Presets:** Isometric 3D, Top-Down Orthographic (Plan view), Front Elevation, Side Elevation.
   - **Dollhouse View:** Cutaway walls and roof removal for inspection of interior room arrangements.
   - **First-Person Walkthrough:** Eye-level (1.65m) human perspective with WASD / Arrow key navigation.
   - **Room Inspection:** Click any room floor on the 3D model to inspect dimensions and change finishes.
   - **Dimension Markers:** 3D dimension lines displaying overall length and width in meters/feet.

5. **Professional Exports & Reports**
   - **PNG 3D Snapshot:** High-resolution render from the current camera view.
   - **GLB 3D Model:** Standard binary GLTF format compatible with Blender, Unreal Engine, Unity, and 3D viewers.
   - **OBJ Geometry:** Standard Wavefront OBJ for AutoCAD, Revit, and SketchUp.
   - **Architectural PDF Report:** Formatted A4 specification report with project title block, room schedule table, 3D render snapshot, and civil verification notice.

6. **Civil Engineering Safety Notice**
   - Clear on-screen warnings and PDF disclaimers noting that generated 3D geometry represents a preliminary architectural conversion and must be site-verified by a registered civil engineer before construction.

---

## 🚀 Running the Web Application (Node.js & Express)

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Setup & Run
```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables (optional for AI vision)
cp .env.example .env
# Edit .env and insert your GEMINI_API_KEY if using AI vision

# 3. Start development server (Port 3000)
npm run dev
```

Visit `http://localhost:3000` in your web browser.

---

## 🐍 Python FastAPI Backend Setup (Alternative)

For developers wishing to run the Python FastAPI backend with SQLite:

### Windows / VS Code Instructions:

1. **Open VS Code:**
   Open the folder `teju-ai-floorplan` in Visual Studio Code (`File > Open Folder`).

2. **Create Python Virtual Environment:**
   Open the integrated terminal in VS Code (`Ctrl + ~`) and run:
   ```cmd
   python -m venv venv
   .\venv\Scripts\activate
   ```

3. **Install Dependencies:**
   ```cmd
   pip install -r backend/requirements.txt
   ```

4. **Set Environment Variable:**
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY="your-gemini-api-key-here"
   ```

5. **Launch the FastAPI Backend:**
   ```cmd
   python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
   ```

API docs will be available at: `http://localhost:8000/docs`.

---

## 📁 Project Architecture

```
teju-ai-floorplan/
├── server.ts                       # Express fullstack server with Vite middleware & Gemini API
├── src/
│   ├── App.tsx                     # Main application screen router
│   ├── main.tsx                    # React DOM entrypoint
│   ├── index.css                   # Tailwind CSS styling
│   ├── types/
│   │   └── floorplan.ts            # TypeScript interfaces for rooms, walls, doors, windows
│   ├── services/
│   │   ├── aiService.ts            # Client connector for AI plan analysis
│   │   ├── sampleBlueprints.ts     # Pre-loaded 2BHK and 3BHK architectural blueprints
│   │   ├── exportService.ts        # GLB, OBJ, PNG, and PDF report exporters
│   │   └── storageService.ts       # Project persistence (Backend & LocalStorage)
│   └── components/
│       ├── Navbar.tsx              # Architectural navigation bar & unit toggles
│       ├── LandingPage.tsx         # Brand landing page with 1-click test villa
│       ├── Dashboard.tsx           # Project dashboard (Search, Duplicate, Rename, Delete)
│       ├── UploadScreen.tsx        # Blueprint upload dropzone & scale calibration
│       ├── AnalysisCorrectionScreen.tsx # 2D review canvas & editable room schedule
│       ├── Workspace3D.tsx         # 3D workspace screen
│       ├── ExportModal.tsx         # Multi-format export dialog
│       └── Viewer3D/
│           ├── Scene3D.tsx         # Three.js canvas with PBR, soft shadows, OrbitControls
│           ├── GeometryBuilder.ts  # Parametric 3D wall cutouts, floors, and roofs
│           ├── ProceduralMaterials.ts # Procedural wood grain, marble, and tile textures
│           ├── ProceduralFurniture.ts # 3D composite furniture models (Beds, Sofas, Dining)
│           └── ControlDock.tsx     # Collapsible bottom control dock
├── backend/                        # Standalone Python FastAPI backend
│   ├── main.py                     # FastAPI endpoints
│   ├── ai_service.py               # Gemini vision & fallback geometry
│   ├── geometry.py                 # Geometric partition calculations
│   ├── database.py                 # SQLite storage module
│   └── requirements.txt            # Python dependencies
├── metadata.json                   # Applet configuration
├── package.json                    # Node dependencies & build scripts
└── README.md                       # Project documentation
```

---

## 🛡️ Professional Safety & Verification

All dimensions, wall vectors, and material estimates generated by this application are provisional preliminary digital models. Prior to physical structural execution, excavation, or municipal submission, all drawings must be certified and stamped by a licensed civil engineer or registered architect.

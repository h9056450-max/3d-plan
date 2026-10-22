/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Support large image payloads (floor plan scans and multi-page PDFs)
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// In-memory / file-backed projects database
const DATA_DIR = path.join(__dirname, '.data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');

function loadProjects() {
  try {
    if (fs.existsSync(PROJECTS_FILE)) {
      const data = fs.readFileSync(PROJECTS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error loading projects:', err);
  }
  return [];
}

function saveProjects(projects: unknown[]) {
  try {
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving projects:', err);
  }
}

// -------------------------------------------------------------
// AI Floor Plan Vision Analysis using Gemini 3.5 / 3.7 / 3.8 Flash
// -------------------------------------------------------------
async function runGeminiVisionAnalysis(apiKey: string, mimeType: string, rawBase64: string, knownDimensionMeters: number, projectName: string) {
  const ai = new GoogleGenAI({ apiKey });
  const models = ['gemini-3.5-flash', 'gemini-3.7-flash', 'gemini-3.8-flash'];

  const prompt = `
You are a senior civil engineer and chief architectural draftsman for Teju Civil Engineer & Architect.
Analyze this exact 2D architectural floor plan drawing.

CRITICAL INSTRUCTION:
Do NOT return a generic template or pre-made house.
You MUST read and extract the EXACT printed room names, printed dimensions, visible wall partitions, doors, windows, stairs, lifts, and pooja rooms from THIS specific drawing.

If the image is a screenshot or scan with black borders or outer margins around the drawing, first identify:
- "drawingBounds": {"minY": number, "minX": number, "maxY": number, "maxX": number} in normalized [0, 1] image coordinates.

Reference overall width calibrated by civil engineer: ${knownDimensionMeters || 12.0} meters.

Extract the floor plan data matching this JSON schema:
{
  "name": "${projectName || 'Analyzed Architectural Plan'}",
  "drawingBounds": {"minY": number, "minX": number, "maxY": number, "maxX": number},
  "overallDimensions": {
    "widthMeters": number,
    "lengthMeters": number,
    "totalAreaSqm": number
  },
  "rooms": [
    {
      "id": string (unique e.g. "room-living", "room-master"),
      "name": string (EXACT printed room title, e.g. "LIVING ROOM", "MASTER BEDROOM", "KITCHEN", "WC", "TECHNIC", "POOJA ROOM", "LIFT", "LOBBY", "BALCONY"),
      "category": string (one of "living_room", "bedroom", "master_bedroom", "kitchen", "bathroom", "attached_bathroom", "dining_room", "balcony", "hallway", "study", "utility", "pooja_room", "foyer", "lift", "lobby", "staircase"),
      "printedAreaText": string (exact printed text e.g. "26,23m³", "13,70m²", "12'0\" x 14'0\""),
      "areaSqm": number (numeric area in m²),
      "normalizedPolygon": [{"x": number, "y": number}], // 4 or more corner points normalized [0, 1] relative to drawingBounds (0,0 is top-left, 1,1 is bottom-right)
      "normalizedCenter": {"x": number, "y": number},
      "floorFinish": string (one of "light_oak_wood", "dark_walnut_wood", "white_carrara_marble", "ceramic_tile", "grey_granite", "polished_concrete"),
      "wallColor": string ("warm_ivory", "classic_white", "sandstone"),
      "furnishings": [string] // visibly drawn furniture e.g. ["dining_table", "sofa", "coffee_table", "bed", "wardrobe", "kitchen_counter", "sink", "stove", "toilet", "washing_machine", "mandir_altar"]
    }
  ],
  "walls": [
    {
      "id": string,
      "startNorm": {"x": number, "y": number}, // [0, 1] relative to drawingBounds
      "endNorm": {"x": number, "y": number},
      "thickness": number (0.23 for exterior envelope, 0.12 or 0.15 for interior partition),
      "height": 2.8,
      "isExterior": boolean
    }
  ],
  "doors": [
    {
      "id": string,
      "positionNorm": {"x": number, "y": number},
      "width": number (0.8 to 1.2),
      "swingDirection": string ("inward", "outward", "sliding")
    }
  ],
  "windows": [
    {
      "id": string,
      "positionNorm": {"x": number, "y": number},
      "width": number (1.2 to 2.4),
      "sillHeight": 0.9
    }
  ],
  "stairs": [
    {
      "id": string,
      "positionNorm": {"x": number, "y": number},
      "width": number,
      "length": number,
      "stepsCount": number,
      "direction": string
    }
  ],
  "lifts": [
    {
      "id": string,
      "positionNorm": {"x": number, "y": number},
      "width": number,
      "depth": number,
      "label": "LIFT"
    }
  ],
  "confidenceNotes": [string],
  "safetyWarning": "Provisional AI architectural scan. Civil engineer on-site verification required."
}

Output ONLY valid JSON.
`;

  let lastError: any = null;
  for (const modelName of models) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        console.log(`[AI FloorPlan] Attempting analysis with ${modelName} (attempt ${attempt + 1})...`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: [
            {
              role: 'user',
              parts: [
                {
                  inlineData: {
                    mimeType: mimeType.includes('pdf') ? 'application/pdf' : mimeType,
                    data: rawBase64,
                  },
                },
                { text: prompt },
              ],
            },
          ],
          config: {
            responseMimeType: 'application/json',
          },
        });

        const text = response.text || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          console.log(`[AI FloorPlan] Successfully extracted ${parsed.rooms?.length || 0} rooms using ${modelName}`);
          return parsed;
        }
      } catch (err: any) {
        console.warn(`[AI FloorPlan] Model ${modelName} attempt ${attempt + 1} failed:`, err.message || err);
        lastError = err;
        if (attempt < 2) {
          await new Promise((r) => setTimeout(r, (attempt + 1) * 1500));
        }
      }
    }
  }

  throw lastError || new Error('All AI vision models failed to analyze image.');
}

// -------------------------------------------------------------
// POST /api/analyze-plan
// -------------------------------------------------------------
app.post('/api/analyze-plan', async (req: Request, res: Response) => {
  try {
    const { imageBase64, knownDimensionMeters, projectName, clientName } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Missing imageBase64 in request' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please set it in .env to enable AI vision analysis.',
      });
    }

    // Clean base64 string
    const match = imageBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    const mimeType = match ? match[1] : 'image/png';
    const rawBase64 = match ? match[2] : imageBase64;

    const rawParsed = await runGeminiVisionAnalysis(
      apiKey,
      mimeType,
      rawBase64,
      Number(knownDimensionMeters) || 12.0,
      projectName || 'Analyzed Architectural Plan'
    );

    // Coordinate Conversion: Transform normalized [0, 1] relative to drawingBounds into Real Metric Geometry
    const targetW = Number(knownDimensionMeters) || rawParsed.overallDimensions?.widthMeters || 12.0;

    // Aspect ratio from drawing bounds or overall dimensions
    let aspect = 0.85;
    if (rawParsed.drawingBounds) {
      const db = rawParsed.drawingBounds;
      const bH = Math.max(0.01, (db.maxY || 1) - (db.minY || 0));
      const bW = Math.max(0.01, (db.maxX || 1) - (db.minX || 0));
      aspect = bH / bW;
    } else if (rawParsed.overallDimensions?.lengthMeters && rawParsed.overallDimensions?.widthMeters) {
      aspect = rawParsed.overallDimensions.lengthMeters / rawParsed.overallDimensions.widthMeters;
    }
    const targetL = Math.round(targetW * aspect * 10) / 10;

    // Convert room polygons to meters
    const convertedRooms = (rawParsed.rooms || []).map((r: any, idx: number) => {
      const polygon = (r.normalizedPolygon || []).map((pt: any) => ({
        x: Math.round(pt.x * targetW * 100) / 100,
        y: Math.round(pt.y * targetL * 100) / 100,
      }));

      // Calculate bounding box and center in meters
      const xs = polygon.map((p: any) => p.x);
      const ys = polygon.map((p: any) => p.y);
      const minX = xs.length ? Math.min(...xs) : 0;
      const maxX = xs.length ? Math.max(...xs) : targetW * 0.4;
      const minY = ys.length ? Math.min(...ys) : 0;
      const maxY = ys.length ? Math.max(...ys) : targetL * 0.4;

      const w = Math.round((maxX - minX) * 10) / 10 || 3.0;
      const l = Math.round((maxY - minY) * 10) / 10 || 3.0;
      const calculatedArea = Math.round(w * l * 10) / 10;

      const center = {
        x: r.normalizedCenter ? Math.round(r.normalizedCenter.x * targetW * 100) / 100 : Math.round((minX + maxX) / 2 * 100) / 100,
        y: r.normalizedCenter ? Math.round(r.normalizedCenter.y * targetL * 100) / 100 : Math.round((minY + maxY) / 2 * 100) / 100,
      };

      return {
        id: r.id || `room-${idx + 1}`,
        name: r.name || `Room ${idx + 1}`,
        category: r.category || 'bedroom',
        polygon: polygon.length >= 3 ? polygon : [
          { x: minX, y: minY },
          { x: maxX, y: minY },
          { x: maxX, y: maxY },
          { x: minX, y: maxY },
        ],
        center,
        dimensions: {
          width: w,
          length: l,
          areaSqm: r.areaSqm || calculatedArea,
        },
        floorFinish: r.floorFinish || (r.category === 'bathroom' ? 'white_carrara_marble' : r.category === 'kitchen' ? 'ceramic_tile' : 'light_oak_wood'),
        wallColor: r.wallColor || 'warm_ivory',
        furnishings: r.furnishings || [],
      };
    });

    // Convert walls
    let convertedWalls: any[] = [];
    if (rawParsed.walls && rawParsed.walls.length > 0) {
      convertedWalls = rawParsed.walls.map((w: any, idx: number) => ({
        id: w.id || `w-${idx + 1}`,
        start: {
          x: Math.round((w.startNorm?.x ?? w.start?.x ?? 0) * targetW * 100) / 100,
          y: Math.round((w.startNorm?.y ?? w.start?.y ?? 0) * targetL * 100) / 100,
        },
        end: {
          x: Math.round((w.endNorm?.x ?? w.end?.x ?? 0) * targetW * 100) / 100,
          y: Math.round((w.endNorm?.y ?? w.end?.y ?? 0) * targetL * 100) / 100,
        },
        thickness: w.thickness || (w.isExterior ? 0.23 : 0.12),
        height: w.height || 2.8,
        isExterior: Boolean(w.isExterior),
      }));
    } else {
      // Synthesize walls from room perimeters
      convertedWalls = [
        { id: 'w-ext-1', start: { x: 0, y: 0 }, end: { x: targetW, y: 0 }, thickness: 0.23, height: 2.8, isExterior: true },
        { id: 'w-ext-2', start: { x: targetW, y: 0 }, end: { x: targetW, y: targetL }, thickness: 0.23, height: 2.8, isExterior: true },
        { id: 'w-ext-3', start: { x: targetW, y: targetL }, end: { x: 0, y: targetL }, thickness: 0.23, height: 2.8, isExterior: true },
        { id: 'w-ext-4', start: { x: 0, y: targetL }, end: { x: 0, y: 0 }, thickness: 0.23, height: 2.8, isExterior: true },
      ];
    }

    // Convert doors
    const convertedDoors = (rawParsed.doors || []).map((d: any, idx: number) => ({
      id: d.id || `door-${idx + 1}`,
      position: {
        x: Math.round((d.positionNorm?.x ?? d.position?.x ?? 0.5) * targetW * 100) / 100,
        y: Math.round((d.positionNorm?.y ?? d.position?.y ?? 0.5) * targetL * 100) / 100,
      },
      width: d.width || 0.9,
      height: 2.1,
      type: 'single',
      swingDirection: d.swingDirection || 'inward',
    }));

    // Convert windows
    const convertedWindows = (rawParsed.windows || []).map((win: any, idx: number) => ({
      id: win.id || `win-${idx + 1}`,
      position: {
        x: Math.round((win.positionNorm?.x ?? win.position?.x ?? 0.5) * targetW * 100) / 100,
        y: Math.round((win.positionNorm?.y ?? win.position?.y ?? 0.5) * targetL * 100) / 100,
      },
      width: win.width || 1.5,
      height: 1.4,
      sillHeight: win.sillHeight || 0.9,
      type: 'casement',
    }));

    // Convert stairs
    const convertedStairs = (rawParsed.stairs || []).map((s: any, idx: number) => ({
      id: s.id || `stair-${idx + 1}`,
      position: {
        x: Math.round((s.positionNorm?.x ?? s.position?.x ?? 0.5) * targetW * 100) / 100,
        y: Math.round((s.positionNorm?.y ?? s.position?.y ?? 0.5) * targetL * 100) / 100,
      },
      width: s.width || 1.2,
      length: s.length || 3.0,
      stepsCount: s.stepsCount || 14,
      direction: s.direction || 'up',
      height: 2.8,
    }));

    // Convert lifts
    const convertedLifts = (rawParsed.lifts || []).map((l: any, idx: number) => ({
      id: l.id || `lift-${idx + 1}`,
      position: {
        x: Math.round((l.positionNorm?.x ?? l.position?.x ?? 0.5) * targetW * 100) / 100,
        y: Math.round((l.positionNorm?.y ?? l.position?.y ?? 0.5) * targetL * 100) / 100,
      },
      width: l.width || 1.6,
      depth: l.depth || 1.6,
      label: l.label || 'LIFT',
    }));

    const totalArea = convertedRooms.reduce((sum: number, r: any) => sum + r.dimensions.areaSqm, 0) || (targetW * targetL);

    const validatedResult = {
      name: projectName || rawParsed.name || 'Analyzed Architectural Plan',
      drawingBounds: rawParsed.drawingBounds,
      overallDimensions: {
        widthMeters: targetW,
        lengthMeters: targetL,
        totalAreaSqm: Math.round(totalArea * 10) / 10,
      },
      rooms: convertedRooms,
      walls: convertedWalls,
      doors: convertedDoors,
      windows: convertedWindows,
      stairs: convertedStairs,
      lifts: convertedLifts,
      confidenceNotes: rawParsed.confidenceNotes || [
        `Extracted ${convertedRooms.length} functional spaces directly from drawing labels.`,
        `Dimensions calibrated to ${targetW.toFixed(1)}m × ${targetL.toFixed(1)}m building envelope.`,
      ],
      safetyWarning: 'Provisional architectural model. On-site structural verification required by civil engineer.',
    };

    return res.json({
      success: true,
      source: 'gemini-ai',
      data: validatedResult,
    });
  } catch (error: any) {
    console.error('[AI FloorPlan] Extraction error:', error);
    // Explicitly do NOT generate a canned fake house!
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to analyze floor plan drawing.',
      needsManualReview: true,
    });
  }
});

// -------------------------------------------------------------
// Projects API Endpoints
// -------------------------------------------------------------
app.get('/api/projects', (req: Request, res: Response) => {
  const projects = loadProjects();
  res.json({ success: true, projects });
});

app.post('/api/projects', (req: Request, res: Response) => {
  const newProject = req.body;
  if (!newProject || !newProject.id) {
    return res.status(400).json({ error: 'Invalid project payload' });
  }
  const projects = loadProjects();
  const existingIdx = projects.findIndex((p: any) => p.id === newProject.id);
  if (existingIdx >= 0) {
    projects[existingIdx] = { ...newProject, updatedAt: new Date().toISOString() };
  } else {
    projects.unshift({ ...newProject, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  saveProjects(projects);
  res.json({ success: true, project: newProject });
});

app.delete('/api/projects/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  let projects = loadProjects();
  projects = projects.filter((p: any) => p.id !== id);
  saveProjects(projects);
  res.json({ success: true, deletedId: id });
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    appName: 'Teju AI FloorPlan 3D',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// -------------------------------------------------------------
// Setup Vite in Dev or Serve Static in Prod
// -------------------------------------------------------------
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[Teju AI FloorPlan 3D] Server running on port ${PORT} (${isProd ? 'production' : 'development'})`);
  });
}

startServer();

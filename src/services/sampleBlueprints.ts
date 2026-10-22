/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FloorPlanModel } from '../types/floorplan';

export const SAMPLE_BLUEPRINTS: FloorPlanModel[] = [
  {
    id: 'sample-2bhk-villa',
    name: 'Modern 2BHK Contemporary Villa',
    description: 'Spacious residential villa with open living-dining space, master bedroom with en-suite bath, guest bedroom, kitchen, and foyer.',
    clientName: 'Shri R. Sharma',
    architectName: 'Teju Civil Engineer & Architect',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    scale: {
      pixelsPerMeter: 45,
      referenceDistanceMeters: 12.0,
      referencePixelDistance: 540,
      unit: 'metric',
      calibrated: true,
    },
    overallDimensions: {
      widthMeters: 12.0,
      lengthMeters: 10.0,
      totalAreaSqm: 120.0,
    },
    rooms: [
      {
        id: 'room-living',
        name: 'Living & Dining Room',
        category: 'living_room',
        polygon: [
          { x: 0, y: 0 },
          { x: 6.5, y: 0 },
          { x: 6.5, y: 5.5 },
          { x: 0, y: 5.5 },
        ],
        center: { x: 3.25, y: 2.75 },
        dimensions: { width: 6.5, length: 5.5, areaSqm: 35.75 },
        floorFinish: 'light_oak_wood',
        wallColor: 'warm_ivory',
        furnishings: ['sofa', 'coffee_table', 'tv_unit', 'dining_table'],
      },
      {
        id: 'room-kitchen',
        name: 'Modular Kitchen & Utility',
        category: 'kitchen',
        polygon: [
          { x: 6.5, y: 0 },
          { x: 12.0, y: 0 },
          { x: 12.0, y: 3.5 },
          { x: 6.5, y: 3.5 },
        ],
        center: { x: 9.25, y: 1.75 },
        dimensions: { width: 5.5, length: 3.5, areaSqm: 19.25 },
        floorFinish: 'ceramic_tile',
        wallColor: 'classic_white',
        furnishings: ['kitchen_counter', 'sink'],
      },
      {
        id: 'room-master',
        name: 'Master Bedroom',
        category: 'master_bedroom',
        polygon: [
          { x: 0, y: 5.5 },
          { x: 5.5, y: 5.5 },
          { x: 5.5, y: 10.0 },
          { x: 0, y: 10.0 },
        ],
        center: { x: 2.75, y: 7.75 },
        dimensions: { width: 5.5, length: 4.5, areaSqm: 24.75 },
        floorFinish: 'dark_walnut_wood',
        wallColor: 'sandstone',
        furnishings: ['bed', 'wardrobe'],
      },
      {
        id: 'room-master-bath',
        name: 'Attached Bath (Master)',
        category: 'bathroom',
        polygon: [
          { x: 5.5, y: 7.0 },
          { x: 8.0, y: 7.0 },
          { x: 8.0, y: 10.0 },
          { x: 5.5, y: 10.0 },
        ],
        center: { x: 6.75, y: 8.5 },
        dimensions: { width: 2.5, length: 3.0, areaSqm: 7.5 },
        floorFinish: 'white_carrara_marble',
        wallColor: 'classic_white',
        furnishings: ['toilet', 'bathtub', 'sink'],
      },
      {
        id: 'room-bedroom-2',
        name: 'Guest Bedroom',
        category: 'bedroom',
        polygon: [
          { x: 8.0, y: 5.5 },
          { x: 12.0, y: 5.5 },
          { x: 12.0, y: 10.0 },
          { x: 8.0, y: 10.0 },
        ],
        center: { x: 10.0, y: 7.75 },
        dimensions: { width: 4.0, length: 4.5, areaSqm: 18.0 },
        floorFinish: 'light_oak_wood',
        wallColor: 'warm_ivory',
        furnishings: ['bed', 'wardrobe', 'desk'],
      },
      {
        id: 'room-powder-bath',
        name: 'Common Bath',
        category: 'bathroom',
        polygon: [
          { x: 6.5, y: 3.5 },
          { x: 8.5, y: 3.5 },
          { x: 8.5, y: 5.5 },
          { x: 6.5, y: 5.5 },
        ],
        center: { x: 7.5, y: 4.5 },
        dimensions: { width: 2.0, length: 2.0, areaSqm: 4.0 },
        floorFinish: 'white_carrara_marble',
        wallColor: 'classic_white',
        furnishings: ['toilet', 'sink'],
      },
    ],
    walls: [
      // Perimeter / Exterior walls
      { id: 'w-ext-1', start: { x: 0, y: 0 }, end: { x: 12, y: 0 }, thickness: 0.23, height: 2.8, isExterior: true },
      { id: 'w-ext-2', start: { x: 12, y: 0 }, end: { x: 12, y: 10 }, thickness: 0.23, height: 2.8, isExterior: true },
      { id: 'w-ext-3', start: { x: 12, y: 10 }, end: { x: 0, y: 10 }, thickness: 0.23, height: 2.8, isExterior: true },
      { id: 'w-ext-4', start: { x: 0, y: 10 }, end: { x: 0, y: 0 }, thickness: 0.23, height: 2.8, isExterior: true },

      // Interior partitions
      { id: 'w-int-1', start: { x: 6.5, y: 0 }, end: { x: 6.5, y: 5.5 }, thickness: 0.12, height: 2.8, isExterior: false },
      { id: 'w-int-2', start: { x: 0, y: 5.5 }, end: { x: 12, y: 5.5 }, thickness: 0.15, height: 2.8, isExterior: false },
      { id: 'w-int-3', start: { x: 6.5, y: 3.5 }, end: { x: 12, y: 3.5 }, thickness: 0.12, height: 2.8, isExterior: false },
      { id: 'w-int-4', start: { x: 5.5, y: 5.5 }, end: { x: 5.5, y: 10 }, thickness: 0.12, height: 2.8, isExterior: false },
      { id: 'w-int-5', start: { x: 8.0, y: 5.5 }, end: { x: 8.0, y: 10 }, thickness: 0.12, height: 2.8, isExterior: false },
      { id: 'w-int-6', start: { x: 5.5, y: 7.0 }, end: { x: 8.0, y: 7.0 }, thickness: 0.12, height: 2.8, isExterior: false },
      { id: 'w-int-7', start: { x: 8.5, y: 3.5 }, end: { x: 8.5, y: 5.5 }, thickness: 0.12, height: 2.8, isExterior: false },
    ],
    doors: [
      { id: 'd-main', position: { x: 0, y: 2.5 }, width: 1.0, height: 2.2, type: 'single', swingDirection: 'inward' },
      { id: 'd-kitchen', position: { x: 6.5, y: 1.8 }, width: 0.9, height: 2.1, type: 'single', swingDirection: 'inward' },
      { id: 'd-master', position: { x: 3.0, y: 5.5 }, width: 0.9, height: 2.1, type: 'single', swingDirection: 'inward' },
      { id: 'd-master-bath', position: { x: 5.5, y: 8.0 }, width: 0.75, height: 2.1, type: 'single', swingDirection: 'inward' },
      { id: 'd-bed2', position: { x: 9.5, y: 5.5 }, width: 0.9, height: 2.1, type: 'single', swingDirection: 'inward' },
      { id: 'd-common-bath', position: { x: 7.2, y: 5.5 }, width: 0.75, height: 2.1, type: 'single', swingDirection: 'inward' },
    ],
    windows: [
      { id: 'win-living-1', position: { x: 2.5, y: 0 }, width: 1.8, height: 1.4, sillHeight: 0.8, type: 'casement' },
      { id: 'win-living-2', position: { x: 0, y: 4.0 }, width: 1.5, height: 1.4, sillHeight: 0.8, type: 'sliding' },
      { id: 'win-kitchen', position: { x: 9.5, y: 0 }, width: 1.5, height: 1.2, sillHeight: 0.9, type: 'sliding' },
      { id: 'win-master', position: { x: 0, y: 8.0 }, width: 1.8, height: 1.4, sillHeight: 0.8, type: 'casement' },
      { id: 'win-bed2', position: { x: 12, y: 8.0 }, width: 1.8, height: 1.4, sillHeight: 0.8, type: 'casement' },
      { id: 'win-mbath', position: { x: 6.75, y: 10.0 }, width: 0.8, height: 0.6, sillHeight: 1.8, type: 'louver' },
    ],
    stairs: [],
    furniture: [
      { id: 'f-sofa', roomId: 'room-living', type: 'sofa', position: { x: 2.0, y: 1.8 }, rotation: 0, dimensions: { width: 2.2, depth: 0.9, height: 0.75 } },
      { id: 'f-coffee', roomId: 'room-living', type: 'coffee_table', position: { x: 2.0, y: 2.7 }, rotation: 0, dimensions: { width: 1.1, depth: 0.6, height: 0.4 } },
      { id: 'f-tv', roomId: 'room-living', type: 'tv_unit', position: { x: 2.0, y: 0.3 }, rotation: 0, dimensions: { width: 1.8, depth: 0.4, height: 0.5 } },
      { id: 'f-dining', roomId: 'room-living', type: 'dining_table', position: { x: 4.8, y: 3.5 }, rotation: 0, dimensions: { width: 1.6, depth: 0.9, height: 0.76 } },
      { id: 'f-counter', roomId: 'room-kitchen', type: 'kitchen_counter', position: { x: 10.5, y: 1.0 }, rotation: 0, dimensions: { width: 2.4, depth: 0.6, height: 0.86 } },
      { id: 'f-mbed', roomId: 'room-master', type: 'bed', position: { x: 2.6, y: 8.0 }, rotation: 0, dimensions: { width: 2.0, depth: 2.1, height: 0.6 } },
      { id: 'f-bed2', roomId: 'room-bedroom-2', type: 'bed', position: { x: 10.0, y: 8.0 }, rotation: 0, dimensions: { width: 1.6, depth: 2.0, height: 0.55 } },
      { id: 'f-desk', roomId: 'room-bedroom-2', type: 'desk', position: { x: 10.0, y: 6.3 }, rotation: 0, dimensions: { width: 1.2, depth: 0.6, height: 0.75 } },
      { id: 'f-toilet1', roomId: 'room-master-bath', type: 'toilet', position: { x: 6.2, y: 9.3 }, rotation: 0, dimensions: { width: 0.5, depth: 0.7, height: 0.45 } },
      { id: 'f-bath', roomId: 'room-master-bath', type: 'bathtub', position: { x: 7.2, y: 8.5 }, rotation: 0, dimensions: { width: 0.8, depth: 1.5, height: 0.55 } },
    ],
    customSettings: {
      defaultWallHeight: 2.8,
      defaultWallThickness: 0.15,
      defaultExteriorWallThickness: 0.23,
      globalWallColor: 'warm_ivory',
      showRoof: false,
      showCeiling: false,
      showFurniture: true,
      showRoomLabels: true,
      showDimensions: true,
      lightingPreset: 'daylight',
    },
    aiConfidence: {
      overall: 0.96,
      notes: [
        'Detected 6 distinct functional zones with architectural labels.',
        'Load-bearing exterior envelope (230mm) and partition walls (120mm/150mm) segmented.',
        'Fenestrations identified with door swing clearance and window sill elevations.',
      ],
      warnings: [
        'Provisional structural representation. All dimensions must be verified by site engineer.',
      ],
    },
  },
  {
    id: 'sample-3bhk-duplex',
    name: 'Luxury 3BHK Residence with Internal Staircase',
    description: 'Executive duplex floor plan featuring internal dog-leg staircase, double-height living lounge, formal dining, puja room, kitchen, and suites.',
    clientName: 'Dr. A. Verma',
    architectName: 'Teju Civil Engineer & Architect',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    scale: {
      pixelsPerMeter: 40,
      referenceDistanceMeters: 14.0,
      referencePixelDistance: 560,
      unit: 'metric',
      calibrated: true,
    },
    overallDimensions: {
      widthMeters: 14.0,
      lengthMeters: 11.0,
      totalAreaSqm: 154.0,
    },
    rooms: [
      {
        id: 'room-living',
        name: 'Grand Living Hall',
        category: 'living_room',
        polygon: [
          { x: 0, y: 0 },
          { x: 8.0, y: 0 },
          { x: 8.0, y: 6.0 },
          { x: 0, y: 6.0 },
        ],
        center: { x: 4.0, y: 3.0 },
        dimensions: { width: 8.0, length: 6.0, areaSqm: 48.0 },
        floorFinish: 'white_carrara_marble',
        wallColor: 'warm_ivory',
        furnishings: ['sofa', 'coffee_table', 'tv_unit'],
      },
      {
        id: 'room-dining',
        name: 'Dining Lounge',
        category: 'dining_room',
        polygon: [
          { x: 8.0, y: 0 },
          { x: 14.0, y: 0 },
          { x: 14.0, y: 4.0 },
          { x: 8.0, y: 4.0 },
        ],
        center: { x: 11.0, y: 2.0 },
        dimensions: { width: 6.0, length: 4.0, areaSqm: 24.0 },
        floorFinish: 'white_carrara_marble',
        wallColor: 'warm_ivory',
        furnishings: ['dining_table'],
      },
      {
        id: 'room-kitchen',
        name: 'Chef Kitchen & Pantry',
        category: 'kitchen',
        polygon: [
          { x: 8.0, y: 4.0 },
          { x: 14.0, y: 4.0 },
          { x: 14.0, y: 7.5 },
          { x: 8.0, y: 7.5 },
        ],
        center: { x: 11.0, y: 5.75 },
        dimensions: { width: 6.0, length: 3.5, areaSqm: 21.0 },
        floorFinish: 'ceramic_tile',
        wallColor: 'classic_white',
        furnishings: ['kitchen_counter', 'sink'],
      },
      {
        id: 'room-master',
        name: 'Master Suite',
        category: 'master_bedroom',
        polygon: [
          { x: 0, y: 6.0 },
          { x: 5.5, y: 6.0 },
          { x: 5.5, y: 11.0 },
          { x: 0, y: 11.0 },
        ],
        center: { x: 2.75, y: 8.5 },
        dimensions: { width: 5.5, length: 5.0, areaSqm: 27.5 },
        floorFinish: 'dark_walnut_wood',
        wallColor: 'sandstone',
        furnishings: ['bed', 'wardrobe'],
      },
      {
        id: 'room-bed2',
        name: 'Guest Suite',
        category: 'bedroom',
        polygon: [
          { x: 9.0, y: 7.5 },
          { x: 14.0, y: 7.5 },
          { x: 14.0, y: 11.0 },
          { x: 9.0, y: 11.0 },
        ],
        center: { x: 11.5, y: 9.25 },
        dimensions: { width: 5.0, length: 3.5, areaSqm: 17.5 },
        floorFinish: 'light_oak_wood',
        wallColor: 'warm_ivory',
        furnishings: ['bed', 'wardrobe'],
      },
      {
        id: 'room-stair-hall',
        name: 'Stairwell & Foyer',
        category: 'hallway',
        polygon: [
          { x: 5.5, y: 6.0 },
          { x: 9.0, y: 6.0 },
          { x: 9.0, y: 11.0 },
          { x: 5.5, y: 11.0 },
        ],
        center: { x: 7.25, y: 8.5 },
        dimensions: { width: 3.5, length: 5.0, areaSqm: 17.5 },
        floorFinish: 'white_carrara_marble',
        wallColor: 'warm_ivory',
        furnishings: [],
      },
    ],
    walls: [
      { id: 'w-ext-1', start: { x: 0, y: 0 }, end: { x: 14, y: 0 }, thickness: 0.23, height: 3.0, isExterior: true },
      { id: 'w-ext-2', start: { x: 14, y: 0 }, end: { x: 14, y: 11 }, thickness: 0.23, height: 3.0, isExterior: true },
      { id: 'w-ext-3', start: { x: 14, y: 11 }, end: { x: 0, y: 11 }, thickness: 0.23, height: 3.0, isExterior: true },
      { id: 'w-ext-4', start: { x: 0, y: 11 }, end: { x: 0, y: 0 }, thickness: 0.23, height: 3.0, isExterior: true },
      { id: 'w-int-1', start: { x: 8, y: 0 }, end: { x: 8, y: 6 }, thickness: 0.15, height: 3.0, isExterior: false },
      { id: 'w-int-2', start: { x: 0, y: 6 }, end: { x: 14, y: 6 }, thickness: 0.15, height: 3.0, isExterior: false },
      { id: 'w-int-3', start: { x: 8, y: 4 }, end: { x: 14, y: 4 }, thickness: 0.12, height: 3.0, isExterior: false },
      { id: 'w-int-4', start: { x: 5.5, y: 6 }, end: { x: 5.5, y: 11 }, thickness: 0.12, height: 3.0, isExterior: false },
      { id: 'w-int-5', start: { x: 9.0, y: 6 }, end: { x: 9.0, y: 11 }, thickness: 0.12, height: 3.0, isExterior: false },
      { id: 'w-int-6', start: { x: 9.0, y: 7.5 }, end: { x: 14.0, y: 7.5 }, thickness: 0.12, height: 3.0, isExterior: false },
    ],
    doors: [
      { id: 'd-main', position: { x: 0, y: 3.0 }, width: 1.2, height: 2.4, type: 'double', swingDirection: 'inward' },
      { id: 'd-dining', position: { x: 8.0, y: 2.0 }, width: 1.2, height: 2.2, type: 'sliding' },
      { id: 'd-kitchen', position: { x: 8.0, y: 5.0 }, width: 0.9, height: 2.1, type: 'single' },
      { id: 'd-master', position: { x: 4.5, y: 6.0 }, width: 0.9, height: 2.1, type: 'single' },
      { id: 'd-bed2', position: { x: 10.0, y: 7.5 }, width: 0.9, height: 2.1, type: 'single' },
    ],
    windows: [
      { id: 'win-living-front', position: { x: 3.5, y: 0 }, width: 2.4, height: 1.8, sillHeight: 0.6, type: 'casement' },
      { id: 'win-dining', position: { x: 11.0, y: 0 }, width: 2.0, height: 1.4, sillHeight: 0.8, type: 'sliding' },
      { id: 'win-kitchen', position: { x: 14.0, y: 5.5 }, width: 1.6, height: 1.2, sillHeight: 0.9, type: 'sliding' },
      { id: 'win-master', position: { x: 0, y: 8.5 }, width: 2.0, height: 1.5, sillHeight: 0.8, type: 'casement' },
      { id: 'win-bed2', position: { x: 14.0, y: 9.2 }, width: 1.8, height: 1.4, sillHeight: 0.8, type: 'casement' },
    ],
    stairs: [
      {
        id: 'stair-internal',
        position: { x: 7.25, y: 8.5 },
        width: 1.2,
        length: 3.4,
        direction: 'north',
        stepsCount: 16,
        height: 3.0,
      },
    ],
    furniture: [
      { id: 'f-sofa1', roomId: 'room-living', type: 'sofa', position: { x: 2.5, y: 2.5 }, rotation: 0, dimensions: { width: 2.6, depth: 1.0, height: 0.8 } },
      { id: 'f-coffee', roomId: 'room-living', type: 'coffee_table', position: { x: 2.5, y: 3.6 }, rotation: 0, dimensions: { width: 1.2, depth: 0.7, height: 0.42 } },
      { id: 'f-dining', roomId: 'room-dining', type: 'dining_table', position: { x: 11.0, y: 2.0 }, rotation: 0, dimensions: { width: 2.0, depth: 1.0, height: 0.76 } },
      { id: 'f-bed1', roomId: 'room-master', type: 'bed', position: { x: 2.7, y: 8.8 }, rotation: 0, dimensions: { width: 2.1, depth: 2.1, height: 0.65 } },
      { id: 'f-bed2', roomId: 'room-bed2', type: 'bed', position: { x: 11.5, y: 9.3 }, rotation: 0, dimensions: { width: 1.8, depth: 2.0, height: 0.6 } },
      { id: 'f-counter', roomId: 'room-kitchen', type: 'kitchen_counter', position: { x: 12.0, y: 5.5 }, rotation: 0, dimensions: { width: 3.0, depth: 0.6, height: 0.86 } },
    ],
    customSettings: {
      defaultWallHeight: 3.0,
      defaultWallThickness: 0.15,
      defaultExteriorWallThickness: 0.23,
      globalWallColor: 'warm_ivory',
      showRoof: false,
      showCeiling: false,
      showFurniture: true,
      showRoomLabels: true,
      showDimensions: true,
      lightingPreset: 'daylight',
    },
    aiConfidence: {
      overall: 0.98,
      notes: [
        'Internal multi-flight architectural stair detected and modeled in 3D.',
        'High ceilings and open-plan transition between Grand Living and Dining analyzed.',
      ],
      warnings: [
        'Stair riser height calculated at 187mm. Confirm local building codes.',
      ],
    },
  },
];

/**
 * Procedurally draws a crisp, high-resolution 2D architectural blueprint
 * as a PNG data URL for preview or download.
 */
export function generateBlueprintDataUrl(plan: FloorPlanModel): string {
  const canvas = document.createElement('canvas');
  const width = 1200;
  const height = 900;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background - Technical architectural blueprint paper (Blueprint cream or blueprint dark)
  ctx.fillStyle = '#1e293b'; // slate dark drafting sheet
  ctx.fillRect(0, 0, width, height);

  // Subtle CAD grid lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  const gridSize = 30;
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Margin and Title Block
  const pad = 60;
  const plotW = width - pad * 2;
  const plotH = height - pad * 2 - 80;

  // Scale computation
  const planW = plan.overallDimensions.widthMeters;
  const planL = plan.overallDimensions.lengthMeters;
  const scale = Math.min(plotW / (planW + 2), plotH / (planL + 2));
  const offsetX = pad + (plotW - planW * scale) / 2;
  const offsetY = pad + (plotH - planL * scale) / 2;

  const toCanvas = (p: { x: number; y: number }) => ({
    x: offsetX + p.x * scale,
    y: offsetY + p.y * scale,
  });

  // Draw room fills
  const colors: Record<string, string> = {
    living_room: 'rgba(56, 189, 248, 0.12)',
    dining_room: 'rgba(56, 189, 248, 0.08)',
    kitchen: 'rgba(245, 158, 11, 0.12)',
    bedroom: 'rgba(168, 85, 247, 0.12)',
    master_bedroom: 'rgba(168, 85, 247, 0.18)',
    bathroom: 'rgba(16, 185, 129, 0.15)',
    hallway: 'rgba(148, 163, 184, 0.1)',
  };

  plan.rooms.forEach((r) => {
    if (r.polygon.length < 3) return;
    ctx.fillStyle = colors[r.category] || 'rgba(255,255,255,0.06)';
    ctx.beginPath();
    const p0 = toCanvas(r.polygon[0]);
    ctx.moveTo(p0.x, p0.y);
    for (let i = 1; i < r.polygon.length; i++) {
      const p = toCanvas(r.polygon[i]);
      ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.fill();

    // Room Label & Dimensions
    const c = toCanvas(r.center);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(r.name.toUpperCase(), c.x, c.y - 10);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px monospace';
    ctx.fillText(`${r.dimensions.width.toFixed(1)}m × ${r.dimensions.length.toFixed(1)}m  (${r.dimensions.areaSqm.toFixed(1)} m²)`, c.x, c.y + 10);
  });

  // Draw Walls
  plan.walls.forEach((w) => {
    const p1 = toCanvas(w.start);
    const p2 = toCanvas(w.end);
    ctx.strokeStyle = w.isExterior ? '#38bdf8' : '#e2e8f0';
    ctx.lineWidth = Math.max(2, (w.thickness * scale));
    ctx.lineCap = 'square';
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  });

  // Draw Doors (with architectural swing arc)
  plan.doors.forEach((d) => {
    const cp = toCanvas(d.position);
    const rad = d.width * scale;
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cp.x, cp.y, rad, 0, Math.PI / 2);
    ctx.stroke();
    // Door leaf
    ctx.beginPath();
    ctx.moveTo(cp.x, cp.y);
    ctx.lineTo(cp.x + rad, cp.y);
    ctx.stroke();
  });

  // Draw Windows
  plan.windows.forEach((win) => {
    const cp = toCanvas(win.position);
    const half = (win.width * scale) / 2;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cp.x - half, cp.y);
    ctx.lineTo(cp.x + half, cp.y);
    ctx.stroke();
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cp.x - half, cp.y - 3);
    ctx.lineTo(cp.x + half, cp.y - 3);
    ctx.moveTo(cp.x - half, cp.y + 3);
    ctx.lineTo(cp.x + half, cp.y + 3);
    ctx.stroke();
  });

  // Stairs
  plan.stairs.forEach((st) => {
    const cp = toCanvas(st.position);
    const sw = st.width * scale;
    const sl = st.length * scale;
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cp.x - sw / 2, cp.y - sl / 2, sw, sl);
    const stepDist = sl / st.stepsCount;
    for (let i = 1; i < st.stepsCount; i++) {
      ctx.beginPath();
      ctx.moveTo(cp.x - sw / 2, cp.y - sl / 2 + i * stepDist);
      ctx.lineTo(cp.x + sw / 2, cp.y - sl / 2 + i * stepDist);
      ctx.stroke();
    }
  });

  // Architectural Title Block at bottom
  const tbY = height - 90;
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(pad, tbY, width - pad * 2, 70);
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(pad, tbY, width - pad * 2, 70);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`PROJECT: ${plan.name.toUpperCase()}`, pad + 20, tbY + 28);

  ctx.font = '13px sans-serif';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(`FIRM: TEJU CIVIL ENGINEER & ARCHITECT`, pad + 20, tbY + 50);

  ctx.fillStyle = '#94a3b8';
  ctx.textAlign = 'right';
  ctx.fillText(`SCALE: 1:${Math.round(100 / (scale / 45))}   |   BUILT-UP AREA: ${plan.overallDimensions.totalAreaSqm.toFixed(1)} SQ.M`, width - pad - 20, tbY + 28);
  ctx.fillText(`DRAWING REF: T-CAD-2026-${plan.id.slice(0, 6).toUpperCase()}   |   DATE: ${new Date().toLocaleDateString()}`, width - pad - 20, tbY + 50);

  return canvas.toDataURL('image/png');
}

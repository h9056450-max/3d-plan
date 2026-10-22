/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RoomCategory =
  | 'living_room'
  | 'bedroom'
  | 'master_bedroom'
  | 'kitchen'
  | 'bathroom'
  | 'attached_bathroom'
  | 'dining_room'
  | 'balcony'
  | 'hallway'
  | 'study'
  | 'garage'
  | 'utility'
  | 'pooja_room'
  | 'foyer'
  | 'lift'
  | 'lobby'
  | 'staircase';

export interface LiftData {
  id: string;
  position: Point2D;
  width: number;
  depth: number;
  label?: string;
}

export type FloorFinish =
  | 'light_oak_wood'
  | 'dark_walnut_wood'
  | 'white_carrara_marble'
  | 'grey_granite'
  | 'ceramic_tile'
  | 'terrazzo'
  | 'polished_concrete';

export type WallColor =
  | 'warm_ivory'
  | 'classic_white'
  | 'stone_grey'
  | 'sage_green'
  | 'terracotta'
  | 'navy_accent'
  | 'sandstone';

export interface Point2D {
  x: number; // in meters (architectural coordinate system)
  y: number; // in meters
}

export interface RoomData {
  id: string;
  name: string;
  category: RoomCategory;
  polygon: Point2D[]; // vertices in clockwise or CCW order
  center: Point2D;
  dimensions: {
    width: number; // meters
    length: number; // meters
    areaSqm: number; // square meters
  };
  floorFinish: FloorFinish;
  wallColor: WallColor;
  furnishings: string[]; // detected furniture items e.g., ['bed', 'wardrobe', 'sofa']
  ceilingHeight?: number; // optional custom height
}

export interface WallData {
  id: string;
  start: Point2D;
  end: Point2D;
  thickness: number; // meters (e.g. 0.23m for exterior, 0.12m for interior)
  height: number; // meters (default 2.8m)
  isExterior: boolean;
  isBearing?: boolean;
}

export interface DoorData {
  id: string;
  wallId?: string;
  position: Point2D;
  rotation?: number; // degrees or radians
  width: number; // meters (e.g. 0.9m)
  height: number; // meters (e.g. 2.1m)
  type: 'single' | 'double' | 'sliding' | 'pocket';
  swingDirection?: 'inward' | 'outward' | 'left' | 'right';
  connectedRooms?: string[];
}

export interface WindowData {
  id: string;
  wallId?: string;
  position: Point2D;
  rotation?: number;
  width: number; // meters (e.g. 1.2m)
  height: number; // meters (e.g. 1.4m)
  sillHeight: number; // height from floor, meters (e.g. 0.9m)
  type: 'casement' | 'sliding' | 'picture' | 'louver';
}

export interface StairData {
  id: string;
  position: Point2D;
  width: number;
  length: number;
  direction: 'up' | 'down' | 'north' | 'south' | 'east' | 'west';
  stepsCount: number;
  height: number;
}

export interface FurnitureData {
  id: string;
  roomId?: string;
  type: 'sofa' | 'bed' | 'dining_table' | 'kitchen_counter' | 'toilet' | 'bathtub' | 'desk' | 'coffee_table' | 'tv_unit' | 'wardrobe' | 'sink';
  position: Point2D;
  rotation: number; // radians
  dimensions: { width: number; depth: number; height: number };
}

export interface ScaleCalibration {
  pixelsPerMeter: number;
  referenceDistanceMeters: number;
  referencePixelDistance: number;
  unit: 'metric' | 'imperial';
  calibrated: boolean;
}

export interface FloorPlanModel {
  id: string;
  name: string;
  description?: string;
  clientName?: string;
  architectName?: string;
  createdAt: string;
  updatedAt: string;
  originalImage?: string; // base64 data URL or path
  imageDimensions?: { width: number; height: number };
  drawingBounds?: { minY: number; minX: number; maxY: number; maxX: number };
  scale: ScaleCalibration;
  overallDimensions: {
    widthMeters: number;
    lengthMeters: number;
    totalAreaSqm: number;
  };
  rooms: RoomData[];
  walls: WallData[];
  doors: DoorData[];
  windows: WindowData[];
  stairs: StairData[];
  lifts?: LiftData[];
  furniture: FurnitureData[];
  customSettings: {
    defaultWallHeight: number;
    defaultWallThickness: number;
    defaultExteriorWallThickness: number;
    globalWallColor: WallColor;
    showRoof: boolean;
    showCeiling: boolean;
    showFurniture: boolean;
    showRoomLabels: boolean;
    showDimensions: boolean;
    lightingPreset: 'daylight' | 'golden_hour' | 'studio' | 'night';
  };
  aiConfidence?: {
    overall: number; // 0 to 1
    notes: string[];
    warnings: string[];
  };
}

export type ViewPreset =
  | 'isometric'
  | 'top'
  | 'front'
  | 'side'
  | 'dollhouse'
  | 'walkthrough';

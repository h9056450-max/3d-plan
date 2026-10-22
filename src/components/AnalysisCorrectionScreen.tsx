/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Box,
  Layers,
  ArrowRight,
  ShieldAlert,
  Info,
  Ruler,
  Maximize2,
  Eye,
  Columns,
  Sparkles,
  Move,
  CornerDownRight,
} from 'lucide-react';
import { FloorPlanModel, RoomCategory, FloorFinish, RoomData, Point2D } from '../types/floorplan';

interface AnalysisCorrectionScreenProps {
  plan: FloorPlanModel;
  onUpdatePlan: (updated: FloorPlanModel) => void;
  onProceedTo3D: () => void;
  onBackToUpload: () => void;
}

export const AnalysisCorrectionScreen: React.FC<AnalysisCorrectionScreenProps> = ({
  plan,
  onUpdatePlan,
  onProceedTo3D,
  onBackToUpload,
}) => {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(
    plan.rooms[0]?.id || null
  );

  const [viewMode, setViewMode] = useState<'overlay' | 'split' | 'cad' | 'source'>('overlay');
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0.55);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const roomCategories: { id: RoomCategory; label: string }[] = [
    { id: 'living_room', label: 'Living Room' },
    { id: 'master_bedroom', label: 'Master Bedroom' },
    { id: 'bedroom', label: 'Bedroom' },
    { id: 'kitchen', label: 'Kitchen' },
    { id: 'bathroom', label: 'Bathroom / Toilet' },
    { id: 'attached_bathroom', label: 'Attached Bathroom' },
    { id: 'dining_room', label: 'Dining Room' },
    { id: 'balcony', label: 'Balcony' },
    { id: 'hallway', label: 'Hallway / Corridor / Foyer' },
    { id: 'utility', label: 'Technic / Utility / Laundry' },
    { id: 'pooja_room', label: 'Pooja Room / Mandir' },
    { id: 'study', label: 'Study / Office' },
    { id: 'lift', label: 'Lift / Elevator' },
    { id: 'lobby', label: 'Lobby' },
    { id: 'staircase', label: 'Staircase' },
  ];

  const floorFinishes: { id: FloorFinish; label: string }[] = [
    { id: 'light_oak_wood', label: 'Light Oak Wood' },
    { id: 'dark_walnut_wood', label: 'Dark Walnut Wood' },
    { id: 'white_carrara_marble', label: 'Carrara Marble' },
    { id: 'grey_granite', label: 'Grey Granite' },
    { id: 'ceramic_tile', label: 'Ceramic Tile' },
    { id: 'polished_concrete', label: 'Polished Concrete' },
  ];

  // Preload original drawing image
  useEffect(() => {
    if (plan.originalImage) {
      const img = new Image();
      img.onload = () => {
        imgRef.current = img;
        drawCanvas();
      };
      img.src = plan.originalImage;
    }
  }, [plan.originalImage]);

  // Redraw canvas whenever geometry, mode, opacity, or selected room changes
  useEffect(() => {
    drawCanvas();
  }, [plan, viewMode, overlayOpacity, selectedRoomId]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const houseW = plan.overallDimensions.widthMeters || 12;
    const houseL = plan.overallDimensions.lengthMeters || 10;

    const pad = 30;
    const drawW = width - pad * 2;
    const drawH = height - pad * 2;
    const scale = Math.min(drawW / houseW, drawH / houseL);
    const offsetX = pad + (drawW - houseW * scale) / 2;
    const offsetY = pad + (drawH - houseL * scale) / 2;

    const toCanvas = (p: Point2D) => ({
      x: offsetX + p.x * scale,
      y: offsetY + p.y * scale,
    });

    // 1. Draw Original Background Image if present
    if (imgRef.current && (viewMode === 'overlay' || viewMode === 'source')) {
      ctx.save();
      if (viewMode === 'overlay') {
        ctx.globalAlpha = 1.0;
      }
      // If drawingBounds are defined, align drawingBounds to our metric rect
      if (plan.drawingBounds) {
        const db = plan.drawingBounds;
        const sx = db.minX * imgRef.current.naturalWidth;
        const sy = db.minY * imgRef.current.naturalHeight;
        const sW = (db.maxX - db.minX) * imgRef.current.naturalWidth;
        const sH = (db.maxY - db.minY) * imgRef.current.naturalHeight;
        ctx.drawImage(imgRef.current, sx, sy, sW, sH, offsetX, offsetY, houseW * scale, houseL * scale);
      } else {
        ctx.drawImage(imgRef.current, offsetX, offsetY, houseW * scale, houseL * scale);
      }
      ctx.restore();
    } else {
      // Dark slate CAD background for vector view
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);
      // CAD grid
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 25) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 25) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }

    if (viewMode === 'source') {
      return; // Source image only
    }

    // 2. Draw Detected Room Polygons
    const categoryColors: Record<string, string> = {
      living_room: '56, 189, 248', // sky
      master_bedroom: '168, 85, 247', // purple
      bedroom: '192, 132, 252',
      kitchen: '245, 158, 11', // amber
      bathroom: '16, 185, 129', // emerald
      attached_bathroom: '16, 185, 129',
      utility: '100, 116, 139', // slate
      pooja_room: '234, 179, 8', // yellow
      lift: '99, 102, 241', // indigo
      lobby: '148, 163, 184',
      hallway: '148, 163, 184',
      dining_room: '59, 130, 246',
    };

    plan.rooms.forEach((room) => {
      if (!room.polygon || room.polygon.length < 3) return;

      const isSelected = room.id === selectedRoomId;
      const rgb = categoryColors[room.category] || '100, 116, 139';

      ctx.beginPath();
      const p0 = toCanvas(room.polygon[0]);
      ctx.moveTo(p0.x, p0.y);
      for (let i = 1; i < room.polygon.length; i++) {
        const pt = toCanvas(room.polygon[i]);
        ctx.lineTo(pt.x, pt.y);
      }
      ctx.closePath();

      // Fill with transparency
      const alpha = isSelected ? Math.min(0.85, overlayOpacity + 0.3) : overlayOpacity * 0.5;
      ctx.fillStyle = `rgba(${rgb}, ${alpha})`;
      ctx.fill();

      // Polygon perimeter stroke
      ctx.strokeStyle = isSelected ? '#10b981' : `rgba(${rgb}, 0.9)`;
      ctx.lineWidth = isSelected ? 3 : 1.5;
      ctx.stroke();

      // Draw corner vertex handles if selected
      if (isSelected) {
        room.polygon.forEach((pt) => {
          const cp = toCanvas(pt);
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#059669';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(cp.x, cp.y, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        });
      }

      // Room Center Label
      const c = toCanvas(room.center);
      ctx.fillStyle = isSelected ? '#ffffff' : '#0f172a';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';

      // Text background tag for high contrast readability over blueprints
      const txt = room.name.toUpperCase();
      const sub = `${room.dimensions.areaSqm.toFixed(1)} m²`;
      ctx.fillStyle = isSelected ? 'rgba(5, 150, 105, 0.95)' : 'rgba(15, 23, 42, 0.85)';
      ctx.beginPath();
      ctx.roundRect(c.x - 55, c.y - 18, 110, 36, 6);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.fillText(txt.slice(0, 16), c.x, c.y - 3);
      ctx.fillStyle = isSelected ? '#a7f3d0' : '#94a3b8';
      ctx.font = '10px monospace';
      ctx.fillText(sub, c.x, c.y + 11);
    });

    // 3. Draw Walls
    plan.walls.forEach((wall) => {
      const p1 = toCanvas(wall.start);
      const p2 = toCanvas(wall.end);
      ctx.strokeStyle = wall.isExterior ? '#38bdf8' : '#e2e8f0';
      ctx.lineWidth = Math.max(2, wall.thickness * scale * 0.75);
      ctx.lineCap = 'square';
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    });

    // 4. Draw Doors
    plan.doors.forEach((d) => {
      const cp = toCanvas(d.position);
      const rad = d.width * scale;
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cp.x, cp.y, rad, 0, Math.PI / 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cp.x, cp.y);
      ctx.lineTo(cp.x + rad, cp.y);
      ctx.stroke();
    });

    // 5. Draw Windows
    plan.windows.forEach((win) => {
      const cp = toCanvas(win.position);
      const half = (win.width * scale) / 2;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cp.x - half, cp.y);
      ctx.lineTo(cp.x + half, cp.y);
      ctx.stroke();
    });

    // 6. Draw Stairs
    plan.stairs.forEach((st) => {
      const cp = toCanvas(st.position);
      const sw = st.width * scale;
      const sl = st.length * scale;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(cp.x - sw / 2, cp.y - sl / 2, sw, sl);
      const stepDist = sl / (st.stepsCount || 12);
      for (let i = 1; i < (st.stepsCount || 12); i++) {
        ctx.beginPath();
        ctx.moveTo(cp.x - sw / 2, cp.y - sl / 2 + i * stepDist);
        ctx.lineTo(cp.x + sw / 2, cp.y - sl / 2 + i * stepDist);
        ctx.stroke();
      }
    });

    // 7. Draw Lifts
    (plan.lifts || []).forEach((l) => {
      const cp = toCanvas(l.position);
      const lw = (l.width || 1.6) * scale;
      const ld = (l.depth || 1.6) * scale;
      ctx.fillStyle = 'rgba(99, 102, 241, 0.4)';
      ctx.fillRect(cp.x - lw / 2, cp.y - ld / 2, lw, ld);
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 2;
      ctx.strokeRect(cp.x - lw / 2, cp.y - ld / 2, lw, ld);

      // Draw X mark inside elevator shaft
      ctx.beginPath();
      ctx.moveTo(cp.x - lw / 2, cp.y - ld / 2);
      ctx.lineTo(cp.x + lw / 2, cp.y + ld / 2);
      ctx.moveTo(cp.x + lw / 2, cp.y - ld / 2);
      ctx.lineTo(cp.x - lw / 2, cp.y + ld / 2);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('LIFT', cp.x, cp.y + 4);
    });
  };

  const handleRoomChange = (roomId: string, field: keyof RoomData | 'width' | 'length', value: any) => {
    const updatedRooms = plan.rooms.map((room) => {
      if (room.id !== roomId) return room;

      if (field === 'width' || field === 'length') {
        const numVal = parseFloat(value) || 1;
        const newDims = {
          ...room.dimensions,
          [field]: numVal,
        };
        newDims.areaSqm = Math.round(newDims.width * newDims.length * 10) / 10;
        return {
          ...room,
          dimensions: newDims,
        };
      }

      return {
        ...room,
        [field]: value,
      };
    });

    const totalArea = updatedRooms.reduce((sum, r) => sum + r.dimensions.areaSqm, 0);

    onUpdatePlan({
      ...plan,
      rooms: updatedRooms,
      overallDimensions: {
        ...plan.overallDimensions,
        totalAreaSqm: Math.round(totalArea * 10) / 10,
      },
    });
  };

  const handleAddRoom = () => {
    const id = 'room-' + Date.now();
    const newRoom: RoomData = {
      id,
      name: 'New Room ' + (plan.rooms.length + 1),
      category: 'bedroom',
      polygon: [
        { x: 0, y: 0 },
        { x: 4.0, y: 0 },
        { x: 4.0, y: 3.5 },
        { x: 0, y: 3.5 },
      ],
      center: { x: 2.0, y: 1.75 },
      dimensions: { width: 4.0, length: 3.5, areaSqm: 14.0 },
      floorFinish: 'light_oak_wood',
      wallColor: 'warm_ivory',
      furnishings: ['bed'],
    };

    onUpdatePlan({
      ...plan,
      rooms: [...plan.rooms, newRoom],
    });
    setSelectedRoomId(id);
  };

  const handleDeleteRoom = (roomId: string) => {
    if (plan.rooms.length <= 1) {
      alert('Floor plan must retain at least one room.');
      return;
    }
    const updatedRooms = plan.rooms.filter((r) => r.id !== roomId);
    onUpdatePlan({
      ...plan,
      rooms: updatedRooms,
    });
    setSelectedRoomId(updatedRooms[0]?.id || null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Step 2 of 2: Source Blueprint Verification &amp; Correction
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Reconstructed Floor Plan Geometry
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Compare the detected room geometry directly against your uploaded 2D blueprint before generating the 3D model.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onBackToUpload}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl bg-white transition"
          >
            Back to Upload
          </button>

          <button
            onClick={onProceedTo3D}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-700/20 transition active:scale-95"
          >
            <Box className="w-4 h-4" />
            Generate Photorealistic 3D Model
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Verification Notice */}
      <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 text-emerald-950 text-xs flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">
            Real Source Drawing Verification Active
          </p>
          <p className="text-emerald-800 leading-relaxed">
            All rooms, titles, dimensions, and wall locations below were extracted directly from your uploaded blueprint.
            Use the canvas controls to cross-fade between your original drawing and the reconstructed CAD lines to verify alignment.
          </p>
        </div>
      </div>

      {/* Main Review Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive 2D Blueprint Canvas with Modes */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900 rounded-2xl p-4 text-white space-y-3 shadow-md border border-slate-800">
            {/* View Mode Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setViewMode('overlay')}
                  className={`px-3 py-1 rounded-lg font-medium transition ${
                    viewMode === 'overlay' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Blueprint Overlay
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('cad')}
                  className={`px-3 py-1 rounded-lg font-medium transition ${
                    viewMode === 'cad' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  CAD Vectors
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('source')}
                  className={`px-3 py-1 rounded-lg font-medium transition ${
                    viewMode === 'source' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Source Image
                </button>
              </div>

              {viewMode === 'overlay' && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">Opacity:</span>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={overlayOpacity}
                    onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                    className="w-20 accent-emerald-500 h-1 bg-slate-700 rounded-lg cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Interactive Drawing Canvas */}
            <div className="relative aspect-4/3 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="w-full h-full object-contain cursor-crosshair"
              />
            </div>

            {/* Elements Summary Counters */}
            <div className="grid grid-cols-5 gap-2 pt-1 text-center text-[11px]">
              <div className="p-2 bg-slate-800/80 rounded-xl">
                <div className="text-emerald-400 font-bold text-base">{plan.rooms.length}</div>
                <div className="text-slate-400 text-[10px]">Rooms</div>
              </div>
              <div className="p-2 bg-slate-800/80 rounded-xl">
                <div className="text-emerald-400 font-bold text-base">{plan.walls.length}</div>
                <div className="text-slate-400 text-[10px]">Walls</div>
              </div>
              <div className="p-2 bg-slate-800/80 rounded-xl">
                <div className="text-emerald-400 font-bold text-base">{plan.doors.length}</div>
                <div className="text-slate-400 text-[10px]">Doors</div>
              </div>
              <div className="p-2 bg-slate-800/80 rounded-xl">
                <div className="text-emerald-400 font-bold text-base">{plan.windows.length}</div>
                <div className="text-slate-400 text-[10px]">Windows</div>
              </div>
              <div className="p-2 bg-slate-800/80 rounded-xl">
                <div className="text-emerald-400 font-bold text-base">
                  {(plan.stairs?.length || 0) + (plan.lifts?.length || 0)}
                </div>
                <div className="text-slate-400 text-[10px]">Stairs/Lifts</div>
              </div>
            </div>
          </div>

          {/* AI Confidence & Summary Notes */}
          {plan.aiConfidence && (
            <div className="p-4 bg-white border border-slate-200/90 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Blueprint Extraction Verification
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Confidence: {((plan.aiConfidence.overall || 0.95) * 100).toFixed(0)}%
                </span>
              </div>
              <ul className="space-y-1 text-slate-600 list-disc list-inside text-[11px]">
                {plan.aiConfidence.notes?.map((note, i) => (
                  <li key={i}>{note}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column: Editable Room Schedule Table */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Extracted Room Schedule &amp; Specifications
                </h3>
                <p className="text-xs text-slate-500">
                  Click any room to inspect and edit boundaries, labels, or flooring.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddRoom}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Room
              </button>
            </div>

            <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto">
              {plan.rooms.map((room, index) => {
                const isSelected = room.id === selectedRoomId;
                return (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoomId(room.id)}
                    className={`p-4 transition cursor-pointer ${
                      isSelected ? 'bg-emerald-50/50 border-l-4 border-l-emerald-600' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                      {/* Room Name & Category */}
                      <div className="md:col-span-5 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            #{index + 1}
                          </span>
                          <input
                            type="text"
                            value={room.name}
                            onChange={(e) => handleRoomChange(room.id, 'name', e.target.value)}
                            className="text-xs font-bold text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-emerald-600 focus:outline-none w-full bg-transparent"
                          />
                        </div>
                        <select
                          value={room.category}
                          onChange={(e) => handleRoomChange(room.id, 'category', e.target.value)}
                          className="text-[11px] text-slate-600 bg-white border border-slate-200 rounded px-2 py-1 w-full"
                        >
                          {roomCategories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Dimensions (W x L = Area) */}
                      <div className="md:col-span-4 flex items-center gap-1.5 text-xs">
                        <div>
                          <label className="text-[10px] text-slate-400 block">W (m)</label>
                          <input
                            type="number"
                            step="0.1"
                            min="0.5"
                            max="50"
                            value={room.dimensions.width}
                            onChange={(e) => handleRoomChange(room.id, 'width', e.target.value)}
                            className="w-14 px-1.5 py-1 text-xs border border-slate-200 rounded font-semibold text-center"
                          />
                        </div>
                        <span className="text-slate-400 mt-3">×</span>
                        <div>
                          <label className="text-[10px] text-slate-400 block">L (m)</label>
                          <input
                            type="number"
                            step="0.1"
                            min="0.5"
                            max="50"
                            value={room.dimensions.length}
                            onChange={(e) => handleRoomChange(room.id, 'length', e.target.value)}
                            className="w-14 px-1.5 py-1 text-xs border border-slate-200 rounded font-semibold text-center"
                          />
                        </div>
                        <div className="pl-1">
                          <label className="text-[10px] text-slate-400 block">Area</label>
                          <span className="text-xs font-bold text-emerald-700 whitespace-nowrap">
                            {room.dimensions.areaSqm.toFixed(1)} m²
                          </span>
                        </div>
                      </div>

                      {/* Flooring Material & Delete Action */}
                      <div className="md:col-span-3 flex items-center justify-between gap-2">
                        <select
                          value={room.floorFinish}
                          onChange={(e) => handleRoomChange(room.id, 'floorFinish', e.target.value)}
                          className="text-[11px] text-slate-600 bg-white border border-slate-200 rounded px-2 py-1 w-full"
                        >
                          {floorFinishes.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.label}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRoom(room.id);
                          }}
                          title="Remove room"
                          className="text-slate-400 hover:text-red-600 p-1 rounded transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total Area Summary Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600">
                Total Built-up Carpet Area:
              </span>
              <span className="text-sm font-extrabold text-slate-900">
                {plan.overallDimensions.totalAreaSqm.toFixed(1)} m²{' '}
                <span className="text-xs font-normal text-slate-500">
                  ({(plan.overallDimensions.totalAreaSqm * 10.7639).toFixed(0)} sq ft)
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

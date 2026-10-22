/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
  DoorOpen,
  Square,
} from 'lucide-react';
import { FloorPlanModel, RoomCategory, FloorFinish, RoomData } from '../types/floorplan';

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

  const roomCategories: { id: RoomCategory; label: string }[] = [
    { id: 'living_room', label: 'Living Room' },
    { id: 'master_bedroom', label: 'Master Bedroom' },
    { id: 'bedroom', label: 'Bedroom' },
    { id: 'kitchen', label: 'Kitchen' },
    { id: 'bathroom', label: 'Bathroom / Toilet' },
    { id: 'dining_room', label: 'Dining Room' },
    { id: 'balcony', label: 'Balcony' },
    { id: 'hallway', label: 'Hallway / Foyer' },
    { id: 'study', label: 'Study / Office' },
  ];

  const floorFinishes: { id: FloorFinish; label: string }[] = [
    { id: 'light_oak_wood', label: 'Light Oak Wood' },
    { id: 'dark_walnut_wood', label: 'Dark Walnut Wood' },
    { id: 'white_carrara_marble', label: 'Carrara Marble' },
    { id: 'grey_granite', label: 'Grey Granite' },
    { id: 'ceramic_tile', label: 'Ceramic Tile' },
    { id: 'polished_concrete', label: 'Polished Concrete' },
  ];

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

    // Recalculate total area
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
              Step 2 of 2: AI Structural Review &amp; Correction
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Review Detected Floor Plan Geometry
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Verify identified rooms, wall envelopes, and doors before generating the 3D model.
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
            Generate Interactive 3D Model
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Professional Safety Warning Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">
            Civil Engineering Pre-Execution Notice
          </p>
          <p className="text-amber-800 leading-relaxed">
            AI structural analysis provides provisional architectural geometries based on 2D drawing scans.
            All wall thicknesses, door swing clearances, and room square-footage must be physically verified
            by a licensed civil engineer or architect against municipal setbacks prior to civil construction.
          </p>
        </div>
      </div>

      {/* Main Review Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 2D Blueprint Schematic Review */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 rounded-2xl p-4 text-white space-y-3 shadow-sm border border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-400" />
                2D Drawing Segmentation Canvas
              </span>
              <span className="text-[10px] bg-slate-800 text-emerald-300 px-2 py-0.5 rounded font-mono">
                Scale: 1:{(100 / (plan.scale.pixelsPerMeter / 45)).toFixed(0)}
              </span>
            </div>

            {/* Canvas / Image preview */}
            <div className="relative aspect-4/3 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center p-2">
              {plan.originalImage ? (
                <img
                  src={plan.originalImage}
                  alt="Original Blueprint"
                  className="max-h-full max-w-full object-contain opacity-90"
                />
              ) : (
                <div className="text-center text-slate-500 text-xs">
                  CAD Vector Blueprint Active
                </div>
              )}
            </div>

            {/* Identified Elements Counters */}
            <div className="grid grid-cols-4 gap-2 pt-2 text-center text-[11px]">
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
            </div>
          </div>

          {/* AI Confidence & Summary Notes */}
          {plan.aiConfidence && (
            <div className="p-4 bg-white border border-slate-200/90 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  AI Detection Confidence: {(plan.aiConfidence.overall * 100).toFixed(0)}%
                </span>
              </div>
              <ul className="space-y-1 text-slate-600 list-disc list-inside text-[11px]">
                {plan.aiConfidence.notes.map((note, i) => (
                  <li key={i}>{note}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column: Editable Room Schedule Table */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Room Schedule &amp; Spatial Specifications
                </h3>
                <p className="text-xs text-slate-500">
                  Click any field below to correct names, dimensions, or floor finishes.
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

            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {plan.rooms.map((room, index) => {
                const isSelected = room.id === selectedRoomId;
                return (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoomId(room.id)}
                    className={`p-4 transition ${
                      isSelected ? 'bg-emerald-50/40' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                      {/* Room Name & Category */}
                      <div className="md:col-span-5 space-y-1.5">
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
                            min="1"
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
                            min="1"
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

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  Download,
  Camera,
  Layers,
  Sparkles,
  Info,
  Maximize2,
  Share2,
  Sliders,
  X,
} from 'lucide-react';
import { FloorPlanModel, ViewPreset, FloorFinish, WallColor } from '../types/floorplan';
import { Scene3D } from './Viewer3D/Scene3D';
import { ControlDock } from './Viewer3D/ControlDock';
import { ExportModal } from './ExportModal';
import { saveProject } from '../services/storageService';

interface Workspace3DProps {
  plan: FloorPlanModel;
  onUpdatePlan: (updated: FloorPlanModel) => void;
  onBackToDashboard: () => void;
  onBackToReview: () => void;
  unit: 'metric' | 'imperial';
}

export const Workspace3D: React.FC<Workspace3DProps> = ({
  plan,
  onUpdatePlan,
  onBackToDashboard,
  onBackToReview,
  unit,
}) => {
  const [viewPreset, setViewPreset] = useState<ViewPreset>('isometric');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [screenshotDataUrl, setScreenshotDataUrl] = useState<string | undefined>(undefined);

  // 3D Scene API reference
  const sceneApiRef = useRef<{
    captureScreenshot: () => string;
    getThreeScene: () => any;
    getThreeRenderer: () => any;
  } | null>(null);

  // Custom visual overrides
  const [customOverrides, setCustomOverrides] = useState({
    wallHeight: plan.customSettings.defaultWallHeight || 2.8,
    wallThickness: plan.customSettings.defaultWallThickness || 0.15,
    showRoof: plan.customSettings.showRoof || false,
    showFurniture: plan.customSettings.showFurniture ?? true,
    showRoomLabels: plan.customSettings.showRoomLabels ?? true,
    showDimensions: plan.customSettings.showDimensions ?? true,
    dollhouseMode: false,
    lightingPreset: plan.customSettings.lightingPreset || 'daylight',
  });

  const handleUpdateOverrides = (updates: Partial<typeof customOverrides>) => {
    setCustomOverrides((prev) => ({ ...prev, ...updates }));
  };

  const handleResetToDefaults = () => {
    setCustomOverrides({
      wallHeight: 2.8,
      wallThickness: 0.15,
      showRoof: false,
      showFurniture: true,
      showRoomLabels: true,
      showDimensions: true,
      dollhouseMode: false,
      lightingPreset: 'daylight',
    });
    setViewPreset('isometric');
    setSelectedRoomId(null);
  };

  const handleUpdateRoomFinish = (roomId: string, finish: FloorFinish) => {
    const updatedRooms = plan.rooms.map((r) => (r.id === roomId ? { ...r, floorFinish: finish } : r));
    const updated = { ...plan, rooms: updatedRooms };
    onUpdatePlan(updated);
    saveProject(updated);
  };

  const handleUpdateWallColor = (color: WallColor) => {
    const updated = {
      ...plan,
      customSettings: {
        ...plan.customSettings,
        globalWallColor: color,
      },
    };
    onUpdatePlan(updated);
    saveProject(updated);
  };

  const handleTriggerExport = () => {
    if (sceneApiRef.current) {
      const snap = sceneApiRef.current.captureScreenshot();
      setScreenshotDataUrl(snap);
    }
    setIsExportOpen(true);
  };

  const selectedRoom = plan.rooms.find((r) => r.id === selectedRoomId);

  return (
    <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden bg-slate-900 select-none">
      {/* 3D Scene Viewport */}
      <Scene3D
        plan={plan}
        viewPreset={viewPreset}
        customOverrides={customOverrides}
        selectedRoomId={selectedRoomId}
        onSelectRoom={setSelectedRoomId}
        onSceneReady={(api) => {
          sceneApiRef.current = api;
        }}
      />

      {/* Top HUD Floating Glass Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        {/* Left: Back Buttons & Title */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={onBackToDashboard}
            title="Return to Dashboard"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white/90 hover:bg-white shadow-md border border-slate-200/80 backdrop-blur-md transition active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Dashboard
          </button>

          <button
            onClick={onBackToReview}
            title="Review & edit 2D drawing boundaries"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white/90 hover:bg-white shadow-md border border-slate-200/80 backdrop-blur-md transition"
          >
            <Layers className="w-3.5 h-3.5" />
            Edit 2D Plan
          </button>

          <div className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/90 border border-slate-200/80 shadow-md backdrop-blur-md text-xs">
            <span className="font-bold text-slate-900">{plan.name}</span>
            <span className="text-slate-400">•</span>
            <span className="text-emerald-700 font-semibold">
              {plan.overallDimensions.totalAreaSqm.toFixed(1)} m²
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500 font-medium">{plan.rooms.length} Rooms</span>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => {
              if (sceneApiRef.current) {
                const snap = sceneApiRef.current.captureScreenshot();
                const a = document.createElement('a');
                a.href = snap;
                a.download = `${(plan.name || 'FloorPlan').replace(/\s+/g, '_')}_QuickSnap.png`;
                a.click();
              }
            }}
            title="Quick PNG Snapshot"
            className="p-2.5 rounded-xl bg-white/90 hover:bg-white border border-slate-200/80 shadow-md backdrop-blur-md text-slate-700 transition"
          >
            <Camera className="w-4 h-4" />
          </button>

          <button
            onClick={handleTriggerExport}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-700/20 transition active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Export 3D / PDF</span>
          </button>
        </div>
      </div>

      {/* Selected Room Floating Information Inspector (Top-Left) */}
      {selectedRoom && (
        <div className="absolute top-18 left-4 z-20 w-72 bg-white/95 border border-slate-200 shadow-xl rounded-2xl p-4 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-150 pointer-events-auto">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <h4 className="text-xs font-bold text-slate-900">{selectedRoom.name}</h4>
            </div>
            <button
              onClick={() => setSelectedRoomId(null)}
              className="p-1 text-slate-400 hover:text-slate-700 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="pt-2 space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Category:</span>
              <strong className="text-slate-800 uppercase font-medium text-[11px]">
                {selectedRoom.category.replace('_', ' ')}
              </strong>
            </div>
            <div className="flex justify-between">
              <span>Dimensions:</span>
              <strong className="text-slate-800">
                {selectedRoom.dimensions.width.toFixed(1)}m × {selectedRoom.dimensions.length.toFixed(1)}m
              </strong>
            </div>
            <div className="flex justify-between">
              <span>Carpet Area:</span>
              <strong className="text-emerald-700 font-bold">
                {selectedRoom.dimensions.areaSqm.toFixed(1)} m² (
                {(selectedRoom.dimensions.areaSqm * 10.7639).toFixed(0)} sq ft)
              </strong>
            </div>
            <div className="flex justify-between">
              <span>Floor Finish:</span>
              <strong className="text-slate-800 text-[11px] capitalize">
                {selectedRoom.floorFinish.replace(/_/g, ' ')}
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* Collapsible Bottom Control Dock */}
      <ControlDock
        plan={plan}
        viewPreset={viewPreset}
        onViewChange={setViewPreset}
        customOverrides={customOverrides}
        onUpdateOverrides={handleUpdateOverrides}
        selectedRoomId={selectedRoomId}
        onUpdateRoomFinish={handleUpdateRoomFinish}
        onUpdateWallColor={handleUpdateWallColor}
        onResetToDefaults={handleResetToDefaults}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        plan={plan}
        threeScene={sceneApiRef.current?.getThreeScene()}
        screenshotDataUrl={screenshotDataUrl}
      />
    </div>
  );
};

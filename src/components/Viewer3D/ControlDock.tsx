/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Camera,
  Eye,
  Sliders,
  Palette,
  Sun,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles,
  Maximize2,
  Box,
  Compass,
} from 'lucide-react';
import { FloorPlanModel, FloorFinish, WallColor, ViewPreset } from '../../types/floorplan';

interface ControlDockProps {
  plan: FloorPlanModel;
  viewPreset: ViewPreset;
  onViewChange: (preset: ViewPreset) => void;
  customOverrides: {
    wallHeight: number;
    wallThickness: number;
    showRoof: boolean;
    showFurniture: boolean;
    showRoomLabels: boolean;
    showDimensions: boolean;
    dollhouseMode: boolean;
    lightingPreset: 'daylight' | 'golden_hour' | 'studio' | 'night';
  };
  onUpdateOverrides: (updates: Partial<ControlDockProps['customOverrides']>) => void;
  selectedRoomId?: string | null;
  onUpdateRoomFinish?: (roomId: string, finish: FloorFinish) => void;
  onUpdateWallColor?: (color: WallColor) => void;
  onResetToDefaults: () => void;
}

export const ControlDock: React.FC<ControlDockProps> = ({
  plan,
  viewPreset,
  onViewChange,
  customOverrides,
  onUpdateOverrides,
  selectedRoomId,
  onUpdateRoomFinish,
  onUpdateWallColor,
  onResetToDefaults,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'camera' | 'structure' | 'finishes' | 'lighting'>('camera');

  const selectedRoom = plan.rooms.find((r) => r.id === selectedRoomId);

  const viewPresets: { id: ViewPreset; label: string; icon: any }[] = [
    { id: 'isometric', label: 'Isometric 3D', icon: Box },
    { id: 'top', label: 'Top / Plan', icon: Compass },
    { id: 'front', label: 'Front Elevation', icon: Eye },
    { id: 'side', label: 'Side Elevation', icon: Maximize2 },
    { id: 'dollhouse', label: 'Dollhouse View', icon: Layers },
    { id: 'walkthrough', label: 'Walkthrough', icon: Camera },
  ];

  const wallColors: { id: WallColor; label: string; hex: string }[] = [
    { id: 'warm_ivory', label: 'Warm Ivory', hex: '#f5f2eb' },
    { id: 'classic_white', label: 'Classic White', hex: '#fafafa' },
    { id: 'sandstone', label: 'Sandstone', hex: '#e8dfd5' },
    { id: 'stone_grey', label: 'Stone Grey', hex: '#d6d3d1' },
    { id: 'sage_green', label: 'Sage Green', hex: '#d1dcd0' },
    { id: 'terracotta', label: 'Terracotta', hex: '#e0a899' },
    { id: 'navy_accent', label: 'Navy Accent', hex: '#1e293b' },
  ];

  const floorFinishes: { id: FloorFinish; label: string }[] = [
    { id: 'light_oak_wood', label: 'Light Oak Wood' },
    { id: 'dark_walnut_wood', label: 'Dark Walnut Wood' },
    { id: 'white_carrara_marble', label: 'Carrara Marble' },
    { id: 'grey_granite', label: 'Grey Granite' },
    { id: 'ceramic_tile', label: 'Ceramic Tile' },
    { id: 'polished_concrete', label: 'Polished Concrete' },
  ];

  return (
    <div
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-full max-w-4xl px-4 transition-all duration-300 pointer-events-auto ${
        collapsed ? 'translate-y-[calc(100%-42px)]' : 'translate-y-0'
      }`}
    >
      <div className="bg-white/95 border border-slate-200/90 shadow-2xl rounded-2xl overflow-hidden backdrop-blur-md">
        {/* Dock Header Bar with Collapse Button */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-slate-50/90 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              3D Architectural Workspace
            </span>
            {selectedRoom && (
              <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-medium border border-emerald-200/80">
                Selected: {selectedRoom.name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onResetToDefaults}
              title="Reset parameters to initial AI generated values"
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-200/60 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset View
            </button>

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 shadow-xs hover:bg-slate-50 transition font-medium"
            >
              {collapsed ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5 text-emerald-600" /> Show Controls
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> Hide Controls
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-100 px-4 bg-white">
          {[
            { id: 'camera', label: 'Camera & Views', icon: Camera },
            { id: 'structure', label: 'Wall & Structure', icon: Sliders },
            { id: 'finishes', label: 'Materials & Colors', icon: Palette },
            { id: 'lighting', label: 'Ambiance', icon: Sun },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition ${
                  isActive
                    ? 'border-emerald-600 text-emerald-700 bg-emerald-50/30'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Panes */}
        <div className="p-4 bg-white/95 min-h-[105px]">
          {/* 1. Camera & Views */}
          {activeTab === 'camera' && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {viewPresets.map((preset) => {
                  const Icon = preset.icon;
                  const isSelected = viewPreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => onViewChange(preset.id)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-medium transition border ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-1" />
                      <span>{preset.label}</span>
                    </button>
                  );
                })}
              </div>

              {viewPreset === 'walkthrough' && (
                <div className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-lg p-2 flex items-center justify-between">
                  <span>
                    🚶 <strong>Walkthrough Active:</strong> Use <strong>W, A, S, D</strong> or Arrow Keys to walk. Drag mouse to look around interior rooms.
                  </span>
                  <button
                    onClick={() => onViewChange('isometric')}
                    className="text-xs font-semibold text-emerald-900 underline hover:no-underline"
                  >
                    Exit Walkthrough
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 2. Wall & Structure */}
          {activeTab === 'structure' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span className="font-medium">Wall Height</span>
                    <span className="font-semibold text-emerald-700">
                      {customOverrides.wallHeight.toFixed(2)} m ({(customOverrides.wallHeight * 3.28084).toFixed(1)} ft)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="2.2"
                    max="4.5"
                    step="0.1"
                    value={customOverrides.wallHeight}
                    onChange={(e) => onUpdateOverrides({ wallHeight: parseFloat(e.target.value) })}
                    className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span className="font-medium">Wall Thickness</span>
                    <span className="font-semibold text-emerald-700">
                      {(customOverrides.wallThickness * 1000).toFixed(0)} mm
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.10"
                    max="0.35"
                    step="0.01"
                    value={customOverrides.wallThickness}
                    onChange={(e) => onUpdateOverrides({ wallThickness: parseFloat(e.target.value) })}
                    className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => onUpdateOverrides({ dollhouseMode: !customOverrides.dollhouseMode })}
                  className={`p-2 rounded-lg border text-left transition font-medium flex items-center justify-between ${
                    customOverrides.dollhouseMode
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <span>Dollhouse Cutaway</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white border">
                    {customOverrides.dollhouseMode ? 'ON' : 'OFF'}
                  </span>
                </button>

                <button
                  onClick={() => onUpdateOverrides({ showFurniture: !customOverrides.showFurniture })}
                  className={`p-2 rounded-lg border text-left transition font-medium flex items-center justify-between ${
                    customOverrides.showFurniture
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <span>3D Furniture</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white border">
                    {customOverrides.showFurniture ? 'ON' : 'OFF'}
                  </span>
                </button>

                <button
                  onClick={() => onUpdateOverrides({ showRoomLabels: !customOverrides.showRoomLabels })}
                  className={`p-2 rounded-lg border text-left transition font-medium flex items-center justify-between ${
                    customOverrides.showRoomLabels
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <span>Room Badges</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white border">
                    {customOverrides.showRoomLabels ? 'ON' : 'OFF'}
                  </span>
                </button>

                <button
                  onClick={() => onUpdateOverrides({ showDimensions: !customOverrides.showDimensions })}
                  className={`p-2 rounded-lg border text-left transition font-medium flex items-center justify-between ${
                    customOverrides.showDimensions
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <span>Dimensions</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white border">
                    {customOverrides.showDimensions ? 'ON' : 'OFF'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* 3. Materials & Colors */}
          {activeTab === 'finishes' && (
            <div className="space-y-3">
              {/* Wall Colors */}
              <div>
                <span className="text-xs font-semibold text-slate-700 mb-2 block">
                  Wall Paint Palette
                </span>
                <div className="flex flex-wrap gap-2">
                  {wallColors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => onUpdateWallColor?.(color.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                        plan.customSettings.globalWallColor === color.id
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs"
                        style={{ backgroundColor: color.hex }}
                      />
                      {color.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Room Floor Finish */}
              {selectedRoom ? (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-xs font-semibold text-slate-700 mb-2 block">
                    Floor Material for &ldquo;{selectedRoom.name}&rdquo;
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {floorFinishes.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => onUpdateRoomFinish?.(selectedRoom.id, f.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium border transition ${
                          selectedRoom.floorFinish === f.id
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="pt-1 text-[11px] text-slate-500 italic">
                  💡 Tip: Click any room floor on the 3D model to assign a specific flooring material (wood parquet, Carrara marble, granite, ceramic tile).
                </div>
              )}
            </div>
          )}

          {/* 4. Ambiance & Lighting */}
          {activeTab === 'lighting' && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-700 block">
                Atmospheric Lighting Simulation
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'daylight', label: 'Natural Daylight', desc: 'Bright exterior sunlight' },
                  { id: 'golden_hour', label: 'Golden Hour', desc: 'Warm dusk architectural glow' },
                  { id: 'studio', label: 'Studio Neutral', desc: 'Clean architectural render' },
                  { id: 'night', label: 'Night Exterior', desc: 'Dark ambient with interior warmth' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onUpdateOverrides({ lightingPreset: item.id as any })}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      customOverrides.lightingPreset === item.id
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs font-semibold">{item.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Box, Home, LayoutDashboard, UploadCloud, Eye, Plus, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentScreen: 'landing' | 'dashboard' | 'upload' | 'analysis' | 'viewer';
  onNavigate: (screen: 'landing' | 'dashboard' | 'upload' | 'analysis' | 'viewer') => void;
  hasActiveProject: boolean;
  activeProjectName?: string;
  unit: 'metric' | 'imperial';
  onToggleUnit: () => void;
  onNewProject: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  onNavigate,
  hasActiveProject,
  activeProjectName,
  unit,
  onToggleUnit,
  onNewProject,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 border-b border-slate-200/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white shadow-md shadow-emerald-900/10 group-hover:scale-105 transition-transform">
            <Box className="w-5 h-5 text-emerald-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-slate-900">
                Teju AI FloorPlan <span className="text-emerald-600 font-extrabold">3D</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200/60">
                PRO CAD
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              Teju Civil Engineer &amp; Architect
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
          <button
            onClick={() => onNavigate('landing')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              currentScreen === 'landing'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            Home
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              currentScreen === 'dashboard'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Dashboard
          </button>
          <button
            onClick={() => onNavigate('upload')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              currentScreen === 'upload'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            Upload Plan
          </button>

          {hasActiveProject && (
            <button
              onClick={() => onNavigate('viewer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                currentScreen === 'viewer'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 hover:text-emerald-800 font-semibold'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              3D Workspace
            </button>
          )}
        </nav>

        {/* Right Action Tools */}
        <div className="flex items-center gap-3">
          {/* Unit Toggle */}
          <button
            onClick={onToggleUnit}
            title="Toggle Metric (Meters / M²) and Imperial (Feet / Sq Ft)"
            className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition"
          >
            {unit === 'metric' ? 'Metric (m)' : 'Imperial (ft)'}
          </button>

          {/* New Project Button */}
          <button
            onClick={onNewProject}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-700/20 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Project</span>
          </button>
        </div>
      </div>
    </header>
  );
};

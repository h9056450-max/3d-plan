/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Plus,
  Search,
  Box,
  Trash2,
  Copy,
  Edit2,
  Download,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  UploadCloud,
} from 'lucide-react';
import { FloorPlanModel } from '../types/floorplan';

interface DashboardProps {
  projects: FloorPlanModel[];
  onOpenProject: (project: FloorPlanModel) => void;
  onEditProjectGeometry: (project: FloorPlanModel) => void;
  onDuplicateProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onRenameProject: (id: string, newName: string) => void;
  onNewProject: () => void;
  onExportProject: (project: FloorPlanModel) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  projects,
  onOpenProject,
  onEditProjectGeometry,
  onDuplicateProject,
  onDeleteProject,
  onRenameProject,
  onNewProject,
  onExportProject,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const filteredProjects = projects.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.clientName && p.clientName.toLowerCase().includes(q))
    );
  });

  const handleStartRename = (project: FloorPlanModel, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingId(project.id);
    setRenameValue(project.name);
  };

  const handleSaveRename = (id: string, e: React.FormEvent) => {
    e.preventDefault();
    if (renameValue.trim()) {
      onRenameProject(id, renameValue.trim());
    }
    setRenamingId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Project Management
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Architectural Projects Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your uploaded 2D floor plans, AI reconstructions, and interactive 3D spaces.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNewProject}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-700/20 transition active:scale-95"
          >
            <UploadCloud className="w-4 h-4" />
            Upload New Floor Plan
          </button>
        </div>
      </div>

      {/* Search & Statistics Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects by name or client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
          />
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
          <span>
            Total Projects: <strong className="text-slate-800">{projects.length}</strong>
          </span>
          <span>•</span>
          <span>
            Ready in 3D: <strong className="text-emerald-700">{projects.length}</strong>
          </span>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed border-slate-300 rounded-2xl">
          <Box className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No projects found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            {searchQuery
              ? `No projects matching "${searchQuery}". Try a different keyword.`
              : 'You have not uploaded any floor plans yet.'}
          </p>
          <button
            onClick={onNewProject}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition"
          >
            <Plus className="w-4 h-4" /> Upload Floor Plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => onOpenProject(project)}
              className="group bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg hover:border-emerald-500/50 transition duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Visual Thumbnail Header */}
                <div className="h-40 bg-slate-900 relative overflow-hidden flex items-center justify-center">
                  {project.originalImage ? (
                    <img
                      src={project.originalImage}
                      alt={project.name}
                      className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <Box className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
                      <span className="text-[11px] font-mono text-slate-300 uppercase tracking-wider">
                        3D Architectural Model
                      </span>
                    </div>
                  )}

                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-xs text-[10px] font-semibold text-white border border-white/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>{project.rooms.length} Rooms</span>
                  </div>

                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold">
                    3D READY
                  </div>
                </div>

                {/* Project Details */}
                <div className="p-5 space-y-3">
                  {renamingId === project.id ? (
                    <form
                      onSubmit={(e) => handleSaveRename(project.id, e)}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1"
                    >
                      <input
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        className="text-sm font-bold border border-emerald-500 rounded px-2 py-1 w-full"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="text-xs bg-emerald-600 text-white px-2 py-1 rounded font-medium"
                      >
                        Save
                      </button>
                    </form>
                  ) : (
                    <div className="flex items-start justify-between">
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition">
                        {project.name}
                      </h3>
                      <button
                        onClick={(e) => handleStartRename(project, e)}
                        title="Rename project"
                        className="p-1 text-slate-400 hover:text-slate-700 rounded opacity-0 group-hover:opacity-100 transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <div className="text-xs text-slate-500 space-y-1">
                    <div className="flex items-center justify-between">
                      <span>Client:</span>
                      <strong className="text-slate-700 font-medium">
                        {project.clientName || 'General Residence'}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Built-up Area:</span>
                      <strong className="text-slate-700 font-medium">
                        {project.overallDimensions.totalAreaSqm.toFixed(1)} m² (
                        {(project.overallDimensions.totalAreaSqm * 10.7639).toFixed(0)} sq ft)
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Dimensions:</span>
                      <strong className="text-slate-700 font-medium">
                        {project.overallDimensions.widthMeters.toFixed(1)}m ×{' '}
                        {project.overallDimensions.lengthMeters.toFixed(1)}m
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditProjectGeometry(project);
                    }}
                    title="Review & edit detected 2D geometry"
                    className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-200/60 transition"
                  >
                    <Layers className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicateProject(project.id);
                    }}
                    title="Duplicate project"
                    className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-200/60 transition"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onExportProject(project);
                    }}
                    title="Export 3D Model / PDF Report"
                    className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-200/60 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Are you sure you want to delete "${project.name}"?`)) {
                        onDeleteProject(project.id);
                      }
                    }}
                    title="Delete project"
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

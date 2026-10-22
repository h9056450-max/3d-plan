/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  FileImage,
  FileText,
  Box,
  Download,
  CheckCircle2,
  Loader2,
  FileCode,
} from 'lucide-react';
import { FloorPlanModel } from '../types/floorplan';
import {
  downloadFile,
  exportToGLB,
  exportToOBJ,
  generatePdfReport,
} from '../services/exportService';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: FloorPlanModel;
  threeScene?: any;
  screenshotDataUrl?: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  plan,
  threeScene,
  screenshotDataUrl,
}) => {
  const [exportingType, setExportingType] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExportPNG = () => {
    if (!screenshotDataUrl) {
      alert('Snapshot not ready yet. Please try again.');
      return;
    }
    setExportingType('png');
    downloadFile(screenshotDataUrl, `${(plan.name || 'FloorPlan').replace(/\s+/g, '_')}_Render.png`);
    setSuccessMsg('PNG 3D View exported successfully!');
    setTimeout(() => {
      setExportingType(null);
      setSuccessMsg(null);
    }, 2000);
  };

  const handleExportPDF = () => {
    setExportingType('pdf');
    try {
      generatePdfReport(plan, screenshotDataUrl);
      setSuccessMsg('Architectural PDF Report generated successfully!');
    } catch (e: any) {
      alert('Error generating PDF: ' + (e.message || e));
    }
    setTimeout(() => {
      setExportingType(null);
      setSuccessMsg(null);
    }, 2000);
  };

  const handleExportGLB = async () => {
    if (!threeScene) {
      alert('3D Scene is not yet initialized.');
      return;
    }
    setExportingType('glb');
    try {
      await exportToGLB(threeScene, (plan.name || 'FloorPlan').replace(/\s+/g, '_'));
      setSuccessMsg('GLB 3D Model exported successfully!');
    } catch (e: any) {
      alert('Error exporting GLB: ' + (e.message || e));
    }
    setTimeout(() => {
      setExportingType(null);
      setSuccessMsg(null);
    }, 2000);
  };

  const handleExportOBJ = () => {
    if (!threeScene) {
      alert('3D Scene is not yet initialized.');
      return;
    }
    setExportingType('obj');
    try {
      exportToOBJ(threeScene, (plan.name || 'FloorPlan').replace(/\s+/g, '_'));
      setSuccessMsg('OBJ 3D Geometry exported successfully!');
    } catch (e: any) {
      alert('Error exporting OBJ: ' + (e.message || e));
    }
    setTimeout(() => {
      setExportingType(null);
      setSuccessMsg(null);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Export 3D Model &amp; Architectural Deliverables
            </h3>
            <p className="text-xs text-slate-500">{plan.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* PNG Snapshot */}
            <div
              onClick={handleExportPNG}
              className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition cursor-pointer group space-y-2"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileImage className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">3D Render Image</h4>
              <p className="text-[11px] text-slate-500">
                High-resolution PNG snapshot from current camera angle.
              </p>
              <button
                type="button"
                className="text-xs font-semibold text-emerald-600 flex items-center gap-1 group-hover:underline pt-1"
              >
                {exportingType === 'png' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                Download PNG
              </button>
            </div>

            {/* Architectural PDF Report */}
            <div
              onClick={handleExportPDF}
              className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition cursor-pointer group space-y-2"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Architectural Report</h4>
              <p className="text-[11px] text-slate-500">
                Complete A4 PDF with room schedule, 3D render &amp; civil disclaimer.
              </p>
              <button
                type="button"
                className="text-xs font-semibold text-amber-700 flex items-center gap-1 group-hover:underline pt-1"
              >
                {exportingType === 'pdf' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                Download PDF
              </button>
            </div>

            {/* GLB 3D Model */}
            <div
              onClick={handleExportGLB}
              className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition cursor-pointer group space-y-2"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Box className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">GLB 3D Model</h4>
              <p className="text-[11px] text-slate-500">
                Binary GLTF with materials for Blender, Unreal, Unity &amp; AR.
              </p>
              <button
                type="button"
                className="text-xs font-semibold text-blue-700 flex items-center gap-1 group-hover:underline pt-1"
              >
                {exportingType === 'glb' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                Download GLB
              </button>
            </div>

            {/* OBJ 3D Model */}
            <div
              onClick={handleExportOBJ}
              className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition cursor-pointer group space-y-2"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileCode className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">OBJ Geometry</h4>
              <p className="text-[11px] text-slate-500">
                Standard Wavefront OBJ format for AutoCAD, SketchUp &amp; Revit.
              </p>
              <button
                type="button"
                className="text-xs font-semibold text-purple-700 flex items-center gap-1 group-hover:underline pt-1"
              >
                {exportingType === 'obj' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                Download OBJ
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

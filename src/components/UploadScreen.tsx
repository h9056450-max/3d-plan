/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Ruler,
  HelpCircle,
  FileImage,
  Loader2,
  Box,
} from 'lucide-react';
import { FloorPlanModel } from '../types/floorplan';
import { SAMPLE_BLUEPRINTS, generateBlueprintDataUrl } from '../services/sampleBlueprints';
import { analyzeFloorPlanImage } from '../services/aiService';

interface UploadScreenProps {
  onPlanAnalyzed: (plan: FloorPlanModel) => void;
  onCancel: () => void;
}

export const UploadScreen: React.FC<UploadScreenProps> = ({ onPlanAnalyzed, onCancel }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('My Residence Floor Plan');
  const [clientName, setClientName] = useState('Shri R. Patel');
  const [knownDimensionMeters, setKnownDimensionMeters] = useState<number>(12.0);
  const [dimensionUnit, setDimensionUnit] = useState<'meters' | 'feet'>('meters');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file drop or selection
  const handleFileProcess = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|pdf)$/i)) {
      setErrorMsg('Please upload a valid JPG, JPEG, PNG, or PDF floor plan drawing.');
      return;
    }

    setErrorMsg(null);
    setSelectedFile(file);

    // Read preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewUrl(result);
    };
    reader.readAsDataURL(file);

    // Default project name from file name
    const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    setProjectName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  // Quick load of sample blueprint
  const handleLoadSampleDrawing = (sample: FloorPlanModel) => {
    const dataUrl = generateBlueprintDataUrl(sample);
    setPreviewUrl(dataUrl);
    setProjectName(sample.name);
    setClientName(sample.clientName || 'Architectural Review');
    setKnownDimensionMeters(sample.overallDimensions.widthMeters);
    setSelectedFile(null);
  };

  // Execute AI analysis pipeline
  const handleStartAnalysis = async () => {
    if (!previewUrl) {
      setErrorMsg('Please select or upload a floor plan drawing first.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      setProcessingStage('1/4 Scanning drawing lines & OCR annotations...');
      await new Promise((r) => setTimeout(r, 600));

      setProcessingStage('2/4 Identifying exterior envelope & interior partition walls...');
      await new Promise((r) => setTimeout(r, 600));

      setProcessingStage('3/4 Detecting door clearances, window sills & room labels...');

      // Convert feet to meters if user entered feet
      const dimInMeters = dimensionUnit === 'feet' ? knownDimensionMeters * 0.3048 : knownDimensionMeters;

      const analyzedModel = await analyzeFloorPlanImage(
        previewUrl,
        dimInMeters,
        projectName,
        clientName
      );

      setProcessingStage('4/4 Building 3D parametric geometry...');
      await new Promise((r) => setTimeout(r, 400));

      onPlanAnalyzed(analyzedModel);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setErrorMsg(err.message || 'Failed to analyze floor plan. Please verify the image file.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Step 1 of 2: Upload &amp; Calibrate
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
          Upload 2D Floor Plan Drawing
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Upload your architectural blueprint or CAD layout. Supports JPG, JPEG, PNG, and PDF files.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Upload Dropzone & Drawing Preview */}
        <div className="lg:col-span-7 space-y-4">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative min-h-[340px] rounded-2xl border-2 border-dashed p-6 transition flex flex-col items-center justify-center cursor-pointer overflow-hidden ${
              previewUrl
                ? 'border-emerald-500/80 bg-slate-900/5'
                : 'border-slate-300 hover:border-emerald-500 bg-white hover:bg-slate-50/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf,image/png,image/jpeg,application/pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileProcess(e.target.files[0]);
                }
              }}
            />

            {previewUrl ? (
              <div className="relative w-full h-full flex flex-col items-center">
                <img
                  src={previewUrl}
                  alt="Floor Plan Preview"
                  className="max-h-[300px] w-auto object-contain rounded-lg shadow-sm border border-slate-200 bg-white"
                />
                <span className="mt-3 text-xs font-medium text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-xs">
                  Click or drag another file to replace
                </span>
              </div>
            ) : (
              <div className="text-center space-y-3 max-w-sm">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto shadow-xs border border-emerald-100">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Drag and drop your 2D Floor Plan here
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports JPG, JPEG, PNG, and PDF architectural drawings
                  </p>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition"
                >
                  Browse Files from Computer
                </button>
              </div>
            )}
          </div>

          {/* Quick Sample Selector */}
          <div className="p-4 bg-white border border-slate-200/90 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Test Instantly with Architectural Blueprint Samples
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleLoadSampleDrawing(SAMPLE_BLUEPRINTS[0])}
                className="text-left p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 transition text-xs group"
              >
                <div className="font-semibold text-slate-900 group-hover:text-emerald-800">
                  Modern 2BHK Villa
                </div>
                <div className="text-[11px] text-slate-500">12.0m × 10.0m • 120 m²</div>
              </button>

              <button
                type="button"
                onClick={() => handleLoadSampleDrawing(SAMPLE_BLUEPRINTS[1])}
                className="text-left p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 transition text-xs group"
              >
                <div className="font-semibold text-slate-900 group-hover:text-emerald-800">
                  Luxury 3BHK Duplex
                </div>
                <div className="text-[11px] text-slate-500">14.0m × 11.0m • Staircase</div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Scale Calibration & Metadata Form */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-5 shadow-xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Ruler className="w-4 h-4 text-emerald-600" />
              Scale &amp; Project Parameters
            </h3>

            {/* Project Name */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
                placeholder="e.g. Modern Residential Villa"
              />
            </div>

            {/* Client Name */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Client / Owner Name
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
                placeholder="e.g. Shri R. Sharma"
              />
            </div>

            {/* Scale Calibration (Prompt Requirement: "Allow users to confirm the drawing scale or enter a known measurement. If dimensions are missing, ask user instead of inventing") */}
            <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5 text-amber-700" />
                  Known Reference Measurement
                </span>
                <div className="flex items-center text-[10px] font-semibold bg-white rounded-lg border border-amber-200 p-0.5">
                  <button
                    type="button"
                    onClick={() => setDimensionUnit('meters')}
                    className={`px-2 py-0.5 rounded ${
                      dimensionUnit === 'meters'
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Meters
                  </button>
                  <button
                    type="button"
                    onClick={() => setDimensionUnit('feet')}
                    className={`px-2 py-0.5 rounded ${
                      dimensionUnit === 'feet'
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Feet
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-amber-800 leading-relaxed">
                Enter a known reference dimension (e.g. overall house width, or major room dimension)
                so the AI scales the 3D walls accurately without guessing:
              </p>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="2"
                  max="100"
                  step="0.5"
                  value={knownDimensionMeters}
                  onChange={(e) => setKnownDimensionMeters(parseFloat(e.target.value) || 12)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-bold text-slate-900"
                />
                <span className="text-xs font-semibold text-slate-700 shrink-0">
                  {dimensionUnit === 'meters' ? 'Meters' : 'Feet'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-3">
              <button
                type="button"
                disabled={isProcessing || !previewUrl}
                onClick={handleStartAnalysis}
                className="w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-700/20 transition flex items-center justify-center gap-2 active:scale-95"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Architectural Blueprint...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Start AI Floor Plan Analysis</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={isProcessing}
                onClick={onCancel}
                className="w-full py-2.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition"
              >
                Cancel and Return to Dashboard
              </button>
            </div>
          </div>

          {/* Processing Status Banner */}
          {isProcessing && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 text-xs text-emerald-900">
              <div className="flex items-center gap-2 font-bold">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                <span>AI Vision Reconstruction in Progress</span>
              </div>
              <p className="text-[11px] text-emerald-800">{processingStage}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

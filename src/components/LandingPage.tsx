/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  UploadCloud,
  Box,
  Layers,
  Compass,
  FileCheck,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import { SAMPLE_BLUEPRINTS } from '../services/sampleBlueprints';
import { FloorPlanModel } from '../types/floorplan';

interface LandingPageProps {
  onStartUpload: () => void;
  onOpenDashboard: () => void;
  onLoadSample: (sample: FloorPlanModel) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartUpload,
  onOpenDashboard,
  onLoadSample,
}) => {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-slate-200/80">
        {/* Subtle architectural grid pattern background */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#1e293b 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Architectural Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-amber-200/80 shadow-xs text-xs font-semibold text-amber-900">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>Teju Civil Engineer &amp; Architect • Automated 2D to 3D CAD</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
              Transform 2D Floor Plans into{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600">
                Interactive 3D Spaces
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
              Upload any architectural blueprint or layout drawing in JPG, PNG, or PDF format.
              Our AI vision pipeline detects walls, doors, windows, and room partitions to generate
              an editable, realistic Three.js 3D model with dollhouse views and walkthroughs.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={onStartUpload}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-700/20 transition active:scale-95"
              >
                <UploadCloud className="w-4 h-4" />
                Upload 2D Floor Plan
              </button>

              <button
                onClick={() => onLoadSample(SAMPLE_BLUEPRINTS[0])}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs transition"
              >
                <Box className="w-4 h-4 text-emerald-600" />
                Preview Sample 3D Villa
              </button>

              <button
                onClick={onOpenDashboard}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 transition"
              >
                Open Dashboard <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Trust Features */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> True Parametric Geometry
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> GLB / OBJ / PDF Reports
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Civil Scale Calibration
              </span>
            </div>
          </div>

          {/* Interactive Preset Blueprint Cards */}
          <div className="mt-14 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                  Ready-to-Test Architectural Blueprints
                </h3>
              </div>
              <span className="text-xs text-slate-500">1-Click Instant 3D Conversion</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {SAMPLE_BLUEPRINTS.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => onLoadSample(sample)}
                  className="group relative bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-emerald-500/50 transition cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200/80 mb-2">
                        {sample.rooms.length} Rooms • {sample.overallDimensions.totalAreaSqm.toFixed(0)} m² Built-up
                      </span>
                      <h4 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition">
                        {sample.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {sample.description}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 group-hover:bg-emerald-600 group-hover:text-white transition">
                      <Box className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      Dimensions: {sample.overallDimensions.widthMeters}m × {sample.overallDimensions.lengthMeters}m
                    </span>
                    <span className="font-semibold text-emerald-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Launch 3D Model <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Steps Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Engineered for Civil Engineering Precision
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            A methodical, verifiable pipeline from raster blueprint to production 3D geometry.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Upload & Scale',
              desc: 'Upload 2D blueprint in JPG, PNG, or PDF. Calibrate scale with a known reference dimension or room width.',
              icon: UploadCloud,
            },
            {
              step: '02',
              title: 'AI Structural Scan',
              desc: 'Gemini multimodal vision segments exterior envelopes, internal partitions, doors, windows, and functional rooms.',
              icon: Compass,
            },
            {
              step: '03',
              title: 'Review & Correct',
              desc: 'Verify detected boundaries, adjust dimensions, review wall classifications, and customize floor materials.',
              icon: FileCheck,
            },
            {
              step: '04',
              title: 'Interactive 3D & Export',
              desc: 'Explore dollhouse and walkthrough views. Download GLB models, OBJ geometry, and professional PDF reports.',
              icon: Layers,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs relative"
              >
                <div className="text-3xl font-black text-slate-200 absolute top-4 right-5 select-none">
                  {item.step}
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Safety & Standards Disclaimer */}
      <section className="py-10 bg-white border-t border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Professional Civil Engineering Safety Standard</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Teju AI FloorPlan 3D generates parametric architectural spatial models to assist civil
            engineers, architects, and property developers in visual design communication.
            All structural elements, load-bearing capacities, and municipal setbacks must be
            independently verified by a registered civil engineer prior to construction.
          </p>
        </div>
      </section>
    </div>
  );
};

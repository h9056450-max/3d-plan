/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { OBJExporter } from 'three/addons/exporters/OBJExporter.js';
import { jsPDF } from 'jspdf';
import { FloorPlanModel } from '../types/floorplan';

/**
 * Downloads a raw blob or data URL as a file on client
 */
export function downloadFile(blobOrUrl: Blob | string, filename: string) {
  const url = typeof blobOrUrl === 'string' ? blobOrUrl : URL.createObjectURL(blobOrUrl);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  if (typeof blobOrUrl !== 'string') {
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

/**
 * Export 3D Scene to GLB binary file
 */
export function exportToGLB(scene: THREE.Scene, filename: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter();
    exporter.parse(
      scene,
      (gltf) => {
        if (gltf instanceof ArrayBuffer) {
          const blob = new Blob([gltf], { type: 'model/gltf-binary' });
          downloadFile(blob, `${filename}.glb`);
          resolve();
        } else {
          const output = JSON.stringify(gltf, null, 2);
          const blob = new Blob([output], { type: 'application/json' });
          downloadFile(blob, `${filename}.gltf`);
          resolve();
        }
      },
      (error) => {
        console.error('An error occurred while exporting GLTF:', error);
        reject(error);
      },
      { binary: true }
    );
  });
}

/**
 * Export 3D Scene to OBJ text format
 */
export function exportToOBJ(scene: THREE.Scene, filename: string): void {
  const exporter = new OBJExporter();
  const result = exporter.parse(scene);
  const blob = new Blob([result], { type: 'text/plain' });
  downloadFile(blob, `${filename}.obj`);
}

/**
 * Generates and downloads an architectural PDF specification report
 */
export function generatePdfReport(plan: FloorPlanModel, screenshotDataUrl?: string): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = 20;

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, cursorY, contentWidth, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('TEJU CIVIL ENGINEER & ARCHITECT', margin + 6, cursorY + 10);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(52, 211, 153); // emerald-400
  doc.text('TEJU AI FLOORPLAN 3D - ARCHITECTURAL SPECIFICATION REPORT', margin + 6, cursorY + 17);

  cursorY += 32;

  // Project Info Table
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(plan.name || 'Architectural Floor Plan Project', margin, cursorY);

  cursorY += 7;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  const clientText = `Client: ${plan.clientName || 'General Residence'}  |  Date: ${new Date().toLocaleDateString()}`;
  const dimText = `Overall Dimensions: ${plan.overallDimensions.widthMeters.toFixed(1)}m × ${plan.overallDimensions.lengthMeters.toFixed(1)}m  |  Total Built-up: ${plan.overallDimensions.totalAreaSqm.toFixed(1)} m² (${(plan.overallDimensions.totalAreaSqm * 10.7639).toFixed(0)} sq ft)`;
  doc.text(clientText, margin, cursorY);
  cursorY += 5;
  doc.text(dimText, margin, cursorY);

  cursorY += 10;

  // Render Image Snapshot
  if (screenshotDataUrl) {
    try {
      const imgHeight = 85;
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.5);
      doc.rect(margin, cursorY, contentWidth, imgHeight);
      doc.addImage(screenshotDataUrl, 'PNG', margin + 1, cursorY + 1, contentWidth - 2, imgHeight - 2);
      cursorY += imgHeight + 8;
    } catch (e) {
      console.warn('Could not embed 3D image into PDF:', e);
    }
  }

  // Room Schedule Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('ROOM SCHEDULE & SPATIAL BREAKDOWN', margin, cursorY);
  cursorY += 6;

  // Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, cursorY, contentWidth, 7, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);

  doc.text('ROOM NAME', margin + 4, cursorY + 5);
  doc.text('CATEGORY', margin + 55, cursorY + 5);
  doc.text('DIMENSIONS', margin + 95, cursorY + 5);
  doc.text('AREA (M² / SQ FT)', margin + 130, cursorY + 5);
  cursorY += 8;

  // Table Rows
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  plan.rooms.forEach((r, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, cursorY - 1, contentWidth, 6, 'F');
    }
    doc.text(r.name, margin + 4, cursorY + 3.5);
    doc.text(r.category.replace('_', ' ').toUpperCase(), margin + 55, cursorY + 3.5);
    doc.text(`${r.dimensions.width.toFixed(1)}m × ${r.dimensions.length.toFixed(1)}m`, margin + 95, cursorY + 3.5);
    doc.text(`${r.dimensions.areaSqm.toFixed(1)} m² (${(r.dimensions.areaSqm * 10.7639).toFixed(0)} sq ft)`, margin + 130, cursorY + 3.5);
    cursorY += 6;
  });

  cursorY += 8;

  // Civil Engineer & Architect Notice / Safety Warning
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(248, 113, 113);
  doc.setLineWidth(0.5);
  doc.rect(margin, cursorY, contentWidth, 18, 'FD');

  doc.setTextColor(153, 27, 27);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('PROFESSIONAL SAFETY & CIVIL VERIFICATION NOTICE', margin + 4, cursorY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(185, 28, 28);
  const disclaimer = 'This document and generated 3D geometry represent a preliminary architectural conversion. All load-bearing walls, column placements, structural dimensions, and municipal setbacks must be physically surveyed and approved by a qualified civil engineer or registered architect prior to construction.';
  doc.text(doc.splitTextToSize(disclaimer, contentWidth - 8), margin + 4, cursorY + 11);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Teju AI FloorPlan 3D  •  Generated for ${plan.clientName || 'Architectural Review'}  •  Page 1 of 1`,
    pageWidth / 2,
    285,
    { align: 'center' }
  );

  doc.save(`${(plan.name || 'FloorPlan').replace(/\s+/g, '_')}_Report.pdf`);
}

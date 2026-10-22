/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// @ts-ignore
import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs';

// Set worker source for pdfjs-dist
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

export interface RenderedPdfResult {
  dataUrl: string;
  width: number;
  height: number;
  pageCount: number;
}

/**
 * Renders a PDF page to a high-resolution PNG image Data URL.
 */
export async function renderPdfPageToImage(
  fileOrBuffer: File | ArrayBuffer,
  pageNumber = 1,
  scale = 2.0
): Promise<RenderedPdfResult> {
  let arrayBuffer: ArrayBuffer;
  if (fileOrBuffer instanceof File) {
    arrayBuffer = await fileOrBuffer.arrayBuffer();
  } else {
    arrayBuffer = fileOrBuffer;
  }

  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdfDoc = await loadingTask.promise;
  const pageCount = pdfDoc.numPages;

  const validPage = Math.min(Math.max(1, pageNumber), pageCount);
  const page = await pdfDoc.getPage(validPage);

  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get 2D canvas context for PDF rendering');
  }

  // Draw white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({
    canvasContext: ctx,
    viewport: viewport,
  }).promise;

  const dataUrl = canvas.toDataURL('image/png');
  return {
    dataUrl,
    width: viewport.width,
    height: viewport.height,
    pageCount,
  };
}

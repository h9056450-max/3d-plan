/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { FloorFinish, WallColor } from '../../types/floorplan';

// Cache for procedural textures to avoid recreating canvas textures
const textureCache = new Map<string, THREE.CanvasTexture>();

function createProceduralWoodTexture(isDark = false): THREE.CanvasTexture {
  const key = isDark ? 'wood-dark' : 'wood-light';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const baseColor = isDark ? '#3e2723' : '#c79c6e';
  const grainColor = isDark ? '#2e1c18' : '#a8794c';

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, 512, 512);

  // Draw wood planks
  const plankH = 64;
  for (let y = 0; y < 512; y += plankH) {
    ctx.strokeStyle = grainColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();

    // Subtle grain lines
    for (let i = 0; i < 6; i++) {
      ctx.strokeStyle = isDark ? 'rgba(0,0,0,0.15)' : 'rgba(90,50,20,0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y + (i + 1) * 9);
      ctx.bezierCurveTo(150, y + (i + 1) * 9 + 4, 350, y + (i + 1) * 9 - 4, 512, y + (i + 1) * 9);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, texture);
  return texture;
}

function createProceduralMarbleTexture(): THREE.CanvasTexture {
  const key = 'marble-white';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, 512, 512);

  // Soft grey marble veins
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(20, 0);
  ctx.bezierCurveTo(180, 140, 220, 260, 390, 512);
  ctx.stroke();

  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(400, 0);
  ctx.bezierCurveTo(340, 180, 180, 320, 100, 512);
  ctx.stroke();

  // Fine vein splits
  ctx.strokeStyle = 'rgba(100, 116, 139, 0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(180, 140);
  ctx.lineTo(260, 180);
  ctx.lineTo(310, 140);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, texture);
  return texture;
}

function createProceduralTileTexture(): THREE.CanvasTexture {
  const key = 'ceramic-tile';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(0, 0, 512, 512);

  // Tile grids with grout lines
  const tileSize = 128;
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 3;

  for (let x = 0; x <= 512; x += tileSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }
  for (let y = 0; y <= 512; y += tileSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, texture);
  return texture;
}

export const WALL_COLORS: Record<WallColor, number> = {
  warm_ivory: 0xf5f2eb,
  classic_white: 0xfafafa,
  stone_grey: 0xd6d3d1,
  sage_green: 0xd1dcd0,
  terracotta: 0xe0a899,
  navy_accent: 0x1e293b,
  sandstone: 0xe8dfd5,
};

export function getFloorMaterial(finish: FloorFinish, isSoftwareGl = false): THREE.Material {
  switch (finish) {
    case 'light_oak_wood':
      return new THREE.MeshStandardMaterial({
        map: isSoftwareGl ? undefined : createProceduralWoodTexture(false),
        color: isSoftwareGl ? 0xd4a373 : 0xffffff,
        roughness: 0.45,
        metalness: 0.05,
      });
    case 'dark_walnut_wood':
      return new THREE.MeshStandardMaterial({
        map: isSoftwareGl ? undefined : createProceduralWoodTexture(true),
        color: isSoftwareGl ? 0x4a3525 : 0xffffff,
        roughness: 0.4,
        metalness: 0.05,
      });
    case 'white_carrara_marble':
      return new THREE.MeshStandardMaterial({
        map: isSoftwareGl ? undefined : createProceduralMarbleTexture(),
        color: 0xffffff,
        roughness: 0.2,
        metalness: 0.1,
      });
    case 'ceramic_tile':
      return new THREE.MeshStandardMaterial({
        map: isSoftwareGl ? undefined : createProceduralTileTexture(),
        color: 0xffffff,
        roughness: 0.25,
        metalness: 0.05,
      });
    case 'grey_granite':
      return new THREE.MeshStandardMaterial({
        color: 0x64748b,
        roughness: 0.4,
        metalness: 0.1,
      });
    case 'polished_concrete':
    default:
      return new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        roughness: 0.5,
        metalness: 0.05,
      });
  }
}

export function getWallMaterial(color: WallColor, isExterior = false): THREE.Material {
  const hex = WALL_COLORS[color] || 0xf5f2eb;
  return new THREE.MeshStandardMaterial({
    color: isExterior ? 0xede8df : hex,
    roughness: isExterior ? 0.75 : 0.6,
    metalness: 0.02,
  });
}

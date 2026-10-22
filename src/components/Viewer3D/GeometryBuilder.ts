/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { FloorPlanModel, RoomData, WallData } from '../../types/floorplan';
import { getFloorMaterial, getWallMaterial } from './ProceduralMaterials';
import {
  createProceduralBed,
  createProceduralSofa,
  createProceduralDiningSet,
  createProceduralCoffeeTable,
  createProceduralKitchenCounter,
  createProceduralBathroomFixtures,
  createProceduralStaircase,
  createProceduralLift,
  createProceduralPoojaAltar,
  createProceduralUtilityAppliances,
  createProceduralWardrobe,
  createProceduralDesk,
  createProceduralArmchair,
} from './ProceduralFurniture';

/**
 * Creates a sprite label displaying text for rooms
 */
function createRoomTextSprite(text: string, subtext: string): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 384;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  // Background pill / badge
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.roundRect(10, 10, 364, 108, 16);
  ctx.fill();
  ctx.strokeStyle = '#059669'; // Emerald border
  ctx.lineWidth = 3;
  ctx.stroke();

  // Primary Room Name
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(text, 192, 54);

  // Subtext (Dimensions / Area)
  ctx.fillStyle = '#94a3b8';
  ctx.font = '18px monospace';
  ctx.fillText(subtext, 192, 90);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(2.2, 0.75, 1);
  return sprite;
}

/**
 * Builds the complete 3D Architectural Scene Group from a FloorPlanModel
 */
export function buildFloorPlan3D(
  plan: FloorPlanModel,
  isSoftwareGl = false,
  overrides?: {
    wallHeight?: number;
    wallThickness?: number;
    showRoof?: boolean;
    showFurniture?: boolean;
    showRoomLabels?: boolean;
    showDimensions?: boolean;
    dollhouseMode?: boolean;
  }
): THREE.Group {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'FloorPlan_Model_' + plan.id;

  const houseW = plan.overallDimensions.widthMeters || 12;
  const houseL = plan.overallDimensions.lengthMeters || 10;
  const centerX = houseW / 2;
  const centerZ = houseL / 2;

  // Transform helper to center the building around (0,0,0)
  const to3D = (p: { x: number; y: number }, y = 0) => new THREE.Vector3(p.x - centerX, y, p.y - centerZ);

  const effectiveWallHeight = overrides?.dollhouseMode
    ? 1.1 // Cut-down walls in dollhouse mode for unobstructed visual inspectability!
    : overrides?.wallHeight ?? plan.customSettings.defaultWallHeight ?? 2.8;

  const showFurniture = overrides?.showFurniture ?? plan.customSettings.showFurniture ?? true;
  const showRoof = !overrides?.dollhouseMode && (overrides?.showRoof ?? plan.customSettings.showRoof ?? false);
  const showRoomLabels = overrides?.showRoomLabels ?? plan.customSettings.showRoomLabels ?? true;
  const showDimensions = overrides?.showDimensions ?? plan.customSettings.showDimensions ?? true;

  // -------------------------------------------------------------
  // 1. Foundation Plinth & Ground Slab
  // -------------------------------------------------------------
  const plinthGeo = new THREE.BoxGeometry(houseW + 1.2, 0.2, houseL + 1.2);
  const plinthMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.7, metalness: 0.05 });
  const plinth = new THREE.Mesh(plinthGeo, plinthMat);
  plinth.position.set(0, -0.1, 0);
  plinth.receiveShadow = true;
  rootGroup.add(plinth);

  // Soft contact shadow ground plane
  const contactGeo = new THREE.PlaneGeometry(houseW + 5, houseL + 5);
  const contactCanvas = document.createElement('canvas');
  contactCanvas.width = 256;
  contactCanvas.height = 256;
  const cctx = contactCanvas.getContext('2d')!;
  const grad = cctx.createRadialGradient(128, 128, 20, 128, 128, 120);
  grad.addColorStop(0, 'rgba(0,0,0,0.4)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  cctx.fillStyle = grad;
  cctx.fillRect(0, 0, 256, 256);
  const contactTex = new THREE.CanvasTexture(contactCanvas);
  const contactMat = new THREE.MeshBasicMaterial({
    map: contactTex,
    transparent: true,
    depthWrite: false,
    opacity: 0.6,
  });
  const contactShadow = new THREE.Mesh(contactGeo, contactMat);
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.y = -0.201;
  rootGroup.add(contactShadow);

  // -------------------------------------------------------------
  // 2. Individual Room Floors & Custom Finishes
  // -------------------------------------------------------------
  plan.rooms.forEach((room) => {
    if (!room.polygon || room.polygon.length < 3) return;

    const shape = new THREE.Shape();
    const p0 = to3D(room.polygon[0]);
    shape.moveTo(p0.x, -p0.z); // Shape coordinate system
    for (let i = 1; i < room.polygon.length; i++) {
      const p = to3D(room.polygon[i]);
      shape.lineTo(p.x, -p.z);
    }
    shape.closePath();

    const floorGeo = new THREE.ShapeGeometry(shape);
    const floorMat = getFloorMaterial(room.floorFinish, isSoftwareGl);
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = Math.PI / 2;
    floorMesh.position.y = 0.01; // offset to prevent z-fighting with plinth
    floorMesh.receiveShadow = true;
    floorMesh.userData = { roomId: room.id, roomName: room.name };
    rootGroup.add(floorMesh);

    // Floating 3D Room Label
    if (showRoomLabels) {
      const roomCenter3D = to3D(room.center);
      const label = createRoomTextSprite(
        room.name,
        `${room.dimensions.width.toFixed(1)}m × ${room.dimensions.length.toFixed(1)}m  (${room.dimensions.areaSqm.toFixed(1)} m²)`
      );
      label.position.set(roomCenter3D.x, effectiveWallHeight + 0.6, roomCenter3D.z);
      rootGroup.add(label);
    }
  });

  // -------------------------------------------------------------
  // 3. Walls with Door and Window Openings
  // -------------------------------------------------------------
  plan.walls.forEach((wall) => {
    const pStart = to3D(wall.start);
    const pEnd = to3D(wall.end);

    const deltaX = pEnd.x - pStart.x;
    const deltaZ = pEnd.z - pStart.z;
    const wallLength = Math.sqrt(deltaX * deltaX + deltaZ * deltaZ);
    if (wallLength < 0.05) return;

    const angle = Math.atan2(deltaZ, deltaX);
    const thickness = overrides?.wallThickness ?? wall.thickness ?? (wall.isExterior ? 0.23 : 0.12);
    const wallMat = getWallMaterial(plan.customSettings.globalWallColor, wall.isExterior);

    // Check if any doors are along this wall segment
    const doorsOnWall = plan.doors.filter((d) => {
      const dp = to3D(d.position);
      // Project door point onto line segment
      const t = ((dp.x - pStart.x) * deltaX + (dp.z - pStart.z) * deltaZ) / (wallLength * wallLength);
      if (t > 0.05 && t < 0.95) {
        // Distance from line
        const projX = pStart.x + t * deltaX;
        const projZ = pStart.z + t * deltaZ;
        const dist = Math.hypot(dp.x - projX, dp.z - projZ);
        return dist < thickness + 0.3;
      }
      return false;
    });

    // Check if any windows are along this wall segment
    const windowsOnWall = plan.windows.filter((win) => {
      const wp = to3D(win.position);
      const t = ((wp.x - pStart.x) * deltaX + (wp.z - pStart.z) * deltaZ) / (wallLength * wallLength);
      if (t > 0.05 && t < 0.95) {
        const projX = pStart.x + t * deltaX;
        const projZ = pStart.z + t * deltaZ;
        const dist = Math.hypot(wp.x - projX, wp.z - projZ);
        return dist < thickness + 0.3;
      }
      return false;
    });

    const wallGroup = new THREE.Group();
    wallGroup.position.set(pStart.x, 0, pStart.z);
    wallGroup.rotation.y = -angle;

    if (doorsOnWall.length === 0 && windowsOnWall.length === 0) {
      // Solid continuous wall
      const geo = new THREE.BoxGeometry(wallLength, effectiveWallHeight, thickness);
      const mesh = new THREE.Mesh(geo, wallMat);
      mesh.position.set(wallLength / 2, effectiveWallHeight / 2, 0);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      wallGroup.add(mesh);
    } else {
      // Wall with architectural cutouts for doors/windows
      // For simplicity and rock-solid geometry, subdivide along length
      const cuts: { start: number; end: number; type: 'door' | 'window'; obj: any }[] = [];

      doorsOnWall.forEach((d) => {
        const dp = to3D(d.position);
        const distFromStart = Math.hypot(dp.x - pStart.x, dp.z - pStart.z);
        cuts.push({
          start: Math.max(0, distFromStart - d.width / 2),
          end: Math.min(wallLength, distFromStart + d.width / 2),
          type: 'door',
          obj: d,
        });
      });

      windowsOnWall.forEach((win) => {
        const wp = to3D(win.position);
        const distFromStart = Math.hypot(wp.x - pStart.x, wp.z - pStart.z);
        cuts.push({
          start: Math.max(0, distFromStart - win.width / 2),
          end: Math.min(wallLength, distFromStart + win.width / 2),
          type: 'window',
          obj: win,
        });
      });

      cuts.sort((a, b) => a.start - b.start);

      let currentX = 0;
      cuts.forEach((cut) => {
        if (cut.start > currentX + 0.05) {
          // Solid wall segment before opening
          const segLen = cut.start - currentX;
          const geo = new THREE.BoxGeometry(segLen, effectiveWallHeight, thickness);
          const mesh = new THREE.Mesh(geo, wallMat);
          mesh.position.set(currentX + segLen / 2, effectiveWallHeight / 2, 0);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          wallGroup.add(mesh);
        }

        const openingWidth = cut.end - cut.start;
        const openingCenter = cut.start + openingWidth / 2;

        if (cut.type === 'door') {
          // Lintel above door if wall is taller than door height
          const doorHeight = Math.min(effectiveWallHeight, cut.obj.height || 2.1);
          if (effectiveWallHeight > doorHeight) {
            const lintelH = effectiveWallHeight - doorHeight;
            const lintelGeo = new THREE.BoxGeometry(openingWidth, lintelH, thickness);
            const lintel = new THREE.Mesh(lintelGeo, wallMat);
            lintel.position.set(openingCenter, doorHeight + lintelH / 2, 0);
            lintel.castShadow = true;
            wallGroup.add(lintel);
          }

          // Door frame & Leaf
          const frameGeo = new THREE.BoxGeometry(openingWidth, doorHeight, thickness * 0.4);
          const doorMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.5 });
          const doorMesh = new THREE.Mesh(frameGeo, doorMat);
          doorMesh.position.set(openingCenter, doorHeight / 2, 0);
          doorMesh.castShadow = true;
          wallGroup.add(doorMesh);

          // Metallic Door Handle
          const handle = new THREE.Mesh(
            new THREE.CylinderGeometry(0.015, 0.015, 0.12, 8),
            new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.2, metalness: 0.85 })
          );
          handle.rotation.z = Math.PI / 2;
          handle.position.set(openingCenter + openingWidth * 0.35, 1.0, thickness * 0.25);
          wallGroup.add(handle);
        } else if (cut.type === 'window') {
          const sillH = cut.obj.sillHeight || 0.9;
          const winH = cut.obj.height || 1.4;

          // Wall below window sill
          if (sillH > 0 && effectiveWallHeight > sillH) {
            const sillWallGeo = new THREE.BoxGeometry(openingWidth, Math.min(sillH, effectiveWallHeight), thickness);
            const sillWall = new THREE.Mesh(sillWallGeo, wallMat);
            sillWall.position.set(openingCenter, Math.min(sillH, effectiveWallHeight) / 2, 0);
            sillWall.castShadow = true;
            wallGroup.add(sillWall);
          }

          // Lintel above window
          if (effectiveWallHeight > sillH + winH) {
            const lintelH = effectiveWallHeight - (sillH + winH);
            const lintelGeo = new THREE.BoxGeometry(openingWidth, lintelH, thickness);
            const lintel = new THREE.Mesh(lintelGeo, wallMat);
            lintel.position.set(openingCenter, sillH + winH + lintelH / 2, 0);
            lintel.castShadow = true;
            wallGroup.add(lintel);
          }

          // Translucent Glass Pane
          if (effectiveWallHeight > sillH) {
            const glassH = Math.min(winH, effectiveWallHeight - sillH);
            const glassGeo = new THREE.BoxGeometry(openingWidth - 0.04, glassH - 0.04, 0.02);
            const glassMat = new THREE.MeshPhysicalMaterial({
              color: 0x93c5fd,
              transparent: true,
              opacity: 0.45,
              roughness: 0.05,
              metalness: 0.1,
            });
            const glass = new THREE.Mesh(glassGeo, glassMat);
            glass.position.set(openingCenter, sillH + glassH / 2, 0);
            wallGroup.add(glass);

            // Window Frame
            const frameGeo = new THREE.BoxGeometry(openingWidth, glassH, thickness * 0.5);
            const frameMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
            const frame = new THREE.Mesh(frameGeo, frameMat);
            frame.position.set(openingCenter, sillH + glassH / 2, 0);
            wallGroup.add(frame);
          }
        }

        currentX = cut.end;
      });

      if (currentX < wallLength - 0.05) {
        const segLen = wallLength - currentX;
        const geo = new THREE.BoxGeometry(segLen, effectiveWallHeight, thickness);
        const mesh = new THREE.Mesh(geo, wallMat);
        mesh.position.set(currentX + segLen / 2, effectiveWallHeight / 2, 0);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        wallGroup.add(mesh);
      }
    }

    rootGroup.add(wallGroup);
  });

  // -------------------------------------------------------------
  // 4. Procedural Furniture Placement
  // -------------------------------------------------------------
  if (showFurniture) {
    // Room-specific furnishings
    plan.rooms.forEach((r) => {
      const rc = to3D(r.center);
      const cat = r.category?.toLowerCase() || '';
      const name = r.name?.toLowerCase() || '';

      if (cat === 'bedroom' || cat === 'master_bedroom') {
        const bed = createProceduralBed(cat === 'master_bedroom' ? 2.0 : 1.6, 2.0);
        bed.position.set(rc.x, 0, rc.z);
        rootGroup.add(bed);

        if (r.furnishings?.some((f) => f.includes('wardrobe') || f.includes('closet'))) {
          const w = createProceduralWardrobe(Math.min(1.8, r.dimensions.width * 0.4));
          w.position.set(rc.x - r.dimensions.width * 0.35, 0, rc.z);
          w.rotation.y = Math.PI / 2;
          rootGroup.add(w);
        }

        if (r.furnishings?.some((f) => f.includes('desk') || f.includes('table'))) {
          const d = createProceduralDesk();
          d.position.set(rc.x + r.dimensions.width * 0.3, 0, rc.z + r.dimensions.length * 0.3);
          rootGroup.add(d);
        }
      } else if (cat === 'living_room') {
        const sofa = createProceduralSofa(Math.min(2.6, r.dimensions.width * 0.6));
        sofa.position.set(rc.x - 0.4, 0, rc.z - 0.4);
        rootGroup.add(sofa);

        const coffee = createProceduralCoffeeTable();
        coffee.position.set(rc.x - 0.4, 0, rc.z + 0.5);
        rootGroup.add(coffee);

        if (r.furnishings?.some((f) => f.includes('armchair') || f.includes('chair'))) {
          const arm = createProceduralArmchair();
          arm.position.set(rc.x + 0.8, 0, rc.z + 0.5);
          arm.rotation.y = -Math.PI / 3;
          rootGroup.add(arm);
        }

        if (r.dimensions.areaSqm > 20 || r.furnishings?.some((f) => f.includes('dining'))) {
          const dining = createProceduralDiningSet();
          dining.position.set(rc.x + 1.4, 0, rc.z - 0.2);
          rootGroup.add(dining);
        }
      } else if (cat === 'dining_room') {
        const dining = createProceduralDiningSet();
        dining.position.set(rc.x, 0, rc.z);
        rootGroup.add(dining);
      } else if (cat === 'kitchen') {
        const counter = createProceduralKitchenCounter(Math.min(2.8, r.dimensions.width * 0.8));
        counter.position.set(rc.x, 0, rc.z);
        rootGroup.add(counter);
      } else if (cat === 'bathroom' || cat === 'attached_bathroom') {
        const fixtures = createProceduralBathroomFixtures();
        fixtures.position.set(rc.x, 0, rc.z);
        rootGroup.add(fixtures);
      } else if (cat === 'pooja_room' || name.includes('pooja') || name.includes('mandir')) {
        const altar = createProceduralPoojaAltar(Math.min(1.4, r.dimensions.width * 0.7));
        altar.position.set(rc.x, 0, rc.z);
        rootGroup.add(altar);
      } else if (cat === 'utility' || name.includes('technic') || name.includes('utility') || name.includes('laundry')) {
        const util = createProceduralUtilityAppliances(Math.min(1.8, r.dimensions.width * 0.8));
        util.position.set(rc.x, 0, rc.z);
        rootGroup.add(util);
      } else if (cat === 'lift' || name.includes('lift') || name.includes('elevator')) {
        const lift = createProceduralLift(r.dimensions.width, r.dimensions.length, effectiveWallHeight);
        lift.position.set(rc.x, 0, rc.z);
        rootGroup.add(lift);
      }
    });

    // Lifts explicitly listed in plan
    (plan.lifts || []).forEach((l) => {
      const lp = to3D(l.position);
      const lift = createProceduralLift(l.width || 1.6, l.depth || 1.6, effectiveWallHeight);
      lift.position.set(lp.x, 0, lp.z);
      rootGroup.add(lift);
    });

    // Explicit furniture items if defined
    plan.furniture.forEach((f) => {
      const pos = to3D(f.position);
      let mesh: THREE.Group | null = null;
      if (f.type === 'bed') mesh = createProceduralBed(f.dimensions.width, f.dimensions.depth);
      else if (f.type === 'sofa') mesh = createProceduralSofa(f.dimensions.width, f.dimensions.depth);
      else if (f.type === 'dining_table') mesh = createProceduralDiningSet(f.dimensions.width, f.dimensions.depth);
      else if (f.type === 'coffee_table') mesh = createProceduralCoffeeTable(f.dimensions.width, f.dimensions.depth);
      else if (f.type === 'kitchen_counter') mesh = createProceduralKitchenCounter(f.dimensions.width, f.dimensions.depth);
      else if (f.type === 'toilet') mesh = createProceduralBathroomFixtures();

      if (mesh) {
        mesh.position.set(pos.x, 0, pos.z);
        mesh.rotation.y = f.rotation;
        rootGroup.add(mesh);
      }
    });
  }

  // -------------------------------------------------------------
  // 5. Stairs
  // -------------------------------------------------------------
  plan.stairs.forEach((st) => {
    const sp = to3D(st.position);
    const stairMesh = createProceduralStaircase(st.width, st.length, effectiveWallHeight, st.stepsCount || 14);
    stairMesh.position.set(sp.x, 0, sp.z);
    rootGroup.add(stairMesh);
  });

  // -------------------------------------------------------------
  // 6. Roof / Slab (Toggled in Dollhouse view)
  // -------------------------------------------------------------
  if (showRoof) {
    const roofGeo = new THREE.BoxGeometry(houseW + 0.4, 0.25, houseL + 0.4);
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0xd1d5db,
      roughness: 0.7,
      metalness: 0.05,
    });
    const roofMesh = new THREE.Mesh(roofGeo, roofMat);
    roofMesh.position.set(0, effectiveWallHeight + 0.125, 0);
    roofMesh.castShadow = true;
    roofMesh.receiveShadow = true;
    rootGroup.add(roofMesh);
  }

  // -------------------------------------------------------------
  // 7. Architectural 3D Dimension Markers
  // -------------------------------------------------------------
  if (showDimensions) {
    const dimGroup = new THREE.Group();
    dimGroup.name = 'Dimensions';

    // Width Dimension Line (Front)
    const dimWGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-centerX, 0.05, centerZ + 0.8),
      new THREE.Vector3(centerX, 0.05, centerZ + 0.8),
    ]);
    const dimMat = new THREE.LineBasicMaterial({ color: 0x059669 });
    const lineW = new THREE.Line(dimWGeo, dimMat);
    dimGroup.add(lineW);

    // Dimension Label
    const dimWLabel = createRoomTextSprite('WIDTH', `${houseW.toFixed(1)} M`);
    dimWLabel.position.set(0, 0.4, centerZ + 1.2);
    dimWLabel.scale.set(1.5, 0.5, 1);
    dimGroup.add(dimWLabel);

    // Length Dimension Line (Side)
    const dimLGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(centerX + 0.8, 0.05, -centerZ),
      new THREE.Vector3(centerX + 0.8, 0.05, centerZ),
    ]);
    const lineL = new THREE.Line(dimLGeo, dimMat);
    dimGroup.add(lineL);

    const dimLLabel = createRoomTextSprite('LENGTH', `${houseL.toFixed(1)} M`);
    dimLLabel.position.set(centerX + 1.2, 0.4, 0);
    dimLLabel.scale.set(1.5, 0.5, 1);
    dimGroup.add(dimLLabel);

    rootGroup.add(dimGroup);
  }

  return rootGroup;
}

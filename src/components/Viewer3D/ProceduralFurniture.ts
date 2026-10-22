/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

// Procedural materials cache
const materials = {
  woodLight: new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.6, metalness: 0.05 }),
  woodDark: new THREE.MeshStandardMaterial({ color: 0x4a3525, roughness: 0.5, metalness: 0.05 }),
  fabricGrey: new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.85, metalness: 0.0 }),
  fabricBeige: new THREE.MeshStandardMaterial({ color: 0xe2d9cc, roughness: 0.9, metalness: 0.0 }),
  fabricCushion: new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.8, metalness: 0.0 }), // Emerald accent
  ceramicWhite: new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.15, metalness: 0.1 }),
  metalChrome: new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.2, metalness: 0.9 }),
  countertopStone: new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.35, metalness: 0.1 }),
  glassTranslucent: new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.45,
    roughness: 0.1,
    metalness: 0.1,
  }),
};

/**
 * Creates a procedural 3D Bed with frame, mattress, pillows, and duvet
 */
export function createProceduralBed(w = 1.8, l = 2.0, h = 0.55): THREE.Group {
  const bedGroup = new THREE.Group();
  bedGroup.name = 'Bed';

  // 1. Bed Frame Base
  const frameGeo = new THREE.BoxGeometry(w, 0.2, l);
  const frame = new THREE.Mesh(frameGeo, materials.woodDark);
  frame.position.y = 0.1;
  frame.castShadow = true;
  frame.receiveShadow = true;
  bedGroup.add(frame);

  // 2. Headboard
  const headboardGeo = new THREE.BoxGeometry(w + 0.1, 0.9, 0.12);
  const headboard = new THREE.Mesh(headboardGeo, materials.woodDark);
  headboard.position.set(0, 0.45, -l / 2 + 0.06);
  headboard.castShadow = true;
  bedGroup.add(headboard);

  // 3. Mattress
  const matGeo = new THREE.BoxGeometry(w - 0.1, 0.25, l - 0.15);
  const mattress = new THREE.Mesh(matGeo, materials.fabricBeige);
  mattress.position.set(0, 0.32, 0.05);
  mattress.castShadow = true;
  bedGroup.add(mattress);

  // 4. Duvet / Quilt Cover
  const duvetGeo = new THREE.BoxGeometry(w - 0.08, 0.08, l * 0.65);
  const duvet = new THREE.Mesh(duvetGeo, materials.fabricGrey);
  duvet.position.set(0, 0.45, l * 0.15);
  duvet.castShadow = true;
  bedGroup.add(duvet);

  // 5 & 6. Two Pillows
  const pillowGeo = new THREE.BoxGeometry(w * 0.38, 0.1, 0.4);
  const pillowL = new THREE.Mesh(pillowGeo, materials.fabricBeige);
  pillowL.position.set(-w * 0.23, 0.48, -l / 2 + 0.35);
  pillowL.castShadow = true;
  bedGroup.add(pillowL);

  const pillowR = new THREE.Mesh(pillowGeo, materials.fabricBeige);
  pillowR.position.set(w * 0.23, 0.48, -l / 2 + 0.35);
  pillowR.castShadow = true;
  bedGroup.add(pillowR);

  return bedGroup;
}

/**
 * Creates a procedural 3D Sofa Sectional with cushions and armrests
 */
export function createProceduralSofa(w = 2.4, d = 0.9, h = 0.75): THREE.Group {
  const sofa = new THREE.Group();
  sofa.name = 'Sofa';

  // Base platform
  const baseGeo = new THREE.BoxGeometry(w, 0.2, d);
  const base = new THREE.Mesh(baseGeo, materials.fabricGrey);
  base.position.y = 0.1;
  base.castShadow = true;
  sofa.add(base);

  // Backrest
  const backGeo = new THREE.BoxGeometry(w, h - 0.2, 0.22);
  const back = new THREE.Mesh(backGeo, materials.fabricGrey);
  back.position.set(0, (h - 0.2) / 2 + 0.2, -d / 2 + 0.11);
  back.castShadow = true;
  sofa.add(back);

  // Armrests Left and Right
  const armGeo = new THREE.BoxGeometry(0.2, h * 0.75, d);
  const armL = new THREE.Mesh(armGeo, materials.fabricGrey);
  armL.position.set(-w / 2 + 0.1, (h * 0.75) / 2, 0);
  armL.castShadow = true;
  sofa.add(armL);

  const armR = new THREE.Mesh(armGeo, materials.fabricGrey);
  armR.position.set(w / 2 - 0.1, (h * 0.75) / 2, 0);
  armR.castShadow = true;
  sofa.add(armR);

  // Seat Cushions (3 cushions)
  const seatWidth = (w - 0.4) / 3;
  for (let i = 0; i < 3; i++) {
    const cushionGeo = new THREE.BoxGeometry(seatWidth - 0.04, 0.16, d - 0.28);
    const cushion = new THREE.Mesh(cushionGeo, materials.fabricBeige);
    cushion.position.set(-w / 2 + 0.2 + (i + 0.5) * seatWidth, 0.28, 0.06);
    cushion.castShadow = true;
    sofa.add(cushion);
  }

  // Accent Throw Pillows
  const throwGeo = new THREE.BoxGeometry(0.12, 0.35, 0.35);
  const throwL = new THREE.Mesh(throwGeo, materials.fabricCushion);
  throwL.position.set(-w / 2 + 0.25, 0.45, -0.05);
  throwL.rotation.y = 0.2;
  throwL.castShadow = true;
  sofa.add(throwL);

  return sofa;
}

/**
 * Creates a procedural 3D Dining Table with 4 Chairs
 */
export function createProceduralDiningSet(w = 1.6, d = 0.9, h = 0.76): THREE.Group {
  const dining = new THREE.Group();
  dining.name = 'DiningSet';

  // Table Top
  const topGeo = new THREE.BoxGeometry(w, 0.06, d);
  const top = new THREE.Mesh(topGeo, materials.woodDark);
  top.position.y = h - 0.03;
  top.castShadow = true;
  dining.add(top);

  // Table Legs
  const legGeo = new THREE.CylinderGeometry(0.035, 0.025, h - 0.06, 8);
  const legPositions = [
    [-w / 2 + 0.1, -d / 2 + 0.1],
    [w / 2 - 0.1, -d / 2 + 0.1],
    [-w / 2 + 0.1, d / 2 - 0.1],
    [w / 2 - 0.1, d / 2 - 0.1],
  ];
  legPositions.forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(legGeo, materials.woodDark);
    leg.position.set(lx, (h - 0.06) / 2, lz);
    leg.castShadow = true;
    dining.add(leg);
  });

  // 4 Chairs
  const chairPositions = [
    [-w * 0.25, -d / 2 - 0.35, 0],
    [w * 0.25, -d / 2 - 0.35, 0],
    [-w * 0.25, d / 2 + 0.35, Math.PI],
    [w * 0.25, d / 2 + 0.35, Math.PI],
  ];

  chairPositions.forEach(([cx, cz, rot]) => {
    const chair = new THREE.Group();
    // Seat
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.04, 0.42), materials.woodLight);
    seat.position.y = 0.45;
    seat.castShadow = true;
    chair.add(seat);
    // Backrest
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.45, 0.04), materials.woodLight);
    back.position.set(0, 0.68, -0.19);
    back.castShadow = true;
    chair.add(back);
    // Legs
    const chairLegGeo = new THREE.CylinderGeometry(0.02, 0.015, 0.45, 6);
    [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]].forEach(([clx, clz]) => {
      const cl = new THREE.Mesh(chairLegGeo, materials.metalChrome);
      cl.position.set(clx, 0.225, clz);
      chair.add(cl);
    });
    chair.position.set(cx, 0, cz);
    chair.rotation.y = rot;
    dining.add(chair);
  });

  return dining;
}

/**
 * Creates a procedural 3D Coffee Table
 */
export function createProceduralCoffeeTable(w = 1.1, d = 0.6, h = 0.42): THREE.Group {
  const table = new THREE.Group();
  table.name = 'CoffeeTable';

  const top = new THREE.Mesh(new THREE.BoxGeometry(w, 0.04, d), materials.woodLight);
  top.position.y = h;
  top.castShadow = true;
  table.add(top);

  const legGeo = new THREE.CylinderGeometry(0.025, 0.02, h, 8);
  [[-w / 2 + 0.08, -d / 2 + 0.08], [w / 2 - 0.08, -d / 2 + 0.08], [-w / 2 + 0.08, d / 2 - 0.08], [w / 2 - 0.08, d / 2 - 0.08]].forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(legGeo, materials.metalChrome);
    leg.position.set(lx, h / 2, lz);
    leg.castShadow = true;
    table.add(leg);
  });

  return table;
}

/**
 * Creates a procedural 3D Kitchen Modular Counter & Sink
 */
export function createProceduralKitchenCounter(w = 2.4, d = 0.65, h = 0.88): THREE.Group {
  const counter = new THREE.Group();
  counter.name = 'KitchenCounter';

  // Base Cabinets
  const base = new THREE.Mesh(new THREE.BoxGeometry(w, h - 0.04, d), materials.woodDark);
  base.position.y = (h - 0.04) / 2;
  base.castShadow = true;
  counter.add(base);

  // Stone Countertop
  const top = new THREE.Mesh(new THREE.BoxGeometry(w + 0.04, 0.04, d + 0.04), materials.countertopStone);
  top.position.y = h - 0.02;
  top.castShadow = true;
  counter.add(top);

  // Chrome Sink Basin
  const sink = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.02, 0.4), materials.metalChrome);
  sink.position.set(-w * 0.25, h, 0);
  counter.add(sink);

  // Chrome Faucet
  const faucet = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.25, 8), materials.metalChrome);
  faucet.position.set(-w * 0.25, h + 0.12, -0.15);
  counter.add(faucet);

  return counter;
}

/**
 * Creates a procedural 3D Modern Toilet & Vanity
 */
export function createProceduralBathroomFixtures(): THREE.Group {
  const bath = new THREE.Group();
  bath.name = 'BathroomFixtures';

  // Toilet bowl
  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.15, 0.42, 16), materials.ceramicWhite);
  bowl.position.set(0, 0.21, 0);
  bowl.castShadow = true;
  bath.add(bowl);

  // Cistern tank
  const cistern = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.2), materials.ceramicWhite);
  cistern.position.set(0, 0.55, -0.2);
  cistern.castShadow = true;
  bath.add(cistern);

  return bath;
}

/**
 * Creates a procedural 3D Architectural Staircase
 */
export function createProceduralStaircase(w = 1.2, l = 3.2, h = 2.8, steps = 14): THREE.Group {
  const stair = new THREE.Group();
  stair.name = 'ArchitecturalStair';

  const riserH = h / steps;
  const treadL = l / steps;

  for (let i = 0; i < steps; i++) {
    // Solid block under step
    const stepGeo = new THREE.BoxGeometry(w, riserH, treadL);
    const step = new THREE.Mesh(stepGeo, materials.woodDark);
    step.position.set(0, (i + 0.5) * riserH, (i + 0.5) * treadL - l / 2);
    step.castShadow = true;
    step.receiveShadow = true;
    stair.add(step);
  }

  // Chrome / Timber Handrail
  const railGeo = new THREE.CylinderGeometry(0.03, 0.03, Math.sqrt(l * l + h * h), 8);
  const handrail = new THREE.Mesh(railGeo, materials.metalChrome);
  handrail.position.set(w / 2 - 0.04, h / 2 + 0.85, 0);
  handrail.rotation.x = Math.atan2(h, l);
  handrail.castShadow = true;
  stair.add(handrail);

  return stair;
}

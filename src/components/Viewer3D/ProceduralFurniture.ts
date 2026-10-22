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

/**
 * Creates a procedural 3D Lift / Elevator Shaft
 */
export function createProceduralLift(w = 1.6, d = 1.6, h = 2.8): THREE.Group {
  const lift = new THREE.Group();
  lift.name = 'ElevatorShaft';

  // Stainless steel shaft enclosure walls
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.35, metalness: 0.6 });
  const doorMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.25, metalness: 0.85 });

  // Rear wall
  const rear = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.08), wallMat);
  rear.position.set(0, h / 2, -d / 2 + 0.04);
  rear.castShadow = true;
  lift.add(rear);

  // Left wall
  const left = new THREE.Mesh(new THREE.BoxGeometry(0.08, h, d), wallMat);
  left.position.set(-w / 2 + 0.04, h / 2, 0);
  left.castShadow = true;
  lift.add(left);

  // Right wall
  const right = new THREE.Mesh(new THREE.BoxGeometry(0.08, h, d), wallMat);
  right.position.set(w / 2 - 0.04, h / 2, 0);
  right.castShadow = true;
  lift.add(right);

  // Front Sliding Doors (with center line)
  const doorW = (w - 0.2) / 2;
  const doorL = new THREE.Mesh(new THREE.BoxGeometry(doorW - 0.02, 2.1, 0.04), doorMat);
  doorL.position.set(-doorW / 2 - 0.01, 1.05, d / 2 - 0.02);
  doorL.castShadow = true;
  lift.add(doorL);

  const doorR = new THREE.Mesh(new THREE.BoxGeometry(doorW - 0.02, 2.1, 0.04), doorMat);
  doorR.position.set(doorW / 2 + 0.01, 1.05, d / 2 - 0.02);
  doorR.castShadow = true;
  lift.add(doorR);

  // Floor Indicator Display & Call Button
  const panelGeo = new THREE.BoxGeometry(0.16, 0.24, 0.02);
  const panelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 });
  const panel = new THREE.Mesh(panelGeo, panelMat);
  panel.position.set(w / 2 - 0.08, 1.3, d / 2 + 0.01);
  lift.add(panel);

  const button = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 0.01, 12),
    new THREE.MeshBasicMaterial({ color: 0x10b981 })
  );
  button.rotation.x = Math.PI / 2;
  button.position.set(w / 2 - 0.08, 1.3, d / 2 + 0.025);
  lift.add(button);

  return lift;
}

/**
 * Creates a procedural 3D Pooja Room Altar / Mandir
 */
export function createProceduralPoojaAltar(w = 1.2, d = 0.6, h = 1.4): THREE.Group {
  const pooja = new THREE.Group();
  pooja.name = 'PoojaMandir';

  const teak = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.45, metalness: 0.05 });
  const brass = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.25, metalness: 0.85 });

  // Base platform
  const base = new THREE.Mesh(new THREE.BoxGeometry(w, 0.3, d), teak);
  base.position.set(0, 0.15, 0);
  base.castShadow = true;
  pooja.add(base);

  // Altar niche back
  const back = new THREE.Mesh(new THREE.BoxGeometry(w, h - 0.3, 0.06), teak);
  back.position.set(0, (h - 0.3) / 2 + 0.3, -d / 2 + 0.03);
  back.castShadow = true;
  pooja.add(back);

  // Stepped pediment / Shikhara canopy
  const top = new THREE.Mesh(new THREE.ConeGeometry(w * 0.45, 0.4, 4), teak);
  top.position.set(0, h + 0.2, 0);
  top.rotation.y = Math.PI / 4;
  top.castShadow = true;
  pooja.add(top);

  // Brass Kalash finial
  const finial = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), brass);
  finial.position.set(0, h + 0.45, 0);
  pooja.add(finial);

  // 2 Brass Diya oil lamps
  [-w * 0.3, w * 0.3].forEach((dx) => {
    const diya = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.04, 0.08, 12), brass);
    diya.position.set(dx, 0.34, 0);
    pooja.add(diya);
  });

  return pooja;
}

/**
 * Creates a procedural 3D Utility / Technic Room Appliance Setup
 */
export function createProceduralUtilityAppliances(w = 1.6, d = 0.7, h = 0.9): THREE.Group {
  const util = new THREE.Group();
  util.name = 'UtilityAppliances';

  // 1. Washing Machine
  const washerGeo = new THREE.BoxGeometry(0.65, 0.88, 0.65);
  const washerMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.3, metalness: 0.1 });
  const washer = new THREE.Mesh(washerGeo, washerMat);
  washer.position.set(-0.4, 0.44, 0);
  washer.castShadow = true;
  util.add(washer);

  // Glass Porthole Door
  const doorGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.03, 24);
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.2, metalness: 0.8 });
  const door = new THREE.Mesh(doorGeo, doorMat);
  door.rotation.x = Math.PI / 2;
  door.position.set(-0.4, 0.45, 0.33);
  util.add(door);

  // 2. Utility Sink & Laundry Cabinet
  const sinkCabinet = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.86, 0.65), materials.woodDark);
  sinkCabinet.position.set(0.4, 0.43, 0);
  sinkCabinet.castShadow = true;
  util.add(sinkCabinet);

  const sinkTop = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.04, 0.67), materials.metalChrome);
  sinkTop.position.set(0.4, 0.88, 0);
  util.add(sinkTop);

  return util;
}

/**
 * Creates a procedural 3D Wardrobe Closet
 */
export function createProceduralWardrobe(w = 1.6, d = 0.6, h = 2.1): THREE.Group {
  const wardrobe = new THREE.Group();
  wardrobe.name = 'Wardrobe';

  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), materials.woodDark);
  body.position.set(0, h / 2, 0);
  body.castShadow = true;
  wardrobe.add(body);

  // Center seam
  const seam = new THREE.Mesh(new THREE.BoxGeometry(0.01, h - 0.1, 0.02), materials.metalChrome);
  seam.position.set(0, h / 2, d / 2 + 0.01);
  wardrobe.add(seam);

  // Handles
  [-0.05, 0.05].forEach((hx) => {
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.2, 0.03), materials.metalChrome);
    handle.position.set(hx, 1.1, d / 2 + 0.02);
    wardrobe.add(handle);
  });

  return wardrobe;
}

/**
 * Creates a procedural 3D Study Desk and Chair
 */
export function createProceduralDesk(w = 1.2, d = 0.6, h = 0.76): THREE.Group {
  const desk = new THREE.Group();
  desk.name = 'Desk';

  const top = new THREE.Mesh(new THREE.BoxGeometry(w, 0.04, d), materials.woodLight);
  top.position.y = h;
  top.castShadow = true;
  desk.add(top);

  // Metal frame legs
  const legGeo = new THREE.BoxGeometry(0.04, h, 0.04);
  [[-w / 2 + 0.04, -d / 2 + 0.04], [w / 2 - 0.04, -d / 2 + 0.04], [-w / 2 + 0.04, d / 2 - 0.04], [w / 2 - 0.04, d / 2 - 0.04]].forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(legGeo, materials.metalChrome);
    leg.position.set(lx, h / 2, lz);
    leg.castShadow = true;
    desk.add(leg);
  });

  // Laptop / Monitor
  const screen = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 0.02), new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 }));
  screen.position.set(0, h + 0.15, -0.1);
  desk.add(screen);

  return desk;
}

/**
 * Creates a procedural 3D Armchair
 */
export function createProceduralArmchair(w = 0.85, d = 0.85, h = 0.75): THREE.Group {
  const chair = new THREE.Group();
  chair.name = 'Armchair';

  const seat = new THREE.Mesh(new THREE.BoxGeometry(w, 0.2, d), materials.fabricGrey);
  seat.position.y = 0.25;
  seat.castShadow = true;
  chair.add(seat);

  const back = new THREE.Mesh(new THREE.BoxGeometry(w, h - 0.2, 0.18), materials.fabricGrey);
  back.position.set(0, (h - 0.2) / 2 + 0.25, -d / 2 + 0.09);
  back.castShadow = true;
  chair.add(back);

  // Armrests
  [-w / 2 + 0.08, w / 2 - 0.08].forEach((ax) => {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.16, h * 0.65, d), materials.fabricGrey);
    arm.position.set(ax, (h * 0.65) / 2, 0);
    arm.castShadow = true;
    chair.add(arm);
  });

  return chair;
}


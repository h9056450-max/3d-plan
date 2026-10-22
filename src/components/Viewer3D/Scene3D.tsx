/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { FloorPlanModel, ViewPreset } from '../../types/floorplan';
import { buildFloorPlan3D } from './GeometryBuilder';

interface Scene3DProps {
  plan: FloorPlanModel;
  viewPreset: ViewPreset;
  customOverrides: {
    wallHeight: number;
    wallThickness: number;
    showRoof: boolean;
    showFurniture: boolean;
    showRoomLabels: boolean;
    showDimensions: boolean;
    dollhouseMode: boolean;
    lightingPreset: 'daylight' | 'golden_hour' | 'studio' | 'night';
  };
  selectedRoomId?: string | null;
  onSelectRoom?: (roomId: string | null) => void;
  onSceneReady?: (api: { captureScreenshot: () => string; getThreeScene: () => THREE.Scene; getThreeRenderer: () => THREE.WebGLRenderer }) => void;
}

export const Scene3D: React.FC<Scene3DProps> = ({
  plan,
  viewPreset,
  customOverrides,
  selectedRoomId,
  onSelectRoom,
  onSceneReady,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const animFrameRef = useRef<number>(0);
  const keyStateRef = useRef<Record<string, boolean>>({});

  // Raycaster for room selection
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  // Camera animation target values for smooth damping
  const cameraTargetPos = useRef<THREE.Vector3>(new THREE.Vector3(12, 12, 14));
  const controlsTargetPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.2, 0));

  const [walkthroughActive, setWalkthroughActive] = useState(false);

  // -------------------------------------------------------------
  // Setup Three.js scene once
  // -------------------------------------------------------------
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Detect software WebGL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Initialize Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true, // for crystal-clear snapshot export
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(container.clientWidth, container.clientHeight);

    // Clear previous children and append canvas
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Initialize Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1f5f9); // architectural soft mist grey
    scene.fog = new THREE.FogExp2(0xf1f5f9, 0.015);
    sceneRef.current = scene;

    // 4. Studio Environment Reflection via RoomEnvironment
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    // 5. Camera & OrbitControls
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      500
    );
    camera.position.set(12, 12, 14);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2 + 0.05; // Prevent flipping under ground
    controls.minDistance = 1;
    controls.maxDistance = 80;
    controls.target.set(0, 1.2, 0);
    controlsRef.current = controls;

    // 6. Balanced 3-Point Architectural Lighting
    const ambientLight = new THREE.HemisphereLight(0xffffff, 0x94a3b8, 0.7);
    ambientLight.name = 'HemisphereLight';
    scene.add(ambientLight);

    const dirKeyLight = new THREE.DirectionalLight(0xfffaf0, 1.8);
    dirKeyLight.name = 'KeyLight';
    dirKeyLight.position.set(15, 25, 15);
    dirKeyLight.castShadow = !isSoftwareGl;
    dirKeyLight.shadow.mapSize.width = 2048;
    dirKeyLight.shadow.mapSize.height = 2048;
    dirKeyLight.shadow.camera.near = 0.5;
    dirKeyLight.shadow.camera.far = 70;
    const d = 16;
    dirKeyLight.shadow.camera.left = -d;
    dirKeyLight.shadow.camera.right = d;
    dirKeyLight.shadow.camera.top = d;
    dirKeyLight.shadow.camera.bottom = -d;
    dirKeyLight.shadow.bias = -0.0005;
    dirKeyLight.shadow.normalBias = 0.02;
    scene.add(dirKeyLight);

    const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.6);
    fillLight.name = 'FillLight';
    fillLight.position.set(-15, 15, -15);
    scene.add(fillLight);

    // 7. Render Loop with Frame-Rate Independent Damping
    const clock = new THREE.Clock();
    let isTransitioningCamera = true;

    controls.addEventListener('start', () => {
      isTransitioningCamera = false;
    });

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);

      // Camera smooth glide towards preset target if transitioning
      if (isTransitioningCamera && camera && controls) {
        camera.position.lerp(cameraTargetPos.current, 0.08);
        controls.target.lerp(controlsTargetPos.current, 0.08);
        if (
          camera.position.distanceTo(cameraTargetPos.current) < 0.05 &&
          controls.target.distanceTo(controlsTargetPos.current) < 0.05
        ) {
          isTransitioningCamera = false;
        }
      }

      // First-person walkthrough keyboard movement
      if (walkthroughActive && camera && controls) {
        const moveSpeed = 4.0 * delta;
        const forward = new THREE.Vector3();
        camera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();
        const side = new THREE.Vector3().crossVectors(camera.up, forward).normalize();

        if (keyStateRef.current['KeyW'] || keyStateRef.current['ArrowUp']) {
          camera.position.addScaledVector(forward, moveSpeed);
          controls.target.addScaledVector(forward, moveSpeed);
        }
        if (keyStateRef.current['KeyS'] || keyStateRef.current['ArrowDown']) {
          camera.position.addScaledVector(forward, -moveSpeed);
          controls.target.addScaledVector(forward, -moveSpeed);
        }
        if (keyStateRef.current['KeyA'] || keyStateRef.current['ArrowLeft']) {
          camera.position.addScaledVector(side, moveSpeed);
          controls.target.addScaledVector(side, moveSpeed);
        }
        if (keyStateRef.current['KeyD'] || keyStateRef.current['ArrowRight']) {
          camera.position.addScaledVector(side, -moveSpeed);
          controls.target.addScaledVector(side, -moveSpeed);
        }
        camera.position.y = 1.65; // keep human eye level
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // 8. Keyboard listener for Walkthrough
    const onKeyDown = (e: KeyboardEvent) => {
      keyStateRef.current[e.code] = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keyStateRef.current[e.code] = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // 9. Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Expose capture and scene APIs
    if (onSceneReady) {
      onSceneReady({
        captureScreenshot: () => {
          renderer.render(scene, camera);
          return renderer.domElement.toDataURL('image/png');
        },
        getThreeScene: () => scene,
        getThreeRenderer: () => renderer,
      });
    }

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // -------------------------------------------------------------
  // Rebuild 3D Model when plan or visual options change
  // -------------------------------------------------------------
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Remove old model
    if (modelGroupRef.current) {
      scene.remove(modelGroupRef.current);
    }

    // Build new 3D model
    const newGroup = buildFloorPlan3D(plan, false, {
      wallHeight: customOverrides.wallHeight,
      wallThickness: customOverrides.wallThickness,
      showRoof: customOverrides.showRoof,
      showFurniture: customOverrides.showFurniture,
      showRoomLabels: customOverrides.showRoomLabels,
      showDimensions: customOverrides.showDimensions,
      dollhouseMode: customOverrides.dollhouseMode,
    });

    modelGroupRef.current = newGroup;
    scene.add(newGroup);
  }, [plan, customOverrides]);

  // -------------------------------------------------------------
  // Adjust Lighting Preset
  // -------------------------------------------------------------
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const keyLight = scene.getObjectByName('KeyLight') as THREE.DirectionalLight;
    const hemiLight = scene.getObjectByName('HemisphereLight') as THREE.HemisphereLight;
    if (!keyLight || !hemiLight) return;

    switch (customOverrides.lightingPreset) {
      case 'golden_hour':
        keyLight.color.setHex(0xffaa44);
        keyLight.intensity = 2.2;
        hemiLight.color.setHex(0xffeedd);
        hemiLight.groundColor.setHex(0x553311);
        scene.background = new THREE.Color(0xfef3c7);
        break;
      case 'night':
        keyLight.color.setHex(0x38bdf8);
        keyLight.intensity = 0.5;
        hemiLight.color.setHex(0x1e293b);
        hemiLight.groundColor.setHex(0x0f172a);
        scene.background = new THREE.Color(0x0f172a);
        break;
      case 'studio':
        keyLight.color.setHex(0xffffff);
        keyLight.intensity = 1.5;
        hemiLight.color.setHex(0xf8fafc);
        hemiLight.groundColor.setHex(0x64748b);
        scene.background = new THREE.Color(0xe2e8f0);
        break;
      case 'daylight':
      default:
        keyLight.color.setHex(0xfffaf0);
        keyLight.intensity = 1.8;
        hemiLight.color.setHex(0xffffff);
        hemiLight.groundColor.setHex(0x94a3b8);
        scene.background = new THREE.Color(0xf1f5f9);
        break;
    }
  }, [customOverrides.lightingPreset]);

  // -------------------------------------------------------------
  // Adjust Camera for View Preset
  // -------------------------------------------------------------
  useEffect(() => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    const houseW = plan.overallDimensions.widthMeters || 12;
    const houseL = plan.overallDimensions.lengthMeters || 10;
    const wallH = customOverrides.wallHeight || 2.8;

    setWalkthroughActive(viewPreset === 'walkthrough');

    switch (viewPreset) {
      case 'isometric':
        cameraTargetPos.current.set(houseW * 1.1, houseW * 1.1, houseL * 1.1);
        controlsTargetPos.current.set(0, wallH * 0.5, 0);
        break;
      case 'top':
        cameraTargetPos.current.set(0, Math.max(houseW, houseL) * 1.8, 0.01);
        controlsTargetPos.current.set(0, 0, 0);
        break;
      case 'front':
        cameraTargetPos.current.set(0, wallH * 0.8, houseL * 1.6);
        controlsTargetPos.current.set(0, wallH * 0.5, 0);
        break;
      case 'side':
        cameraTargetPos.current.set(houseW * 1.6, wallH * 0.8, 0);
        controlsTargetPos.current.set(0, wallH * 0.5, 0);
        break;
      case 'dollhouse':
        cameraTargetPos.current.set(houseW * 0.9, houseW * 0.95, houseL * 0.9);
        controlsTargetPos.current.set(0, 0.5, 0);
        break;
      case 'walkthrough':
        // Place user inside first room or living room at human eye height
        const firstRoom = plan.rooms[0];
        const rx = firstRoom ? firstRoom.center.x - houseW / 2 : 0;
        const rz = firstRoom ? firstRoom.center.y - houseL / 2 : 0;
        cameraTargetPos.current.set(rx, 1.65, rz);
        controlsTargetPos.current.set(rx + 1, 1.65, rz);
        break;
    }
  }, [viewPreset, plan, customOverrides.wallHeight]);

  // -------------------------------------------------------------
  // Pointer click for room selection
  // -------------------------------------------------------------
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current || !cameraRef.current || !sceneRef.current || viewPreset === 'walkthrough') return;

    const rect = containerRef.current.getBoundingClientRect();
    mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.current.setFromCamera(mouse.current, cameraRef.current);
    const intersects = raycaster.current.intersectObjects(sceneRef.current.children, true);

    for (const hit of intersects) {
      if (hit.object.userData?.roomId) {
        onSelectRoom?.(hit.object.userData.roomId);
        return;
      }
    }
    // Clicked outside any room
    onSelectRoom?.(null);
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      className="relative w-full h-full overflow-hidden select-none cursor-grab active:cursor-grabbing outline-none"
    />
  );
};

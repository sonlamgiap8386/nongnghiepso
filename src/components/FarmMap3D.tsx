import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { FarmParcel } from '../types';
import {
  Maximize2,
  Minimize2,
  RotateCcw,
  Sun,
  CloudRain,
  Droplets,
  AlertTriangle,
  Calendar,
  Sparkles,
  Compass,
  Plus,
  Minus,
  Activity,
  Thermometer,
} from 'lucide-react';

interface FarmMap3DProps {
  parcels: FarmParcel[];
  selectedParcelId?: string | null;
  onSelectParcel: (parcel: FarmParcel | null | any) => void;
  onScheduleTask?: (parcel: FarmParcel) => void;
  compact?: boolean;
}

export const FarmMap3D: React.FC<FarmMap3DProps> = ({
  parcels,
  selectedParcelId,
  onSelectParcel,
  onScheduleTask,
  compact = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeLayer, setActiveLayer] = useState<'crops' | 'moisture' | 'health'>('crops');
  const [weatherMode, setWeatherMode] = useState<'sunny' | 'rainy' | 'sunset'>('sunny');
  const [viewAngle, setViewAngle] = useState<'iso' | 'top' | 'low'>('iso');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredParcel, setHoveredParcel] = useState<FarmParcel | null>(null);

  const selectedParcel = parcels.find((p) => p.id === selectedParcelId) || null;

  // Three.js instances ref
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const parcelMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const animationFrameId = useRef<number | null>(null);
  const rainParticlesRef = useRef<THREE.Points | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const canalMeshRef = useRef<THREE.Mesh | null>(null);

  // Helper to get parcel color based on active layer
  const getParcelColor = useCallback(
    (parcel: FarmParcel, layer: 'crops' | 'moisture' | 'health') => {
      if (layer === 'moisture') {
        if (parcel.soilMoisture < 40) return '#ef4444';
        if (parcel.soilMoisture < 55) return '#f59e0b';
        if (parcel.soilMoisture <= 75) return '#10b981';
        return '#0284c7';
      }
      if (layer === 'health') {
        return parcel.healthScore > 90
          ? '#10b981'
          : parcel.healthScore > 75
          ? '#84cc16'
          : '#f97316';
      }
      return parcel.color;
    },
    []
  );

  // 1. One-time Scene & Renderer Initialization
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || (compact ? 288 : 450);

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xe8f5e9);
    scene.fog = new THREE.FogExp2(0xecfdf5, 0.02);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(24, 28, 28);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const sunLight = new THREE.DirectionalLight(0xfffbeb, 1.6);
    sunLight.position.set(20, 35, 15);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    const d = 25;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    const fillLight = new THREE.DirectionalLight(0x86efac, 0.4);
    fillLight.position.set(-15, 10, -15);
    scene.add(fillLight);

    // 5. Farm Base Island
    const baseGeo = new THREE.BoxGeometry(32, 1.2, 32);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x6b4423,
      roughness: 0.9,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.7;
    baseMesh.receiveShadow = true;
    scene.add(baseMesh);

    // Grass edge trim
    const trimGeo = new THREE.BoxGeometry(32.4, 0.2, 32.4);
    const trimMat = new THREE.MeshStandardMaterial({ color: 0x1e3a1e, roughness: 0.8 });
    const trimMesh = new THREE.Mesh(trimGeo, trimMat);
    trimMesh.position.y = -0.1;
    scene.add(trimMesh);

    // Water Canal
    const canalGeo = new THREE.BoxGeometry(28, 0.4, 1.8);
    const canalMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.3,
      roughness: 0.1,
      transparent: true,
      opacity: 0.88,
    });
    const canalMesh = new THREE.Mesh(canalGeo, canalMat);
    canalMesh.position.set(0, 0.05, 11);
    canalMesh.receiveShadow = true;
    scene.add(canalMesh);
    canalMeshRef.current = canalMesh;

    // Agricultural Roads / Paths
    const roadMat = new THREE.MeshStandardMaterial({ color: 0xded1b3, roughness: 0.9 });
    const roadX = new THREE.Mesh(new THREE.BoxGeometry(28, 0.08, 1.2), roadMat);
    roadX.position.set(0, 0.04, 0);
    roadX.receiveShadow = true;
    scene.add(roadX);

    const roadZ = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 24), roadMat);
    roadZ.position.set(0, 0.04, 0);
    roadZ.receiveShadow = true;
    scene.add(roadZ);

    // IoT Sensor Windmill Station in center corner
    const towerGeo = new THREE.CylinderGeometry(0.2, 0.4, 3, 6);
    const towerMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
    const towerMesh = new THREE.Mesh(towerGeo, towerMat);
    towerMesh.position.set(0, 1.5, 0);
    towerMesh.castShadow = true;
    scene.add(towerMesh);

    // 6. Rain Particle System
    const rainCount = 1200;
    const rainGeo = new THREE.BufferGeometry();
    const rainPositions = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount * 3; i += 3) {
      rainPositions[i] = (Math.random() - 0.5) * 35;
      rainPositions[i + 1] = Math.random() * 25 + 2;
      rainPositions[i + 2] = (Math.random() - 0.5) * 35;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
    const rainMat = new THREE.PointsMaterial({
      color: 0x60a5fa,
      size: 0.15,
      transparent: true,
      opacity: 0.75,
    });
    const rainSystem = new THREE.Points(rainGeo, rainMat);
    rainSystem.visible = false;
    scene.add(rainSystem);
    rainParticlesRef.current = rainSystem;

    // 7. Parcels Group
    const parcelGroup = new THREE.Group();
    parcelGroup.name = 'parcelGroup';
    scene.add(parcelGroup);
    parcelMeshesRef.current.clear();

    parcels.forEach((parcel) => {
      const coords = parcel.threeCoordinates;
      const initialColor = parcel.color;
      const heightVal = 0.35;

      const pGeo = new THREE.BoxGeometry(coords.width, heightVal, coords.depth);
      const pMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(initialColor),
        roughness: 0.65,
        metalness: parcel.cropType === 'Mặt nước' ? 0.35 : 0.05,
      });

      const pMesh = new THREE.Mesh(pGeo, pMat);
      pMesh.position.set(coords.x, heightVal / 2, coords.z);
      pMesh.castShadow = true;
      pMesh.receiveShadow = true;
      pMesh.userData = { parcelId: parcel.id, parcel, baseHeight: heightVal };

      // Crop-specific 3D decorations for Chũ fruit orchards
      if (
        parcel.cropType.includes('Vải') ||
        parcel.cropType.includes('Cam') ||
        parcel.cropType.includes('Bưởi') ||
        parcel.cropType.includes('Táo') ||
        parcel.cropType.includes('Ổi')
      ) {
        const fruitColor = parcel.cropType.includes('Vải')
          ? 0xe11d48 // Ruby red litchi
          : parcel.cropType.includes('Cam')
          ? 0xf97316 // Bright orange
          : parcel.cropType.includes('Diễn')
          ? 0xfacc15 // Golden yellow pomelo
          : parcel.cropType.includes('Táo')
          ? 0xa3e635 // Apple lime green
          : parcel.cropType.includes('Ổi')
          ? 0xffffff // Foam wrapped guava
          : 0x22c55e;

        for (let i = 0; i < 2; i++) {
          for (let j = 0; j < 2; j++) {
            const trunk = new THREE.Mesh(
              new THREE.CylinderGeometry(0.09, 0.12, 0.5, 6),
              new THREE.MeshStandardMaterial({ color: 0x5c3a21 })
            );
            trunk.position.set(
              -coords.width / 4 + i * (coords.width / 2),
              heightVal / 2 + 0.25,
              -coords.depth / 4 + j * (coords.depth / 2)
            );
            // Foliage dome
            const foliage = new THREE.Mesh(
              new THREE.DodecahedronGeometry(0.42, 1),
              new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.6 })
            );
            foliage.position.y = 0.38;

            // Fruit spheres hanging
            for (let f = 0; f < 3; f++) {
              const fruit = new THREE.Mesh(
                new THREE.SphereGeometry(0.09, 6, 6),
                new THREE.MeshStandardMaterial({ color: fruitColor, roughness: 0.3 })
              );
              fruit.position.set(
                (Math.random() - 0.5) * 0.45,
                (Math.random() - 0.5) * 0.25 - 0.1,
                (Math.random() - 0.5) * 0.45
              );
              foliage.add(fruit);
            }

            trunk.add(foliage);
            pMesh.add(trunk);
          }
        }
      } else if (parcel.cropType === 'Nhà kính') {
        const ghFrameGeo = new THREE.BoxGeometry(coords.width - 0.4, 0.9, coords.depth - 0.4);
        const ghFrameMat = new THREE.MeshPhysicalMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.55,
          roughness: 0.1,
          transmission: 0.75,
          thickness: 0.5,
        });
        const ghMesh = new THREE.Mesh(ghFrameGeo, ghFrameMat);
        ghMesh.position.set(0, heightVal / 2 + 0.45, 0);
        pMesh.add(ghMesh);

        const roofGeo = new THREE.ConeGeometry(coords.width / 2 - 0.2, 0.5, 4);
        roofGeo.rotateY(Math.PI / 4);
        const roofMesh = new THREE.Mesh(roofGeo, ghFrameMat);
        roofMesh.position.set(0, heightVal / 2 + 1.15, 0);
        roofMesh.scale.set(1, 0.8, coords.depth / coords.width);
        pMesh.add(roofMesh);
      } else if (parcel.cropType === 'Ngô') {
        for (let r = -coords.depth / 2 + 0.7; r <= coords.depth / 2 - 0.7; r += 0.9) {
          const cornStalk = new THREE.Mesh(
            new THREE.BoxGeometry(coords.width - 0.8, 0.35, 0.12),
            new THREE.MeshStandardMaterial({ color: 0xeab308 })
          );
          cornStalk.position.set(0, heightVal / 2 + 0.18, r);
          pMesh.add(cornStalk);
        }
      }

      // Live IoT Sensor Beacon
      const sensorPole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.8),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8 })
      );
      sensorPole.position.set(coords.width / 2 - 0.4, heightVal / 2 + 0.4, coords.depth / 2 - 0.4);
      const sensorLight = new THREE.Mesh(
        new THREE.SphereGeometry(0.12),
        new THREE.MeshBasicMaterial({ color: parcel.needsAttention ? 0xef4444 : 0x10b981 })
      );
      sensorLight.position.y = 0.4;
      sensorPole.add(sensorLight);
      pMesh.add(sensorPole);

      // Warning beacon for Attention Parcels
      if (parcel.needsAttention) {
        const beaconGeo = new THREE.OctahedronGeometry(0.38, 0);
        const beaconMat = new THREE.MeshStandardMaterial({
          color: 0xef4444,
          emissive: 0xdc2626,
          emissiveIntensity: 0.9,
        });
        const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
        beaconMesh.position.set(0, heightVal + 0.9, 0);
        beaconMesh.name = 'beacon';
        pMesh.add(beaconMesh);
      }

      parcelGroup.add(pMesh);
      parcelMeshesRef.current.set(parcel.id, pMesh);
    });

    // 8. Raycaster for clicking & hovering
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(parcelGroup.children, true);

      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj && !obj.userData?.parcelId && obj.parent) {
          obj = obj.parent;
        }
        if (obj?.userData?.parcel) {
          setHoveredParcel(obj.userData.parcel);
          document.body.style.cursor = 'pointer';
          return;
        }
      }
      setHoveredParcel(null);
      document.body.style.cursor = 'default';
    };

    const onPointerDown = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(parcelGroup.children, true);

      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj && !obj.userData?.parcelId && obj.parent) {
          obj = obj.parent;
        }
        if (obj?.userData?.parcel) {
          onSelectParcel(obj.userData.parcel);
        }
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener('pointermove', onPointerMove);
    dom.addEventListener('pointerdown', onPointerDown);

    // 9. Orbit drag controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onDragStart = (e: MouseEvent) => {
      if (e.button !== 0) return;
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onDragMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      scene.rotation.y += deltaX * 0.005;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onDragEnd = () => {
      isDragging = false;
    };

    dom.addEventListener('mousedown', onDragStart);
    window.addEventListener('mousemove', onDragMove);
    window.addEventListener('mouseup', onDragEnd);

    // 10. Animation Loop
    const clock = new THREE.Clock();
    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Beacon rotation
      parcelGroup.children.forEach((mesh) => {
        const beacon = mesh.getObjectByName('beacon');
        if (beacon) {
          beacon.rotation.y += 0.04;
          beacon.position.y = 1.2 + Math.sin(elapsedTime * 3) * 0.15;
        }
      });

      // Rain animation
      if (rainParticlesRef.current && rainParticlesRef.current.visible) {
        const positions = rainParticlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 1; i < positions.length; i += 3) {
          positions[i] -= 0.6;
          if (positions[i] < 0) positions[i] = 25;
        }
        rainParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Water gentle shimmer
      if (canalMeshRef.current) {
        canalMeshRef.current.position.y = 0.05 + Math.sin(elapsedTime * 2) * 0.01;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 11. High-Performance ResizeObserver
    const resizeObserver = new ResizeObserver(() => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight || (compact ? 288 : 450);
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    });
    resizeObserver.observe(container);

    // Cleanup resources cleanly when component actually unmounts
    return () => {
      resizeObserver.disconnect();
      dom.removeEventListener('pointermove', onPointerMove);
      dom.removeEventListener('pointerdown', onPointerDown);
      dom.removeEventListener('mousedown', onDragStart);
      window.removeEventListener('mousemove', onDragMove);
      window.removeEventListener('mouseup', onDragEnd);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);

      // Recursive disposal of Three.js objects
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Points) {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach((m) => m.dispose());
            } else {
              obj.material.dispose();
            }
          }
        }
      });

      renderer.dispose();
      document.body.style.cursor = 'default';
    };
  }, [parcels, compact, onSelectParcel]);

  // 2. Reactive Update for Active Layer & Selection (ZERO FLICKER, NO REBUILDING)
  useEffect(() => {
    parcelMeshesRef.current.forEach((mesh, parcelId) => {
      const parcel = parcels.find((p) => p.id === parcelId);
      if (!parcel) return;

      const colorHex = getParcelColor(parcel, activeLayer);
      if (mesh.material instanceof THREE.MeshStandardMaterial) {
        mesh.material.color.set(colorHex);
      }

      // Elevate selected parcel smoothly
      const isSelected = parcel.id === selectedParcelId;
      const targetScaleY = isSelected ? 1.5 : 1.0;
      mesh.scale.y = targetScaleY;
      mesh.position.y = (mesh.userData.baseHeight * targetScaleY) / 2;
    });
  }, [activeLayer, selectedParcelId, parcels, getParcelColor]);

  // 3. Reactive Update for Weather Mode (Lighting, Fog, Rain visibility)
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (weatherMode === 'sunset') {
      scene.background = new THREE.Color(0xffedd5);
      scene.fog = new THREE.FogExp2(0xfed7aa, 0.02);
      if (sunLightRef.current) {
        sunLightRef.current.color.set(0xf97316);
        sunLightRef.current.intensity = 1.4;
      }
      if (ambientLightRef.current) ambientLightRef.current.intensity = 0.75;
      if (rainParticlesRef.current) rainParticlesRef.current.visible = false;
    } else if (weatherMode === 'rainy') {
      scene.background = new THREE.Color(0xcfd8dc);
      scene.fog = new THREE.FogExp2(0x94a3b8, 0.025);
      if (sunLightRef.current) {
        sunLightRef.current.color.set(0xfffbeb);
        sunLightRef.current.intensity = 0.7;
      }
      if (ambientLightRef.current) ambientLightRef.current.intensity = 0.55;
      if (rainParticlesRef.current) rainParticlesRef.current.visible = true;
    } else {
      // Sunny
      scene.background = new THREE.Color(0xe8f5e9);
      scene.fog = new THREE.FogExp2(0xecfdf5, 0.02);
      if (sunLightRef.current) {
        sunLightRef.current.color.set(0xfffbeb);
        sunLightRef.current.intensity = 1.6;
      }
      if (ambientLightRef.current) ambientLightRef.current.intensity = 0.85;
      if (rainParticlesRef.current) rainParticlesRef.current.visible = false;
    }
  }, [weatherMode]);

  // 4. Reactive Camera Position for View Angles
  useEffect(() => {
    const camera = cameraRef.current;
    if (!camera) return;

    if (viewAngle === 'iso') {
      camera.position.set(24, 28, 28);
      camera.lookAt(0, 0, 0);
    } else if (viewAngle === 'top') {
      camera.position.set(0, 42, 1);
      camera.lookAt(0, 0, 0);
    } else {
      // Low angle
      camera.position.set(16, 7, 20);
      camera.lookAt(0, 2, 0);
    }
  }, [viewAngle]);

  const resetView = () => {
    if (sceneRef.current) sceneRef.current.rotation.y = 0;
    if (cameraRef.current) {
      cameraRef.current.position.set(24, 28, 28);
      cameraRef.current.lookAt(0, 0, 0);
    }
    setViewAngle('iso');
  };

  const handleZoom = (zoomIn: boolean) => {
    if (!cameraRef.current) return;
    const factor = zoomIn ? 0.85 : 1.15;
    cameraRef.current.position.multiplyScalar(factor);
  };

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-emerald-900/10 bg-gradient-to-b from-[#e8f5e9]/40 to-[#dcfce7]/20 shadow-sm transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none bg-slate-900' : ''
      }`}
    >
      {/* Top Controls Overlay */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left tags */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md text-emerald-800 text-xs font-semibold shadow-sm border border-emerald-100">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            TDP Hồng Giang, P. Chũ, TP Bắc Ninh (5,68 ha)
          </div>

          {/* Layer switcher */}
          <div className="hidden sm:flex items-center bg-white/90 backdrop-blur-md rounded-xl p-0.5 border border-slate-200/80 shadow-sm text-xs">
            <button
              onClick={() => setActiveLayer('crops')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                activeLayer === 'crops'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Loại cây trồng
            </button>
            <button
              onClick={() => setActiveLayer('moisture')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                activeLayer === 'moisture'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Độ ẩm đất (IoT)
            </button>
            <button
              onClick={() => setActiveLayer('health')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                activeLayer === 'health'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sức khỏe sinh trưởng
            </button>
          </div>
        </div>

        {/* Right view & mode controls */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-white/90 backdrop-blur-md rounded-xl p-1 border border-slate-200/80 shadow-sm text-xs">
          <button
            onClick={() => handleZoom(true)}
            title="Thu phóng gần"
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleZoom(false)}
            title="Thu phóng xa"
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() =>
              setWeatherMode(
                weatherMode === 'sunny'
                  ? 'rainy'
                  : weatherMode === 'rainy'
                  ? 'sunset'
                  : 'sunny'
              )
            }
            title="Đổi thời tiết mô phỏng"
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 flex items-center gap-1 font-medium"
          >
            {weatherMode === 'sunny' ? (
              <Sun className="w-3.5 h-3.5 text-amber-500" />
            ) : weatherMode === 'rainy' ? (
              <CloudRain className="w-3.5 h-3.5 text-blue-500" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            )}
            <span className="hidden md:inline capitalize">
              {weatherMode === 'sunny'
                ? 'Nắng ráo'
                : weatherMode === 'rainy'
                ? 'Trời mưa'
                : 'Hoàng hôn'}
            </span>
          </button>

          <button
            onClick={() =>
              setViewAngle(
                viewAngle === 'iso' ? 'top' : viewAngle === 'top' ? 'low' : 'iso'
              )
            }
            title="Đổi góc nhìn"
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 flex items-center gap-1 font-medium"
          >
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden md:inline">
              {viewAngle === 'iso'
                ? '3D Đẳng cự'
                : viewAngle === 'top'
                ? '2D Từ trên'
                : 'Cận cảnh'}
            </span>
          </button>

          <button
            onClick={resetView}
            title="Đặt lại góc nhìn"
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title="Toàn màn hình"
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas */}
      <div
        ref={mountRef}
        className={`w-full ${
          isFullscreen ? 'h-full' : compact ? 'h-72' : 'h-[440px]'
        } cursor-grab active:cursor-grabbing`}
      />

      {/* Hover Tooltip */}
      {hoveredParcel && !selectedParcel && (
        <div className="absolute bottom-16 left-4 pointer-events-none bg-slate-900/90 backdrop-blur-md text-white text-xs px-3 py-2 rounded-xl shadow-lg border border-slate-700/50 flex items-center gap-3 animate-in fade-in">
          <div>
            <div className="font-bold text-emerald-400">{hoveredParcel.name}</div>
            <div className="text-slate-300">
              Cây: {hoveredParcel.cropType} · {hoveredParcel.area} ha
            </div>
          </div>
          <div className="border-l border-slate-700 pl-3">
            <div className="flex items-center gap-1 text-slate-200">
              <Droplets className="w-3 h-3 text-cyan-400" />
              <span>{hoveredParcel.soilMoisture}% ẩm</span>
            </div>
            {hoveredParcel.needsAttention && (
              <span className="text-amber-400 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Cần chú ý
              </span>
            )}
          </div>
        </div>
      )}

      {/* Selected Parcel Inspector Panel */}
      {selectedParcel && (
        <div className="absolute top-14 right-3 z-20 w-80 max-w-[90vw] bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-emerald-900/10 p-4 animate-in slide-in-from-right-4">
          <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5 mb-3">
            <div>
              <div className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: selectedParcel.color }}
                />
                <h4 className="font-bold text-slate-900 text-sm leading-tight">
                  {selectedParcel.name}
                </h4>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Loại:{' '}
                <span className="font-medium text-emerald-700">
                  {selectedParcel.cropType}
                </span>{' '}
                · Diện tích: {selectedParcel.area} ha
              </p>
            </div>
            <button
              onClick={() => onSelectParcel(null)}
              className="text-slate-400 hover:text-slate-600 p-1 text-xs"
            >
              ✕
            </button>
          </div>

          {/* Environmental metrics */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 block font-medium">Độ ẩm đất</span>
              <span className="text-xs font-bold text-cyan-600 flex items-center justify-center gap-0.5 mt-0.5">
                <Droplets className="w-3 h-3" />
                {selectedParcel.soilMoisture}%
              </span>
            </div>
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 block font-medium">Nhiệt độ</span>
              <span className="text-xs font-bold text-amber-600 flex items-center justify-center gap-0.5 mt-0.5">
                <Thermometer className="w-3 h-3" />
                {selectedParcel.temperature}°C
              </span>
            </div>
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 block font-medium">Sức khỏe</span>
              <span className="text-xs font-bold text-emerald-600 flex items-center justify-center gap-0.5 mt-0.5">
                <Activity className="w-3 h-3" />
                {selectedParcel.healthScore}/100
              </span>
            </div>
          </div>

          {/* Attention alert box */}
          {selectedParcel.needsAttention && (
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 mb-3 flex items-start gap-2 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-800">Cảnh báo kỹ thuật:</span>
                <p className="text-amber-700 text-[11px] mt-0.5">
                  {selectedParcel.attentionReason ||
                    'Độ ẩm thấp dưới ngưỡng cảnh báo. Cần kiểm tra hệ thống tưới nhỏ giọt.'}
                </p>
              </div>
            </div>
          )}

          {/* Detailed Info */}
          <div className="space-y-1.5 text-xs text-slate-600 mb-3 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
            <div className="flex justify-between">
              <span className="text-slate-400">Giai đoạn sinh trưởng:</span>
              <span className="font-semibold text-slate-800">{selectedParcel.growthStage}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Độ pH đất:</span>
              <span className="font-semibold text-slate-800">{selectedParcel.ph} (Thích hợp)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Ngày trồng:</span>
              <span className="font-semibold text-slate-800">{selectedParcel.plantedDate}</span>
            </div>
          </div>

          {/* Action button */}
          {onScheduleTask && (
            <button
              onClick={() => onScheduleTask(selectedParcel)}
              className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Lên lịch chăm sóc cho lô này</span>
            </button>
          )}
        </div>
      )}

      {/* Bottom Legend */}
      <div className="absolute bottom-2 left-3 right-3 z-10 flex items-center justify-between pointer-events-none text-[11px] text-slate-600">
        <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-200/80 pointer-events-auto flex items-center gap-3">
          <span className="font-semibold text-slate-700">Chú thích:</span>
          {activeLayer === 'crops' && (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#16a34a]" /> Vải thiều
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#f97316]" /> Cam đường canh
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#ca8a04]" /> Bưởi Diễn
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#65a30d]" /> Táo & Ổi
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#0284c7]" /> Hồ nước đồi
              </span>
            </div>
          )}
          {activeLayer === 'moisture' && (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#ef4444]" /> &lt;40% (Thiếu nước)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#f59e0b]" /> 40-55% (Vừa)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#10b981]" /> 55-75% (Tối ưu)
              </span>
            </div>
          )}
          {activeLayer === 'health' && (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#10b981]" /> &gt;90 Tốt
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#84cc16]" /> 75-90 Bình thường
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#f97316]" /> &lt;75 Cần theo dõi
              </span>
            </div>
          )}
        </div>

        <div className="bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-200/80 pointer-events-auto hidden md:block">
          <span>Kéo chuột trái để xoay · Cuộn/Nút để phóng to/thu nhỏ</span>
        </div>
      </div>
    </div>
  );
};

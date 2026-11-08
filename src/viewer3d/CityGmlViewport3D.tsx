import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  ChevronDown,
  ChevronUp,
  Compass,
  Eye,
  Focus,
  Layers,
  Maximize2,
  Sliders,
} from 'lucide-react';
import { ImportedModel, ImportedPolygon } from '../core/gml/gmlReader.ts';
import {
  triangulatePolygonWithHoles3D,
  turefToLocalThree,
} from '../core/gml/triangulate3d.ts';

export interface CityGmlViewport3DProps {
  readonly model: ImportedModel;
  readonly selectedGmlId: string | null;
  readonly activeStoreyGmlId: string | null;
  readonly highlightedRulePolygonId?: string | null;
  readonly onSelectGmlId: (gmlId: string | null) => void;
  readonly onClearStoreyFilter: () => void;
}

export interface LayerVisibilityState {
  readonly lod2Shell: boolean;
  readonly lod4Rooms: boolean;
  readonly openings: boolean;
  readonly balconies: boolean;
  readonly storeyAndBbShells: boolean;
  readonly lod0AndTic: boolean;
  readonly showWireframe: boolean;
  readonly xrayEnvelope: boolean;
}

const DEFAULT_LAYERS: LayerVisibilityState = {
  lod2Shell: true,
  lod4Rooms: true,
  openings: true,
  balconies: true,
  storeyAndBbShells: false,
  lod0AndTic: true,
  showWireframe: true,
  xrayEnvelope: true,
};

// Modül düzeyinde yeniden kullanılabilir vektörler (Render döngüsünde 0 GC)
const _targetCameraPos = new THREE.Vector3(18, 16, 22);
const _targetControlsLook = new THREE.Vector3(0, 3.5, 0);
const _raycastMouse = new THREE.Vector2();

function detectSoftwareWebGL(): boolean {
  if (typeof document === 'undefined') return true;
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2');
  if (!gl) return true;
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
  const gpu = String(gl.getParameter(param));
  gl.getExtension('WEBGL_lose_context')?.loseContext();
  return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
}

function getPolygonColorAndOpacity(
  poly: ImportedPolygon,
  xrayEnvelope: boolean
): {
  color: number;
  roughness: number;
  metalness: number;
  opacity: number;
  transparent: boolean;
} {
  if (poly.ownerObjectPrefix === 'KAPI_') {
    return {
      color: 0xb45309, // Ahşap/Bronz Kapı
      roughness: 0.45,
      metalness: 0.2,
      opacity: 0.95,
      transparent: true,
    };
  }
  if (poly.ownerObjectPrefix === 'PEN_') {
    return {
      color: 0x38bdf8, // Cam Pencere
      roughness: 0.15,
      metalness: 0.1,
      opacity: 0.65,
      transparent: true,
    };
  }
  if (poly.ownerObjectPrefix === 'BLKN_' || poly.ownerObjectPrefix === 'TRS_') {
    return {
      color: 0xf59e0b, // Balkon / Teras
      roughness: 0.55,
      metalness: 0.15,
      opacity: 0.88,
      transparent: true,
    };
  }
  if (poly.ownerObjectPrefix === 'BBK_' || poly.ownerObjectPrefix === 'OA_') {
    if (poly.surfaceTag === 'FloorSurface') {
      return {
        color: 0x10b981, // Oda Tabanı (Zümrüt)
        roughness: 0.6,
        metalness: 0.05,
        opacity: 0.92,
        transparent: true,
      };
    }
    if (poly.surfaceTag === 'CeilingSurface') {
      return {
        color: 0x94a3b8, // Oda Tavanı
        roughness: 0.75,
        metalness: 0.05,
        opacity: 0.35,
        transparent: true,
      };
    }
    return {
      color: 0x6ee7b7, // İç Duvar (InteriorWallSurface)
      roughness: 0.65,
      metalness: 0.05,
      opacity: 0.72,
      transparent: true,
    };
  }
  if (poly.ownerObjectPrefix === 'K_' || poly.ownerObjectPrefix === 'BB_') {
    return {
      color: poly.ownerObjectPrefix === 'K_' ? 0x6366f1 : 0xa855f7,
      roughness: 0.6,
      metalness: 0.1,
      opacity: 0.4,
      transparent: true,
    };
  }
  if (poly.surfaceTag === 'RoofSurface') {
    return {
      color: 0xdc2626, // Çatı (Kiremit Kırmızı)
      roughness: 0.65,
      metalness: 0.1,
      opacity: xrayEnvelope ? 0.55 : 0.96,
      transparent: xrayEnvelope,
    };
  }
  if (poly.surfaceTag === 'GroundSurface') {
    return {
      color: 0x475569, // Zemin (Bazalt Gri)
      roughness: 0.85,
      metalness: 0.05,
      opacity: 0.95,
      transparent: false,
    };
  }
  // LoD2 Dış Duvar / Dış Taban / Dış Tavan
  return {
    color: 0xe2e8f0,
    roughness: 0.7,
    metalness: 0.08,
    opacity: xrayEnvelope ? 0.38 : 0.92,
    transparent: xrayEnvelope,
  };
}

function isPolygonVisibleByLayer(
  poly: ImportedPolygon,
  layers: LayerVisibilityState,
  activeStoreyGmlId: string | null
): boolean {
  if (
    activeStoreyGmlId &&
    poly.storeyGmlId &&
    poly.storeyGmlId !== activeStoreyGmlId
  ) {
    return false;
  }

  if (poly.lodLevel === 'lod0FootPrint' || poly.lodLevel === 'lod0RoofEdge') {
    return layers.lod0AndTic;
  }
  if (poly.lodLevel === 'lod1Solid') {
    return false; // LoD1 solid varsayılan gizli (LoD2/LoD4 ile üst üste binmemesi için)
  }
  if (poly.ownerObjectPrefix === 'KAPI_' || poly.ownerObjectPrefix === 'PEN_') {
    return layers.openings;
  }
  if (poly.ownerObjectPrefix === 'BLKN_' || poly.ownerObjectPrefix === 'TRS_') {
    return layers.balconies;
  }
  if (
    poly.ownerObjectPrefix === 'BBK_' ||
    poly.ownerObjectPrefix === 'OA_' ||
    poly.ownerObjectPrefix === 'BBKIY_' ||
    poly.ownerObjectPrefix === 'OAIY_'
  ) {
    return layers.lod4Rooms;
  }
  if (poly.ownerObjectPrefix === 'K_' || poly.ownerObjectPrefix === 'BB_') {
    return layers.storeyAndBbShells;
  }
  return layers.lod2Shell;
}

export const CityGmlViewport3D: React.FC<CityGmlViewport3DProps> = ({
  model,
  selectedGmlId,
  activeStoreyGmlId,
  highlightedRulePolygonId,
  onSelectGmlId,
  onClearStoreyFilter,
}) => {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const [layers, setLayers] = useState<LayerVisibilityState>(DEFAULT_LAYERS);
  const [explodeDistanceMeters, setExplodeDistanceMeters] = useState<number>(0);
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);

  // Kat indeks tablosu (Kat patlatma için alttan üste 0, 1, 2...)
  const storeyIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    const storeys = model.objects
      .filter((o) => o.prefix === 'K_')
      .sort((a, b) => (a.minZ ?? 0) - (b.minZ ?? 0));
    storeys.forEach((st, idx) => {
      map.set(st.gmlId, idx);
    });
    return map;
  }, [model]);

  // Seçili nesneye ait tüm poligon kimlikleri kümesi
  const selectedPolygonSet = useMemo(() => {
    const set = new Set<string>();
    if (!selectedGmlId) return set;
    if (model.polygonsById[selectedGmlId]) {
      set.add(selectedGmlId);
      return set;
    }
    const obj = model.objectsById[selectedGmlId];
    if (obj) {
      for (const pid of obj.allPolygonIds) {
        set.add(pid);
      }
      // Eğer BB_ veya K_ seçildiyse altındaki BBK_, BLKN_, KAPI_, PEN_ poligonlarını da vurgula
      for (const child of model.objects) {
        if (
          child.parentGmlId === selectedGmlId ||
          child.referencedBbGmlId === selectedGmlId ||
          child.storeyGmlId === selectedGmlId
        ) {
          for (const pid of child.allPolygonIds) {
            set.add(pid);
          }
        }
      }
    }
    return set;
  }, [model, selectedGmlId]);

  const requestRenderRef = useRef<(() => void) | null>(null);
  const flyToTargetRef = useRef<{ active: boolean }>({ active: false });
  const currentExplodeRef = useRef<number>(0);
  const targetExplodeRef = useRef<number>(0);

  // Sahne nesneleri referansları
  const polyMeshMapRef = useRef<
    Map<
      string,
      {
        poly: ImportedPolygon;
        mesh: THREE.Mesh;
        edgeLine: THREE.LineSegments;
        holeLine: THREE.LineSegments | null;
        storeyIndex: number;
      }
    >
  >(new Map());
  const ticLinesGroupRef = useRef<THREE.Group | null>(null);
  const onSelectRef = useRef(onSelectGmlId);
  onSelectRef.current = onSelectGmlId;

  useEffect(() => {
    const mountEl = canvasMountRef.current;
    if (!mountEl) return;

    const isSoftwareGl = detectSoftwareWebGL();
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2)
    );
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const rect = mountEl.getBoundingClientRect();
    const initW = Math.max(rect.width, 320);
    const initH = Math.max(rect.height, 260);
    renderer.setSize(initW, initH);
    mountEl.innerHTML = '';
    mountEl.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    scene.fog = new THREE.FogExp2(0x0f172a, 0.008);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTex = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(45, initW / initH, 0.1, 600);
    camera.position.set(18, 15, 22);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 3.5, 0);
    controls.maxDistance = 250;
    controls.minDistance = 1.5;

    // 3-Noktalı Dengeli Stüdyo Işıklandırması (Sıcak Ana Işık + Soğuk Gökyüzü Dolgusu)
    const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x1e293b, 0.85);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 1.45);
    keyLight.position.set(24, 38, 26);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    keyLight.shadow.camera.left = -25;
    keyLight.shadow.camera.right = 25;
    keyLight.shadow.camera.top = 25;
    keyLight.shadow.camera.bottom = -25;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x93c5fd, 0.55);
    rimLight.position.set(-22, 18, -20);
    scene.add(rimLight);

    // Zemin Grid ve Temas Gölgesi Düzlemi (Coplanar Z-Fighting Önlemli)
    const gridHelper = new THREE.GridHelper(48, 48, 0x334155, 0x1e293b);
    gridHelper.position.y = -0.02;
    scene.add(gridHelper);

    const axesHelper = new THREE.AxesHelper(3.5);
    axesHelper.position.set(-14, 0.01, 14);
    scene.add(axesHelper);

    const modelRootGroup = new THREE.Group();
    scene.add(modelRootGroup);

    const ticGroup = new THREE.Group();
    scene.add(ticGroup);
    ticLinesGroupRef.current = ticGroup;

    // Model poligonlarını oluştur
    polyMeshMapRef.current.clear();
    const raycastTargets: THREE.Object3D[] = [];

    for (const poly of model.polygons) {
      if (poly.lodLevel === 'lod1Solid') continue;
      const triData = triangulatePolygonWithHoles3D(
        poly.exteriorRing.vertices,
        poly.interiorRings.map((r) => r.vertices),
        model.originTuref
      );
      if (triData.positions.length < 9 || triData.indices.length < 3) continue;

      const geom = new THREE.BufferGeometry();
      geom.setAttribute(
        'position',
        new THREE.BufferAttribute(triData.positions, 3)
      );
      geom.setIndex(new THREE.BufferAttribute(triData.indices, 1));
      geom.computeVertexNormals();
      geom.computeBoundingBox();
      geom.computeBoundingSphere();

      const style = getPolygonColorAndOpacity(poly, true);
      const mat = new THREE.MeshStandardMaterial({
        color: style.color,
        roughness: style.roughness,
        metalness: style.metalness,
        transparent: style.transparent,
        opacity: style.opacity,
        side: THREE.DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: poly.ownerObjectPrefix === 'KAPI_' || poly.ownerObjectPrefix === 'PEN_' ? -1 : 1,
        polygonOffsetUnits: 1,
      });

      const mesh = new THREE.Mesh(geom, mat);
      mesh.userData = {
        polygonGmlId: poly.gmlId,
        ownerObjectGmlId: poly.ownerObjectGmlId,
        label: `${poly.ownerObjectGmlId} (${poly.surfaceGmlName || poly.surfaceTag})`,
      };
      mesh.castShadow = !isSoftwareGl && poly.surfaceTag === 'RoofSurface';
      mesh.receiveShadow = !isSoftwareGl;

      const edgeGeom = new THREE.BufferGeometry();
      edgeGeom.setAttribute(
        'position',
        new THREE.BufferAttribute(triData.boundaryLinePositions, 3)
      );
      const edgeMat = new THREE.LineBasicMaterial({
        color: 0x475569,
        transparent: true,
        opacity: 0.7,
      });
      const edgeLine = new THREE.LineSegments(edgeGeom, edgeMat);

      let holeLine: THREE.LineSegments | null = null;
      if (triData.holeLinePositions.length >= 6) {
        const holeGeom = new THREE.BufferGeometry();
        holeGeom.setAttribute(
          'position',
          new THREE.BufferAttribute(triData.holeLinePositions, 3)
        );
        const holeMat = new THREE.LineBasicMaterial({
          color: 0xfbbf24,
        });
        holeLine = new THREE.LineSegments(holeGeom, holeMat);
        modelRootGroup.add(holeLine);
      }

      modelRootGroup.add(mesh);
      modelRootGroup.add(edgeLine);
      raycastTargets.push(mesh);

      const stIdx = poly.storeyGmlId
        ? storeyIndexMap.get(poly.storeyGmlId) ?? 0
        : poly.surfaceTag === 'RoofSurface' || poly.lodLevel === 'lod0RoofEdge'
        ? storeyIndexMap.size
        : 0;

      polyMeshMapRef.current.set(poly.gmlId, {
        poly,
        mesh,
        edgeLine,
        holeLine,
        storeyIndex: stIdx,
      });
    }

    // TIC (lod2TerrainIntersection) kapalı arazi kesişim eğrisi
    for (const tic of model.ticLineStrings) {
      const pts: THREE.Vector3[] = tic.vertices.map((v) => {
        const [lx, ly, lz] = turefToLocalThree(v, model.originTuref);
        return new THREE.Vector3(lx, ly + 0.02, lz);
      });
      const ticGeom = new THREE.BufferGeometry().setFromPoints(pts);
      const ticMat = new THREE.LineBasicMaterial({
        color: 0x22d3ee, // Parlak Camgöbeği TIC çizgisi
      });
      const line = new THREE.Line(ticGeom, ticMat);
      ticGroup.add(line);
    }

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    let frameId = 0;
    let renderBusy = false;
    let renderDirty = false;
    const clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
      gl.flush();
      const poll = () => {
        const state = sync ? gl.getSyncParameter(sync, gl.SYNC_STATUS) : gl.SIGNALED;
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function requestRender() {
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame(() => {
        renderDirty = false;
        const dt = Math.min(clock.getDelta(), 0.1);
        let needsMoreFrames = false;

        // Kat patlatma (Exploded View) yumuşak sönümleme
        if (Math.abs(currentExplodeRef.current - targetExplodeRef.current) > 0.002) {
          currentExplodeRef.current = THREE.MathUtils.damp(
            currentExplodeRef.current,
            targetExplodeRef.current,
            10,
            dt || 0.016
          );
          for (const item of polyMeshMapRef.current.values()) {
            const yOffset = item.storeyIndex * currentExplodeRef.current;
            item.mesh.position.y = yOffset;
            item.edgeLine.position.y = yOffset;
            if (item.holeLine) item.holeLine.position.y = yOffset;
          }
          needsMoreFrames = true;
        }

        // Kamera odaklama geçişi
        if (flyToTargetRef.current.active) {
          camera.position.lerp(_targetCameraPos, 1 - Math.exp(-8 * (dt || 0.016)));
          controls.target.lerp(_targetControlsLook, 1 - Math.exp(-8 * (dt || 0.016)));
          if (
            camera.position.distanceTo(_targetCameraPos) < 0.05 &&
            controls.target.distanceTo(_targetControlsLook) < 0.05
          ) {
            flyToTargetRef.current.active = false;
          } else {
            needsMoreFrames = true;
          }
        }

        controls.update();
        renderer.render(scene, camera);

        const done = () => {
          renderBusy = false;
          if (renderDirty || needsMoreFrames) {
            requestRender();
          }
        };
        if (isSoftwareGl) afterDraw(done);
        else done();
      });
    }

    requestRenderRef.current = requestRender;

    const onControlStart = () => {
      flyToTargetRef.current.active = false;
    };
    const onControlChange = () => {
      requestRender();
    };
    controls.addEventListener('start', onControlStart);
    controls.addEventListener('change', onControlChange);

    // Raycasting (Tıklama ile 3B nesne seçimi ve hover etiketi)
    const raycaster = new THREE.Raycaster();
    let downX = 0;
    let downY = 0;

    const onPointerDown = (e: PointerEvent) => {
      downX = e.clientX;
      downY = e.clientY;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - downX, e.clientY - downY) > 5) return;
      const bounds = renderer.domElement.getBoundingClientRect();
      _raycastMouse.x = ((e.clientX - bounds.left) / bounds.width) * 2 - 1;
      _raycastMouse.y = -((e.clientY - bounds.top) / bounds.height) * 2 + 1;
      raycaster.setFromCamera(_raycastMouse, camera);

      const visibleTargets = raycastTargets.filter((t) => t.visible);
      const hits = raycaster.intersectObjects(visibleTargets, false);
      if (hits.length > 0) {
        const hitObj = hits[0].object;
        const ownerId = hitObj.userData?.ownerObjectGmlId as string | undefined;
        if (ownerId) {
          onSelectRef.current(ownerId);
        }
      } else {
        onSelectRef.current(null);
      }
    };

    let lastHoverTime = 0;
    const onPointerMove = (e: PointerEvent) => {
      if (e.buttons !== 0) return;
      const now = performance.now();
      if (now - lastHoverTime < 60) return;
      lastHoverTime = now;

      const bounds = renderer.domElement.getBoundingClientRect();
      _raycastMouse.x = ((e.clientX - bounds.left) / bounds.width) * 2 - 1;
      _raycastMouse.y = -((e.clientY - bounds.top) / bounds.height) * 2 + 1;
      raycaster.setFromCamera(_raycastMouse, camera);

      const visibleTargets = raycastTargets.filter((t) => t.visible);
      const hits = raycaster.intersectObjects(visibleTargets, false);
      if (hits.length > 0) {
        const lbl = hits[0].object.userData?.label as string | undefined;
        setHoveredLabel(lbl ?? null);
        renderer.domElement.style.cursor = 'pointer';
      } else {
        setHoveredLabel(null);
        renderer.domElement.style.cursor = 'grab';
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('pointermove', onPointerMove);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.max(entry.contentRect.width, 200);
        const h = Math.max(entry.contentRect.height, 200);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        requestRender();
      }
    });
    resizeObserver.observe(mountEl);

    requestRender();

    return () => {
      resizeObserver.disconnect();
      controls.removeEventListener('start', onControlStart);
      controls.removeEventListener('change', onControlChange);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      for (const item of polyMeshMapRef.current.values()) {
        item.mesh.geometry.dispose();
        (item.mesh.material as THREE.Material).dispose();
        item.edgeLine.geometry.dispose();
        (item.edgeLine.material as THREE.Material).dispose();
        if (item.holeLine) {
          item.holeLine.geometry.dispose();
          (item.holeLine.material as THREE.Material).dispose();
        }
      }
      envTex.dispose();
      renderer.dispose();
    };
  }, [model, storeyIndexMap]);

  // Katman görünürlüğü, seçim vurgusu ve kat filtresi güncellemeleri
  useEffect(() => {
    for (const [polyId, item] of polyMeshMapRef.current.entries()) {
      const visible = isPolygonVisibleByLayer(
        item.poly,
        layers,
        activeStoreyGmlId
      );
      item.mesh.visible = visible;
      item.edgeLine.visible = visible && layers.showWireframe;
      if (item.holeLine) {
        item.holeLine.visible = visible && layers.showWireframe;
      }

      const isSelected = selectedPolygonSet.has(polyId);
      const isRuleError = highlightedRulePolygonId === polyId;
      const baseStyle = getPolygonColorAndOpacity(item.poly, layers.xrayEnvelope);
      const mat = item.mesh.material as THREE.MeshStandardMaterial;
      const edgeMat = item.edgeLine.material as THREE.LineBasicMaterial;

      if (isRuleError) {
        mat.color.setHex(0xef4444); // Doğrulama hatası poligonu kırmızı (D-23.3)
        mat.emissive.setHex(0x7f1d1d);
        mat.opacity = 0.98;
        mat.transparent = false;
        edgeMat.color.setHex(0xfca5a5);
        edgeMat.opacity = 1;
      } else if (isSelected) {
        mat.color.setHex(0xf59e0b); // Seçili nesne kehribar/altın vurgusu
        mat.emissive.setHex(0x78350f);
        mat.opacity = 0.96;
        mat.transparent = false;
        edgeMat.color.setHex(0xfef08a);
        edgeMat.opacity = 1;
      } else {
        mat.color.setHex(baseStyle.color);
        mat.emissive.setHex(0x000000);
        mat.opacity = baseStyle.opacity;
        mat.transparent = baseStyle.transparent;
        edgeMat.color.setHex(0x475569);
        edgeMat.opacity = 0.65;
      }
    }

    if (ticLinesGroupRef.current) {
      ticLinesGroupRef.current.visible = layers.lod0AndTic;
    }

    requestRenderRef.current?.();
  }, [
    layers,
    selectedPolygonSet,
    activeStoreyGmlId,
    highlightedRulePolygonId,
  ]);

  // Seçili nesneye veya aktif kata otomatik yumuşak kamera odaklama
  useEffect(() => {
    if (!selectedGmlId && !activeStoreyGmlId) return;
    const box = new THREE.Box3();
    let count = 0;
    for (const [polyId, item] of polyMeshMapRef.current.entries()) {
      if (
        selectedPolygonSet.has(polyId) ||
        (activeStoreyGmlId && item.poly.storeyGmlId === activeStoreyGmlId)
      ) {
        item.mesh.geometry.computeBoundingBox();
        if (item.mesh.geometry.boundingBox) {
          const b = item.mesh.geometry.boundingBox.clone();
          b.translate(item.mesh.position);
          box.union(b);
          count++;
        }
      }
    }
    if (count > 0 && !box.isEmpty()) {
      const center = new THREE.Vector3();
      const size = new THREE.Vector3();
      box.getCenter(center);
      box.getSize(size);
      const radius = Math.max(size.length(), 4);
      _targetControlsLook.copy(center);
      _targetCameraPos.set(
        center.x + radius * 1.15,
        center.y + radius * 0.85,
        center.z + radius * 1.25
      );
      flyToTargetRef.current.active = true;
      requestRenderRef.current?.();
    }
  }, [selectedGmlId, activeStoreyGmlId, selectedPolygonSet]);

  // Kat patlatma mesafesi değiştiğinde hedefi güncelle
  useEffect(() => {
    targetExplodeRef.current = explodeDistanceMeters;
    requestRenderRef.current?.();
  }, [explodeDistanceMeters]);

  const setCameraPreset = (preset: 'iso' | 'top' | 'south' | 'east') => {
    _targetControlsLook.set(0, 3.5, 0);
    if (preset === 'iso') _targetCameraPos.set(18, 15, 22);
    else if (preset === 'top') _targetCameraPos.set(0, 32, 0.01);
    else if (preset === 'south') _targetCameraPos.set(0, 6, 26);
    else if (preset === 'east') _targetCameraPos.set(26, 6, 0);
    flyToTargetRef.current.active = true;
    requestRenderRef.current?.();
  };

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden select-none">
      {/* Isolated WebGL Canvas Container (No backdrop-filter over canvas) */}
      <div ref={canvasMountRef} className="w-full h-full" />

      {/* Minimal Top-Left Spec & Coordinate Origin Badge */}
      <div className="absolute top-3 left-3 pointer-events-none flex flex-wrap items-center gap-2">
        <div className="bg-slate-900 border border-slate-800 rounded-md px-2.5 py-1 text-[11px] font-mono text-slate-200">
          3B CityGML Sahnesi · {model.srsName} · Merkez:{' '}
          {model.originTuref.e.toFixed(2)}E, {model.originTuref.n.toFixed(2)}N,{' '}
          {model.originTuref.z.toFixed(2)}Z
        </div>
        {activeStoreyGmlId && (
          <button
            type="button"
            onClick={onClearStoreyFilter}
            className="pointer-events-auto bg-amber-950 border border-amber-700 text-amber-200 rounded-md px-2.5 py-1 text-[11px] font-mono font-semibold hover:bg-amber-900 cursor-pointer"
          >
            Aktif Kat İzolasyonu: {model.objectsById[activeStoreyGmlId]?.gmlName || activeStoreyGmlId} (Tüm Katları Göster ×)
          </button>
        )}
        {hoveredLabel && (
          <div className="bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1 text-[11px] font-mono text-amber-300">
            {hoveredLabel}
          </div>
        )}
      </div>

      {/* Unified Collapsible Bottom Control Dock (Zero Viewport Occlusion) */}
      <div
        className="absolute left-1/2 -translate-x-1/2 bottom-3 z-10 w-[min(920px,95%)] transition-transform duration-200"
        style={{
          transform: dockCollapsed
            ? 'translate(-50%, calc(100% - 28px))'
            : 'translate(-50%, 0)',
        }}
      >
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setDockCollapsed((c) => !c)}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-mono font-medium bg-slate-900 text-slate-200 border border-b-0 border-slate-700 rounded-t-md hover:bg-slate-800 cursor-pointer"
          >
            {dockCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>3B Sahne Kontrollerini Göster</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Kontrolleri Gizle</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-lg p-2.5 shadow-xl space-y-2 text-xs text-slate-200">
          {/* Row 1: Layer Toggles */}
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" />
                <span>Katmanlar:</span>
              </span>
              {[
                { key: 'lod2Shell' as const, label: 'LoD2 Dış Kabuk' },
                { key: 'lod4Rooms' as const, label: 'LoD4 Odalar (BBK)' },
                { key: 'openings' as const, label: 'Kapı/Pencere' },
                { key: 'balconies' as const, label: 'Balkon/Teras' },
                { key: 'storeyAndBbShells' as const, label: 'Kat/BB Kabuğu' },
                { key: 'lod0AndTic' as const, label: 'LoD0 & TIC' },
                { key: 'xrayEnvelope' as const, label: 'Yarı Saydam Dış Duvar' },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() =>
                    setLayers((prev) => ({ ...prev, [item.key]: !prev[item.key] }))
                  }
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    layers[item.key]
                      ? 'bg-emerald-700 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: Exploded Storey Slider & Camera Presets */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-800">
            <div className="flex items-center gap-2 flex-1 min-w-[220px]">
              <Sliders className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-[11px] text-slate-300 whitespace-nowrap">
                Kat Patlatma:
              </span>
              <input
                type="range"
                min={0}
                max={6}
                step={0.2}
                value={explodeDistanceMeters}
                onChange={(e) => setExplodeDistanceMeters(Number(e.target.value))}
                className="w-full max-w-[160px] accent-amber-500 cursor-pointer"
              />
              <span className="text-[11px] font-mono tabular-nums text-amber-400 w-12">
                {explodeDistanceMeters.toFixed(1)} m
              </span>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-400 mr-1 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5" />
                <span>Bakış:</span>
              </span>
              <button
                type="button"
                onClick={() => setCameraPreset('iso')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] cursor-pointer"
              >
                İzometrik
              </button>
              <button
                type="button"
                onClick={() => setCameraPreset('top')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] cursor-pointer"
              >
                Üst Plan
              </button>
              <button
                type="button"
                onClick={() => setCameraPreset('south')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] cursor-pointer"
              >
                Güney
              </button>
              <button
                type="button"
                onClick={() => setCameraPreset('east')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] cursor-pointer"
              >
                Doğu
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

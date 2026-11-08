// M5 — Tasarımdan üretilen B-rep'in 3B önizlemesi (oda kabukları, BB küvetleri, kat kabukları, açıklıklar).
// GML'e yazmadan geometriyi göz ile denetlemek içindir; GML yazımı M6'dadır.
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { BrepBuilding, BrepPolygon, Pt3 } from '../core/brep/types.ts';
import { triangulatePolygonWithHoles3D } from '../core/gml/triangulate3d.ts';

export interface BrepPreview3DProps {
  readonly brep: BrepBuilding;
  readonly onClose: () => void;
}

type Layer = 'rooms' | 'tubs' | 'storeys' | 'openings' | 'shell';
const LAYER_LABEL: Record<Layer, string> = { rooms: 'Kısımlar', tubs: 'BB küvetleri', storeys: 'Kat kabukları', openings: 'Açıklıklar', shell: 'Çatı ve balkonlar' };

const COLOR: Record<BrepPolygon['kind'], number> = {
  Floor_: 0x94a3b8,
  Ceiling_: 0xe2e8f0,
  Wall_: 0xcbd5e1,
  InteriorWall_: 0xf8fafc,
  Door_: 0x92400e,
  Window_: 0x38bdf8,
  Roof_: 0xb45309,
  Ground_: 0x64748b,
  OuterFloor_: 0x94a3b8,
  OuterCeiling_: 0x94a3b8,
  Lod0FootPrint_: 0x22c55e,
  Lod0RoofEdge_: 0x22c55e,
  Lod1Poligon_: 0xa3e635,
};

export const BrepPreview3D: React.FC<BrepPreview3DProps> = ({ brep, onClose }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const groupsRef = useRef<Partial<Record<Layer, THREE.Group>>>({});
  const renderRef = useRef<() => void>(() => undefined);
  const [layers, setLayers] = useState<Record<Layer, boolean>>({ rooms: true, tubs: false, storeys: false, openings: true, shell: true });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    const r0 = mount.getBoundingClientRect();
    renderer.setSize(Math.max(r0.width, 200), Math.max(r0.height, 200));
    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x334155, 1.6));
    const sun = new THREE.DirectionalLight(0xffffff, 1.4);
    sun.position.set(30, 50, 20);
    scene.add(sun);

    // Köken: tüm köşelerin orta noktası (32 bit titremesini önler)
    const all: Pt3[] = [...brep.storeys, ...brep.sectionParts, ...brep.rooms].flatMap((o) => o.surfaces.flatMap((s) => s.polygons.flatMap((p) => p.outer)));
    const mid = (k: 'x' | 'y' | 'z') => (all.length ? (Math.min(...all.map((p) => p[k])) + Math.max(...all.map((p) => p[k]))) / 2 : 0);
    const origin = { e: mid('x') / 1000, n: mid('y') / 1000, z: (all.length ? Math.min(...all.map((p) => p.z)) : 0) / 1000 };
    const toP = (q: Pt3) => ({ e: q.x / 1000, n: q.y / 1000, z: q.z / 1000 });
    const disposables: { dispose: () => void }[] = [];

    const addPoly = (g: THREE.Group, p: BrepPolygon, opacity: number) => {
      const tri = triangulatePolygonWithHoles3D(p.outer.map(toP), p.holes.map((h) => h.map(toP)), origin);
      if (tri.indices.length < 3) return;
      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.BufferAttribute(tri.positions, 3));
      geom.setIndex(new THREE.BufferAttribute(tri.indices, 1));
      geom.computeVertexNormals();
      const mat = new THREE.MeshStandardMaterial({ color: COLOR[p.kind], transparent: opacity < 1, opacity, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: p.kind === 'Door_' || p.kind === 'Window_' ? -1 : 1, polygonOffsetUnits: 1, depthWrite: opacity >= 1 });
      g.add(new THREE.Mesh(geom, mat));
      const lineGeom = new THREE.BufferGeometry();
      lineGeom.setAttribute('position', new THREE.BufferAttribute(tri.boundaryLinePositions, 3));
      const lineMat = new THREE.LineBasicMaterial({ color: 0x1e293b });
      g.add(new THREE.LineSegments(lineGeom, lineMat));
      disposables.push(geom, mat, lineGeom, lineMat);
    };
    const mk = (layer: Layer) => {
      const g = new THREE.Group();
      scene.add(g);
      groupsRef.current[layer] = g;
      return g;
    };
    const gRooms = mk('rooms');
    const gTubs = mk('tubs');
    const gStoreys = mk('storeys');
    const gOps = mk('openings');
    const gShell = mk('shell');
    for (const r of brep.rooms) for (const s of r.surfaces) for (const p of s.polygons) if (s.tag !== 'CeilingSurface') addPoly(gRooms, p, 1);
    for (const r of brep.rooms) for (const s of r.surfaces) for (const o of s.openings) addPoly(gOps, o.polygon, 1);
    for (const o of brep.lod2Openings) addPoly(gOps, o.polygon, 1);
    for (const b of brep.sectionParts) for (const s of b.surfaces) for (const p of s.polygons) addPoly(gTubs, p, 0.45);
    for (const k of brep.storeys) for (const s of k.surfaces) for (const p of s.polygons) addPoly(gStoreys, p, 0.25);
    for (const s of brep.shell.lod2Surfaces) if (s.tag === 'RoofSurface') for (const p of s.polygons) addPoly(gShell, p, 1);
    for (const b of brep.shell.balconies) for (const s of b.surfaces) for (const p of s.polygons) addPoly(gShell, p, 1);

    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3()).length() || 20;
    const center = box.getCenter(new THREE.Vector3());
    const camera = new THREE.PerspectiveCamera(45, renderer.domElement.width / renderer.domElement.height, 0.1, 2000);
    camera.position.set(center.x + size * 0.7, center.y + size * 0.6, center.z + size * 0.8);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(center);
    controls.update();
    const render = () => renderer.render(scene, camera);
    renderRef.current = render;
    controls.addEventListener('change', render);
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const w = Math.max(e.contentRect.width, 200);
        const h = Math.max(e.contentRect.height, 200);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        render();
      }
    });
    ro.observe(mount);
    render();
    return () => {
      ro.disconnect();
      controls.removeEventListener('change', render);
      controls.dispose();
      for (const d of disposables) d.dispose();
      renderer.dispose();
      groupsRef.current = {};
    };
  }, [brep]);

  useEffect(() => {
    for (const [k, g] of Object.entries(groupsRef.current) as [Layer, THREE.Group][]) g.visible = layers[k];
    renderRef.current();
  }, [layers, brep]);

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-slate-950" role="dialog" aria-label="Üretilen B-rep 3B önizleme">
      <div className="flex items-center gap-3 px-2 py-1 border-b border-slate-800 text-[11px] text-slate-200">
        <span className="font-semibold">3B önizleme (M5 geometri motoru)</span>
        {(Object.keys(LAYER_LABEL) as Layer[]).map((k) => (
          <label key={k} className="flex items-center gap-1">
            <input type="checkbox" checked={layers[k]} onChange={(e) => setLayers((s) => ({ ...s, [k]: e.target.checked }))} />
            {LAYER_LABEL[k]}
          </label>
        ))}
        <button type="button" onClick={onClose} className="ml-auto px-2 py-0.5 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700">Kapat</button>
      </div>
      <div ref={mountRef} className="relative flex-1 min-h-0" />
    </div>
  );
};

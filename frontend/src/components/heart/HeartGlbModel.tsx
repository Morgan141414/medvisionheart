import { Html, useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useUiStore } from '../../app/store';
import { PARTS_CONFIG, classifyPartByLocalPoint, matchPartFromObjectName } from './parts';

type Props = {
  clipPlane: THREE.Plane;
  modelUrl: string;
};

function guessLayerFromName(name: string): 'myocardium' | 'valves' | 'arteries' | 'chambers' | 'unknown' {
  const n = name.toLowerCase();
  if (/(artery|coronar|aorta|arteries|vessel)/.test(n)) return 'arteries';
  if (/(valve|mitral|aortic|tricuspid|pulmon)/.test(n)) return 'valves';
  if (/(atrium|ventricle|chamber)/.test(n)) return 'chambers';
  if (/(myocard|muscle)/.test(n)) return 'myocardium';
  return 'unknown';
}

function coerceToLayerId(
  partId: ReturnType<typeof matchPartFromObjectName>,
): 'myocardium' | 'valves' | 'arteries' | 'chambers' | 'unknown' {
  if (partId === 'myocardium') return 'myocardium';
  if (partId === 'valves') return 'valves';
  if (partId === 'arteries') return 'arteries';
  if (partId === 'chambers') return 'chambers';
  return 'unknown';
}

export function HeartGlbModel({ clipPlane, modelUrl }: Props) {
  const layers = useUiStore((s) => s.layers);
  const beat = useUiStore((s) => s.beat);
  const opacity = useUiStore((s) => s.opacity);
  const sectionEnabled = useUiStore((s) => s.sectionEnabled);
  const pathology = useUiStore((s) => s.pathology);
  const resetViewNonce = useUiStore((s) => s.resetViewNonce);
  const setHoveredPart = useUiStore((s) => s.setHoveredPart);
  const setSelectedPart = useUiStore((s) => s.setSelectedPart);

  const gltf = useGLTF(modelUrl) as any;
  const rootRef = useRef<THREE.Group>(null);
  const arteryMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);

  // Tooltip state: we show it at the hit point (even if the model is a single mesh).
  const [tip, setTip] = useState<{ text: string; position: THREE.Vector3 } | null>(null);

  const scene = useMemo<THREE.Object3D>(() => {
    // Clone once to avoid mutating GLTF cache.
    const cloned = gltf.scene.clone(true);

    cloned.traverse((obj: any) => {
      if (!obj.isMesh) return;
      obj.castShadow = false;
      obj.receiveShadow = false;
      // Clone material so we can safely tweak it.
      if (obj.material) {
        obj.material = obj.material.clone();
      } else {
        obj.material = new THREE.MeshStandardMaterial({ color: '#D35462', roughness: 0.55 });
      }

      // Tag the mesh with a guessed layer from its name.
      const byName = matchPartFromObjectName(String(obj.name || ''));
      const layer = byName !== 'unknown' ? coerceToLayerId(byName) : guessLayerFromName(String(obj.name || ''));
      obj.userData.__layer = layer;
    });

    return cloned;
  }, [gltf.scene]);

  // Dev helper: dump object tree (names) so we can map real meshNames -> UI layers.
  useEffect(() => {
    const lines: string[] = [];
    const maxNodes = 260;
    let count = 0;
    const walk = (obj: THREE.Object3D, depth: number) => {
      if (count >= maxNodes) return;
      count += 1;
      const pad = '  '.repeat(depth);
      const type = (obj as any).type || 'Object3D';
      const name = obj.name ? `"${obj.name}"` : '(no-name)';
      const meshFlag = (obj as any).isMesh ? ' [Mesh]' : '';
      lines.push(`${pad}- ${type} ${name}${meshFlag}`);
      for (const child of obj.children) {
        if (count >= maxNodes) break;
        walk(child, depth + 1);
      }
    };
    walk(scene as THREE.Object3D, 0);
    if (count >= maxNodes) lines.push(`… truncated after ${maxNodes} nodes`);
    // eslint-disable-next-line no-console
    console.log(`[Heart GLB] Scene graph (${count} nodes, capped):\n${lines.join('\n')}`);
  }, [scene]);

  // Apply materials, visibility, clipping.
  useEffect(() => {
    arteryMaterialsRef.current = [];
    scene.traverse((obj: any) => {
      if (!obj.isMesh) return;
      const mat = obj.material as THREE.MeshStandardMaterial;
      mat.clippingPlanes = sectionEnabled ? [clipPlane] : null;
      mat.clipIntersection = true;
      mat.transparent = opacity < 0.999;
      mat.opacity = opacity;

      // Layer toggles: work great for segmented GLBs; for single-mesh GLBs it stays visible.
      const layer = (obj.userData.__layer || 'unknown') as string;
      const visibleByLayer =
        layer === 'myocardium'
          ? layers.myocardium
          : layer === 'valves'
            ? layers.valves
            : layer === 'arteries'
              ? layers.arteries
              : layer === 'chambers'
                ? layers.chambers
                : true;
      obj.visible = visibleByLayer;

      // Pathology “CAD” mode: intensify arteries.
      if (layer === 'arteries') {
        mat.emissive = new THREE.Color(pathology === 'cad' ? '#ff0000' : '#000000');
        mat.emissiveIntensity = pathology === 'cad' ? 0.4 : 0.0;
        arteryMaterialsRef.current.push(mat);
      }
    });
  }, [scene, layers, opacity, sectionEnabled, clipPlane, pathology]);

  // Heartbeat (scale) animation.
  useFrame(({ clock }) => {
    if (!rootRef.current) return;

    // CAD: subtle pulsating arterial glow.
    if (pathology === 'cad' && arteryMaterialsRef.current.length) {
      const t = clock.getElapsedTime();
      const intensity = 0.32 + Math.max(0, Math.sin(t * 3.8)) * 0.22;
      for (const mat of arteryMaterialsRef.current) {
        mat.emissiveIntensity = intensity;
      }
    }

    if (!beat) {
      rootRef.current.scale.setScalar(1);
      return;
    }
    const t = clock.getElapsedTime();
    const rate = pathology === 'cad' ? 2.8 : 2.2;
    const amp = pathology === 'cad' ? 0.026 : 0.02;
    const s = 1 + Math.sin(t * rate) * amp;
    rootRef.current.scale.setScalar(s);
  });

  // Reset view: clear selected/hovered and tooltip.
  useEffect(() => {
    setHoveredPart(undefined);
    setSelectedPart(undefined);
    setTip(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetViewNonce]);

  return (
    <group
      ref={rootRef}
      // Many Sketchfab models are huge; keep it centered and consistent.
      scale={1.0}
      position={[0, -0.1, 0]}
      onPointerMove={(e: any) => {
        e.stopPropagation();
        if (!rootRef.current) return;

        const worldPoint = e.point as THREE.Vector3;
        const byName = matchPartFromObjectName(String(e.object?.name || ''));
        if (byName !== 'unknown') {
          const cfg = PARTS_CONFIG.find((p) => p.id === byName);
          setHoveredPart(byName);
          setTip({ text: cfg?.label || byName, position: worldPoint.clone() });
          return;
        }

        const local = rootRef.current.worldToLocal(worldPoint.clone());
        const part = classifyPartByLocalPoint(local);
        setHoveredPart(part.id);
        setTip({ text: part.label, position: worldPoint.clone() });
      }}
      onPointerOut={(e: any) => {
        e.stopPropagation();
        setHoveredPart(undefined);
        setTip(null);
      }}
      onClick={(e: any) => {
        e.stopPropagation();
        if (!rootRef.current) return;

        const byName = matchPartFromObjectName(String(e.object?.name || ''));
        if (byName !== 'unknown') {
          setSelectedPart(byName);
          return;
        }

        const local = rootRef.current.worldToLocal((e.point as THREE.Vector3).clone());
        const part = classifyPartByLocalPoint(local);
        setSelectedPart(part.id);
      }}
    >
      <primitive object={scene} />
      {tip ? (
        <Html position={tip.position} center style={{ pointerEvents: 'none' }}>
          <div
            style={{
              padding: '6px 10px',
              borderRadius: 10,
              background: 'rgba(15, 26, 51, 0.92)',
              border: '1px solid rgba(255,255,255,0.18)',
              color: '#eaf0ff',
              fontSize: 12,
              whiteSpace: 'nowrap',
            }}
          >
            {tip.text}
          </div>
        </Html>
      ) : null}
    </group>
  );
}

// Preload for better UX (WOW factor: no “pop-in”).
useGLTF.preload('/models/heart.glb');

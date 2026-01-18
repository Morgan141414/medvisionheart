import * as THREE from 'three';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useUiStore } from '../../app/store';

type Props = {
  clipPlane: THREE.Plane;
};

function makeMaterial(base: THREE.MeshStandardMaterialParameters, clipPlane: THREE.Plane) {
  return new THREE.MeshStandardMaterial({
    ...base,
    clippingPlanes: [clipPlane],
    clipIntersection: true,
  });
}

export function HeartModel({ clipPlane }: Props) {
  const layers = useUiStore((s) => s.layers);
  const beat = useUiStore((s) => s.beat);
  const opacity = useUiStore((s) => s.opacity);
  const pathology = useUiStore((s) => s.pathology);
  const setHoveredPart = useUiStore((s) => s.setHoveredPart);
  const setSelectedPart = useUiStore((s) => s.setSelectedPart);

  const groupRef = useRef<THREE.Group>(null);

  // Geometries: stylized but “anatomy-like” placeholders.
  const geo = useMemo(() => {
    const myocardium = new THREE.SphereGeometry(0.62, 48, 48);
    myocardium.scale(0.85, 1.05, 0.72);

    const valve = new THREE.TorusGeometry(0.12, 0.03, 18, 64);
    const artery = new THREE.TorusKnotGeometry(0.25, 0.03, 140, 18);

    return { myocardium, valve, artery };
  }, []);

  const materials = useMemo(() => {
    const transparent = opacity < 0.999;

    const myocardium = makeMaterial(
      {
        color: '#D35462',
        roughness: 0.55,
        metalness: 0.05,
        transparent,
        opacity,
      },
      clipPlane,
    );

    const valves = makeMaterial(
      {
        color: '#E7D8C9',
        roughness: 0.6,
        metalness: 0.0,
        transparent,
        opacity,
      },
      clipPlane,
    );

    const arteries = makeMaterial(
      {
        color: pathology === 'cad' ? '#FF4D4D' : '#FF7A7A',
        emissive: pathology === 'cad' ? new THREE.Color('#FF1A1A') : new THREE.Color('#000000'),
        emissiveIntensity: pathology === 'cad' ? 0.35 : 0.0,
        roughness: 0.35,
        metalness: 0.0,
        transparent,
        opacity,
      },
      clipPlane,
    );

    return { myocardium, valves, arteries };
  }, [clipPlane, opacity, pathology]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    if (!beat) {
      groupRef.current.scale.setScalar(1);
      return;
    }
    const t = clock.getElapsedTime();
    const s = 1 + Math.sin(t * 2.2) * 0.03;
    groupRef.current.scale.setScalar(s);
  });

  const commonHandlers = (name: string) => ({
    onPointerOver: (e: any) => {
      e.stopPropagation();
      setHoveredPart(name);
    },
    onPointerOut: (e: any) => {
      e.stopPropagation();
      setHoveredPart(undefined);
    },
    onClick: (e: any) => {
      e.stopPropagation();
      setSelectedPart(name);
    },
  });

  return (
    <group ref={groupRef} position={[0, 0.05, 0]}>
      {layers.myocardium && (
        <mesh
          name="myocardium"
          geometry={geo.myocardium}
          material={materials.myocardium}
          {...commonHandlers('myocardium')}
        />
      )}

      {layers.valves && (
        <group name="valves" {...commonHandlers('valves')}>
          <mesh geometry={geo.valve} material={materials.valves} position={[0.05, 0.2, 0.15]} />
          <mesh geometry={geo.valve} material={materials.valves} position={[-0.1, 0.05, 0.22]} />
        </group>
      )}

      {layers.arteries && (
        <mesh
          name="coronaryArteries"
          geometry={geo.artery}
          material={materials.arteries}
          rotation={[Math.PI / 2.5, 0, 0]}
          position={[0.02, 0.0, 0.05]}
          {...commonHandlers('coronaryArteries')}
        />
      )}
    </group>
  );
}

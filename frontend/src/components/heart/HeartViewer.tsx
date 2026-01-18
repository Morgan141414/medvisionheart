import { Box } from '@mui/material';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, TransformControls } from '@react-three/drei';
import * as THREE from 'three';
import { useMemo, useRef } from 'react';
import { useUiStore } from '../../app/store';
import { HeartGlbModel } from './HeartGlbModel';

function Scene() {
  const clip = useUiStore((s) => s.clip);
  const sectionEnabled = useUiStore((s) => s.sectionEnabled);
  const resetViewNonce = useUiStore((s) => s.resetViewNonce);
  const setClip = useUiStore((s) => s.setClip);

  const { gl } = useThree();
  gl.localClippingEnabled = true;

  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(1, 0, 0), 0), []);

  const controlsRef = useRef<any>(null);
  const planeMeshRef = useRef<THREE.Mesh>(null);
  const isDraggingRef = useRef(false);

  const CLIP_SCALE = 0.35;

  useFrame(() => {
    if (!sectionEnabled) return;

    // If user is dragging the plane with TransformControls, derive clip from plane position.
    // Otherwise, keep plane synced to the slider value.
    if (isDraggingRef.current && planeMeshRef.current) {
      plane.constant = -planeMeshRef.current.position.x;
      const v = THREE.MathUtils.clamp((-plane.constant) / CLIP_SCALE, -1, 1);
      setClip(v);
      return;
    }

    plane.constant = THREE.MathUtils.clamp(clip, -1, 1) * CLIP_SCALE;
    if (planeMeshRef.current) {
      planeMeshRef.current.position.x = -plane.constant;
    }
  });

  // Reset orbit controls on demand.
  // Note: OrbitControls has a .reset() method.
  // We keep it here to match UX expectations of "Сбросить вид".
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useMemo(() => {
    if (controlsRef.current?.reset) controlsRef.current.reset();
    return null;
  }, [resetViewNonce]);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 6, 3]} intensity={1.1} />
      {/*
        Production-like integration:
        - If /public/models/heart.glb exists, we render it.
        - Otherwise we fall back to the stylized placeholder.
      */}
      <group>
        {/* If the model URL 404s, drei will throw; for MVP we keep fallback via try/catch boundary in the page later. */}
        <HeartGlbModel clipPlane={plane} modelUrl="/models/heart.glb" />

        {sectionEnabled ? (
          <TransformControls
            mode="translate"
            showY={false}
            showZ={false}
            onMouseDown={() => {
              isDraggingRef.current = true;
            }}
            onMouseUp={() => {
              isDraggingRef.current = false;
            }}
          >
            {/* Visual plane you can drag (gizmo). PlaneGeometry default normal is +Z, rotate to +X. */}
            <mesh
              ref={planeMeshRef}
              rotation={[0, Math.PI / 2, 0]}
              position={[-plane.constant, 0, 0]}
            >
              <planeGeometry args={[1.4, 1.4]} />
              <meshBasicMaterial color="#66b2ff" transparent opacity={0.12} depthWrite={false} />
            </mesh>
          </TransformControls>
        ) : null}
      </group>
      <OrbitControls ref={controlsRef} enablePan={false} enabled={!isDraggingRef.current} />
      <Environment preset="city" />
    </>
  );
}

export function HeartViewer() {
  return (
    <Box
      sx={{
        width: '100%',
        height: 520,
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.08)',
        background:
          'radial-gradient(900px 480px at 25% 15%, rgba(102,178,255,0.16), rgba(11,18,32,0.85) 55%, rgba(6,10,18,1) 100%)',
      }}
    >
      <Canvas camera={{ position: [1.7, 0.6, 2.2], fov: 45 }}>
        <Scene />
      </Canvas>
    </Box>
  );
}

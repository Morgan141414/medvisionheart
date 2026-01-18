import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import fs from 'node:fs';
import path from 'node:path';

// three.js GLTFExporter is written for the browser and expects FileReader.
// Node has Blob/ArrayBuffer but no FileReader, so we polyfill the minimal bits.
if (typeof globalThis.FileReader === 'undefined') {
  globalThis.FileReader = class FileReader {
    constructor() {
      this.result = null;
      this.onloadend = null;
      this.onerror = null;
    }

    readAsArrayBuffer(blob) {
      Promise.resolve()
        .then(() => blob.arrayBuffer())
        .then((ab) => {
          this.result = ab;
          this.onloadend?.({ target: this });
        })
        .catch((err) => {
          this.onerror?.(err);
        });
    }

    readAsDataURL(blob) {
      Promise.resolve()
        .then(() => blob.arrayBuffer())
        .then((ab) => {
          const base64 = Buffer.from(ab).toString('base64');
          const mime = blob.type || 'application/octet-stream';
          this.result = `data:${mime};base64,${base64}`;
          this.onloadend?.({ target: this });
        })
        .catch((err) => {
          this.onerror?.(err);
        });
    }
  };
}

function makeHeartShape() {
  // Based on the classic three.js heart Shape example (procedural, no external asset).
  const x = 0;
  const y = 0;
  const heartShape = new THREE.Shape();

  heartShape.moveTo(x + 0.25, y + 0.25);
  heartShape.bezierCurveTo(x + 0.25, y + 0.25, x + 0.2, y, x, y);
  heartShape.bezierCurveTo(x - 0.3, y, x - 0.3, y + 0.35, x - 0.3, y + 0.35);
  heartShape.bezierCurveTo(x - 0.3, y + 0.55, x - 0.1, y + 0.77, x + 0.25, y + 0.95);
  heartShape.bezierCurveTo(x + 0.6, y + 0.77, x + 0.8, y + 0.55, x + 0.8, y + 0.35);
  heartShape.bezierCurveTo(x + 0.8, y + 0.35, x + 0.8, y, x + 0.5, y);
  heartShape.bezierCurveTo(x + 0.35, y, x + 0.25, y + 0.25, x + 0.25, y + 0.25);

  return heartShape;
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function exportGlb(object3d, outPath) {
  const exporter = new GLTFExporter();

  return new Promise((resolve, reject) => {
    exporter.parse(
      object3d,
      (result) => {
        try {
          if (result instanceof ArrayBuffer) {
            fs.writeFileSync(outPath, Buffer.from(result));
          } else {
            reject(new Error('Expected GLB (ArrayBuffer) but got JSON glTF.'));
            return;
          }
          resolve();
        } catch (e) {
          reject(e);
        }
      },
      (error) => reject(error),
      { binary: true }
    );
  });
}

async function main() {
  const outPath = path.resolve('public', 'models', 'heart.glb');
  ensureDir(path.dirname(outPath));

  const root = new THREE.Group();
  root.name = 'HeartRoot';

  // Myocardium: extruded heart shape.
  const heartShape = makeHeartShape();
  const myocardiumGeom = new THREE.ExtrudeGeometry(heartShape, {
    depth: 0.22,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.02,
    bevelSegments: 2,
    curveSegments: 18,
  });
  myocardiumGeom.center();

  const myocardiumMat = new THREE.MeshStandardMaterial({
    color: '#b31b2c',
    roughness: 0.7,
    metalness: 0.0,
  });

  const myocardium = new THREE.Mesh(myocardiumGeom, myocardiumMat);
  myocardium.name = 'Myocardium';
  myocardium.scale.set(1.2, 1.2, 1.2);
  myocardium.rotation.x = Math.PI * 0.5;
  root.add(myocardium);

  // Chambers: two inner spheres.
  const chamberMat = new THREE.MeshStandardMaterial({
    color: '#5d1a25',
    roughness: 0.85,
  });

  const chamberLeft = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 16), chamberMat);
  chamberLeft.name = 'Chamber_Left';
  chamberLeft.position.set(0.12, 0.02, 0.05);
  root.add(chamberLeft);

  const chamberRight = new THREE.Mesh(new THREE.SphereGeometry(0.2, 24, 16), chamberMat);
  chamberRight.name = 'Chamber_Right';
  chamberRight.position.set(-0.12, 0.02, 0.06);
  root.add(chamberRight);

  // Arteries: simple tubes.
  const arteryMat = new THREE.MeshStandardMaterial({
    color: '#d33636',
    roughness: 0.55,
  });

  const aortaPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.0, 0.12, 0.02),
    new THREE.Vector3(0.05, 0.2, 0.02),
    new THREE.Vector3(0.07, 0.28, -0.02),
  ]);
  const aorta = new THREE.Mesh(new THREE.TubeGeometry(aortaPath, 24, 0.045, 12, false), arteryMat);
  aorta.name = 'Aorta';
  root.add(aorta);

  const pulmPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.02, 0.11, 0.02),
    new THREE.Vector3(-0.08, 0.18, 0.03),
    new THREE.Vector3(-0.12, 0.26, 0.01),
  ]);
  const pulmonary = new THREE.Mesh(new THREE.TubeGeometry(pulmPath, 24, 0.04, 12, false), arteryMat);
  pulmonary.name = 'PulmonaryArtery';
  root.add(pulmonary);

  // Valves: small rings/disks near outlets.
  const valveMat = new THREE.MeshStandardMaterial({
    color: '#2ca24a',
    roughness: 0.6,
  });

  const valveAortic = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.018, 12, 24), valveMat);
  valveAortic.name = 'Valve_Aortic';
  valveAortic.position.set(0.02, 0.1, 0.02);
  valveAortic.rotation.x = Math.PI * 0.5;
  root.add(valveAortic);

  const valveMitral = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.018, 12, 24), valveMat);
  valveMitral.name = 'Valve_Mitral';
  valveMitral.position.set(0.0, 0.03, 0.02);
  valveMitral.rotation.x = Math.PI * 0.5;
  root.add(valveMitral);

  // Lighting hint: not exported as lights by default; materials are enough.

  // Normalize transform: scale to a reasonable size for viewer.
  root.scale.setScalar(1.0);

  await exportGlb(root, outPath);

  // eslint-disable-next-line no-console
  console.log(`Generated GLB: ${outPath}`);
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exitCode = 1;
});

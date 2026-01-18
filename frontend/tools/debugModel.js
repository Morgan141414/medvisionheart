import fs from 'node:fs';
import path from 'node:path';

// Minimal GLB (glTF binary) parser to extract node/mesh names without extra deps.
// Works offline and does not rely on fetch/file:// support.

function parseGlb(buffer) {
  if (buffer.length < 12) throw new Error('File too small to be a GLB');

  const magic = buffer.readUInt32LE(0);
  const version = buffer.readUInt32LE(4);
  const length = buffer.readUInt32LE(8);

  // 0x46546C67 == 'glTF'
  if (magic !== 0x46546c67) throw new Error('Not a GLB (bad magic)');
  if (version !== 2) throw new Error(`Unsupported GLB version: ${version}`);
  if (length !== buffer.length) {
    // Some generators may pad; do not hard-fail.
  }

  let offset = 12;
  let jsonChunk = null;

  while (offset + 8 <= buffer.length) {
    const chunkLength = buffer.readUInt32LE(offset);
    const chunkType = buffer.readUInt32LE(offset + 4);
    offset += 8;

    const chunkData = buffer.subarray(offset, offset + chunkLength);
    offset += chunkLength;

    // JSON chunk type == 0x4E4F534A ('JSON')
    if (chunkType === 0x4e4f534a) {
      jsonChunk = chunkData;
      break;
    }
  }

  if (!jsonChunk) throw new Error('GLB missing JSON chunk');

  const jsonText = jsonChunk.toString('utf8').replace(/\u0000+$/g, '');
  return JSON.parse(jsonText);
}

function main() {
  const glbPath = path.resolve('public', 'models', 'heart.glb');
  const outPath = path.resolve('model_structure.json');

  const buffer = fs.readFileSync(glbPath);
  const gltf = parseGlb(buffer);

  const nodes = Array.isArray(gltf.nodes) ? gltf.nodes : [];
  const meshes = Array.isArray(gltf.meshes) ? gltf.meshes : [];

  const meshList = [];
  for (let i = 0; i < nodes.length; i += 1) {
    const n = nodes[i];
    if (typeof n?.mesh !== 'number') continue;

    const mesh = meshes[n.mesh];
    meshList.push({
      name: n.name ?? '(unnamed)',
      type: 'Mesh',
      meshIndex: n.mesh,
      meshName: mesh?.name ?? '(unnamed-mesh)',
      primitives: Array.isArray(mesh?.primitives) ? mesh.primitives.length : 0,
    });
  }

  // eslint-disable-next-line no-console
  console.log('Найденные объекты (ноды/меши):');
  // eslint-disable-next-line no-console
  console.table(meshList);

  fs.writeFileSync(outPath, JSON.stringify(meshList, null, 2), 'utf8');
  // eslint-disable-next-line no-console
  console.log(`Структура сохранена в ${outPath}`);
}

main();

import * as THREE from 'three';

export type PartId =
  | 'arteries'
  | 'valves'
  | 'chambers'
  | 'myocardium'
  | 'unknown';

export type PartConfig = {
  id: PartId;
  label: string;
  description: string;
  /** Exact mesh names from the loaded GLB. */
  meshNames?: string[];
  /** Optional UI hint. */
  color?: string;
  /**
   * Heuristic classifier for models that are NOT split into named meshes.
   * Works best if the heart is roughly centered and oriented consistently.
   * You can tune these rules after inspecting your GLB in devtools.
   */
  containsLocalPoint?: (p: THREE.Vector3) => boolean;
};

export const PARTS_CONFIG: PartConfig[] = [
  {
    id: 'arteries',
    label: 'Артерии',
    description:
      'Крупные сосуды, по которым кровь выходит из сердца. В режиме патологии (CAD) подсвечиваются для акцента на сосудистых структурах.',
    meshNames: ['Aorta', 'PulmonaryArtery'],
    color: '#ff4444',
  },
  {
    id: 'valves',
    label: 'Клапаны',
    description:
      'Клапаны обеспечивают однонаправленный ток крови. В демо представлены условно для наглядности.',
    meshNames: ['Valve_Aortic', 'Valve_Mitral'],
    color: '#44ff44',
  },
  {
    id: 'chambers',
    label: 'Камеры',
    description: 'Полости сердца (условно) для визуального объяснения заполнения и выброса.',
    meshNames: ['Chamber_Left', 'Chamber_Right'],
    color: '#7aa7ff',
  },
  {
    id: 'myocardium',
    label: 'Миокард',
    description:
      'Сердечная мышца, которая сокращается и обеспечивает работу насоса. В демо это основной объём сердца.',
    meshNames: ['Myocardium'],
    color: '#b31b2c',
    containsLocalPoint: () => true,
  },
  {
    id: 'unknown',
    label: 'Прочее',
    description:
      'Элементы, не классифицированные автоматически. Используйте подсказки при наведении и обновите правила сопоставления по именам мешей.',
  },
];

export function matchPartFromObjectName(name: string | undefined | null): PartId {
  if (!name) return 'unknown';
  const needle = String(name).trim().toLowerCase();
  for (const part of PARTS_CONFIG) {
    if (!part.meshNames?.length) continue;
    if (part.meshNames.some((n) => n.toLowerCase() === needle)) return part.id;
  }
  return 'unknown';
}

export function classifyPartByLocalPoint(p: THREE.Vector3): PartConfig {
  for (const part of PARTS_CONFIG) {
    if (!part.containsLocalPoint) continue;
    if (part.containsLocalPoint(p)) return part;
  }
  return {
    id: 'unknown',
    label: 'Неизвестная структура',
    description: 'Часть модели не классифицирована. Для точности настройте PARTS_CONFIG под вашу GLB-модель.',
    containsLocalPoint: () => true,
  };
}

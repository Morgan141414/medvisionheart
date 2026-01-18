import type { HeartInfoMap, Patient } from './types';

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return (await res.json()) as T;
}

export async function fetchPatient(): Promise<Patient> {
  try {
    return await getJson<Patient>('/api/patient');
  } catch {
    // Deploy-friendly fallback (static demo).
    return {
      id: 'demo-001',
      fullName: 'Иванов А.А.',
      age: 55,
      diagnosis: 'ИБС, атеросклероз коронарных артерий',
      note: 'Демо-режим. Для локального API запустите backend на :3001.',
    };
  }
}

export async function fetchHeartInfo(): Promise<HeartInfoMap> {
  try {
    return await getJson<HeartInfoMap>('/api/heart-info');
  } catch {
    return {
      myocardium: {
        title: 'Миокард (мышечная ткань)',
        description:
          'Основная мышечная ткань сердца, которая обеспечивает сокращение и выброс крови. Её питание зависит от коронарного кровотока.',
      },
      valves: {
        title: 'Клапаны',
        description:
          'Клапаны задают однонаправленный поток крови. При пролапсе/стенозе меняется объём и направление потока.',
      },
      arteries: {
        title: 'Артерии (коронарные сосуды)',
        description:
          'Сосуды, питающие миокард. При атеросклерозе просвет сужается — тканям может не хватать кислорода.',
      },
      chambers: {
        title: 'Камеры сердца',
        description:
          'Предсердия и желудочки — полости, которые наполняются и опорожняются во время сердечного цикла.',
      },
      leftVentricle: {
        title: 'Левый желудочек',
        description:
          'Главная насосная камера большого круга кровообращения. При ишемии страдает чаще из‑за высокой нагрузки.',
      },
      rightVentricle: {
        title: 'Правый желудочек',
        description:
          'Перекачивает кровь в лёгочный круг. Важно для понимания одышки и лёгочной гипертензии.',
      },
      leftAtrium: {
        title: 'Левое предсердие',
        description:
          'Принимает кровь из лёгочных вен. Часто фигурирует в контексте аритмий (например, фибрилляции предсердий).',
      },
      rightAtrium: {
        title: 'Правое предсердие',
        description:
          'Принимает венозную кровь из большого круга. Помогает объяснить роль венозного возврата и давления.',
      },
    };
  }
}

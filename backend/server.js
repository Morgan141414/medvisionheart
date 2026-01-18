const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/healthz', (_req, res) => {
  res.type('text/plain').send('ok');
});

app.get('/api/patient', (_req, res) => {
  res.json({
    id: 'demo-001',
    fullName: 'Иванов А.А.',
    age: 55,
    diagnosis: 'ИБС, атеросклероз коронарных артерий',
    note: 'Демо-режим. Данные не являются медицинской информацией.',
  });
});

app.get('/api/heart-info', (_req, res) => {
  // Keys correspond to PartId in the frontend (virtual parts) and/or mesh-layer guesses.
  res.json({
    myocardium: {
      title: 'Миокард (мышечная ткань)',
      description:
        'Основная мышечная ткань сердца, которая обеспечивает сокращение и выброс крови. В демо используется стилизованная модель для обучения пациента.',
    },
    valves: {
      title: 'Клапаны',
      description:
        'Клапаны направляют поток крови и предотвращают обратный ток. При некоторых состояниях (например, пролапс) клапан может закрываться неплотно.',
    },
    arteries: {
      title: 'Артерии (коронарные сосуды)',
      description:
        'Сосуды, питающие сердечную мышцу. При ишемической болезни сердца кровоток может быть нарушен из‑за сужения просвета.',
    },
    chambers: {
      title: 'Камеры сердца',
      description:
        'Полости предсердий и желудочков, где происходит заполнение и выброс крови. В демо — виртуальная сегментация для визуального объяснения.',
    },
    leftVentricle: {
      title: 'Левый желудочек',
      description:
        'Главная «насосная» камера большого круга. При поражении коронарных артерий страдает в первую очередь из‑за высокой потребности в кислороде.',
    },
    rightVentricle: {
      title: 'Правый желудочек',
      description:
        'Перекачивает кровь в лёгочный круг. Важно для понимания одышки и перегрузки правых отделов.',
    },
    leftAtrium: {
      title: 'Левое предсердие',
      description:
        'Принимает кровь из лёгочных вен и направляет её в левый желудочек. Часто упоминается при мерцательной аритмии.',
    },
    rightAtrium: {
      title: 'Правое предсердие',
      description:
        'Принимает венозную кровь и передаёт её в правый желудочек. Помогает объяснить связь венозного возврата и нагрузки на сердце.',
    },
  });
});

const port = Number(process.env.PORT || 3001);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`SAA backend listening on http://127.0.0.1:${port}`);
});

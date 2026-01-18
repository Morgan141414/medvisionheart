import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Drawer,
  FormControlLabel,
  IconButton,
  Slider,
  Stack,
  Switch,
  Typography,
} from '@mui/material';

import { AppShell } from '../components/AppShell';
import { HeartViewer } from '../components/heart/HeartViewer';
import { fetchHeartInfo, fetchPatient } from '../api/api';
import type { HeartInfoMap, Patient } from '../api/types';
import { useUiStore } from '../app/store';
import ReplayIcon from '@mui/icons-material/Replay';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ContentCutIcon from '@mui/icons-material/ContentCut';

export function DemoPage() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [heartInfo, setHeartInfo] = useState<HeartInfoMap | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const layers = useUiStore((s) => s.layers);
  const beat = useUiStore((s) => s.beat);
  const opacity = useUiStore((s) => s.opacity);
  const sectionEnabled = useUiStore((s) => s.sectionEnabled);
  const clip = useUiStore((s) => s.clip);
  const pathology = useUiStore((s) => s.pathology);
  const hoveredPart = useUiStore((s) => s.hoveredPart);
  const selectedPart = useUiStore((s) => s.selectedPart);

  const setLayer = useUiStore((s) => s.setLayer);
  const setBeat = useUiStore((s) => s.setBeat);
  const setOpacity = useUiStore((s) => s.setOpacity);
  const setSectionEnabled = useUiStore((s) => s.setSectionEnabled);
  const setClip = useUiStore((s) => s.setClip);
  const setPathology = useUiStore((s) => s.setPathology);
  const setSelectedPart = useUiStore((s) => s.setSelectedPart);
  const resetView = useUiStore((s) => s.resetView);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const [p, info] = await Promise.all([fetchPatient(), fetchHeartInfo()]);
        if (!alive) return;
        setPatient(p);
        setHeartInfo(info);
        setApiError(null);
      } catch (e: any) {
        if (!alive) return;
        setApiError(String(e?.message || e));
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  const selected = useMemo(() => {
    if (!heartInfo || !selectedPart) return null;
    return heartInfo[selectedPart];
  }, [heartInfo, selectedPart]);

  return (
    <AppShell>
      <Stack spacing={2}>
        <Card>
          <CardContent>
            <Stack spacing={0.5}>
              <Typography variant="h6">Карта пациента</Typography>
              {patient ? (
                <>
                  <Typography>
                    <strong>{patient.fullName}</strong>, {patient.age} лет
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    <Chip label={`Диагноз: ${patient.diagnosis}`} color="primary" />
                    <Button
                      variant="contained"
                      onClick={() => {
                        setPathology('cad');
                        setLayer('arteries', true);
                        setBeat(true);
                      }}
                    >
                      Показать в 3D
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<ReplayIcon />}
                      onClick={() => {
                        setPathology('none');
                        setBeat(true);
                        setOpacity(1);
                        setSectionEnabled(false);
                        setClip(0);
                        resetView();
                      }}
                    >
                      Сбросить вид
                    </Button>
                  </Stack>
                  {patient.note ? (
                    <Typography sx={{ color: 'text.secondary', mt: 1 }}>{patient.note}</Typography>
                  ) : null}
                </>
              ) : (
                <Typography sx={{ color: 'text.secondary' }}>Загрузка пациента…</Typography>
              )}
            </Stack>
          </CardContent>
        </Card>

        {apiError ? (
          <Alert severity="warning">
            API недоступно: {apiError}. Можно запустить backend на `localhost:3001`.
          </Alert>
        ) : null}

        <Card>
          <CardContent>
            <Stack spacing={1.5}>
              <Box sx={{ position: 'relative' }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  3D‑визуализатор
                </Typography>

                <HeartViewer />

                {/* Overlay controls (product-like). */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    width: { xs: 'calc(100% - 32px)', sm: 360 },
                  }}
                >
                  <Card sx={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(15,26,51,0.78)' }}>
                    <CardContent sx={{ py: 1.5 }}>
                      <Stack spacing={1}>
                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                          <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                            Управление
                          </Typography>
                          <Stack direction="row" spacing={0.5}>
                            <IconButton
                              size="small"
                              onClick={() => setBeat(!beat)}
                              sx={{ border: '1px solid rgba(255,255,255,0.12)' }}
                            >
                              {beat ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => setSectionEnabled(!sectionEnabled)}
                              sx={{ border: '1px solid rgba(255,255,255,0.12)' }}
                            >
                              <ContentCutIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </Stack>

                        <Box>
                          <Typography sx={{ color: 'text.secondary', fontSize: 12 }}>
                            Прозрачность
                          </Typography>
                          <Slider
                            value={opacity}
                            min={0.25}
                            max={1}
                            step={0.01}
                            onChange={(_, v) => setOpacity(Number(v))}
                          />
                        </Box>

                        <Divider />
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                          Слои
                        </Typography>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={layers.myocardium}
                              onChange={(_, v) => setLayer('myocardium', v)}
                            />
                          }
                          label="Миокард"
                        />
                        <FormControlLabel
                          control={<Switch checked={layers.valves} onChange={(_, v) => setLayer('valves', v)} />}
                          label="Клапаны"
                        />
                        <FormControlLabel
                          control={<Switch checked={layers.arteries} onChange={(_, v) => setLayer('arteries', v)} />}
                          label="Артерии"
                        />
                        <FormControlLabel
                          control={<Switch checked={layers.chambers} onChange={(_, v) => setLayer('chambers', v)} />}
                          label="Камеры"
                        />

                        {sectionEnabled ? (
                          <Box>
                            <Typography sx={{ color: 'text.secondary', fontSize: 12 }}>
                              Сечение (перетаскивайте плоскость мышью; ползунок — синхронизируется)
                            </Typography>
                            <Slider
                              value={clip}
                              min={-1}
                              max={1}
                              step={0.01}
                              onChange={(_, v) => setClip(Number(v))}
                            />
                          </Box>
                        ) : null}

                        <Typography sx={{ color: 'text.secondary', fontSize: 12 }}>
                          Наведение: {hoveredPart ? hoveredPart : '—'} · Режим: {pathology}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Box>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      <Drawer
        anchor="right"
        open={Boolean(selectedPart)}
        onClose={() => setSelectedPart(undefined)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 420 }, p: 2 } }}
      >
        <Stack spacing={1}>
          <Typography variant="h6">Аннотация</Typography>
          <Divider />
          {selected && selectedPart ? (
            <>
              <Typography variant="subtitle1">{selected.title}</Typography>
              <Typography sx={{ color: 'text.secondary' }}>{selected.description}</Typography>
              <Divider sx={{ my: 1 }} />
              <Typography sx={{ color: 'text.secondary', fontSize: 12 }}>
                Техническая метка: <code>{selectedPart}</code>
              </Typography>
            </>
          ) : (
            <Typography sx={{ color: 'text.secondary' }}>
              Описание недоступно (не загружено).
            </Typography>
          )}

          <Box sx={{ flex: 1 }} />
          <Button variant="outlined" onClick={() => setSelectedPart(undefined)}>
            Закрыть
          </Button>
        </Stack>
      </Drawer>
    </AppShell>
  );
}

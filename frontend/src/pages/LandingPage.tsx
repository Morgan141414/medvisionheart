import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import LayersIcon from '@mui/icons-material/Layers';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import PsychologyIcon from '@mui/icons-material/Psychology';
import CodeIcon from '@mui/icons-material/Code';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import StorageIcon from '@mui/icons-material/Storage';
import CloudIcon from '@mui/icons-material/Cloud';

export function LandingPage() {
  const githubUrl = (import.meta as any).env?.VITE_GITHUB_URL || '#';
  const liveUrl = (import.meta as any).env?.VITE_LIVE_DEMO_URL || '#';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background:
          'radial-gradient(1200px 700px at 20% 15%, rgba(102,178,255,0.22), rgba(11,18,32,0.92) 55%, rgba(6,10,18,1) 100%)',
      }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        {/* Hero */}
        <Stack spacing={2.2} sx={{ maxWidth: 920 }}>
          <Typography variant="overline" sx={{ color: 'text.secondary' }}>
            Smart Anatomy Assistant (SAA)
          </Typography>
          <Typography variant="h2" sx={{ fontWeight: 900, lineHeight: 1.05, fontSize: { xs: 40, md: 56 } }}>
            Smart Anatomy Assistant: Визуализируйте здоровье
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: { xs: 16, md: 18 } }}>
            Интерактивная 3D‑платформа для медицинского образования и консультаций.
            Показывайте пациенту сложные вещи быстро и понятно — прямо во время приёма.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ pt: 1 }}>
            <Button
              variant="contained"
              size="large"
              component={RouterLink}
              to="/demo"
              sx={{ px: 3, py: 1.2 }}
            >
              Запустить Демо
            </Button>
            <Button
              variant="outlined"
              size="large"
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              sx={{ px: 3, py: 1.2 }}
            >
              GitHub репозиторий
            </Button>
          </Stack>
        </Stack>

        {/* Features */}
        <Box sx={{ mt: { xs: 6, md: 8 } }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
            Возможности
          </Typography>
          <Grid container spacing={2} component="div">
            <Grid size={{ xs: 12, md: 4 }} component="div">
              <Card>
                <CardContent>
                  <Stack spacing={1}>
                    <Avatar sx={{ bgcolor: 'rgba(102,178,255,0.22)', color: 'primary.main' }}>
                      <LayersIcon />
                    </Avatar>
                    <Typography variant="h6">Детальная анатомия</Typography>
                    <Typography sx={{ color: 'text.secondary' }}>
                      Исследуйте сердце слой за слоем в реальном времени: выделение структур, прозрачность,
                      сечение.
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }} component="div">
              <Card>
                <CardContent>
                  <Stack spacing={1}>
                    <Avatar sx={{ bgcolor: 'rgba(77,208,225,0.18)', color: 'secondary.main' }}>
                      <MonitorHeartIcon />
                    </Avatar>
                    <Typography variant="h6">Патологии в контексте</Typography>
                    <Typography sx={{ color: 'text.secondary' }}>
                      Наглядно демонстрируйте заболевания в интерфейсе, похожем на МИС, с готовыми сценариями.
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }} component="div">
              <Card>
                <CardContent>
                  <Stack spacing={1}>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.10)', color: 'text.primary' }}>
                      <PsychologyIcon />
                    </Avatar>
                    <Typography variant="h6">Инструмент врача</Typography>
                    <Typography sx={{ color: 'text.secondary' }}>
                      Используйте во время приёма для повышения понимания и комплаенса пациента.
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Tech */}
        <Box sx={{ mt: { xs: 6, md: 8 } }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
            Технологии
          </Typography>
          <Grid container spacing={2} component="div">
            <Grid size={{ xs: 12, md: 3 }} component="div">
              <Card>
                <CardContent>
                  <Stack spacing={1} direction="row" alignItems="center">
                    <Avatar sx={{ bgcolor: 'rgba(102,178,255,0.16)' }}>
                      <CodeIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        React + TypeScript
                      </Typography>
                      <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
                        UI/UX и масштабируемая архитектура
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }} component="div">
              <Card>
                <CardContent>
                  <Stack spacing={1} direction="row" alignItems="center">
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.10)' }}>
                      <ViewInArIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        Three.js
                      </Typography>
                      <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
                        WebGL + интерактивная 3D‑анатомия
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }} component="div">
              <Card>
                <CardContent>
                  <Stack spacing={1} direction="row" alignItems="center">
                    <Avatar sx={{ bgcolor: 'rgba(77,208,225,0.14)' }}>
                      <StorageIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        Node.js API
                      </Typography>
                      <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
                        Mock MIS endpoints для демо
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }} component="div">
              <Card>
                <CardContent>
                  <Stack spacing={1} direction="row" alignItems="center">
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.10)' }}>
                      <CloudIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        Vercel-ready
                      </Typography>
                      <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
                        Сборка и деплой SPA
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Footer */}
        <Box sx={{ mt: { xs: 6, md: 8 }, pt: 3, borderTop: '1px solid rgba(255,255,255,0.10)' }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.2}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
          >
            <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
              Проект для портфолио.
            </Typography>
            <Stack direction="row" spacing={2}>
              <Link href={githubUrl} target="_blank" rel="noreferrer">
                GitHub репозиторий
              </Link>
              <Link href={liveUrl} target="_blank" rel="noreferrer">
                Живое демо
              </Link>
            </Stack>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}

import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Container maxWidth="sm">
        <Stack spacing={2}>
          <Typography variant="h4">Страница не найдена</Typography>
          <Typography sx={{ color: 'text.secondary' }}>
            Проверьте адрес или вернитесь на главную.
          </Typography>
          <Button variant="contained" component={RouterLink} to="/">
            На главную
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}

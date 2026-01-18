import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#66B2FF' },
    secondary: { main: '#4DD0E1' },
    background: {
      default: '#0B1220',
      paper: '#0F1A33',
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Noto Sans", "Liberation Sans"',
  },
});

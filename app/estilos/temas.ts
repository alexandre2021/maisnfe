import { createTheme } from '@mui/material/styles';

const temaClaro = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#9c27b0',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        main: {
          paddingTop: '10px', // Define o padding superior para o elemento main
          padding: '10px 20px 20px 20px', // Define os paddings individualmente se necessário
        },
      },
    },
  },
});

const temaEscuro = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        main: {
          paddingTop: '10px', // Define o padding superior para o elemento main
          padding: '10px 20px 20px 20px', // Define os paddings individualmente se necessário
        },
      },
    },
  },
});

export { temaClaro, temaEscuro };


import { createTheme } from '@mui/material/styles';

const FONT_HEADING = '"Baloo 2", "Trebuchet MS", cursive';
const FONT_BODY = '"Nunito Sans", "Segoe UI", sans-serif';

const theme = createTheme({
  spacing: 8,
  breakpoints: {
    values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 },
  },
  palette: {
    primary: { main: '#7C4DFF', light: '#A47BFF', dark: '#5B2FD6', contrastText: '#FFFFFF' },
    secondary: { main: '#FF4D8D', light: '#FF80AE', dark: '#D62F6C', contrastText: '#FFFFFF' },
    warning: { main: '#FFC93C' },
    success: { main: '#2DBE8F' },
    background: { default: '#FFFCF8', paper: '#FFFFFF' },
    text: { primary: '#1F1B2E', secondary: '#6B6580' },
    divider: '#EFE9F7',
  },
  typography: {
    fontFamily: FONT_BODY,
    h1: {
      fontFamily: FONT_HEADING,
      fontWeight: 700,
      fontSize: 'clamp(2rem, 5vw, 3.25rem)',
      lineHeight: 1.15,
    },
    h2: { fontFamily: FONT_HEADING, fontWeight: 700, fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)' },
    h3: { fontFamily: FONT_HEADING, fontWeight: 700, fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)' },
    h4: { fontFamily: FONT_HEADING, fontWeight: 700, fontSize: '1.4rem' },
    h5: { fontFamily: FONT_HEADING, fontWeight: 600, fontSize: '1.2rem' },
    h6: { fontFamily: FONT_HEADING, fontWeight: 600, fontSize: '1.05rem' },
    button: { fontFamily: FONT_BODY, fontWeight: 700, textTransform: 'none' },
  },
  shape: { borderRadius: 16 },
  shadows: [
    'none',
    '0 8px 24px rgba(124, 77, 255, 0.10)',
    '0 10px 28px rgba(124, 77, 255, 0.12)',
    '0 12px 32px rgba(124, 77, 255, 0.14)',
    '0 14px 36px rgba(124, 77, 255, 0.16)',
    ...Array(20).fill('0 16px 40px rgba(124, 77, 255, 0.16)'),
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: { scrollBehavior: 'smooth' },
        body: { backgroundColor: '#FFFCF8', overflowX: 'hidden' },
        img: { maxWidth: '100%' },
        '@media (prefers-reduced-motion: reduce)': {
          '*, *::before, *::after': {
            animationDuration: '0.01ms !important',
            animationIterationCount: '1 !important',
            transitionDuration: '0.01ms !important',
            scrollBehavior: 'auto !important',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          textTransform: 'none',
          fontWeight: 700,
          boxShadow: 'none',
          paddingInline: 20,
        },
        contained: {
          '&:hover': { boxShadow: '0 8px 24px rgba(124, 77, 255, 0.22)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 8px 24px rgba(124, 77, 255, 0.08)',
          border: '1px solid #EFE9F7',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 700, borderRadius: 999 },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': { borderRadius: 12 },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: '1px solid #EFE9F7',
          backgroundImage: 'none',
        },
      },
    },
  },
});

export default theme;

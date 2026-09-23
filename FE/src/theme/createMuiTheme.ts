import { createTheme } from '@mui/material/styles'

const FONT_STACK = '"Inter", system-ui, -apple-system, "Segoe UI", sans-serif'

const QQ_GOLD = '#f5a524'
const QQ_GOLD_DARK = '#c7780a'

export const createTruyenMuiTheme = (mode: 'light' | 'dark') =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: QQ_GOLD,
        light: '#ffd54f',
        dark: QQ_GOLD_DARK,
        contrastText: '#1a1a1a',
      },
      warning: {
        main: QQ_GOLD,
      },
      background: {
        default: mode === 'dark' ? '#1a1a1a' : '#eceff4',
        paper: mode === 'dark' ? '#252525' : '#ffffff',
      },
      text: {
        primary: mode === 'dark' ? '#f2f2f2' : '#1c1c1c',
        secondary: mode === 'dark' ? '#9a9a9a' : '#5c5c5c',
      },
      divider: mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)',
    },
    typography: {
      fontFamily: FONT_STACK,
      h2: { fontWeight: 800, letterSpacing: '-0.02em' },
      subtitle2: { fontWeight: 700 },
    },
    shape: {
      borderRadius: 10,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          // Tránh nhảy layout khi Select/Menu/Dialog khóa cuộn (scrollbar biến mất rồi xuất hiện lại).
          html: {
            scrollbarGutter: 'stable',
          },
          body: {
            backgroundColor: mode === 'dark' ? '#1a1a1a' : '#eceff4',
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
      },
    },
  })

import { createTheme, alpha } from "@mui/material/styles";

const palettes = {
  dark: {
    bg: "#080d18",
    panel: "#0e1626",
    panel2: "#121d30",
    border: "#243149",
    text: "#edf3ff",
    muted: "#91a0b8",
    accent: "#6ea8ff",
    accent2: "#8b7cff",
    code: "#07101d",
  },
  light: {
    bg: "#f5f7fb",
    panel: "#ffffff",
    panel2: "#f0f4fa",
    border: "#dbe2ee",
    text: "#142033",
    muted: "#66738a",
    accent: "#356fe6",
    accent2: "#7059e8",
    code: "#101827",
  },
};

export function buildTheme(mode) {
  const c = palettes[mode];
  return createTheme({
    palette: {
      mode,
      primary: { main: c.accent },
      secondary: { main: c.accent2 },
      background: { default: c.bg, paper: c.panel },
      text: { primary: c.text, secondary: c.muted },
      divider: c.border,
    },
    custom: { panel2: c.panel2, code: c.code },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily:
        'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: alpha(c.bg, 0.92),
            backdropFilter: "blur(16px)",
            color: c.text,
            borderBottom: `1px solid ${c.border}`,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: c.bg,
            borderRight: `1px solid ${c.border}`,
          },
        },
      },
      MuiAccordion: {
        styleOverrides: {
          root: {
            backgroundColor: c.panel,
            border: `1px solid ${c.border}`,
            "&:before": { display: "none" },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderColor: c.border },
        },
      },
    },
  });
}

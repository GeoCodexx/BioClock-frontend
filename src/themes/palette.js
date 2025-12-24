// themes/palette.js

export const lightColors = {
  primary: {
    light: "#E3F2FD",
    main: "#2196F3",
    dark: "#1E88E5",
    200: "#90CAF9",
    800: "#1565C0",
  },
  secondary: {
    light: "#EDE7F6",
    main: "#673AB7",
    dark: "#5E35B1",
    200: "#B39DDB",
    800: "#4527A0",
  },
  success: {
    light: "#B9F6CA",
    main: "#00E676",
    dark: "#00C853",
  },
  error: {
    light: "#EF9A9A",
    main: "#F44336",
    dark: "#C62828",
  },
  warning: {
    light: "#FFF8E1",
    main: "#FFC107",
    dark: "#FFA000",
  },
  background: {
    default: "#f5f5f5",
    paper: "#ffffff",
  },
  text: {
    primary: "rgba(0, 0, 0, 0.87)",
    secondary: "rgba(0, 0, 0, 0.6)",
    disabled: "rgba(0, 0, 0, 0.38)",
  },
};

export const darkColors = {
  primary: {
    light: "#64B5F6",
    main: "#42A5F5",
    dark: "#1E88E5",
    200: "#90CAF9",
    800: "#1565C0",
  },
  secondary: {
    light: "#B39DDB",
    main: "#9575CD",
    dark: "#7E57C2",
    200: "#B39DDB",
    800: "#4527A0",
  },
  success: {
    light: "#81C784",
    main: "#66BB6A",
    dark: "#4CAF50",
  },
  error: {
    light: "#E57373",
    main: "#F44336",
    dark: "#D32F2F",
  },
  warning: {
    light: "#FFD54F",
    main: "#FFC107",
    dark: "#FFA000",
  },
  background: {
    default: "#0a0e27", // Azul muy oscuro (casi negro)
    paper: "#151a2e", // Azul oscuro para cards
  },
  text: {
    //primary: '#e4e6eb',      // Gris claro suave (en vez de blanco puro)
    primary: "#d1d5db",
    //secondary: '#b0b3b8',    // Gris medio para texto secundario
    secondary: "#9ca3af",
    //disabled: '#8a8d91'      // Gris para texto deshabilitado
    disabled: "#6b7280",
  },
  divider: "rgba(255, 255, 255, 0.12)",
};

// Exportación por defecto para compatibilidad
export default lightColors;

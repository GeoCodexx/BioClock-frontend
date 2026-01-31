import { createTheme } from "@mui/material/styles";
import { lightColors, darkColors } from "./palette";
import typography from "./typography";

const commonComponents = {
  MuiButton: {
    styleOverrides: {
      root: {
        fontWeight: 500,
        borderRadius: 4,
      },
    },
  },
  MuiPaper: {
    defaultProps: {
      elevation: 0,
    },
    styleOverrides: {
      root: {
        backgroundImage: "none",
      },
    },
  },
  MuiDialog: {
    defaultProps: {
      // Mantén el scroll lock para mejor UX
      disableScrollLock: false,
    },
  },

  // --- NUEVA SECCIÓN PARA EL SCROLL ---
  MuiCssBaseline: {
    styleOverrides: (theme) => ({
      body: {
        // Webkit (Chrome, Safari, Edge)
        '&::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
          backgroundColor: 'transparent',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          borderRadius: '10px',
          // Usamos el color del divider o un gris adaptativo
          backgroundColor: theme.palette.mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.2)' 
            : 'rgba(0, 0, 0, 0.2)',
          border: `2px solid ${theme.palette.background.default}`,
          '&:hover': {
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.3)' 
              : 'rgba(0, 0, 0, 0.3)',
          },
        },
        // Firefox
        scrollbarWidth: 'thin',
        scrollbarColor: `${
          theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'
        } transparent`,
      },
    }),
  },
};

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    ...lightColors,
  },
  typography,
  components: commonComponents,
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    ...darkColors,
  },
  typography,
  components: commonComponents,
});

export default lightTheme;

// themes/index.js
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

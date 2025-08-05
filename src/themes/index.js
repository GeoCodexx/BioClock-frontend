import { createTheme } from '@mui/material/styles';
import colors from './palette';
import typography from './typography';

export const theme = createTheme({
  palette: colors,
  typography: typography,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: '4px'
        }
      }
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none'
        }
      }
    }
  }
});

export default theme;
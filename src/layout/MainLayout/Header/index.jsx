import {
  AppBar,
  Box,
  IconButton,
  Toolbar,
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

// Componentes personalizados
import NotificationSection from './NotificationSection';
import ProfileSection from './ProfileSection';

const Header = ({ toggleTheme, isDarkMode, handleDrawerToggle, isDrawerOpen }) => {
  const theme = useTheme();

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        bgcolor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.05)',
        transition: 'width 400ms cubic-bezier(0, 0, 0.2, 1)',
        width: '100%'
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="toggle drawer"
          onClick={handleDrawerToggle}
          edge="start"
          sx={{
            marginRight: 2,
            transition: 'transform 400ms cubic-bezier(0, 0, 0.2, 1)',
            transform: isDrawerOpen ? 'rotate(0deg)' : 'rotate(180deg)'
          }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ flexGrow: 1 }} />
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Botón de tema claro/oscuro */}
          <IconButton 
            onClick={toggleTheme} 
            color="inherit"
            sx={{
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              '&:hover': {
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
              }
            }}
          >
            {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>

          {/* Sección de Notificaciones */}
          <NotificationSection />

          {/* Sección de Perfil */}
          <ProfileSection />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
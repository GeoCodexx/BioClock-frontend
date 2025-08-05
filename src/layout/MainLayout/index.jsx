import { useState } from 'react';
import { Box, useTheme } from '@mui/material';
import { Outlet } from 'react-router-dom';

// Componentes del layout
import Header from './Header';
import Sidebar from './Sidebar';

const drawerWidth = 260;

const MainLayout = () => {
  const theme = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // Aquí puedes implementar la lógica para cambiar el tema
  };

  const handleDrawerToggle = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Header 
        toggleTheme={toggleTheme} 
        isDarkMode={isDarkMode}
        isDrawerOpen={isDrawerOpen}
        handleDrawerToggle={handleDrawerToggle}
      />
      <Sidebar isOpen={isDrawerOpen} />
      <Box
        component="main"
        sx={{
          backgroundColor: 'rgb(238, 242, 246)',
          minWidth: '1%',
          width: isDrawerOpen ? `calc(100% - ${drawerWidth}px)` : 'calc(100% - 80px)',
          minHeight: 'calc(100vh - 88px)',
          flexGrow: 1,
          marginTop: '88px',
          marginRight: '20px',
          marginLeft: 0,
          padding: '20px',
          borderRadius: '8px 8px 0 0',
          transition: 'all 400ms cubic-bezier(0, 0, 0.2, 1)',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
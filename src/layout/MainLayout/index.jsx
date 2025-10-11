import { useState } from "react";
import { Box, Container, useTheme, useMediaQuery } from "@mui/material";
import { Outlet } from "react-router-dom";

// Componentes del layout
import Header from "./Header";
import Sidebar from "./Sidebar";

const drawerWidth = 260;
const collapsedWidth = 80;

const MainLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setIsDrawerOpen(!isDrawerOpen);
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Header
        toggleTheme={toggleTheme}
        isDarkMode={isDarkMode}
        handleDrawerToggle={handleDrawerToggle}
      />
      <Sidebar 
        isOpen={isDrawerOpen} 
        handleDrawerToggle={handleDrawerToggle}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <Box
        component="main"
        sx={{
          backgroundColor: "rgb(238, 242, 246)",
          minWidth: "1%",
          width: isMobile 
            ? "100%" 
            : isDrawerOpen
            ? `calc(100% - ${drawerWidth}px)`
            : `calc(100% - ${collapsedWidth}px)`,
          minHeight: "calc(100vh - 88px)",
          flexGrow: 1,
          marginTop: "88px",
          marginRight: isMobile ? 0 : "20px",
          marginLeft: 0,
          padding: isMobile ? "16px" : "20px",
          borderRadius: isMobile ? 0 : "8px 8px 0 0",
          transition: "all 0.5s ease-in-out",
        }}
      >
        <Container maxWidth="lg">
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout;
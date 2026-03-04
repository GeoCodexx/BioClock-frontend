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
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setIsDrawerOpen(!isDrawerOpen);
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Header handleDrawerToggle={handleDrawerToggle} />
      <Sidebar
        isOpen={isDrawerOpen}
        //handleDrawerToggle={handleDrawerToggle}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <Box
        component="main"
        sx={{
          backgroundColor: theme.palette.background.default,
          minWidth: "320px",
          width: isMobile
            ? "100%"
            : isDrawerOpen
              ? `calc(100% - ${drawerWidth}px)`
              : `calc(100% - ${collapsedWidth}px)`,
          minHeight: "calc(100vh - 88px)",
          flexGrow: 1,
          marginTop: isMobile ? "56px" : "70px",
          marginRight: isMobile ? 0 : "20px",
          marginLeft: 0,
          padding: isMobile ? 0 : "20px",
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

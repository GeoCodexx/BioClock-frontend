import { memo, useMemo } from "react";
import {
  AppBar,
  Box,
  IconButton,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
  alpha,
  Tooltip,
  Fade,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
/*import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";*/

// Logo
// import LogoBitel from "../../../assets/images/bitel_logo.png";
// O
// import Logo from "@/assets/logo.png";

// Componentes personalizados
import NotificationSection from "./NotificationSection";
import ProfileSection from "./ProfileSection";

// Componente de botón de tema memoizado
const ThemeToggleButton = memo(({ toggleTheme, isDarkMode }) => {
  const theme = useTheme();

  return (
    <Tooltip
      title={isDarkMode ? "Modo claro" : "Modo oscuro"}
      arrow
      slots={{
        transition: Fade,
      }}
    >
      <IconButton
        onClick={toggleTheme}
        color="inherit"
        aria-label={`Cambiar a modo ${isDarkMode ? "claro" : "oscuro"}`}
        sx={{
          bgcolor: (theme) =>
            alpha(
              theme.palette.mode === "dark" ? "#fff" : "#000",
              theme.palette.mode === "dark" ? 0.1 : 0.05
            ),
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            bgcolor: (theme) =>
              alpha(
                theme.palette.mode === "dark" ? "#fff" : "#000",
                theme.palette.mode === "dark" ? 0.15 : 0.1
              ),
            transform: "rotate(270deg) scale(1.05)",
          },
        }}
      >
        {isDarkMode ? (
          <LightModeIcon sx={{ color: "#FDB813" }} />
        ) : (
          <DarkModeIcon sx={{ color: "#7C3AED" }} />
        )}
      </IconButton>
    </Tooltip>
  );
});

ThemeToggleButton.displayName = "ThemeToggleButton";

// Componente de Logo memoizado
const Logo = memo(({ src, alt = "Logo", size = "medium" }) => {
  const dimensions = {
    small: { height: 32, maxWidth: 80 }, // Mobile
    medium: { height: 40, maxWidth: 120 }, // Desktop
    large: { height: 48, maxWidth: 140 }, // Extra grande
  };

  const { height, maxWidth } = dimensions[size] || dimensions.medium;

  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      sx={{
        height,
        maxWidth,
        width: "auto",
        objectFit: "contain",
        transition: "transform 0.2s ease",
        "&:hover": {
          transform: "scale(1.05)",
        },
      }}
    />
  );
});

Logo.displayName = "Logo";

// Componente de Vista Mobile memoizado
const MobileView = memo(({ handleDrawerToggle, logoSrc }) => (
  <>
    {/* Menú hamburguesa - Izquierda */}
    <IconButton
      color="inherit"
      aria-label="abrir menú de navegación"
      onClick={handleDrawerToggle}
      edge="start"
      sx={{
        transition: "transform 0.2s ease",
        "&:hover": {
          transform: "scale(1.1)",
        },
      }}
    >
      <MenuIcon />
    </IconButton>

    {/* Logo y Título - Centro */}
    <Box
      sx={{
        flexGrow: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 1.5,
        px: 2,
      }}
    >
      {logoSrc && <Logo src={logoSrc} alt="Logo SISCAB" size="small" />}
      <Typography
        variant="h6"
        fontWeight="bold"
        sx={{
          background: (theme) =>
            `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        BioClock Pro
      </Typography>
    </Box>

    {/* Avatar - Derecha */}
    <ProfileSection />
  </>
));

MobileView.displayName = "MobileView";

// Componente de Vista Desktop memoizado
const DesktopView = memo(({ toggleTheme, isDarkMode, logoSrc }) => {
  const theme = useTheme();

  return (
    <>
      {/* Logo - Izquierda */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {logoSrc && <Logo src={logoSrc} alt="Logo SISCAB" size="large" />}
      </Box>

      {/* Título completo - Centro */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          px: 3,
        }}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
          component="h1"
          sx={{
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "0.5px",
          }}
        >
          BioClock Pro - Sistema de Control de Asistencia Biométrico
        </Typography>
      </Box>

      {/* Botones - Derecha */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <ThemeToggleButton toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
        {/* <NotificationSection /> */}
        <ProfileSection />
      </Box>
    </>
  );
});

DesktopView.displayName = "DesktopView";

// Componente Principal del Header
const Header = memo(
  ({ toggleTheme, isDarkMode, handleDrawerToggle, logoSrc }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    // Memoizar estilos del AppBar
    const appBarStyles = useMemo(
      () => ({
        zIndex: isMobile ? theme.zIndex.drawer - 1 : theme.zIndex.drawer + 1,
        bgcolor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        // boxShadow: `0 1px 3px ${alpha(theme.palette.common.black, 0.08)}`,
        width: "100%",
        borderBottom: `1px solid ${theme.palette.divider}`,
        transition: "all 0.3s ease",
      }),
      [isMobile, theme]
    );

    // Memoizar estilos del Toolbar
    const toolbarStyles = useMemo(
      () => ({
        justifyContent: "space-between",
        minHeight: isMobile ? 56 : 64,
        px: isMobile ? 1.5 : 3,
      }),
      [isMobile]
    );

    return (
      <AppBar position="fixed" sx={appBarStyles} elevation={0}>
        <Toolbar sx={toolbarStyles}>
          {isMobile ? (
            <MobileView
              handleDrawerToggle={handleDrawerToggle} /*logoSrc={logoSrc}*/
            />
          ) : (
            <DesktopView
              toggleTheme={toggleTheme}
              isDarkMode={isDarkMode}
              logoSrc={logoSrc}
            />
          )}
        </Toolbar>
      </AppBar>
    );
  }
);

Header.displayName = "Header";

export default Header;

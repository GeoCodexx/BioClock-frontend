// src/layouts/MainLayout/Header/Header.jsx
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
  Avatar,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

import NotificationSection from "./NotificationSection";
import ProfileSection from "./ProfileSection";
import { useLogoContext } from "../../../contexts/LogoContext";
import { Link } from "react-router-dom";

// ─── Logo ─────────────────────────────────────────────────────────────────────
const Logo = memo(({ src, alt = "Logo", size = "medium" }) => {
  const dimensions = {
    small: { height: 32, maxWidth: 80 },
    medium: { height: 40, maxWidth: 120 },
    large: { height: 48, maxWidth: 140 },
  };
  const { height, maxWidth } = dimensions[size] ?? dimensions.medium;

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
        "&:hover": { transform: "scale(1.05)" },
      }}
    />
  );
});
Logo.displayName = "Logo";

// ─── MobileView ───────────────────────────────────────────────────────────────
const MobileView = memo(({ handleDrawerToggle, logoUrl }) => (
  <>
    <IconButton
      color="inherit"
      aria-label="abrir menú de navegación"
      onClick={handleDrawerToggle}
      edge="start"
      sx={{
        transition: "transform 0.2s ease",
        "&:hover": { transform: "scale(1.1)" },
      }}
    >
      <MenuIcon />
    </IconButton>

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
      {logoUrl && (
        <Box
          component={Link}
          to="/"
          sx={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
          }}
        >
          <Logo
            src={logoUrl}
            alt="Logo"
            size="small"
            sx={{
              cursor: "pointer",
            }}
          />
        </Box>
      )}
      {/* <Typography
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
      </Typography> */}
    </Box>

    <NotificationSection />
    <ProfileSection />
  </>
));
MobileView.displayName = "MobileView";

// ─── DesktopView ──────────────────────────────────────────────────────────────
const DesktopView = memo(({ logoUrl, handleDrawerToggle }) => {
  const theme = useTheme();

  return (
    <>
      <Box sx={{ display: "flex", width: 228, alignItems: "center", gap: 2 }}>
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {logoUrl && (
            <Box
              component={Link}
              to="/"
              sx={{
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
              }}
            >
              <Logo
                src={logoUrl}
                alt="Logo"
                size="large"
                sx={{
                  cursor: "pointer",
                }}
              />
            </Box>
          )}
        </Box>
        <Avatar
          onClick={handleDrawerToggle}
          sx={{
            width: 34,
            height: 34,
            bgcolor: alpha(theme.palette.primary.main, 0.2),
            color: theme.palette.primary.main,
            borderRadius: 2,
            fontSize: "1.2rem",
            cursor: "pointer",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              bgcolor: theme.palette.primary.main,
              color: theme.palette.primary.light,
            },
          }}
        >
          <MenuIcon />
        </Avatar>
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
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

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <NotificationSection />
        <ProfileSection />
      </Box>
    </>
  );
});
DesktopView.displayName = "DesktopView";

// ─── Header ───────────────────────────────────────────────────────────────────
/**
 * ✅ Props simplificadas — el logo y el tema se leen desde sus contextos globales.
 *
 * @param {{ handleDrawerToggle: () => void }} props
 */
const Header = memo(({ handleDrawerToggle }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { logoUrl } = useLogoContext(); // ← logo activo desde el contexto global

  const appBarStyles = useMemo(
    () => ({
      bgcolor: theme.palette.background.paper,
      color: theme.palette.text.primary,
      width: "100%",
      borderBottom: `1px solid ${theme.palette.divider}`,
      transition: "all 0.3s ease",
    }),
    [theme],
  );

  const toolbarStyles = useMemo(
    () => ({
      justifyContent: "space-between",
      minHeight: isMobile ? 56 : 64,
      px: isMobile ? 1.5 : 3,
    }),
    [isMobile],
  );

  return (
    <AppBar position="fixed" sx={appBarStyles} elevation={0}>
      <Toolbar sx={toolbarStyles}>
        {isMobile ? (
          <MobileView
            handleDrawerToggle={handleDrawerToggle}
            logoUrl={logoUrl}
          />
        ) : (
          <DesktopView
            handleDrawerToggle={handleDrawerToggle}
            logoUrl={logoUrl}
          />
        )}
      </Toolbar>
    </AppBar>
  );
});
Header.displayName = "Header";

export default Header;

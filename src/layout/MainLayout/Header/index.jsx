import {
  AppBar,
  Box,
  IconButton,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
//import LogoBitel from "../../../assets/images/bitel_logo.png";

// Componentes personalizados
import NotificationSection from "./NotificationSection";
import ProfileSection from "./ProfileSection";

const Header = ({ toggleTheme, isDarkMode, handleDrawerToggle }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: "auto", //isMobile ? "auto" : theme.zIndex.drawer + 1,
        bgcolor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        boxShadow: "none",
        width: "100%",
        //pt: 0,
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {isMobile ? (
          // Vista Mobile
          <>
            {/* Menú hamburguesa - Izquierda */}
            <IconButton
              color="inherit"
              aria-label="toggle drawer"
              onClick={handleDrawerToggle}
              edge="start"
              sx={{
                bgcolor:
                  theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.05)",
                "&:hover": {
                  bgcolor:
                    theme.palette.mode === "dark"
                      ? "rgba(255,255,255,0.15)"
                      : "rgba(0,0,0,0.1)",
                },
              }}
            >
              <MenuIcon />
            </IconButton>

            {/* Título corto - Centro */}
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{
                flexGrow: 1,
                textAlign: "center",
                px: 2,
              }}
            >
              SISCAB
            </Typography>

            {/* Avatar - Derecha */}
            <ProfileSection />
          </>
        ) : (
          // Vista Desktop
          <>
            {/* Logo - Izquierda */}
            {/* <Box sx={{ display: "flex", alignItems: "center" }}>
              <img src={LogoBitel} alt="logo" width="130px" />
            </Box> */}

            {/* Título completo - Centro */}
            <Typography
              variant="h5"
              fontWeight="bold"
              sx={{
                flexGrow: 1,
                textAlign: "center",
                px: 3,
              }}
            >
              Sistema de Control de Asistencia Biométrico
            </Typography>

            {/* Botones - Derecha */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton
                onClick={toggleTheme}
                color="inherit"
                sx={{
                  bgcolor:
                    theme.palette.mode === "dark"
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.05)",
                  "&:hover": {
                    bgcolor:
                      theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.15)"
                        : "rgba(0,0,0,0.1)",
                  },
                }}
              >
                {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
              <NotificationSection />
              <ProfileSection />
            </Box>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;

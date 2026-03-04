// src/layouts/MainLayout/Header/ProfileSection.jsx
import { useState, useRef } from "react";
import {
  Box, ButtonBase, Avatar, ClickAwayListener, Collapse,
  Divider, List, ListItemButton, ListItemIcon, ListItemText,
  Paper, Popper, Typography, useTheme, Fade, alpha,
  Tooltip, ToggleButtonGroup, ToggleButton, Chip,
} from "@mui/material";
import PersonOutlineIcon      from "@mui/icons-material/PersonOutline";
import LogoutIcon             from "@mui/icons-material/Logout";
import SettingsIcon           from "@mui/icons-material/Settings";
import LightModeIcon          from "@mui/icons-material/LightMode";
import DarkModeIcon           from "@mui/icons-material/DarkMode";
import SettingsBrightnessIcon from "@mui/icons-material/SettingsBrightness";
import ExpandMoreIcon         from "@mui/icons-material/ExpandMore";
import ExpandLessIcon         from "@mui/icons-material/ExpandLess";

import useAuthStore           from "../../../../store/useAuthStore";
import ProfileDialog          from "../../../../components/Profile/ProfileDialog";
import { useThemeMode }       from "../../../../contexts/ThemeContext";
import { usePermission }      from "../../../../utils/permissions";
import LogoUploader           from "../../../../components/Logo/LogoUploader";

// ─── ThemeModeSelector ────────────────────────────────────────────────────────
const THEME_OPTIONS = [
  { value: "light",  label: "Claro",  Icon: LightModeIcon },
  { value: "dark",   label: "Oscuro", Icon: DarkModeIcon },
  { value: "system", label: "Auto",   Icon: SettingsBrightnessIcon },
];

const ThemeModeSelector = () => {
  const theme = useTheme();
  const { themeMode, setThemeMode } = useThemeMode();

  return (
    <Box sx={{ px: 1.5, pb: 1 }}>
      <Typography
        variant="caption"
        sx={{
          color: theme.palette.text.disabled,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          display: "block",
          mb: 1,
          pl: 0.5,
        }}
      >
        Tema
      </Typography>
      <ToggleButtonGroup
        value={themeMode}
        exclusive
        onChange={(_, val) => val && setThemeMode(val)}
        size="small"
        fullWidth
        sx={{
          gap: 0.5,
          "& .MuiToggleButtonGroup-grouped": {
            border: `1px solid ${alpha(theme.palette.divider, 0.3)} !important`,
            borderRadius: "10px !important",
            flex: 1, py: 0.9,
            transition: "all 0.2s ease",
            "&.Mui-selected": {
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              color: theme.palette.primary.main,
              borderColor: `${alpha(theme.palette.primary.main, 0.4)} !important`,
              fontWeight: 700,
              "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.18) },
            },
            "&:not(.Mui-selected):hover": { bgcolor: alpha(theme.palette.action.hover, 0.6) },
          },
        }}
      >
        {THEME_OPTIONS.map(({ value, label, Icon }) => (
          <ToggleButton key={value} value={value} aria-label={label}>
            <Tooltip title={label} arrow placement="top">
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.25 }}>
                <Icon sx={{ fontSize: 15 }} />
                <Typography variant="caption" sx={{ fontSize: "0.63rem", lineHeight: 1 }}>
                  {label}
                </Typography>
              </Box>
            </Tooltip>
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
};

// ─── ProfileSection ───────────────────────────────────────────────────────────
// ✅ Sin props de logo ni de tema — todo se consume desde contextos globales
const ProfileSection = () => {
  const user            = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout          = useAuthStore((s) => s.logout);
  const theme           = useTheme();
  const { themeMode }   = useThemeMode();
  const { can }         = usePermission();

  const [open, setOpen]                 = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [openProfileDialog, setOpenProfileDialog] = useState(false);
  const anchorRef = useRef(null);

  const canConfigureSystem = can("system:configuration");

  const getFirstName = (name) => name?.trim().split(" ")[0] ?? "—";
  const getInitials  = () => {
    if (!isAuthenticated || !user) return "";
    return (user.name?.charAt(0)?.toUpperCase() ?? "") +
           (user.firstSurname?.charAt(0)?.toUpperCase() ?? "");
  };
  const themeModeLabel = { light: "Claro", dark: "Oscuro", system: "Auto" }[themeMode] ?? "Auto";

  const handleClose = (e) => {
    if (anchorRef.current?.contains(e.target)) return;
    setOpen(false);
    setSettingsOpen(false);
  };
  const handleLogout = async () => {
    try { logout(); } catch (err) { console.error(err); }
  };
  const handleOpenProfile = () => {
    setOpen(false);
    setSettingsOpen(false);
    setOpenProfileDialog(true);
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
      <Tooltip title="Mi cuenta" arrow>
        <ButtonBase
          ref={anchorRef}
          onClick={() => setOpen((p) => !p)}
          aria-label="abrir perfil"
          aria-haspopup="true"
          disableRipple
          sx={{
            p: 0.25, borderRadius: 2,
            transition: "all 0.2s ease-in-out",
            "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.08), transform: "translateY(-1px)" },
          }}
        >
          <Avatar
            sx={{
              width: 36, height: 36,
              bgcolor: open ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.8),
              color: theme.palette.primary.contrastText,
              fontWeight: 600, fontSize: "0.9rem", transition: "all 0.2s ease",
              boxShadow: open ? `0 0 0 3px ${alpha(theme.palette.primary.main, 0.25)}` : "none",
            }}
          >
            {getInitials()}
          </Avatar>
        </ButtonBase>
      </Tooltip>

      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal={false}
        modifiers={[
          { name: "offset", options: { offset: [0, 12] } },
          { name: "preventOverflow", enabled: true, options: { boundary: "viewport" } },
        ]}
        sx={{ zIndex: theme.zIndex.modal }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={150}>
            <Paper
              elevation={0}
              sx={{
                boxShadow: `0 8px 40px ${alpha(theme.palette.common.black, 0.14)},
                             0 2px 8px  ${alpha(theme.palette.common.black, 0.08)}`,
                borderRadius: 3, width: 268, overflow: "hidden",
                border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
              }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <Box>
                  {/* User header */}
                  <Box
                    sx={{
                      p: 2.5,
                      background: `linear-gradient(135deg,
                        ${alpha(theme.palette.primary.main, 0.09)} 0%,
                        ${alpha(theme.palette.primary.light, 0.04)} 100%)`,
                      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.75 }}>
                      <Avatar
                        sx={{
                          width: 48, height: 48,
                          bgcolor: theme.palette.primary.main,
                          color: theme.palette.primary.contrastText,
                          border: `2px solid ${theme.palette.background.paper}`,
                          boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
                          fontWeight: 700,
                        }}
                      >
                        {isAuthenticated && user ? user.name.charAt(0) : "?"}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 700, fontSize: "0.9rem", lineHeight: 1.3 }}
                          noWrap
                        >
                          {isAuthenticated && user
                            ? `${getFirstName(user.name)} ${user.firstSurname}`
                            : "John Doe"}
                        </Typography>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: "0.78rem" }}>
                          {isAuthenticated && user ? user.role : "Administrador"}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Menu items */}
                  <Box sx={{ p: 1 }}>
                    <List
                      component="nav"
                      disablePadding
                      sx={{
                        "& .MuiListItemButton-root": {
                          borderRadius: 2, mb: 0.25, py: 0.75, transition: "all 0.18s ease",
                          "&:hover": {
                            bgcolor: alpha(theme.palette.primary.main, 0.07),
                            "& .MuiListItemIcon-root": { color: theme.palette.primary.main },
                          },
                        },
                        "& .MuiListItemIcon-root": {
                          minWidth: 38, color: theme.palette.text.secondary, transition: "color 0.18s ease",
                        },
                      }}
                    >
                      <ListItemButton onClick={handleOpenProfile}>
                        <ListItemIcon><PersonOutlineIcon fontSize="small" /></ListItemIcon>
                        <ListItemText primary="Mi Perfil" primaryTypographyProps={{ fontSize: "0.875rem", fontWeight: 500 }} />
                      </ListItemButton>

                      <ListItemButton
                        onClick={() => setSettingsOpen((p) => !p)}
                        sx={{ bgcolor: settingsOpen ? alpha(theme.palette.primary.main, 0.06) : "transparent" }}
                      >
                        <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
                        <ListItemText primary="Configuración" primaryTypographyProps={{ fontSize: "0.875rem", fontWeight: 500 }} />
                        <Chip
                          label={themeModeLabel}
                          size="small"
                          sx={{
                            height: 18, fontSize: "0.63rem", fontWeight: 700, mr: 0.75,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            "& .MuiChip-label": { px: 0.75 },
                          }}
                        />
                        {settingsOpen
                          ? <ExpandLessIcon sx={{ fontSize: 16, color: theme.palette.text.disabled }} />
                          : <ExpandMoreIcon sx={{ fontSize: 16, color: theme.palette.text.disabled }} />
                        }
                      </ListItemButton>

                      <Collapse in={settingsOpen} timeout={220} unmountOnExit>
                        <Box
                          sx={{
                            mx: 0.5, mb: 0.5, borderRadius: 2, overflow: "hidden",
                            border: `1px solid ${alpha(theme.palette.divider, 0.18)}`,
                            bgcolor: alpha(theme.palette.background.default, 0.6),
                          }}
                        >
                          <Box sx={{ pt: 1.5 }}>
                            <ThemeModeSelector />
                          </Box>
                          {canConfigureSystem && (
                            <>
                              <Divider sx={{ my: 0.75, borderColor: alpha(theme.palette.divider, 0.15) }} />
                              <LogoUploader />
                            </>
                          )}
                        </Box>
                      </Collapse>

                      <Divider sx={{ my: 0.75 }} />

                      <ListItemButton
                        onClick={handleLogout}
                        sx={{
                          "&:hover": {
                            bgcolor: alpha(theme.palette.error.main, 0.07),
                            "& .MuiListItemIcon-root": { color: theme.palette.error.main },
                            "& .MuiListItemText-primary": { color: theme.palette.error.main },
                          },
                        }}
                      >
                        <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                        <ListItemText primary="Cerrar Sesión" primaryTypographyProps={{ fontSize: "0.875rem", fontWeight: 500 }} />
                      </ListItemButton>
                    </List>
                  </Box>
                </Box>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>

      <ProfileDialog open={openProfileDialog} onClose={() => setOpenProfileDialog(false)} user={user} />
    </Box>
  );
};

export default ProfileSection;
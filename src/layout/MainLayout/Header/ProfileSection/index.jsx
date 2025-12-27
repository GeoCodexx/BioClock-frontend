import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  ButtonBase,
  Avatar,
  ClickAwayListener,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Popper,
  Typography,
  useTheme,
  Fade,
  alpha,
  useMediaQuery,
} from "@mui/material";

// icons
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
//import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import useAuthStore from "../../../../store/useAuthStore";
import ProfileDialog from "../../../../components/Profile/ProfileDialog";

const ProfileSection = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const theme = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  //const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [openProfileDialog, setOpenProfileDialog] = useState(false);

  const handleLogout = async () => {
    try {
      // Implementar lógica de logout
      localStorage.removeItem("token");
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleMenuItemClick = () => {
    setOpen(false);
    setOpenProfileDialog(true);
    //navigate(path);
  };

  const handleProfileDialogClose = () => {
    setOpenProfileDialog(false);
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
      <ButtonBase
        sx={{
          p: 0.25,
          bgcolor: open
            ? alpha(theme.palette.primary.main, 0.08)
            : "transparent",
          borderRadius: 2,
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            transform: "translateY(-1px)",
          },
        }}
        aria-label="open profile"
        ref={anchorRef}
        aria-controls={open ? "profile-grow" : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 0.5 }}>
          <Avatar
            src="/static/images/avatar.jpg"
            sx={{
              width: /*isMobile ? 24 :*/ 36,
              height: /*isMobile ? 24 :*/ 36,
              bgcolor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              //fontSize: "1rem",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "scale(1.05)",
                boxShadow: `0 0 0 4px ${alpha(
                  theme.palette.primary.main,
                  0.1
                )}`,
              },
            }}
          >
            {isAuthenticated && user ? user.name.charAt(0) : ""}
          </Avatar>
        </Box>
      </ButtonBase>
      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal={false}
        modifiers={[
          {
            name: "offset",
            options: {
              offset: [0, 12],
            },
          },
          {
            name: "preventOverflow",
            enabled: true,
            options: {
              boundary: "viewport",
            },
          },
        ]}
        sx={{ zIndex: theme.zIndex.modal }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={250}>
            <Paper
              elevation={8}
              sx={{
                boxShadow: `0 8px 32px ${alpha(
                  theme.palette.common.black,
                  0.12
                )}`,
                borderRadius: 3,
                width: 300,
                overflow: "hidden",
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                mt: 0.5,
              }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <Box>
                  {/* Header Section */}
                  <Box
                    sx={{
                      p: 2.5,
                      background: `linear-gradient(135deg, ${alpha(
                        theme.palette.primary.main,
                        0.08
                      )} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
                      borderBottom: `1px solid ${alpha(
                        theme.palette.divider,
                        0.08
                      )}`,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar
                        src="/static/images/avatar.jpg"
                        sx={{
                          width: 52,
                          height: 52,
                          bgcolor: theme.palette.primary.main,
                          color: theme.palette.primary.contrastText,
                          /* boxShadow: `0 4px 14px ${alpha(
                            theme.palette.primary.main,
                            0.3
                          )}`,*/
                          border: `3px solid ${theme.palette.background.paper}`,
                        }}
                      >
                        {isAuthenticated && user ? user.name.charAt(0) : ""}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            fontSize: "1rem",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {isAuthenticated && user
                            ? `${user.name} ${user.firstSurname}`
                            : "Jhon Doe"}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: theme.palette.text.secondary,
                            fontSize: "0.813rem",
                          }}
                        >
                          {isAuthenticated && user
                            ? user.role
                            : "Administrador"}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Menu Items */}
                  <Box sx={{ p: 1 }}>
                    <List
                      component="nav"
                      sx={{
                        p: 0,
                        "& .MuiListItemButton-root": {
                          borderRadius: 2,
                          mb: 0.5,
                          transition: "all 0.2s ease",
                          "&:hover": {
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            transform: "translateX(4px)",
                            "& .MuiListItemIcon-root": {
                              color: theme.palette.primary.main,
                            },
                          },
                          "&:last-child": {
                            mb: 0,
                          },
                        },
                        "& .MuiListItemIcon-root": {
                          minWidth: 40,
                          color: theme.palette.text.secondary,
                          transition: "color 0.2s ease",
                        },
                      }}
                    >
                      <ListItemButton onClick={() => handleMenuItemClick()}>
                        <ListItemIcon>
                          <PersonOutlineIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Mi Perfil"
                          primaryTypographyProps={{
                            fontSize: "0.875rem",
                            fontWeight: 500,
                          }}
                        />
                      </ListItemButton>

                      <ListItemButton onClick={() => handleMenuItemClick()}>
                        <ListItemIcon>
                          <SettingsIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Configuración"
                          primaryTypographyProps={{
                            fontSize: "0.875rem",
                            fontWeight: 500,
                          }}
                        />
                      </ListItemButton>

                      <Divider sx={{ my: 1 }} />

                      <ListItemButton
                        onClick={handleLogout}
                        sx={{
                          "&:hover": {
                            bgcolor: alpha(theme.palette.error.main, 0.08),
                            transform: "translateX(4px)",
                            "& .MuiListItemIcon-root": {
                              color: theme.palette.error.main,
                            },
                            "& .MuiListItemText-primary": {
                              color: theme.palette.error.main,
                            },
                          },
                        }}
                      >
                        <ListItemIcon>
                          <LogoutIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Cerrar Sesión"
                          primaryTypographyProps={{
                            fontSize: "0.875rem",
                            fontWeight: 500,
                          }}
                        />
                      </ListItemButton>
                    </List>
                  </Box>
                </Box>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
      <ProfileDialog
        open={openProfileDialog}
        onClose={handleProfileDialogClose}
        user={user}
      />
    </Box>
  );
};

export default ProfileSection;

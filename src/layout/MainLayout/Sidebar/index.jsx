import { useLocation, Link } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  Tooltip,
  Collapse,
  IconButton,
  useMediaQuery,
} from "@mui/material";

// Iconos
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import BusinessIcon from "@mui/icons-material/Business";
import EventNoteIcon from "@mui/icons-material/EventNote";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import AssessmentIcon from "@mui/icons-material/Assessment";
import DevicesIcon from "@mui/icons-material/Devices";
import { useState } from "react";
import { CalendarMonth, ExpandLess, ExpandMore, ReadMore, Schedule } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import LogoBitel from "../../../assets/images/bitel_logo.png";
import { usePermission } from "../../../utils/permissions";

const drawerWidth = 260;
const collapsedWidth = 80;

const menuItems = [
  {
    text: "Panel Estadístico",
    path: "/dashboard",
    permission: "dashboard:read",
    icon: <DashboardIcon />,
  },
  {
    text: "Horarios",
    path: "/schedules",
    permission: "schedules:read",
    icon: <Schedule />,
  },
  {
    text: "Departamentos",
    path: "/departments",
    permission: "departments:read",
    icon: <BusinessIcon />,
  },
  {
    text: "Dispositivos",
    path: "/devices",
    permission: "devices:read",
    icon: <DevicesIcon />,
  },
  {
    text: "Huellas Dactilares",
    path: "/fingerprints",
    permission: "fingerprints:read",
    icon: <FingerprintIcon />,
  },
  // {
  //   text: "Asistencias",
  //   path: "/attendances",
  //   permission: "attendances:read",
  //   icon: <EventNoteIcon />,
  // },
  {
    text: "Mi Asistencia",
    path: "/myattendance",
    permission: "my-attendance:read",
    icon: <CalendarMonth />,
  },
  {
    text: "Gestión de Usuarios",
    icon: <PeopleIcon />,
    permission: ["permissions:read", "roles:read", "users:read"],
    children: [
      {
        text: "Permisos",
        path: "/users/permissions",
        permission: "permissions:read",
        icon: <VpnKeyIcon />,
      },
      {
        text: "Roles",
        path: "/users/roles",
        permission: "roles:read",
        icon: <VpnKeyIcon />,
      },
      {
        text: "Usuarios",
        path: "/users",
        permission: "users:read",
        icon: <PeopleIcon />,
      },
    ],
  },
  {
    text: "Gestión de Asistencias",
    icon: <AssessmentIcon />,
    permission: ["general-report:read", "attendances:read"],
    children: [
      {
        text: "Reporte General",
        path: "/general-report",
        permission: "general-report:read",
        icon: <ChevronRightIcon />,
      },
      {
        text: "Historial de Registros",
        path: "/attendances",
        permission: "attendances:read",
        icon: <ChevronRightIcon />,
      },
    ],
  },
];

const Sidebar = ({ isOpen, handleDrawerToggle, mobileOpen, setMobileOpen }) => {
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { can, canAny } = usePermission();

  const [openMenu, setOpenMenu] = useState(() => {
    const current = menuItems.find((item) =>
      item.children?.some((child) => location.pathname.startsWith(child.path))
    );
    return current ? current.text : null;
  });

  const activeRoute = (path) => {
    return location.pathname === path;
  };

  const handleToggle = (text) => {
    setOpenMenu((prev) => (prev === text ? null : text));
  };

  const handleMobileItemClick = () => {
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const canRenderItem = (item) => {
    if (item.children?.length) {
      return (
        canAny(item.permission) &&
        item.children.some((child) => can(child.permission))
      );
    }
    return can(item.permission);
  };

  const renderMenuItems = (items, isSubmenu = false) =>
    items.filter(canRenderItem).map((item) => {
      const isActive =
        (item.path && activeRoute(item.path)) ||
        item.children?.some((child) => activeRoute(child.path));

      return (
        <Box key={item.text}>
          <ListItem
            disablePadding
            sx={{
              mb: 0.5,
              transition: "all 0.2s ease",
              "&:hover": {
                transform: "translateX(4px)",
                /*"& .MuiListItemIcon-root": {
                  color: theme.palette.primary.main,
                },*/
              },
            }}
          >
            <Tooltip
              title={!isOpen && !isMobile ? item.text : ""}
              placement="right"
            >
              <ListItemButton
                component={item.path ? Link : "button"}
                to={item.path}
                onClick={
                  item.children
                    ? () => handleToggle(item.text)
                    : item.path
                    ? handleMobileItemClick
                    : undefined
                }
                selected={!isSubmenu && isActive}
                sx={{
                  borderRadius: 1,
                  minHeight: 48,
                  justifyContent: isOpen || isMobile ? "initial" : "center",
                  ...(isActive &&
                    !isSubmenu && {
                      bgcolor: `${theme.palette.primary.main}15`,
                      color: theme.palette.primary.main,
                      "& .MuiListItemIcon-root": {
                        color: theme.palette.primary.main,
                      },
                    }),
                  ...(isActive &&
                    isSubmenu && {
                      color: theme.palette.primary.main,
                      "& .MuiListItemIcon-root": {
                        color: theme.palette.primary.main,
                      },
                    }),
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 36,
                    mr: isOpen || isMobile ? 3 : "auto",
                    justifyContent: "center",
                    color:
                      isActive && (isSubmenu || item.path)
                        ? theme.palette.primary.main
                        : "inherit",
                  }}
                >
                  {isSubmenu ? <ChevronRightIcon /> : item.icon}
                </ListItemIcon>
                {(isOpen || isMobile) && <ListItemText primary={item.text} />}
                {item.children &&
                  (isOpen || isMobile) &&
                  (openMenu === item.text ? <ExpandLess /> : <ExpandMore />)}
              </ListItemButton>
            </Tooltip>
          </ListItem>

          {item.children && (
            <Collapse in={openMenu === item.text} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {renderMenuItems(
                  item.children.filter((child) => can(child.permission)),
                  true
                )}
              </List>
            </Collapse>
          )}
        </Box>
      );
    });

  const drawerContent = (
    <>
      <Box
        sx={{
          px: 2.5,
          pt: isOpen ? 0.3 : 1.7,
          pb: 1,
          display: "flex",
          justifyContent: isOpen || isMobile ? "space-between" : "center",
          alignItems: "center",
        }}
      >
        {(isOpen || isMobile) && (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <img src={LogoBitel} alt="logo" width="130px" />
          </Box>
        )}
        {!isMobile && (
          <Tooltip title={isOpen ? "Contraer" : "Expandir"} placement="right">
            <IconButton
              color="inherit"
              aria-label="toggle drawer"
              onClick={handleDrawerToggle}
              sx={{
                transition: "transform 400ms cubic-bezier(0, 0, 0.2, 1)",
                transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
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
              {/* <CloseIcon /> */}
              <ReadMore />
            </IconButton>
          </Tooltip>
        )}
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="close drawer"
            onClick={() => setMobileOpen(false)}
          >
            <CloseIcon />
          </IconButton>
        )}
      </Box>
      <List component="nav" sx={{ px: 2, pt: 2 }}>
        {renderMenuItems(menuItems)}
      </List>
    </>
  );

  return (
    <>
      {/* Drawer temporal en mobile */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{
            keepMounted: true, // Mejor rendimiento en mobile
          }}
          sx={{
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              border: "none",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        // Drawer permanente en desktop
        <Drawer
          variant="permanent"
          sx={{
            width: isOpen ? drawerWidth : collapsedWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: isOpen ? drawerWidth : collapsedWidth,
              boxSizing: "border-box",
              border: "none",
              transition: "width 400ms cubic-bezier(0, 0, 0.2, 1)",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;

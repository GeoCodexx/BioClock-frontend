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
  useMediaQuery,
} from "@mui/material";

// Iconos
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import BusinessIcon from "@mui/icons-material/Business";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import AssessmentIcon from "@mui/icons-material/Assessment";
import DevicesIcon from "@mui/icons-material/Devices";
import { useState } from "react";
import {
  CalendarMonth,
  ExpandLess,
  ExpandMore,
  Schedule,
} from "@mui/icons-material";

import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import { usePermission } from "../../../utils/permissions";
import { preload } from "../../../App";

const drawerWidth = 260;
const collapsedWidth = 80;

const menuItems = [
  {
    text: "Panel Estadístico",
    path: "/dashboard",
    permission: "dashboard:read",
    icon: <DashboardIcon />,
    preload: "dashboard",
  },
  {
    text: "Horarios",
    path: "/schedules",
    permission: "schedules:read",
    icon: <Schedule />,
    preload: "schedules",
  },
  {
    text: "Departamentos",
    path: "/departments",
    permission: "departments:read",
    icon: <BusinessIcon />,
    preload: "departments",
  },
  {
    text: "Dispositivos",
    path: "/devices",
    permission: "devices:read",
    icon: <DevicesIcon />,
    preload: "devices",
  },
  {
    text: "Huellas Dactilares",
    path: "/fingerprints",
    permission: "fingerprints:read",
    icon: <FingerprintIcon />,
    preload: "fingerprints",
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
    preload: "myAttendance",
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
        preload: "permissions",
      },
      {
        text: "Roles",
        path: "/users/roles",
        permission: "roles:read",
        icon: <VpnKeyIcon />,
        preload: "roles",
      },
      {
        text: "Usuarios",
        path: "/users",
        permission: "users:read",
        icon: <PeopleIcon />,
        preload: "users",
      },
    ],
  },
  {
    text: "Gestión de Asistencias",
    icon: <AssessmentIcon />,
    permission: [
      "general-report:read",
      "attendances:read",
      "justifications:read",
    ],
    children: [
      {
        text: "Reportes",
        path: "/general-report",
        permission: "general-report:read",
        icon: <ChevronRightIcon />,
        preload: "generalReport",
      },
      {
        text: "Historial de Asistencias",
        path: "/attendances",
        permission: "attendances:read",
        icon: <ChevronRightIcon />,
        preload: "attendances",
      },
      {
        text: "Justificaciones",
        path: "/justifications",
        permission: "justifications:read",
        icon: <ChevronRightIcon />,
        preload: "justifications",
      },
    ],
  },
];

const Sidebar = ({ isOpen, mobileOpen, setMobileOpen }) => {
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { can, canAny } = usePermission();
  //const { logoUrl } = useLogoContext();

  const [openMenu, setOpenMenu] = useState(() => {
    const current = menuItems.find((item) =>
      item.children?.some((child) => location.pathname.startsWith(child.path)),
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

  const handleMouseEnter = (item) => {
    // Dispara el import() del chunk correspondiente ANTES de que el usuario haga clic.
    // React ya habrá descargado el JS cuando la ruta se renderice → 0 delay visible.
    preload[item.preload]?.();
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
                onMouseEnter={handleMouseEnter(item)} // Para precargar el ComponentPage antes que haga click
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
                  true,
                )}
              </List>
            </Collapse>
          )}
        </Box>
      );
    });

  const drawerContent = (
    <List component="nav" sx={{ px: 2, pt: 2 }}>
      {renderMenuItems(menuItems)}
    </List>
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
          PaperProps={{
            sx: {
              width: { xs: "100%", sm: 400 },
              height: "calc(100% - 64px)",
              top: 64,
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

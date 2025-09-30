import { useLocation, Link } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
  Tooltip,
  Avatar,
  Divider,
  Collapse,
} from "@mui/material";

// Iconos
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import BusinessIcon from "@mui/icons-material/Business";
import EventNoteIcon from "@mui/icons-material/EventNote";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import AssessmentIcon from "@mui/icons-material/Assessment";
import { useState } from "react";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight"; // Para submenús

const drawerWidth = 260;
const collapsedWidth = 80;

const menuItems = [
  { text: "Dashboard", path: "/", icon: <DashboardIcon /> },
  { text: "Horarios", path: "/schedules", icon: <EventNoteIcon /> },
  { text: "Departamentos", path: "/departments", icon: <BusinessIcon /> },
  { text: "Permisos", path: "/permissions", icon: <VpnKeyIcon /> },
  { text: "Roles", path: "/roles", icon: <VpnKeyIcon /> },
  { text: "Usuarios", path: "/users", icon: <PeopleIcon /> },
  {
    text: "Huellas Dactilares",
    path: "/fingerprints",
    icon: <FingerprintIcon />,
  },
  { text: "Asistencias", path: "/attendances", icon: <EventNoteIcon /> },
  {
    text: "Reportes",
    icon: <AssessmentIcon />,
    children: [
      {
        text: "Asistencia del día",
        path: "/reports/daily",
        icon: <ChevronRightIcon />,
      },
      {
        text: "Por usuario",
        path: "/reports/user-history",
        icon: <ChevronRightIcon />,
      },
      {
        text: "General",
        path: "/reports/monthly",
        icon: <ChevronRightIcon />,
      },
    ],
  },
];

const Sidebar = ({ isOpen }) => {
  const theme = useTheme();
  const location = useLocation();
  // Estado: menú abierto (solo uno a la vez)
  const [openMenu, setOpenMenu] = useState(() => {
    const current = menuItems.find((item) =>
      item.children?.some((child) => location.pathname.startsWith(child.path))
    );
    return current ? current.text : null;
  });
  // Inicializar submenús abiertos en base a la ruta actual
  /*const [openMenus, setOpenMenus] = useState(() => {
    const initial = {};
    menuItems.forEach((item) => {
      if (
        item.children?.some((child) => location.pathname.startsWith(child.path))
      ) {
        initial[item.text] = true; // abre automáticamente el grupo
      }
    });
    return initial;
  });*/

  const activeRoute = (path) => {
    return location.pathname === path;
  };

  /*const handleToggle = (text) => {
    setOpenMenus((prev) => ({ ...prev, [text]: !prev[text] }));
  };*/
  const handleToggle = (text) => {
    setOpenMenu((prev) => (prev === text ? null : text)); // acordeón
  };

  const renderMenuItems = (items, isSubmenu = false) =>
    items.map((item) => (
      <Box key={item.text}>
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <Tooltip title={!isOpen ? item.text : ""} placement="right">
            <ListItemButton
              component={item.path ? Link : "button"}
              to={item.path}
              onClick={
                item.children ? () => handleToggle(item.text) : undefined
              }
              //selected={item.path && activeRoute(item.path)}
              selected={
                (item.path && activeRoute(item.path)) ||
                item.children?.some((child) => activeRoute(child.path))
              }
              sx={{
                borderRadius: 1,
                minHeight: 48,
                justifyContent: isOpen ? "initial" : "center",
                pl: isSubmenu ? 6 : 2, // indentación si es submenú
                "&.Mui-selected": {
                  bgcolor: `${theme.palette.primary.main}15`,
                  color: theme.palette.primary.main,
                  "& .MuiListItemIcon-root": {
                    color: theme.palette.primary.main,
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 36,
                  mr: isOpen ? 3 : "auto",
                  justifyContent: "center",
                  color: activeRoute(item.path)
                    ? theme.palette.primary.main
                    : "inherit",
                }}
              >
                {isSubmenu ? <ChevronRightIcon /> : item.icon}
              </ListItemIcon>
              {isOpen && <ListItemText primary={item.text} />}
              {item.children &&
                isOpen &&
                (openMenu === item.text ? <ExpandLess /> : <ExpandMore />)}
            </ListItemButton>
          </Tooltip>
        </ListItem>

        {/* Submenús */}
        {item.children && (
          <Collapse in={openMenu === item.text} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {renderMenuItems(item.children, true)}
            </List>
          </Collapse>
        )}
      </Box>
    ));

  // const drawer = (
  //   <>
  //     {/* Header del Sidebar */}
  //     <Box
  //       sx={{
  //         px: 2.5,
  //         py: 3,
  //         display: "flex",
  //         alignItems: "center",
  //         justifyContent: "space-between",
  //       }}
  //     >
  //       {isOpen && (
  //         <Box sx={{ display: "flex", alignItems: "center" }}>
  //           <Avatar
  //             sx={{
  //               width: 40,
  //               height: 40,
  //               bgcolor: theme.palette.primary.main,
  //               mr: 2,
  //             }}
  //           >
  //             A
  //           </Avatar>
  //           <Typography variant="h6" color="inherit">
  //             Attendance
  //           </Typography>
  //         </Box>
  //       )}
  //     </Box>

  //     <Divider sx={{ mb: 2 }} />

  //     {/* Lista de Menú */}
  //     <List component="nav" sx={{ px: 2 }}>
  //       {menuItems.map((item) => (
  //         <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
  //           <Tooltip title={!isOpen ? item.text : ""} placement="right">
  //             <ListItemButton
  //               component={Link}
  //               to={item.path}
  //               selected={activeRoute(item.path)}
  //               sx={{
  //                 borderRadius: 1,
  //                 mb: 0.5,
  //                 minHeight: 48,
  //                 justifyContent: isOpen ? "initial" : "center",
  //                 "&.Mui-selected": {
  //                   bgcolor: `${theme.palette.primary.main}15`,
  //                   color: theme.palette.primary.main,
  //                   "&:hover": {
  //                     bgcolor: `${theme.palette.primary.main}25`,
  //                   },
  //                   "& .MuiListItemIcon-root": {
  //                     color: theme.palette.primary.main,
  //                   },
  //                 },
  //               }}
  //             >
  //               <ListItemIcon
  //                 sx={{
  //                   minWidth: 36,
  //                   mr: isOpen ? 3 : "auto",
  //                   justifyContent: "center",
  //                   color: activeRoute(item.path)
  //                     ? theme.palette.primary.main
  //                     : "inherit",
  //                 }}
  //               >
  //                 {item.icon}
  //               </ListItemIcon>
  //               {isOpen && <ListItemText primary={item.text} />}
  //             </ListItemButton>
  //           </Tooltip>
  //         </ListItem>
  //       ))}
  //     </List>
  //   </>
  // );

  return (
    // <Drawer
    //   variant="permanent"
    //   sx={{
    //     width: isOpen ? drawerWidth : collapsedWidth,
    //     transition: theme.transitions.create("width", {
    //       easing: theme.transitions.easing.sharp,
    //       duration: theme.transitions.duration.enteringScreen,
    //     }),
    //     [`& .MuiDrawer-paper`]: {
    //       width: isOpen ? drawerWidth : collapsedWidth,
    //       transition: theme.transitions.create("width", {
    //         easing: theme.transitions.easing.sharp,
    //         duration: theme.transitions.duration.enteringScreen,
    //       }),
    //       boxSizing: "border-box",
    //       borderRight: `1px solid ${theme.palette.divider}`,
    //       bgcolor: theme.palette.background.paper,
    //       overflowX: "hidden",
    //     },
    //   }}
    // >
    //   {/*drawer*/}
    // </Drawer>
    <Drawer
      variant="permanent"
      sx={{
        width: isOpen ? drawerWidth : collapsedWidth,
        [`& .MuiDrawer-paper`]: {
          width: isOpen ? drawerWidth : collapsedWidth,
          boxSizing: "border-box",
        },
      }}
    >
      <Box sx={{ px: 2.5, py: 3 }}>
        {isOpen && (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Avatar sx={{ width: 40, height: 40, mr: 2 }}>A</Avatar>
            <Typography variant="h6">Attendance</Typography>
          </Box>
        )}
      </Box>
      <Divider />
      <List component="nav" sx={{ px: 2 }}>
        {renderMenuItems(menuItems)}
      </List>
    </Drawer>
  );
};

export default Sidebar;

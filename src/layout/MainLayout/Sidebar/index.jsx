import { useLocation, Link } from 'react-router-dom';
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
  Divider
} from '@mui/material';

// Iconos
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import BusinessIcon from '@mui/icons-material/Business';
import EventNoteIcon from '@mui/icons-material/EventNote';

const drawerWidth = 260;
const collapsedWidth = 80;

const menuItems = [
  { text: 'Dashboard', path: '/', icon: <DashboardIcon /> },
  { text: 'Usuarios', path: '/users', icon: <PeopleIcon /> },
  { text: 'Roles', path: '/roles', icon: <VpnKeyIcon /> },
  { text: 'Departamentos', path: '/departments', icon: <BusinessIcon /> },
  { text: 'Asistencias', path: '/attendances', icon: <EventNoteIcon /> },
];

const Sidebar = ({ isOpen }) => {
  const theme = useTheme();
  const location = useLocation();

  const activeRoute = (path) => {
    return location.pathname === path;
  };

  const drawer = (
    <>
      {/* Header del Sidebar */}
      <Box
        sx={{
          px: 2.5,
          py: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        {isOpen && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: theme.palette.primary.main,
                mr: 2
              }}
            >
              A
            </Avatar>
            <Typography variant="h6" color="inherit">
              Attendance
            </Typography>
          </Box>
        )}
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Lista de Menú */}
      <List component="nav" sx={{ px: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <Tooltip title={!isOpen ? item.text : ""} placement="right">
              <ListItemButton
                component={Link}
                to={item.path}
                selected={activeRoute(item.path)}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  minHeight: 48,
                  justifyContent: isOpen ? 'initial' : 'center',
                  '&.Mui-selected': {
                    bgcolor: `${theme.palette.primary.main}15`,
                    color: theme.palette.primary.main,
                    '&:hover': {
                      bgcolor: `${theme.palette.primary.main}25`,
                    },
                    '& .MuiListItemIcon-root': {
                      color: theme.palette.primary.main,
                    }
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 36,
                    mr: isOpen ? 3 : 'auto',
                    justifyContent: 'center',
                    color: activeRoute(item.path) ? theme.palette.primary.main : 'inherit'
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {isOpen && <ListItemText primary={item.text} />}
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>
    </>
  );

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: isOpen ? drawerWidth : collapsedWidth,
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        [`& .MuiDrawer-paper`]: {
          width: isOpen ? drawerWidth : collapsedWidth,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          boxSizing: 'border-box',
          borderRight: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.background.paper,
          overflowX: 'hidden'
        },
      }}
    >
      {drawer}
    </Drawer>
  );
};

export default Sidebar;
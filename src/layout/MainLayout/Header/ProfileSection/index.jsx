import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  useTheme
} from '@mui/material';

// icons
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const ProfileSection = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);

  const handleLogout = async () => {
    try {
      // Implementar lógica de logout
      localStorage.removeItem('token');
      navigate('/login');
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

  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
      <ButtonBase
        sx={{
          p: 0.25,
          bgcolor: open ? 'rgba(0,0,0,0.1)' : 'transparent',
          borderRadius: 1,
          '&:hover': { bgcolor: 'rgba(0,0,0,0.1)' },
        }}
        aria-label="open profile"
        ref={anchorRef}
        aria-controls={open ? 'profile-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 0.5 }}>
          <Avatar
            src="/static/images/avatar.jpg"
            sx={{
              width: 32,
              height: 32,
              bgcolor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              '&:hover': {
                bgcolor: theme.palette.primary.dark,
              },
            }}
          >
            A
          </Avatar>
          <Typography variant="subtitle1">
            Admin
          </Typography>
          <KeyboardArrowDownIcon 
            sx={{ 
              fontSize: '1rem',
              transform: open ? 'rotate(-180deg)' : 'rotate(0)',
              transition: 'transform 0.3s ease-in-out'
            }} 
          />
        </Box>
      </ButtonBase>
      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, 9]
              }
            }
          ]
        }}
      >
        <Paper
          sx={{
            boxShadow: theme.shadows[8],
            borderRadius: 2,
            width: 290,
            minWidth: 290,
            maxWidth: 290,
          }}
        >
          <ClickAwayListener onClickAway={handleClose}>
            <Box>
              <Box sx={{ p: 2, pt: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    src="/static/images/avatar.jpg"
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText
                    }}
                  >
                    A
                  </Avatar>
                  <Box>
                    <Typography variant="h6">John Doe</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Administrador
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Divider />
              <Box sx={{ p: 1 }}>
                <List component="nav" sx={{ p: 0, '& .MuiListItemIcon-root': { minWidth: 32 } }}>
                  <ListItemButton onClick={() => { handleClose({}); navigate('/profile'); }}>
                    <ListItemIcon>
                      <PersonOutlineIcon />
                    </ListItemIcon>
                    <ListItemText primary="Mi Perfil" />
                  </ListItemButton>
                  <ListItemButton onClick={() => { handleClose({}); navigate('/settings'); }}>
                    <ListItemIcon>
                      <SettingsIcon />
                    </ListItemIcon>
                    <ListItemText primary="Configuración" />
                  </ListItemButton>
                  <ListItemButton onClick={handleLogout}>
                    <ListItemIcon>
                      <LogoutIcon />
                    </ListItemIcon>
                    <ListItemText primary="Cerrar Sesión" />
                  </ListItemButton>
                </List>
              </Box>
            </Box>
          </ClickAwayListener>
        </Paper>
      </Popper>
    </Box>
  );
};

export default ProfileSection;
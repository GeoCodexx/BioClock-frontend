import { useState, useRef } from 'react';
import {
  Box,
  Button,
  ButtonBase,
  ClickAwayListener,
  Divider,
  Grid,
  Paper,
  Popper,
  Stack,
  Typography,
  useTheme,
  Badge
} from '@mui/material';

// icons
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const NotificationSection = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  // Datos de ejemplo para las notificaciones
  const notifications = [
    {
      id: 1,
      title: 'Nueva asistencia registrada',
      time: 'Hace 2 minutos',
      message: 'Juan Pérez registró su entrada'
    },
    {
      id: 2,
      title: 'Actualización de departamento',
      time: 'Hace 5 minutos',
      message: 'Se actualizó la información del departamento de TI'
    },
    {
      id: 3,
      title: 'Nuevo usuario creado',
      time: 'Hace 10 minutos',
      message: 'Se creó un nuevo usuario en el sistema'
    }
  ];

  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
      <ButtonBase
        sx={{
          p: 0.25,
          bgcolor: open ? 'rgba(0,0,0,0.1)' : 'transparent',
          borderRadius: '50%',
          '&:hover': { bgcolor: 'rgba(0,0,0,0.1)' },
        }}
        aria-label="open notifications"
        ref={anchorRef}
        aria-controls={open ? 'notification-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
      >
        <Badge badgeContent={notifications.length} color="primary">
          <NotificationsNoneIcon sx={{ fontSize: '1.5rem' }} />
        </Badge>
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
            width: 360,
            minWidth: 290,
            maxWidth: 360,
          }}
        >
          <ClickAwayListener onClickAway={handleClose}>
            <Box>
              <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6">Notificaciones</Typography>
                <Typography variant="caption" color="textSecondary">
                  {notifications.length} Nuevas
                </Typography>
              </Box>
              <Divider />
              <Box sx={{ height: '100%', maxHeight: 'calc(100vh - 205px)', overflowX: 'hidden' }}>
                <Grid container direction="column" spacing={0}>
                  {notifications.map((notification) => (
                    <Grid item key={notification.id} sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                      <Box sx={{ p: 2, '&:hover': { bgcolor: theme.palette.primary.light + '20' }, cursor: 'pointer' }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <Stack direction="row" spacing={0.5}>
                              <Typography variant="subtitle1">{notification.title}</Typography>
                            </Stack>
                            <Typography variant="body2" color="textSecondary">
                              {notification.message}
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <AccessTimeIcon sx={{ fontSize: '0.75rem', color: 'text.secondary' }} />
                              <Typography variant="caption" color="textSecondary">
                                {notification.time}
                              </Typography>
                            </Stack>
                          </Grid>
                        </Grid>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
              <Divider />
              <Box sx={{ p: 1 }}>
                <Button fullWidth variant="text" size="small">
                  Ver Todas
                </Button>
              </Box>
            </Box>
          </ClickAwayListener>
        </Paper>
      </Popper>
    </Box>
  );
};

export default NotificationSection;
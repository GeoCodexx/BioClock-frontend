import React, { useState, useMemo, useCallback, memo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  useTheme,
  Box,
  Typography,
  TableSortLabel,
  Tooltip,
  alpha,
  Stack,
  Collapse,
  useMediaQuery,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Grid,
  Card,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import EventIcon from "@mui/icons-material/Event";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import NetworkCheckIcon from "@mui/icons-material/NetworkCheck";
import RouterIcon from "@mui/icons-material/Router";
import PlaceIcon from "@mui/icons-material/Place";
import PersonIcon from "@mui/icons-material/Person";

// ============================================
// COMPONENTES AUXILIARES MEMOIZADOS
// ============================================

const EmptyState = memo(() => {
  const theme = useTheme();
  return (
    <Paper
      sx={{
        p: 6,
        textAlign: "center",
        borderRadius: 2,
        bgcolor: alpha(theme.palette.primary.main, 0.02),
      }}
    >
      <EventIcon
        sx={{
          fontSize: 64,
          color: theme.palette.text.disabled,
          mb: 2,
        }}
      />
      <Typography variant="h6" color="text.secondary" gutterBottom>
        No hay dispositivos registrados
      </Typography>
      <Typography variant="body2" color="text.disabled">
        Comienza agregando tu primer dispositivo
      </Typography>
    </Paper>
  );
});

EmptyState.displayName = "EmptyState";

const StatusChip = memo(({ status }) => {
  const theme = useTheme();
  const isActive = status === "active";

  return (
    <Chip
      label={isActive ? "Activo" : "Inactivo"}
      size="small"
      sx={{
        height: 22,
        fontSize: "0.75rem",
        fontWeight: 600,
        bgcolor: isActive
          ? alpha(theme.palette.success.main, 0.15)
          : alpha(theme.palette.error.main, 0.15),
        color: isActive ? theme.palette.success.main : theme.palette.error.main,
        borderRadius: 1,
      }}
    />
  );
});

StatusChip.displayName = "StatusChip";

// Componente para información detallada en Desktop
const DesktopDeviceDetails = memo(({ device, getFullName }) => {
  const theme = useTheme();

  const DetailItem = ({ icon: Icon, label, value, iconColor }) => (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1.5,
        p: 2,
        borderRadius: 1,
        bgcolor: alpha(theme.palette.background.paper, 0.6),
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        transition: "all 0.2s ease",
        "&:hover": {
          bgcolor: alpha(theme.palette.primary.main, 0.02),
          borderColor: alpha(theme.palette.primary.main, 0.2),
          transform: "translateX(4px)",
        },
      }}
    >
      <Box
        sx={{
          p: 1,
          borderRadius: 1,
          bgcolor: alpha(iconColor || theme.palette.primary.main, 0.1),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon
          sx={{
            fontSize: 20,
            color: iconColor || theme.palette.primary.main,
          }}
        />
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography
          variant="caption"
          sx={{
            display: "block",
            fontWeight: 600,
            color: theme.palette.text.secondary,
            mb: 0.5,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          {label}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.primary,
            fontWeight: 500,
            wordBreak: "break-all",
          }}
        >
          {value || "—"}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <DetailItem
            icon={FingerprintIcon}
            label="ID del Dispositivo"
            value={device.deviceId}
            iconColor={theme.palette.info.main}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <DetailItem
            icon={NetworkCheckIcon}
            label="Dirección IP"
            value={device.ipAddress}
            iconColor={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <DetailItem
            icon={RouterIcon}
            label="Dirección MAC"
            value={device.macAddress}
            iconColor={theme.palette.warning.main}
          />
        </Grid>
      </Grid>
    </Box>
  );
});

DesktopDeviceDetails.displayName = "DesktopDeviceDetails";

// Componente mejorado para detalles en Mobile
const MobileDeviceDetails = memo(({ device, getFullName }) => {
  const theme = useTheme();

  const DetailCard = ({ icon: Icon, label, value, iconColor }) => (
    <Card
      elevation={0}
      sx={{
        p: 2,
        bgcolor: alpha(theme.palette.background.paper, 0.8),
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        borderRadius: 2,
        transition: "all 0.2s ease",
        "&:hover": {
          bgcolor: alpha(theme.palette.primary.main, 0.02),
          borderColor: alpha(theme.palette.primary.main, 0.3),
        },
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Box
          sx={{
            p: 1,
            borderRadius: 1.5,
            bgcolor: alpha(iconColor || theme.palette.primary.main, 0.12),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon
            sx={{
              fontSize: 20,
              color: iconColor || theme.palette.primary.main,
            }}
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="caption"
            sx={{
              display: "block",
              fontWeight: 700,
              color: theme.palette.text.secondary,
              mb: 0.5,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              fontSize: "0.7rem",
            }}
          >
            {label}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.primary,
              fontWeight: 500,
              wordBreak: "break-all",
              lineHeight: 1.4,
            }}
          >
            {value || "—"}
          </Typography>
        </Box>
      </Stack>
    </Card>
  );

  return (
    <Box sx={{ p: 2.5, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
      <Stack spacing={1.5}>
        <DetailCard
          icon={FingerprintIcon}
          label="ID del Dispositivo"
          value={device.deviceId}
          iconColor={theme.palette.info.main}
        />
        <DetailCard
          icon={PlaceIcon}
          label="Ubicación"
          value={device.location}
          iconColor={theme.palette.secondary.main}
        />
        <DetailCard
          icon={NetworkCheckIcon}
          label="Dirección IP"
          value={device.ipAddress}
          iconColor={theme.palette.success.main}
        />
        <DetailCard
          icon={RouterIcon}
          label="Dirección MAC"
          value={device.macAddress}
          iconColor={theme.palette.warning.main}
        />
        <DetailCard
          icon={PersonIcon}
          label="Registrado por"
          value={getFullName(device.registeredBy)}
          iconColor={theme.palette.primary.main}
        />
      </Stack>
    </Box>
  );
});

MobileDeviceDetails.displayName = "MobileDeviceDetails";

const MobileActionMenu = memo(({ anchorEl, onClose, onEdit, onDelete }) => (
  <Menu
    anchorEl={anchorEl}
    open={Boolean(anchorEl)}
    onClose={onClose}
    transformOrigin={{ horizontal: "right", vertical: "top" }}
    anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
    slotProps={{
      paper: {
        sx: {
          mt: 0.5,
          minWidth: 160,
          borderRadius: 2,
          border: (theme) =>
                  theme.palette.mode === "dark"
                    ? "1px solid rgba(255, 255, 255, 0.1)"
                    : "none",
        },
      },
    }}
  >
    <MenuItem onClick={onEdit} sx={{ py: 1.5 }}>
      <ListItemIcon>
        <EditIcon fontSize="small" color="primary" />
      </ListItemIcon>
      <ListItemText>Editar</ListItemText>
    </MenuItem>
    <MenuItem onClick={onDelete} sx={{ py: 1.5 }}>
      <ListItemIcon>
        <DeleteIcon fontSize="small" color="error" />
      </ListItemIcon>
      <ListItemText>Eliminar</ListItemText>
    </MenuItem>
  </Menu>
));

MobileActionMenu.displayName = "MobileActionMenu";

const MobileDeviceRow = memo(
  ({ device, index, isOpen, onToggle, onMenuOpen, getFullName }) => {
    const theme = useTheme();

    return (
      <React.Fragment>
        <TableRow
          sx={{
            bgcolor:
              index % 2 === 0
                ? "transparent"
                : alpha(theme.palette.grey[500], 0.02),
            "& td": {
              borderBottom: isOpen ? "none" : undefined,
            },
          }}
        >
          <TableCell sx={{ py: 1, width: 48 }}>
            <IconButton
              size="small"
              onClick={onToggle}
              sx={{
                color: theme.palette.primary.main,
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  transform: "scale(1.1)",
                },
              }}
            >
              {isOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>

          <TableCell sx={{ py: 1.5 }}>
            <Box>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                {device.name || "—"}
              </Typography>
              <StatusChip status={device.status} />
            </Box>
          </TableCell>

          <TableCell align="right" sx={{ py: 1, width: 48 }}>
            <IconButton
              size="small"
              onClick={onMenuOpen}
              sx={{
                color: theme.palette.text.secondary,
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                },
              }}
            >
              <MoreVertIcon />
            </IconButton>
          </TableCell>
        </TableRow>

        <TableRow>
          <TableCell
            colSpan={3}
            sx={{
              py: 0,
              borderBottom: isOpen ? undefined : "none",
              bgcolor:
                index % 2 === 0
                  ? alpha(theme.palette.primary.main, 0.02)
                  : alpha(theme.palette.grey[500], 0.04),
            }}
          >
            <Collapse in={isOpen} timeout="auto" unmountOnExit>
              <MobileDeviceDetails device={device} getFullName={getFullName} />
            </Collapse>
          </TableCell>
        </TableRow>
      </React.Fragment>
    );
  }
);

MobileDeviceRow.displayName = "MobileDeviceRow";

const DesktopDeviceRow = memo(
  ({ device, index, isOpen, onToggle, onEdit, onDelete, getFullName }) => {
    const theme = useTheme();

    return (
      <React.Fragment>
        <TableRow
          hover
          sx={{
            transition: "all 0.2s ease",
            "&:hover": {
              bgcolor: alpha(theme.palette.primary.main, 0.04),
            },
            bgcolor:
              index % 2 === 0
                ? "transparent"
                : alpha(theme.palette.grey[500], 0.02),
            "& td": {
              borderBottom: isOpen ? "none" : undefined,
            },
          }}
        >
          {/* Botón Expandir/Contraer */}
          <TableCell sx={{ width: 60 }}>
            <IconButton
              size="small"
              onClick={onToggle}
              sx={{
                color: theme.palette.primary.main,
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  transform: "scale(1.1)",
                },
              }}
            >
              {isOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>

          {/* Índice */}
          <TableCell>
            <Typography variant="body2" fontWeight={600}>
              {device.index || "—"}
            </Typography>
          </TableCell>

          {/* Nombre */}
          <TableCell>
            <Typography variant="body2" fontWeight={600}>
              {device.name || "—"}
            </Typography>
          </TableCell>

          {/* Ubicación */}
          <TableCell>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <PlaceIcon
                sx={{ fontSize: 18, color: theme.palette.text.secondary }}
              />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {device.location || "Sin ubicación"}
              </Typography>
            </Box>
          </TableCell>

          {/* Registrador */}
          <TableCell>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <PersonIcon
                sx={{ fontSize: 18, color: theme.palette.text.secondary }}
              />
              <Typography variant="body2">
                {getFullName(device.registeredBy)}
              </Typography>
            </Box>
          </TableCell>

          {/* Estado */}
          <TableCell align="center">
            <StatusChip status={device.status} />
          </TableCell>

          {/* Acciones */}
          <TableCell align="center">
            <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
              <Tooltip title="Editar dispositivo" arrow>
                <IconButton
                  size="small"
                  onClick={() => onEdit(device)}
                  sx={{
                    color: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.15),
                      transform: "scale(1.1)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Eliminar dispositivo" arrow>
                <IconButton
                  size="small"
                  onClick={() => onDelete(device._id)}
                  sx={{
                    color: theme.palette.error.main,
                    bgcolor: alpha(theme.palette.error.main, 0.08),
                    "&:hover": {
                      bgcolor: alpha(theme.palette.error.main, 0.15),
                      transform: "scale(1.1)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </TableCell>
        </TableRow>

        {/* Fila Colapsable con Detalles */}
        <TableRow>
          <TableCell
            colSpan={7}
            sx={{
              py: 0,
              borderBottom: isOpen
                ? `2px solid ${theme.palette.divider}`
                : "none",
              bgcolor:
                index % 2 === 0
                  ? alpha(theme.palette.primary.main, 0.02)
                  : alpha(theme.palette.grey[500], 0.04),
            }}
          >
            <Collapse in={isOpen} timeout="auto" unmountOnExit>
              <DesktopDeviceDetails device={device} getFullName={getFullName} />
            </Collapse>
          </TableCell>
        </TableRow>
      </React.Fragment>
    );
  }
);

DesktopDeviceRow.displayName = "DesktopDeviceRow";

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const DeviceTable = ({ devices = [], onEdit, onDelete }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [orderBy, setOrderBy] = useState("index");
  const [order, setOrder] = useState("asc");
  const [openRowId, setOpenRowId] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);

  // Columnas para Desktop (sin ID, IP, MAC)
  const desktopColumns = useMemo(
    () => [
      { id: "expand", label: "", sortable: false, minWidth: 60 },
      { id: "index", label: "#", sortable: true, minWidth: 60 },
      { id: "name", label: "Nombre", sortable: true, minWidth: 180 },
      { id: "location", label: "Ubicación", sortable: true, minWidth: 200 },
      {
        id: "registeredBy",
        label: "Registrador",
        sortable: true,
        minWidth: 200,
      },
      {
        id: "status",
        label: "Estado",
        sortable: true,
        minWidth: 120,
        align: "center",
      },
      {
        id: "actions",
        label: "Acciones",
        sortable: false,
        minWidth: 120,
        align: "center",
      },
    ],
    []
  );

  const getFullName = useCallback((user) => {
    if (!user) return "—";
    const parts = [user.name, user.firstSurname, user.secondSurname].filter(
      Boolean
    );
    return parts.join(" ") || "—";
  }, []);

  const handleRowToggle = useCallback((deviceId) => {
    setOpenRowId((prev) => (prev === deviceId ? null : deviceId));
  }, []);

  const handleMenuOpen = useCallback((event, device) => {
    setAnchorEl(event.currentTarget);
    setSelectedDevice(device);
  }, []);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
    setSelectedDevice(null);
  }, []);

  const handleEdit = useCallback(() => {
    if (selectedDevice && onEdit) {
      onEdit(selectedDevice);
    }
    handleMenuClose();
  }, [selectedDevice, onEdit, handleMenuClose]);

  const handleDelete = useCallback(() => {
    if (selectedDevice && onDelete) {
      onDelete(selectedDevice._id);
    }
    handleMenuClose();
  }, [selectedDevice, onDelete, handleMenuClose]);

  const handleRequestSort = useCallback(
    (property) => {
      setOrder((prevOrder) => {
        const isAsc = orderBy === property && prevOrder === "asc";
        return isAsc ? "desc" : "asc";
      });
      setOrderBy(property);
    },
    [orderBy]
  );

  const getComparator = useCallback((order, orderBy) => {
    return order === "desc"
      ? (a, b) => {
          const aValue = a[orderBy];
          const bValue = b[orderBy];
          if (bValue === null || bValue === undefined) return -1;
          if (aValue === null || aValue === undefined) return 1;
          if (bValue < aValue) return -1;
          if (bValue > aValue) return 1;
          return 0;
        }
      : (a, b) => {
          const aValue = a[orderBy];
          const bValue = b[orderBy];
          if (aValue === null || aValue === undefined) return -1;
          if (bValue === null || bValue === undefined) return 1;
          if (aValue < bValue) return -1;
          if (aValue > bValue) return 1;
          return 0;
        };
  }, []);

  const sortedDevices = useMemo(() => {
    return [...devices].sort(getComparator(order, orderBy));
  }, [devices, order, orderBy, getComparator]);

  if (devices.length === 0) {
    return <EmptyState />;
  }

  // VISTA MOBILE
  if (isMobile) {
    return (
      <>
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 2,
            boxShadow: "none",
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            overflow: "hidden",
          }}
        >
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  "& th": {
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    color: theme.palette.text.primary,
                    borderBottom: `2px solid ${theme.palette.divider}`,
                    py: 2,
                  },
                }}
              >
                <TableCell sx={{ width: 48 }} />
                <TableCell>Dispositivo</TableCell>
                <TableCell align="right" sx={{ width: 48 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedDevices.map((device, index) => (
                <MobileDeviceRow
                  key={device._id}
                  device={device}
                  index={index}
                  isOpen={openRowId === device._id}
                  onToggle={() => handleRowToggle(device._id)}
                  onMenuOpen={(e) => handleMenuOpen(e, device)}
                  getFullName={getFullName}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <MobileActionMenu
          anchorEl={anchorEl}
          onClose={handleMenuClose}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </>
    );
  }

  // VISTA DESKTOP
  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: 2,
        boxShadow: "none",
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}
    >
      <Table sx={{ minWidth: 800 }}>
        <TableHead>
          <TableRow
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              "& th": {
                fontWeight: 700,
                fontSize: "0.875rem",
                color: theme.palette.text.primary,
                borderBottom: `2px solid ${theme.palette.divider}`,
              },
            }}
          >
            {desktopColumns.map((column) => (
              <TableCell
                key={column.id}
                align={column.align || "left"}
                sx={{
                  minWidth: column.minWidth,
                  py: 2,
                }}
              >
                {column.sortable ? (
                  <TableSortLabel
                    active={orderBy === column.id}
                    direction={orderBy === column.id ? order : "asc"}
                    onClick={() => handleRequestSort(column.id)}
                    sx={{
                      "&:hover": {
                        color: theme.palette.primary.main,
                      },
                      "&.Mui-active": {
                        color: theme.palette.primary.main,
                        fontWeight: 700,
                      },
                    }}
                  >
                    {column.label}
                  </TableSortLabel>
                ) : (
                  column.label
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {sortedDevices.map((device, index) => (
            <DesktopDeviceRow
              key={device._id}
              device={device}
              index={index}
              isOpen={openRowId === device._id}
              onToggle={() => handleRowToggle(device._id)}
              onEdit={onEdit}
              onDelete={onDelete}
              getFullName={getFullName}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default memo(DeviceTable);

// DeviceTable.jsx - Versión Optimizada
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
  Divider,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import EventIcon from "@mui/icons-material/Event";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PlaceIcon from "@mui/icons-material/Place";

// ============================================
// COMPONENTES AUXILIARES MEMOIZADOS
// ============================================

// Componente EmptyState separado y memoizado
const EmptyState = memo(() => {
  const theme = useTheme();
  return (
    <Paper
      sx={{
        p: 6,
        textAlign: "center",
        borderRadius: 0,
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

// Componente StatusChip memoizado
const StatusChip = memo(({ status }) => {
  const theme = useTheme();
  const isActive = status === "active";

  return (
    <Chip
      label={isActive ? "Activo" : "Inactivo"}
      size="small"
      sx={{
        height: 20,
        fontSize: "0.7rem",
        fontWeight: 600,
        bgcolor: isActive
          ? alpha(theme.palette.success.main, 0.15)
          : alpha(theme.palette.error.main, 0.15),
        color: isActive ? theme.palette.success.main : theme.palette.error.main,
      }}
    />
  );
});

StatusChip.displayName = "StatusChip";

// Componente para el menú de acciones en mobile
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
        },
      },
    }}
  >
    <MenuItem onClick={onEdit}>
      <ListItemIcon>
        <EditIcon fontSize="small" color="primary" />
      </ListItemIcon>
      <ListItemText>Editar</ListItemText>
    </MenuItem>
    <MenuItem onClick={onDelete}>
      <ListItemIcon>
        <DeleteIcon fontSize="small" color="error" />
      </ListItemIcon>
      <ListItemText>Eliminar</ListItemText>
    </MenuItem>
  </Menu>
));

MobileActionMenu.displayName = "MobileActionMenu";

// Componente para detalles colapsables en mobile
const MobileDeviceDetails = memo(({ device, getFullName }) => {
  const theme = useTheme();

  const details = [
    { label: "ID", value: device.deviceId || "—" },
    { label: "UBICACIÓN", value: device.location || "Sin Ubicación" },
    { label: "DIRECCIÓN IP", value: device.ipAddress || "—" },
    { label: "DIRECCIÓN MAC", value: device.macAddress || "—" },
    { label: "REGISTRADOR", value: getFullName(device.registeredBy) || "—" },
  ];

  return (
    <Box sx={{ py: 2, px: 2 }}>
      <Stack spacing={2}>
        {details.map((detail, index) => (
          <React.Fragment key={detail.label}>
            <Box>
              <Stack direction="row" alignItems="center" spacing={0.5} mb={0.5}>
                <PlaceIcon
                  sx={{
                    fontSize: 14,
                    color: theme.palette.text.secondary,
                  }}
                />
                <Typography
                  variant="caption"
                  fontWeight={600}
                  color="text.secondary"
                >
                  {detail.label}
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.primary">
                {detail.value}
              </Typography>
            </Box>
            {index < details.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </Stack>
    </Box>
  );
});

MobileDeviceDetails.displayName = "MobileDeviceDetails";

// Componente para fila mobile
const MobileDeviceRow = memo(
  ({ device, index, isOpen, onToggle, onMenuOpen, getFullName }) => {
    const theme = useTheme();

    return (
      <React.Fragment>
        {/* Fila Principal */}
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
          {/* Botón Expandir/Contraer */}
          <TableCell sx={{ py: 1 }}>
            <IconButton
              size="small"
              onClick={onToggle}
              sx={{
                color: theme.palette.primary.main,
              }}
            >
              {isOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>

          {/* Nombre del Dispositivo */}
          <TableCell sx={{ py: 1.5 }}>
            <Box>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                {device.name || "—"}
              </Typography>
              <StatusChip status={device.status} />
            </Box>
          </TableCell>

          {/* Menú de Acciones */}
          <TableCell align="right" sx={{ py: 1 }}>
            <IconButton
              size="small"
              onClick={onMenuOpen}
              sx={{
                color: theme.palette.text.secondary,
              }}
            >
              <MoreVertIcon />
            </IconButton>
          </TableCell>
        </TableRow>

        {/* Fila Colapsable con Detalles */}
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

// Componente para fila desktop
const DesktopDeviceRow = memo(
  ({ device, index, onEdit, onDelete, getFullName }) => {
    const theme = useTheme();

    return (
      <TableRow
        hover
        sx={{
          transition: "all 0.2s ease",
          "&:hover": {
            bgcolor: alpha(theme.palette.primary.main, 0.04),
          },
          "&:last-child td": {
            borderBottom: 0,
          },
          bgcolor:
            index % 2 === 0
              ? "transparent"
              : alpha(theme.palette.grey[500], 0.02),
        }}
      >
        {/* indice */}
        <TableCell>
          <Typography variant="body2">{device.index || "—"}</Typography>
        </TableCell>
        {/* ID */}
        <TableCell>
          <Typography variant="body2">{device.deviceId || "—"}</Typography>
        </TableCell>

        {/* Nombre */}
        <TableCell>
          <Typography variant="body2" fontWeight={500}>
            {device.name || "—"}
          </Typography>
        </TableCell>

        {/* Dirección IP */}
        <TableCell>
          <Typography variant="body2" fontWeight={500}>
            {device.ipAddress || "—"}
          </Typography>
        </TableCell>

        {/* Dirección MAC */}
        <TableCell>
          <Typography variant="body2" fontWeight={500}>
            {device.macAddress || "—"}
          </Typography>
        </TableCell>

        {/* Ubicación */}
        <TableCell align="center">
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {device.location || "Sin ubicación"}
          </Typography>
        </TableCell>

        {/* Registrador */}
        <TableCell align="center">
          <Typography variant="body2" fontWeight={500}>
            {getFullName(device.registeredBy)}
          </Typography>
        </TableCell>

        {/* Estado */}
        <TableCell align="center">
          {device.status ? (
            <Chip
              label={device.status === "active" ? "Activo" : "Inactivo"}
              size="small"
              sx={{
                fontWeight: 600,
                fontSize: "0.75rem",
                bgcolor:
                  device.status === "active"
                    ? alpha(theme.palette.success.main, 0.15)
                    : alpha(theme.palette.error.main, 0.15),
                color:
                  device.status === "active"
                    ? theme.palette.success.main
                    : theme.palette.error.main,
                borderRadius: 1,
              }}
            />
          ) : (
            <Typography variant="body2" color="text.disabled">
              —
            </Typography>
          )}
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
                  },
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
                  },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </TableCell>
      </TableRow>
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

  // Configuración de columnas memoizada
  const columns = useMemo(
    () => [
      { id: "index", label: "#", sortable: true, minWidth: 50 },
      { id: "deviceId", label: "ID", sortable: true, minWidth: 100 },
      { id: "name", label: "Nombre", sortable: true, minWidth: 200 },
      { id: "ipAddress", label: "IP", sortable: true, minWidth: 120 },
      { id: "macAddress", label: "MAC", sortable: true, minWidth: 120 },
      {
        id: "location",
        label: "Ubicación",
        sortable: true,
        minWidth: 200,
        align: "center",
      },
      {
        id: "registeredBy",
        label: "Registrador",
        sortable: true,
        minWidth: 200,
        align: "center",
      },
      {
        id: "status",
        label: "Estado",
        sortable: true,
        minWidth: 100,
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

  // Función para formatear nombre completo memoizada
  const getFullName = useCallback((user) => {
    if (!user) return "—";
    const parts = [user.name, user.firstSurname, user.secondSurname].filter(
      Boolean
    );
    return parts.join(" ") || "—";
  }, []);

  // Handlers memoizados
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

  // Función de comparación memoizada
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

  // Dispositivos ordenados memoizados
  const sortedDevices = useMemo(() => {
    return [...devices].sort(getComparator(order, orderBy));
  }, [devices, order, orderBy, getComparator]);

  // Empty state
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
            borderRadius: 0,
            boxShadow: "none",
            overflow: "hidden",
          }}
        >
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  "& th": {
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    color: theme.palette.text.primary,
                    borderBottom: `2px solid ${theme.palette.divider}`,
                    py: 1.5,
                  },
                }}
              >
                <TableCell sx={{ width: 50 }} />
                <TableCell>Dispositivo</TableCell>
                <TableCell align="right" sx={{ width: 50 }} />
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
        borderRadius: 0,
        boxShadow: "none",
        //overflow: "hidden",
      }}
    >
      <Table sx={{ minWidth: 800 }}>
        <TableHead>
          <TableRow
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              "& th": {
                fontWeight: 600,
                fontSize: "0.875rem",
                color: theme.palette.text.primary,
                borderBottom: `2px solid ${theme.palette.divider}`,
              },
            }}
          >
            {columns.map((column) => (
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

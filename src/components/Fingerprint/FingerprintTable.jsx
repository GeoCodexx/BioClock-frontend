// FingerprintTable.jsx - Tabla responsive con filas colapsables en mobile
import React, { useState, useMemo } from "react";
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
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import PersonIcon from "@mui/icons-material/Person";
import DevicesIcon from "@mui/icons-material/Devices";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import BadgeIcon from "@mui/icons-material/Badge";
import { usePermission } from "../../utils/permissions";

// Utilidades de formateo
const formatters = {
  fullName: (user) =>
    user
      ? `${user.name} ${user.firstSurname} ${user.secondSurname || ""}`.trim()
      : "—",

  finger: (finger) => {
    const fingerMap = {
      pulgar_derecho: "Pulgar derecho",
      indice_derecho: "Índice derecho",
      medio_derecho: "Medio derecho",
      anular_derecho: "Anular derecho",
      menique_derecho: "Meñique derecho",
      pulgar_izquierdo: "Pulgar izquierdo",
      indice_izquierdo: "Índice izquierdo",
      medio_izquierdo: "Medio izquierdo",
      anular_izquierdo: "Anular izquierdo",
      menique_izquierdo: "Meñique izquierdo",
    };
    return fingerMap[finger] || finger?.replace(/_/g, " ") || "—";
  },

  date: (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  },

  status: (status) => {
    const statusMap = {
      approved: "Aprobado",
      pending: "Pendiente",
      rejected: "Rechazado",
    };
    return statusMap[status] || status || "—";
  },
};

const FingerprintTable = ({
  fingerprints = [],
  onApprove,
  onReject,
  onDelete,
  onOpenValidationDialog,
}) => {
  const { can } = usePermission();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [orderBy, setOrderBy] = useState("index");
  const [order, setOrder] = useState("asc");
  const [openRowId, setOpenRowId] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFingerprint, setSelectedFingerprint] = useState(null);

  // Toggle row collapse
  const handleRowToggle = (fingerprintId) => {
    setOpenRowId((prev) => (prev === fingerprintId ? null : fingerprintId));
  };

  // Menu de acciones (mobile)
  const handleMenuOpen = (event, fingerprint) => {
    setAnchorEl(event.currentTarget);
    setSelectedFingerprint(fingerprint);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedFingerprint(null);
  };

  const handleApprove = () => {
    if (selectedFingerprint && onApprove) {
      onApprove(selectedFingerprint);
    }
    handleMenuClose();
  };

  const handleReject = () => {
    if (selectedFingerprint && onReject) {
      onReject(selectedFingerprint);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedFingerprint && onDelete) {
      onDelete(selectedFingerprint._id);
    }
    handleMenuClose();
  };

  // Configuración de columnas
  const columns = [
    {
      id: "index",
      label: "#",
      sortable: true,
      minWidth: 50,
    },
    {
      id: "userId.dni",
      label: "DNI",
      sortable: true,
      minWidth: 120,
    },
    {
      id: "userId.name",
      label: "Usuario",
      sortable: true,
      minWidth: 200,
    },
    {
      id: "finger",
      label: "Dedo",
      sortable: true,
      minWidth: 150,
      align: "center",
    },
    {
      id: "deviceId.name",
      label: "Dispositivo",
      sortable: true,
      minWidth: 150,
      align: "center",
    },
    {
      id: "createdAt",
      label: "Fecha",
      sortable: true,
      minWidth: 120,
      align: "center",
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
      minWidth: 150,
      align: "center",
    },
  ];

  // Función de comparación para ordenamiento
  const getComparator = (order, orderBy) => {
    return order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };

  const descendingComparator = (a, b, orderBy) => {
    // Manejo de propiedades anidadas (userId.dni, userId.name, etc.)
    const getNestedValue = (obj, path) => {
      return path.split(".").reduce((acc, part) => acc?.[part], obj);
    };

    let aValue = getNestedValue(a, orderBy);
    let bValue = getNestedValue(b, orderBy);

    // Para ordenamiento de nombres completos
    if (orderBy === "userId.name") {
      aValue = formatters.fullName(a.userId).toLowerCase();
      bValue = formatters.fullName(b.userId).toLowerCase();
    }

    if (bValue === null || bValue === undefined) return -1;
    if (aValue === null || aValue === undefined) return 1;

    if (bValue < aValue) return -1;
    if (bValue > aValue) return 1;
    return 0;
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedFingerprints = useMemo(() => {
    return [...fingerprints].sort(getComparator(order, orderBy));
  }, [fingerprints, order, orderBy]);

  // Empty state
  if (fingerprints.length === 0) {
    return (
      <Paper
        sx={{
          p: 6,
          textAlign: "center",
          borderRadius: 0,
          bgcolor: alpha(theme.palette.primary.main, 0.02),
        }}
      >
        <FingerprintIcon
          sx={{
            fontSize: 64,
            color: theme.palette.text.disabled,
            mb: 2,
          }}
        />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No hay huellas dactilares registradas
        </Typography>
        <Typography variant="body2" color="text.disabled">
          Las huellas capturadas aparecerán aquí
        </Typography>
      </Paper>
    );
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
                <TableCell>Huella Dactilar</TableCell>
                <TableCell align="right" sx={{ width: 50 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedFingerprints.map((fingerprint, index) => {
                const isOpen = openRowId === fingerprint._id;
                const isPending = fingerprint.status === "pending";

                return (
                  <React.Fragment key={fingerprint._id}>
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
                          onClick={() => handleRowToggle(fingerprint._id)}
                          sx={{
                            color: theme.palette.primary.main,
                          }}
                        >
                          {isOpen ? (
                            <KeyboardArrowUpIcon />
                          ) : (
                            <KeyboardArrowDownIcon />
                          )}
                        </IconButton>
                      </TableCell>

                      {/* Info Principal */}
                      <TableCell sx={{ py: 1.5 }}>
                        <Box>
                          <Typography
                            variant="body2"
                            //fontWeight={600}
                            sx={{ mb: 0.5 }}
                          >
                            {formatters.fullName(fingerprint.userId)}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block", mb: 0.5 }}
                          >
                            {formatters.finger(fingerprint.finger)}
                          </Typography>
                          <Stack
                            direction="row"
                            spacing={0.5}
                            alignItems="center"
                          >
                            <Chip
                              label={formatters.status(fingerprint.status)}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: "0.7rem",
                                fontWeight: 600,
                                bgcolor:
                                  fingerprint.status === "approved"
                                    ? alpha(theme.palette.success.main, 0.15)
                                    : fingerprint.status === "pending"
                                      ? alpha(theme.palette.warning.main, 0.15)
                                      : alpha(theme.palette.error.main, 0.15),
                                color:
                                  fingerprint.status === "approved"
                                    ? theme.palette.success.main
                                    : fingerprint.status === "pending"
                                      ? theme.palette.warning.main
                                      : theme.palette.error.main,
                              }}
                            />
                          </Stack>
                        </Box>
                      </TableCell>

                      {/* Menú de Acciones */}
                      <TableCell align="right" sx={{ py: 1 }}>
                        {isPending && (
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, fingerprint)}
                            sx={{
                              color: theme.palette.text.secondary,
                            }}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        )}
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
                          <Box sx={{ py: 2, px: 2 }}>
                            <Stack spacing={2}>
                              {/* DNI */}
                              <Box>
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  spacing={0.5}
                                  mb={0.5}
                                >
                                  <BadgeIcon
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
                                    DNI
                                  </Typography>
                                </Stack>
                                <Typography
                                  variant="body2"
                                  color="text.primary"
                                  fontWeight={500}
                                >
                                  {fingerprint.userId?.dni || "—"}
                                </Typography>
                              </Box>

                              <Divider />

                              {/* Dispositivo */}
                              <Box>
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  spacing={0.5}
                                  mb={0.5}
                                >
                                  <DevicesIcon
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
                                    DISPOSITIVO
                                  </Typography>
                                </Stack>
                                <Typography
                                  variant="body2"
                                  color="text.primary"
                                >
                                  {fingerprint.deviceId?.name || "—"}
                                </Typography>
                              </Box>

                              <Divider />

                              {/* Fecha */}
                              <Box>
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  spacing={0.5}
                                  mb={0.5}
                                >
                                  <CalendarTodayIcon
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
                                    FECHA DE REGISTRO
                                  </Typography>
                                </Stack>
                                <Typography
                                  variant="body2"
                                  color="text.primary"
                                >
                                  {formatters.date(fingerprint.createdAt)}
                                </Typography>
                              </Box>

                              {/* Aprobador (si existe) */}
                              {fingerprint.approvedBy && (
                                <>
                                  <Divider />
                                  <Box>
                                    <Stack
                                      direction="row"
                                      alignItems="center"
                                      spacing={0.5}
                                      mb={0.5}
                                    >
                                      <VerifiedUserIcon
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
                                        APROBADO POR
                                      </Typography>
                                    </Stack>
                                    <Typography
                                      variant="body2"
                                      color="text.primary"
                                    >
                                      {formatters.fullName(
                                        fingerprint.approvedBy,
                                      )}
                                    </Typography>
                                  </Box>
                                </>
                              )}
                            </Stack>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Menú de Acciones Mobile */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
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
          {can("fingerprints:approve") && (
            <MenuItem onClick={handleApprove}>
              <ListItemIcon>
                <CheckCircleIcon fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText>Aprobar</ListItemText>
            </MenuItem>
          )}
          {can("fingerprints:reject") && (
            <MenuItem onClick={handleReject}>
              <ListItemIcon>
                <CancelIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Rechazar</ListItemText>
            </MenuItem>
          )}
          {can("fingerprints:delete") && (
            <MenuItem onClick={handleDelete}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Eliminar</ListItemText>
            </MenuItem>
          )}
        </Menu>
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
        overflow: "hidden",
      }}
    >
      <Table sx={{ minWidth: 1000 }}>
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
          {sortedFingerprints.map((fingerprint, index) => {
            const isPending = fingerprint.status === "pending";

            return (
              <TableRow
                key={fingerprint._id}
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
                {/* Indice */}
                <TableCell align="center">
                  <Typography variant="body2">
                    {fingerprint.index || "—"}
                  </Typography>
                </TableCell>
                {/* DNI */}
                <TableCell>
                  <Typography variant="body2">
                    {fingerprint.userId?.dni || "—"}
                  </Typography>
                  {/* <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <BadgeIcon
                      fontSize="small"
                      sx={{ color: theme.palette.primary.main }}
                    />
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      sx={{
                        fontFamily: "monospace",
                        color: theme.palette.primary.main,
                      }}
                    >
                      {fingerprint.userId?.dni || "—"}
                    </Typography>
                  </Box> */}
                </TableCell>

                {/* Usuario */}
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PersonIcon
                      fontSize="small"
                      sx={{ color: theme.palette.text.secondary }}
                    />
                    <Typography variant="body2" fontWeight={500}>
                      {formatters.fullName(fingerprint.userId)}
                    </Typography>
                  </Box>
                </TableCell>

                {/* Dedo */}
                <TableCell align="center">
                  <Typography variant="body2">
                    {formatters.finger(fingerprint.finger)}
                  </Typography>
                </TableCell>

                {/* Dispositivo */}
                <TableCell align="center">
                  <Typography variant="body2" color="text.secondary">
                    {fingerprint.deviceId?.name || "—"}
                  </Typography>
                </TableCell>

                {/* Fecha */}
                <TableCell align="center">
                  <Typography variant="body2">
                    {formatters.date(fingerprint.createdAt)}
                  </Typography>
                </TableCell>

                {/* Estado */}
                <TableCell align="center">
                  <Chip
                    label={formatters.status(fingerprint.status)}
                    size="small"
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      bgcolor:
                        fingerprint.status === "approved"
                          ? alpha(theme.palette.success.main, 0.15)
                          : fingerprint.status === "pending"
                            ? alpha(theme.palette.warning.main, 0.15)
                            : alpha(theme.palette.error.main, 0.15),
                      color:
                        fingerprint.status === "approved"
                          ? theme.palette.success.main
                          : fingerprint.status === "pending"
                            ? theme.palette.warning.main
                            : theme.palette.error.main,
                      borderRadius: 1,
                    }}
                  />
                </TableCell>

                {/* Acciones */}
                <TableCell align="center">
                  {isPending ? (
                    <Box
                      sx={{
                        display: "flex",
                        gap: 0.5,
                        justifyContent: "center",
                      }}
                    >
                      <Tooltip title="Revisar" arrow>
                        <IconButton
                          size="small"
                          onClick={() =>
                            onOpenValidationDialog &&
                            onOpenValidationDialog(fingerprint._id)
                          }
                          sx={{
                            color: theme.palette.success.main,
                            bgcolor: alpha(theme.palette.success.main, 0.08),
                            "&:hover": {
                              bgcolor: alpha(theme.palette.success.main, 0.15),
                            },
                          }}
                        >
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Aprobar huella" arrow>
                        <IconButton
                          size="small"
                          onClick={() => onApprove && onApprove(fingerprint)}
                          sx={{
                            color: theme.palette.success.main,
                            bgcolor: alpha(theme.palette.success.main, 0.08),
                            "&:hover": {
                              bgcolor: alpha(theme.palette.success.main, 0.15),
                            },
                          }}
                        >
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Rechazar huella" arrow>
                        <IconButton
                          size="small"
                          onClick={() => onReject && onReject(fingerprint)}
                          sx={{
                            color: theme.palette.error.main,
                            bgcolor: alpha(theme.palette.error.main, 0.08),
                            "&:hover": {
                              bgcolor: alpha(theme.palette.error.main, 0.15),
                            },
                          }}
                        >
                          <CancelIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar huella" arrow>
                        <IconButton
                          size="small"
                          onClick={() => onDelete && onDelete(fingerprint._id)}
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
                  ) : (
                    // <Typography variant="body2" color="text.disabled">
                    //   —
                    // </Typography>
                    <Tooltip title="Eliminar huella" arrow>
                      <IconButton
                        size="small"
                        onClick={() => onDelete && onDelete(fingerprint._id)}
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
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default FingerprintTable;

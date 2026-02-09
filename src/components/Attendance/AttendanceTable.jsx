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
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  EditNote as EditNoteIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  MoreVert as MoreVertIcon,
  AccessTime as AccessTimeIcon,
  Badge as BadgeIcon,
  Business as BusinessIcon,
  Schedule as ScheduleIcon,
  Devices as DevicesIcon,
  Fingerprint as FingerprintIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import DescriptionIcon from "@mui/icons-material/Description";
import PendingIcon from "@mui/icons-material/Pending";
import PersonIcon from "@mui/icons-material/Person";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import { usePermission } from "../../utils/permissions";

const AttendanceTable = ({
  attendances = [],
  onEdit,
  onDelete,
  onJustify,
  onDeleteJustification,
  loading = false,
}) => {
  const { can } = usePermission();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [orderBy, setOrderBy] = useState("timestamp");
  const [order, setOrder] = useState("desc");
  const [openRowId, setOpenRowId] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAttendance, setSelectedAttendance] = useState(null);

  // Toggle row collapse
  const handleRowToggle = (attendanceId) => {
    setOpenRowId((prev) => (prev === attendanceId ? null : attendanceId));
  };

  // Menu de acciones (mobile)
  const handleMenuOpen = (event, attendance) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedAttendance(attendance);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAttendance(null);
  };

  const handleEdit = () => {
    if (selectedAttendance && onEdit) {
      onEdit(selectedAttendance);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedAttendance && onDelete) {
      onDelete(selectedAttendance._id);
    }
    handleMenuClose();
  };

  const handleJustify = () => {
    if (selectedAttendance && onJustify) {
      onJustify(selectedAttendance);
    }
    handleMenuClose();
  };

  const handleDeleteJustification = () => {
    if (selectedAttendance && onDelete) {
      onDeleteJustification(selectedAttendance);
    }
    handleMenuClose();
  };

  // Formatear nombre completo
  const getFullName = (userId) => {
    if (!userId) return "—";
    const parts = [
      userId.name,
      userId.firstSurname,
      userId.secondSurname,
    ].filter(Boolean);
    return parts.join(" ") || "—";
  };

  // Formatear fecha y hora
  const formatDateTime = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Formatear solo fecha
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Formatear solo hora
  const formatTime = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Normalizar tipo
  const formatType = (type) => {
    const types = {
      IN: "Entrada",
      OUT: "Salida",
      BREAK_START: "Inicio Descanso",
      BREAK_END: "Fin Descanso",
    };
    return types[type] || type || "—";
  };

  // Normalizar estado
  const formatStatus = (status) => {
    const statuses = {
      on_time: "A tiempo",
      late: "Tardanza",
      early: "Temprano",
      early_exit: "Salida anticipada",
      absent: "Ausente",
      justified: "Justificado",
      pending: "Pendiente",
    };
    return statuses[status] || status || "—";
  };

  // Obtener iniciales del nombre
  /*const getInitials = (userId) => {
    if (!userId) return "?";
    const name = userId.name?.[0] || "";
    const surname = userId.firstSurname?.[0] || "";
    return (name + surname).toUpperCase();
  };*/

  // Obtener icono según tipo
  const getTypeIcon = (type) => {
    switch (type) {
      case "IN":
        return <LoginIcon fontSize="small" />;
      case "OUT":
        return <LogoutIcon fontSize="small" />;
      default:
        return <AccessTimeIcon fontSize="small" />;
    }
  };

  // Obtener configuración de color según tipo
  const getTypeConfig = (type) => {
    switch (type) {
      case "IN":
        return {
          color: theme.palette.success.main,
          bgcolor: "transparent",
          //bgcolor: alpha(theme.palette.info.main, 0.15),
        };
      case "OUT":
        return {
          color: theme.palette.error.main,
          bgcolor: "transparent",
          //bgcolor: alpha(theme.palette.warning.main, 0.15),
        };
      default:
        return {
          color: theme.palette.grey[600],
          bgcolor: alpha(theme.palette.grey[500], 0.15),
        };
    }
  };

  // Obtener icono según estado
  /*const getStatusIcon = (status) => {
    switch (status) {
      case "on_time":
        return <CheckCircleIcon fontSize="small" />;
      case "late":
        return <WarningIcon fontSize="small" />;
      case "early":
        return <InfoIcon fontSize="small" />;
      case "early_exit":
        return <ErrorIcon fontSize="small" />;
      case "justified":
        return <CheckCircleIcon fontSize="small" />;
      default:
        return <WarningIcon fontSize="small" />;
    }
  };*/

  // Obtener configuración de color según estado
  const getStatusConfig = (status) => {
    switch (status) {
      case "on_time":
        return {
          color: theme.palette.success.main,
          bgcolor: alpha(theme.palette.success.main, 0.15),
        };
      case "late":
        return {
          color: theme.palette.warning.main,
          bgcolor: alpha(theme.palette.warning.main, 0.15),
        };
      case "early":
        return {
          color: theme.palette.secondary.main,
          bgcolor: alpha(theme.palette.secondary.main, 0.15),
        };
      case "justified":
        return {
          color: theme.palette.info.main,
          bgcolor: alpha(theme.palette.info.main, 0.15),
        };
      default:
        return {
          color: theme.palette.error.main,
          bgcolor: alpha(theme.palette.error.main, 0.15),
        };
    }
  };

  // Configuración de columnas para Desktop
  const visibleColumns = [
    {
      id: "expand",
      label: "",
      sortable: false,
      minWidth: 50,
      align: "center",
    },
    { id: "timestamp", label: "Fecha y Hora", sortable: true, minWidth: 160 },
    { id: "userId", label: "Usuario", sortable: true, minWidth: 200 },
    {
      id: "type",
      label: "Tipo",
      sortable: true,
      minWidth: 130,
      align: "center",
    },
    {
      id: "status",
      label: "Estado",
      sortable: true,
      minWidth: 130,
      align: "center",
    },
    {
      id: "actions",
      label: "Acciones",
      sortable: false,
      minWidth: 120,
      align: "center",
    },
  ];

  // Funciones de ordenamiento
  const getComparator = (order, orderBy) => {
    return order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };

  const descendingComparator = (a, b, orderBy) => {
    // Ordenar por nombre de usuario
    if (orderBy === "userId") {
      const aName = getFullName(a.userId);
      const bName = getFullName(b.userId);
      return bName.localeCompare(aName);
    }

    // Ordenar por timestamp
    if (orderBy === "timestamp") {
      const aDate = new Date(a.timestamp);
      const bDate = new Date(b.timestamp);
      return bDate - aDate;
    }

    let aValue = a[orderBy];
    let bValue = b[orderBy];

    if (bValue === null || bValue === undefined) return -1;
    if (aValue === null || aValue === undefined) return 1;

    if (typeof aValue === "string" && typeof bValue === "string") {
      return bValue.localeCompare(aValue);
    }

    if (bValue < aValue) return -1;
    if (bValue > aValue) return 1;
    return 0;
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Determinar si un registro necesita justificación
  const needsJustification = (attendance) => {
    return ["late", "absent", "early_exit"].includes(attendance.status);
  };

  const sortedAttendances = useMemo(() => {
    return [...attendances].sort(getComparator(order, orderBy));
  }, [attendances, order, orderBy]);

  // const InfoItem = ({ icon, label, children, color }) => (
  //   <Box>
  //     <Stack direction="row" spacing={1} alignItems="center">
  //       {icon}
  //       <Typography variant="caption" color="text.secondary" fontWeight={600}>
  //         {label}
  //       </Typography>
  //     </Stack>
  //     <Typography variant="body2" sx={{ mt: 0.4 }}>
  //       {children}
  //     </Typography>
  //   </Box>
  // );

  // Estado vacío
  if (attendances.length === 0 && !loading) {
    return (
      <Paper
        sx={{
          p: 6,
          textAlign: "center",
          borderRadius: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.02),
          border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
        }}
      >
        <AccessTimeIcon
          sx={{
            fontSize: 64,
            color: theme.palette.text.disabled,
            mb: 2,
          }}
        />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No hay registros de asistencia
        </Typography>
        <Typography variant="body2" color="text.disabled">
          Los registros de asistencia aparecerán aquí
        </Typography>
      </Paper>
    );
  }

  // =============== VISTA MOBILE ===============
  if (isMobile) {
    return (
      <>
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 2,
            //boxShadow: theme.shadows[2],
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
                <TableCell sx={{ width: 48 }} />
                <TableCell>Asistencia</TableCell>
                <TableCell align="right" sx={{ width: 48 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedAttendances.map((attendance, index) => {
                const isOpen = openRowId === attendance._id;
                const fullName = getFullName(attendance.userId);
                const typeConfig = getTypeConfig(attendance.type);
                const statusConfig = getStatusConfig(attendance.status);

                return (
                  <React.Fragment key={attendance._id}>
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
                        cursor: "pointer",
                      }}
                      onClick={() => handleRowToggle(attendance._id)}
                    >
                      {/* Botón Expandir */}
                      <TableCell sx={{ py: 1, pl: 2 }}>
                        <IconButton
                          size="small"
                          sx={{ color: theme.palette.primary.main }}
                        >
                          {isOpen ? (
                            <KeyboardArrowUpIcon />
                          ) : (
                            <KeyboardArrowDownIcon />
                          )}
                        </IconButton>
                      </TableCell>

                      {/* Información de la Asistencia */}
                      <TableCell sx={{ py: 1.5 }}>
                        <Stack spacing={1}>
                          {/* Usuario y Avatar */}
                          <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                          >
                            {/* <Avatar
                              sx={{
                                width: 36,
                                height: 36,
                                bgcolor: alpha(theme.palette.primary.main, 0.15),
                                color: theme.palette.primary.main,
                                fontWeight: 600,
                                fontSize: "0.8rem",
                              }}
                            >
                              {getInitials(attendance.userId)}
                            </Avatar> */}
                            <Stack spacing={0.3} flex={1}>
                              <Typography variant="body2" fontWeight={600}>
                                {fullName}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {formatDateTime(attendance.timestamp)}
                              </Typography>
                            </Stack>
                          </Stack>

                          {/* Chips de Tipo y Estado */}
                          <Stack direction="column" spacing={1}>
                            <Chip
                              icon={getTypeIcon(attendance.type)}
                              label={formatType(attendance.type)}
                              size="small"
                              sx={{
                                height: 24,
                                fontSize: "0.7rem",
                                fontWeight: 600,
                                bgcolor: typeConfig.bgcolor,
                                color: typeConfig.color,
                                "& .MuiChip-icon": {
                                  color: typeConfig.color,
                                },
                              }}
                            />
                            <Chip
                              //icon={getStatusIcon(attendance.status)}
                              label={formatStatus(attendance.status)}
                              size="small"
                              sx={{
                                height: 24,
                                fontSize: "0.7rem",
                                fontWeight: 600,
                                bgcolor: statusConfig.bgcolor,
                                color: statusConfig.color,
                                "& .MuiChip-icon": {
                                  color: statusConfig.color,
                                },
                              }}
                            />
                            {attendance.justification?.approved && (
                              <Typography
                                variant="caption"
                                color="info"
                                align="center"
                              >
                                (Justificado)
                              </Typography>
                            )}
                          </Stack>
                        </Stack>
                      </TableCell>

                      {/* Menú de Acciones */}
                      <TableCell align="right" sx={{ py: 1, pr: 2 }}>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, attendance)}
                          sx={{ color: theme.palette.text.secondary }}
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
                          <Box sx={{ py: 2, px: 2 }}>
                            <Stack spacing={2}>
                              {/* DNI y Email */}
                              <Stack spacing={1.5}>
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  alignItems="center"
                                >
                                  <BadgeIcon
                                    sx={{
                                      fontSize: 16,
                                      color: theme.palette.text.secondary,
                                    }}
                                  />
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    fontWeight={600}
                                  >
                                    DNI:
                                  </Typography>
                                  <Typography variant="body2">
                                    {attendance.userId?.dni || "—"}
                                  </Typography>
                                </Stack>

                                <Stack
                                  direction="row"
                                  spacing={1}
                                  alignItems="center"
                                >
                                  <DevicesIcon
                                    sx={{
                                      fontSize: 16,
                                      color: theme.palette.text.secondary,
                                    }}
                                  />
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    fontWeight={600}
                                  >
                                    DISPOSITIVO:
                                  </Typography>
                                  <Typography variant="body2">
                                    {attendance.deviceId?.name || "—"}
                                  </Typography>
                                </Stack>

                                {attendance.deviceId?.location && (
                                  <Stack
                                    direction="row"
                                    spacing={1}
                                    alignItems="center"
                                    sx={{ pl: 3 }}
                                  >
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      📍 {attendance.deviceId.location}
                                    </Typography>
                                  </Stack>
                                )}
                              </Stack>

                              <Divider />

                              {/* Horario y Método */}
                              <Stack spacing={1.5}>
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  alignItems="center"
                                >
                                  <ScheduleIcon
                                    sx={{
                                      fontSize: 16,
                                      color: theme.palette.text.secondary,
                                    }}
                                  />
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    fontWeight={600}
                                  >
                                    HORARIO:
                                  </Typography>
                                  <Typography variant="body2">
                                    {attendance.scheduleId?.name ||
                                      "Sin horario"}
                                  </Typography>
                                </Stack>

                                <Stack
                                  direction="row"
                                  spacing={1}
                                  alignItems="center"
                                >
                                  <FingerprintIcon
                                    sx={{
                                      fontSize: 16,
                                      color: theme.palette.text.secondary,
                                    }}
                                  />
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    fontWeight={600}
                                  >
                                    MÉTODO:
                                  </Typography>
                                  <Chip
                                    label={
                                      attendance.verificationMethod ===
                                      "fingerprint"
                                        ? "Huella Digital"
                                        : attendance.verificationMethod || "—"
                                    }
                                    size="small"
                                    sx={{
                                      height: 20,
                                      fontSize: "0.65rem",
                                    }}
                                  />
                                </Stack>

                                <Divider />

                                {/* Justificación */}
                                {attendance.justification && (
                                  <Stack spacing={1.5}>
                                    <Stack
                                      direction="row"
                                      spacing={1}
                                      alignItems="center"
                                    >
                                      <CheckCircleIcon
                                        sx={{
                                          fontSize: 16,
                                          color: theme.palette.main,
                                        }}
                                      />
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        fontWeight={600}
                                      >
                                        JUSTIFICACIÓN:
                                      </Typography>
                                      <Chip
                                        icon={
                                          attendance.justification.approved ? (
                                            <CheckCircleIcon
                                              sx={{ fontSize: 16 }}
                                            />
                                          ) : (
                                            <PendingIcon
                                              sx={{ fontSize: 16 }}
                                            />
                                          )
                                        }
                                        label={
                                          attendance.justification.approved
                                            ? "Aprobada"
                                            : "Pendiente"
                                        }
                                        size="small"
                                        sx={{
                                          fontSize: "0.7rem",
                                          height: 24,
                                          fontWeight: 700,
                                          bgcolor: attendance.justification
                                            .approved
                                            ? theme.palette.success.main
                                            : theme.palette.warning.main,
                                          color: "white",
                                          "& .MuiChip-icon": {
                                            color: "white",
                                          },
                                        }}
                                      />
                                    </Stack>
                                    <Stack
                                      direction="row"
                                      spacing={1}
                                      alignItems="center"
                                    >
                                      <EditNoteIcon
                                        sx={{
                                          fontSize: 16,
                                          color: theme.palette.main,
                                        }}
                                      />
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        fontWeight={600}
                                      >
                                        MOTIVO:
                                      </Typography>
                                      <Typography variant="body2">
                                        {attendance.justification.reason}
                                      </Typography>
                                    </Stack>
                                    <Stack
                                      direction="row"
                                      spacing={1}
                                      alignItems="center"
                                    >
                                      <PersonIcon
                                        sx={{
                                          fontSize: 16,
                                          color: theme.palette.main,
                                        }}
                                      />
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        fontWeight={600}
                                      >
                                        APROBADO POR:
                                      </Typography>
                                      <Typography variant="body2">
                                        {`${attendance.justification.approvedBy.name} ${attendance.justification.approvedBy.firstSurname} ${attendance.justification.approvedBy.secondSurname}`}
                                      </Typography>
                                    </Stack>
                                    <Stack
                                      direction="row"
                                      spacing={1}
                                      alignItems="center"
                                    >
                                      <EventAvailableIcon
                                        sx={{
                                          fontSize: 16,
                                          color: theme.palette.main,
                                        }}
                                      />
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        fontWeight={600}
                                      >
                                        FECHA DE APROBACIÓN:
                                      </Typography>
                                      <Typography variant="body2">
                                        {formatDateTime(
                                          attendance.justification.approvedAt,
                                        )}
                                      </Typography>
                                    </Stack>
                                  </Stack>
                                )}
                              </Stack>
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
                boxShadow: theme.shadows[4],
              },
            },
          }}
        >
          {selectedAttendance &&
            needsJustification(selectedAttendance) &&
            !selectedAttendance.justification && (
              <MenuItem onClick={handleJustify}>
                <ListItemIcon>
                  <CheckIcon fontSize="small" color="secondary" />
                </ListItemIcon>
                <ListItemText>Justificar</ListItemText>
              </MenuItem>
            )}
          {selectedAttendance && selectedAttendance.justification && (
            <MenuItem onClick={handleDeleteJustification}>
              <ListItemIcon>
                <CloseIcon fontSize="small" color="secondary" />
              </ListItemIcon>
              <ListItemText>Anular justificación</ListItemText>
            </MenuItem>
          )}

          <MenuItem onClick={handleEdit}>
            <ListItemIcon>
              <EditIcon fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText>Editar</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleDelete}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Eliminar</ListItemText>
          </MenuItem>
        </Menu>
      </>
    );
  }

  // =============== VISTA DESKTOP (COLAPSABLE) ===============
  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: 2,
        //boxShadow: theme.shadows[2],
        overflow: "hidden",
      }}
    >
      <Table sx={{ minWidth: 900 }}>
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
            {visibleColumns.map((column) => (
              <TableCell
                key={column.id}
                align={column.align || "left"}
                sx={{ minWidth: column.minWidth, py: 2 }}
              >
                {column.sortable ? (
                  <TableSortLabel
                    active={orderBy === column.id}
                    direction={orderBy === column.id ? order : "asc"}
                    onClick={() => handleRequestSort(column.id)}
                    sx={{
                      "&:hover": { color: theme.palette.primary.main },
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
          {sortedAttendances.map((attendance, index) => {
            const isOpen = openRowId === attendance._id;
            const fullName = getFullName(attendance.userId);
            const typeConfig = getTypeConfig(attendance.type);
            const statusConfig = getStatusConfig(attendance.status);

            return (
              <React.Fragment key={attendance._id}>
                {/* Fila Principal */}
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
                  {/* Botón Expandir/Colapsar */}
                  <TableCell align="center" sx={{ py: 2 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleRowToggle(attendance._id)}
                      sx={{
                        color: theme.palette.primary.main,
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        "&:hover": {
                          bgcolor: alpha(theme.palette.primary.main, 0.15),
                        },
                      }}
                    >
                      {isOpen ? (
                        <KeyboardArrowUpIcon />
                      ) : (
                        <KeyboardArrowDownIcon />
                      )}
                    </IconButton>
                  </TableCell>

                  {/* Fecha y Hora */}
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography variant="body2" fontWeight={600}>
                        {formatDate(attendance.timestamp)}
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <AccessTimeIcon fontSize="small" />
                        <Typography variant="caption" color="primary">
                          {formatTime(attendance.timestamp)}
                        </Typography>
                      </Stack>
                    </Stack>
                  </TableCell>

                  {/* Usuario */}
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      {/* <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: alpha(theme.palette.primary.main, 0.15),
                          color: theme.palette.primary.main,
                          fontWeight: 600,
                          fontSize: "0.8rem",
                        }}
                      >
                        {getInitials(attendance.userId)}
                      </Avatar> */}
                      <Stack spacing={0.3}>
                        <Typography variant="body2" fontWeight={600}>
                          {fullName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          DNI: {attendance.userId?.dni || "—"}
                        </Typography>
                      </Stack>
                    </Stack>
                  </TableCell>

                  {/* Tipo */}
                  <TableCell align="center">
                    <Chip
                      icon={getTypeIcon(attendance.type)}
                      label={formatType(attendance.type)}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        bgcolor: typeConfig.bgcolor,
                        color: typeConfig.color,
                        borderRadius: 1,
                        "& .MuiChip-icon": {
                          color: typeConfig.color,
                        },
                      }}
                    />
                  </TableCell>

                  {/* Estado */}
                  <TableCell align="center">
                    <Stack spacing={0.5}>
                      <Chip
                        //icon={getStatusIcon(attendance.status)}
                        label={formatStatus(attendance.status)}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          bgcolor: statusConfig.bgcolor,
                          color: statusConfig.color,
                          borderRadius: 1,
                          "& .MuiChip-icon": {
                            color: statusConfig.color,
                          },
                        }}
                      />
                      {attendance.justification?.approved && (
                        <Typography variant="caption" color="text.secondary">
                          (Justificado)
                        </Typography>
                      )}
                    </Stack>
                  </TableCell>

                  {/* Acciones */}
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="end">
                      {can("attendances:justify") &&
                        needsJustification(attendance) &&
                        !attendance.justification && (
                          <Tooltip title="Justificar asistencia" arrow>
                            <IconButton
                              size="small"
                              onClick={() => onJustify && onJustify(attendance)}
                              sx={{
                                color: theme.palette.secondary.main,
                                bgcolor: alpha(
                                  theme.palette.secondary.main,
                                  0.08,
                                ),
                                "&:hover": {
                                  bgcolor: alpha(
                                    theme.palette.secondary.main,
                                    0.15,
                                  ),
                                },
                              }}
                            >
                              <CheckIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      {can("attendances:unjustify") &&
                        attendance.justification && (
                          <Tooltip title="Anular justificación" arrow>
                            <IconButton
                              size="small"
                              onClick={() =>
                                onDeleteJustification &&
                                onDeleteJustification(attendance)
                              }
                              sx={{
                                color: theme.palette.error.main,
                                bgcolor: alpha(theme.palette.error.main, 0.08),
                                "&:hover": {
                                  bgcolor: alpha(
                                    theme.palette.error.main,
                                    0.15,
                                  ),
                                },
                              }}
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      {can("attendances:update") && (
                        <Tooltip title="Editar asistencia" arrow>
                          <IconButton
                            size="small"
                            onClick={() => onEdit && onEdit(attendance)}
                            sx={{
                              color: theme.palette.primary.main,
                              bgcolor: alpha(theme.palette.primary.main, 0.08),
                              "&:hover": {
                                bgcolor: alpha(
                                  theme.palette.primary.main,
                                  0.15,
                                ),
                              },
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {can("attendances:delete") && (
                        <Tooltip title="Eliminar asistencia" arrow>
                          <IconButton
                            size="small"
                            onClick={() => onDelete && onDelete(attendance._id)}
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
                    </Stack>
                  </TableCell>
                </TableRow>

                {/* Fila Colapsable con Información Adicional */}
                <TableRow>
                  <TableCell
                    colSpan={6}
                    sx={{
                      py: 0,
                      borderBottom: isOpen
                        ? `1px solid ${theme.palette.divider}`
                        : "none",
                      bgcolor:
                        index % 2 === 0
                          ? alpha(theme.palette.primary.main, 0.02)
                          : alpha(theme.palette.grey[500], 0.04),
                    }}
                  >
                    <Collapse in={isOpen} timeout="auto" unmountOnExit>
                      <Box sx={{ py: 3, px: 3 }}>
                        <Stack direction="row" spacing={4}>
                          {/* Columna Izquierda */}
                          <Stack spacing={2} flex={1}>
                            <Typography
                              variant="subtitle2"
                              fontWeight={700}
                              color="primary"
                              gutterBottom
                            >
                              INFORMACIÓN DEL REGISTRO
                            </Typography>

                            {/* Dispositivo */}
                            <Box>
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                              >
                                <DevicesIcon
                                  sx={{
                                    fontSize: 18,
                                    color: theme.palette.text.secondary,
                                  }}
                                />
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  fontWeight={600}
                                >
                                  DISPOSITIVO:
                                </Typography>
                              </Stack>
                              <Typography
                                variant="body2"
                                sx={{
                                  mt: 0.5,
                                  fontFamily: "monospace",
                                  fontSize: "0.85rem",
                                }}
                              >
                                {attendance.deviceId?.name || "—"}
                              </Typography>
                              {attendance.deviceId?.location && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ mt: 0.3, display: "block" }}
                                >
                                  📍 {attendance.deviceId.location}
                                </Typography>
                              )}
                            </Box>

                            {/* Horario */}
                            <Box>
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                              >
                                <ScheduleIcon
                                  sx={{
                                    fontSize: 18,
                                    color: theme.palette.text.secondary,
                                  }}
                                />
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  fontWeight={600}
                                >
                                  HORARIO ASIGNADO:
                                </Typography>
                              </Stack>
                              <Typography variant="body2" sx={{ mt: 0.5 }}>
                                {attendance.scheduleId?.name || "Sin horario"}
                              </Typography>
                              {attendance.scheduleId?.startTime &&
                                attendance.scheduleId?.endTime && (
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ mt: 0.3, display: "block" }}
                                  >
                                    🕐 {attendance.scheduleId.startTime} -{" "}
                                    {attendance.scheduleId.endTime}
                                  </Typography>
                                )}
                            </Box>

                            {/* Método de Verificación */}
                            <Box>
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                              >
                                <FingerprintIcon
                                  sx={{
                                    fontSize: 18,
                                    color: theme.palette.text.secondary,
                                  }}
                                />
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  fontWeight={600}
                                >
                                  MÉTODO DE VERIFICACIÓN:
                                </Typography>
                              </Stack>
                              <Chip
                                label={
                                  attendance.verificationMethod ===
                                  "fingerprint"
                                    ? "Huella Digital"
                                    : attendance.verificationMethod === "rfid"
                                      ? "Tarjeta RFID"
                                      : attendance.verificationMethod === "pin"
                                        ? "PIN"
                                        : attendance.verificationMethod || "—"
                                }
                                size="small"
                                sx={{
                                  mt: 0.5,
                                  fontSize: "0.75rem",
                                  height: 26,
                                  bgcolor: alpha(theme.palette.info.main, 0.1),
                                  color: theme.palette.info.main,
                                  fontWeight: 600,
                                }}
                              />
                            </Box>
                          </Stack>

                          {/* Columna Derecha */}
                          <Stack spacing={2} flex={1}>
                            <Typography
                              variant="subtitle2"
                              fontWeight={700}
                              color="primary"
                              gutterBottom
                            >
                              DETALLES ADICIONALES
                            </Typography>

                            {/* Fecha de Creación */}
                            <Box>
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                              >
                                <AccessTimeIcon
                                  sx={{
                                    fontSize: 18,
                                    color: theme.palette.text.secondary,
                                  }}
                                />
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  fontWeight={600}
                                >
                                  FECHA DE CREACIÓN:
                                </Typography>
                              </Stack>
                              <Typography variant="body2" sx={{ mt: 0.5 }}>
                                {formatDateTime(attendance.createdAt)}
                              </Typography>
                            </Box>

                            {/* Última Actualización */}
                            {attendance.updatedAt &&
                              attendance.updatedAt !== attendance.createdAt && (
                                <Box>
                                  <Stack
                                    direction="row"
                                    spacing={1}
                                    alignItems="center"
                                  >
                                    <AccessTimeIcon
                                      sx={{
                                        fontSize: 18,
                                        color: theme.palette.text.secondary,
                                      }}
                                    />
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      fontWeight={600}
                                    >
                                      ÚLTIMA ACTUALIZACIÓN:
                                    </Typography>
                                  </Stack>
                                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                                    {formatDateTime(attendance.updatedAt)}
                                  </Typography>
                                </Box>
                              )}

                            {/* Aprobado Por */}
                            {attendance.approvedBy && (
                              <Box>
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  alignItems="center"
                                >
                                  <CheckCircleIcon
                                    sx={{
                                      fontSize: 18,
                                      color: theme.palette.success.main,
                                    }}
                                  />
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    fontWeight={600}
                                  >
                                    APROBADO POR:
                                  </Typography>
                                </Stack>
                                <Typography variant="body2" sx={{ mt: 0.5 }}>
                                  {attendance.approvedBy}
                                </Typography>
                              </Box>
                            )}

                            {/* Información del Departamento */}
                            {attendance.userId?.departmentId && (
                              <Box>
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  alignItems="center"
                                >
                                  <BusinessIcon
                                    sx={{
                                      fontSize: 18,
                                      color: theme.palette.text.secondary,
                                    }}
                                  />
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    fontWeight={600}
                                  >
                                    DEPARTAMENTO:
                                  </Typography>
                                </Stack>
                                <Typography variant="body2" sx={{ mt: 0.5 }}>
                                  {attendance.userId.departmentId.name ||
                                    attendance.userId.departmentId}
                                </Typography>
                              </Box>
                            )}
                          </Stack>
                        </Stack>

                        {/* Sección de Justificación - Nueva */}
                        {attendance.justification && (
                          <Box
                            sx={{
                              mt: 3,
                              p: 2.5,
                              borderRadius: 2,
                              border: "1px solid gray",
                              /*bgcolor: attendance.justification.approved
                                ? alpha(theme.palette.success.main, 0.08)
                                : alpha(theme.palette.warning.main, 0.08),*/
                              /*border: `1px solid ${
                                attendance.justification.approved
                                  ? alpha(theme.palette.success.main, 0.3)
                                  : alpha(theme.palette.warning.main, 0.3)
                              }`,*/
                            }}
                          >
                            <Stack spacing={2}>
                              {/* Encabezado de Justificación */}
                              <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="space-between"
                              >
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  alignItems="center"
                                >
                                  <DescriptionIcon
                                    sx={{
                                      fontSize: 20,
                                      color: attendance.justification.approved
                                        ? theme.palette.primary.main
                                        : theme.palette.warning.main,
                                    }}
                                  />
                                  <Typography
                                    variant="subtitle2"
                                    fontWeight={700}
                                    color={
                                      attendance.justification.approved
                                        ? "primary.main"
                                        : "warning.main"
                                    }
                                  >
                                    JUSTIFICACIÓN
                                  </Typography>
                                </Stack>
                                <Chip
                                  icon={
                                    attendance.justification.approved ? (
                                      <CheckCircleIcon sx={{ fontSize: 16 }} />
                                    ) : (
                                      <PendingIcon sx={{ fontSize: 16 }} />
                                    )
                                  }
                                  label={
                                    attendance.justification.approved
                                      ? "Aprobada"
                                      : "Pendiente"
                                  }
                                  size="small"
                                  sx={{
                                    fontSize: "0.7rem",
                                    height: 24,
                                    fontWeight: 700,
                                    bgcolor: attendance.justification.approved
                                      ? theme.palette.success.main
                                      : theme.palette.warning.main,
                                    color: "white",
                                    "& .MuiChip-icon": {
                                      color: "white",
                                    },
                                  }}
                                />
                              </Stack>

                              {/* Motivo */}
                              <Box>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  fontWeight={600}
                                  sx={{ display: "block", mb: 0.5 }}
                                >
                                  MOTIVO:
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    lineHeight: 1.6,
                                    color: theme.palette.text.primary,
                                  }}
                                >
                                  {attendance.justification.reason}
                                </Typography>
                              </Box>

                              {/* Información de Aprobación */}
                              {attendance.justification.approved && (
                                <Stack
                                  direction={{ xs: "column", sm: "row" }}
                                  spacing={3}
                                  sx={{
                                    pt: 1.5,
                                    borderTop: `1px solid ${alpha(
                                      theme.palette.divider,
                                      0.2,
                                    )}`,
                                  }}
                                >
                                  {/* Aprobado Por */}
                                  <Box flex={1}>
                                    <Stack
                                      direction="row"
                                      spacing={1}
                                      alignItems="center"
                                    >
                                      <PersonIcon
                                        sx={{
                                          fontSize: 16,
                                          //color: theme.palette.success.main,
                                        }}
                                      />
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        fontWeight={600}
                                      >
                                        APROBADO POR:
                                      </Typography>
                                    </Stack>
                                    <Typography
                                      variant="body2"
                                      sx={{ mt: 0.5, fontWeight: 500 }}
                                    >
                                      {`${attendance.justification.approvedBy.name} ${attendance.justification.approvedBy.firstSurname} ${attendance.justification.approvedBy.secondSurname}`}
                                    </Typography>
                                  </Box>

                                  {/* Fecha de Aprobación */}
                                  <Box flex={1}>
                                    <Stack
                                      direction="row"
                                      spacing={1}
                                      alignItems="center"
                                    >
                                      <EventAvailableIcon
                                        sx={{
                                          fontSize: 16,
                                          //color: theme.palette.success.main,
                                        }}
                                      />
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        fontWeight={600}
                                      >
                                        FECHA DE APROBACIÓN:
                                      </Typography>
                                    </Stack>
                                    <Typography
                                      variant="body2"
                                      sx={{ mt: 0.5, fontWeight: 500 }}
                                    >
                                      {formatDateTime(
                                        attendance.justification.approvedAt,
                                      )}
                                    </Typography>
                                  </Box>
                                </Stack>
                              )}
                            </Stack>
                          </Box>
                        )}
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
  );
};

export default AttendanceTable;

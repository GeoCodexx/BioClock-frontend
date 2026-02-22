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
  alpha,
  Stack,
  Collapse,
  useMediaQuery,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
} from "@mui/material";
import {
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
import ActionCell from "./ActionCell";

const JustificationTable = ({
  justifications = [],
  onEdit,
  onDelete,
  onRefresh,
  schedules,
  loading = false,
}) => {
  const { can } = usePermission();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [orderBy, setOrderBy] = useState("userId");
  const [order, setOrder] = useState("desc");
  const [openRowId, setOpenRowId] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedJustification, setSelectedJustification] = useState(null);

  // Toggle row collapse
  const handleRowToggle = (justificationId) => {
    setOpenRowId((prev) => (prev === justificationId ? null : justificationId));
  };

  // Menu de acciones (mobile)
  const handleMenuOpen = (event, justification) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedJustification(justification);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedJustification(null);
  };

  const handleEdit = () => {
    if (selectedJustification && onEdit) {
      onEdit(selectedJustification);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedJustification && onDelete) {
      onDelete(selectedJustification._id);
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
      approved: "Aprobado",
      pending: "Pendiente",
      rejected: "Rechazado",
    };
    return statuses[status] || status || "—";
  };

  // Obtener iniciales del nombre
  const getInitials = (userId) => {
    if (!userId) return "?";
    const name = userId.name?.[0] || "";
    const surname = userId.firstSurname?.[0] || "";
    return (name + surname).toUpperCase();
  };

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

  // Obtener configuración de color según estado
  const getStatusConfig = (status) => {
    switch (status) {
      case "approved":
        return {
          color: theme.palette.success.main,
          bgcolor: alpha(theme.palette.success.main, 0.15),
        };
      case "pending":
        return {
          color: theme.palette.warning.main,
          bgcolor: alpha(theme.palette.warning.main, 0.15),
        };
      case "rejected":
        return {
          color: theme.palette.error.main,
          bgcolor: alpha(theme.palette.error.main, 0.15),
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
    // {
    //   id: "expand",
    //   label: "",
    //   sortable: false,
    //   minWidth: 50,
    //   align: "center",
    // },
    {
      id: "userId",
      label: "Usuario",
      sortable: true,
      minWidth: 200,
      align: "center",
    },
    {
      id: "date",
      label: "Fecha",
      sortable: true,
      minWidth: 150,
      align: "center",
    },
    {
      id: "scheduleId",
      label: "Horario",
      sortable: false,
      minWidth: 160,
      align: "center",
    },
    {
      id: "reason",
      label: "Motivo",
      sortable: false,
      minWidth: 220,
      align: "center",
    },
    {
      id: "approvedBy",
      label: "Aprobado por",
      sortable: false,
      minWidth: 180,
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
    if (orderBy === "date") {
      const aDate = new Date(a.date);
      const bDate = new Date(b.date);
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

  const sortedJustifications = useMemo(() => {
    return [...justifications].sort(getComparator(order, orderBy));
  }, [justifications, order, orderBy]);

  // Estado vacío
  if (justifications.length === 0 && !loading) {
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
          No hay registros de justificación
        </Typography>
        <Typography variant="body2" color="text.disabled">
          Los registros de justificación aparecerán aquí
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
              {sortedJustifications.map((justification, index) => {
                const isOpen = openRowId === justification._id;
                const fullName = getFullName(justification.userId);
                const typeConfig = getTypeConfig(justification.type);
                const statusConfig = getStatusConfig(justification.status);

                return (
                  <React.Fragment key={justification._id}>
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
                      onClick={() => handleRowToggle(justification._id)}
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
                              {getInitials(justification.userId)}
                            </Avatar> */}
                            <Stack spacing={0.3} flex={1}>
                              <Typography variant="body2" fontWeight={600}>
                                {fullName}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {formatDateTime(justification.timestamp)}
                              </Typography>
                            </Stack>
                          </Stack>

                          {/* Chips de Tipo y Estado */}
                          <Stack direction="column" spacing={1}>
                            <Chip
                              icon={getTypeIcon(justification.type)}
                              label={formatType(justification.type)}
                              size="small"
                              sx={{
                                height: 24,
                                fontSize: "0.8rem",
                                //fontWeight: 600,
                                bgcolor: typeConfig.bgcolor,
                                //color: typeConfig.color,
                                "& .MuiChip-icon": {
                                  color: typeConfig.color,
                                },
                              }}
                            />
                            <Chip
                              //icon={getStatusIcon(justification.status)}
                              label={formatStatus(justification.status)}
                              size="small"
                              sx={{
                                height: 24,
                                fontSize: "0.7rem",
                                fontWeight: 600,
                                bgcolor: statusConfig.bgcolor,
                                color: statusConfig.color,
                                /*"& .MuiChip-icon": {
                                  color: statusConfig.color,  
                                },*/
                              }}
                            />
                            {/* {justification.justification?.approved && (
                              <Typography
                                variant="caption"
                                color="info"
                                align="center"
                              >
                                (Justificado)
                              </Typography>
                            )} */}
                          </Stack>
                        </Stack>
                      </TableCell>

                      {/* Menú de Acciones */}
                      <TableCell align="right" sx={{ py: 1, pr: 2 }}>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, justification)}
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
                                    {justification.userId?.dni || "—"}
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
                                    {justification.deviceId?.name || "—"}
                                  </Typography>
                                </Stack>

                                {justification.deviceId?.location && (
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
                                      📍 {justification.deviceId.location}
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
                                    {justification.scheduleId?.name ||
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
                                      justification.verificationMethod ===
                                      "fingerprint"
                                        ? "Huella Digital"
                                        : justification.verificationMethod ||
                                          "—"
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
                                {justification.justification && (
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
                                          justification.justification
                                            .approved ? (
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
                                          justification.justification.approved
                                            ? "Aprobada"
                                            : "Pendiente"
                                        }
                                        size="small"
                                        sx={{
                                          fontSize: "0.7rem",
                                          height: 24,
                                          fontWeight: 700,
                                          bgcolor: justification.justification
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
                                        {justification.justification.reason}
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
                                        {`${justification.justification.approvedBy.name} ${justification.justification.approvedBy.firstSurname} ${justification.justification.approvedBy.secondSurname}`}
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
                                          justification.justification
                                            .approvedAt,
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
          {/* {selectedJustification &&
            needsJustification(selectedJustification) &&
            !selectedJustification.justification && (
              <MenuItem onClick={handleJustify}>
                <ListItemIcon>
                  <CheckIcon fontSize="small" color="secondary" />
                </ListItemIcon>
                <ListItemText>Justificar</ListItemText>
              </MenuItem>
            )}
          {selectedJustification && selectedJustification.justification && (
            <MenuItem onClick={handleDeleteJustification}>
              <ListItemIcon>
                <CloseIcon fontSize="small" color="secondary" />
              </ListItemIcon>
              <ListItemText>Anular justificación</ListItemText>
            </MenuItem>
          )} */}

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
          {sortedJustifications.map((justification, index) => {
            const fullName = getFullName(justification.userId);
            const typeConfig = getTypeConfig(justification.type);
            const statusConfig = getStatusConfig(justification.status);

            return (
              <React.Fragment key={justification._id}>
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
                  }}
                >
                  {/* Usuario */}
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: alpha(theme.palette.primary.main, 0.15),
                          color: theme.palette.primary.main,
                          fontWeight: 600,
                          fontSize: "0.8rem",
                        }}
                      >
                        {getInitials(justification.userId)}
                      </Avatar>

                      <Typography variant="body2" fontWeight={600}>
                        {fullName}
                      </Typography>
                    </Stack>
                  </TableCell>

                  {/* Fecha y Hora */}
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(justification.date)}
                    </Typography>
                  </TableCell>

                  {/* Horario */}
                  <TableCell align="center">
                    {justification.scheduleId?.name}
                  </TableCell>
                  {/* Motivo */}
                  <TableCell align="center">{justification.reason}</TableCell>
                  {/* Aprobado por */}
                  <TableCell>
                    <Typography variant="body2">
                      {getFullName(justification.approvedBy)}
                    </Typography>
                  </TableCell>

                  {/* Estado */}
                  <TableCell align="center">
                    <Chip
                      //icon={getStatusIcon(justification.status)}
                      label={formatStatus(justification.status)}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        bgcolor: statusConfig.bgcolor,
                        color: statusConfig.color,
                        //border: `1px solid ${alpha(statusConfig.color, 0.5)}`,
                        //borderRadius: 1,
                        /*"& .MuiChip-icon": {
                          color: statusConfig.color,
                        },*/
                      }}
                    />
                  </TableCell>

                  {/* Acciones */}
                  <TableCell align="center">
                    <ActionCell
                      row={justification}
                      onRefresh={onRefresh}
                      schedules={schedules}
                    />
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

export default JustificationTable;

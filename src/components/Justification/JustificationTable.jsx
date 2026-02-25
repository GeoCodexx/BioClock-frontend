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
  //Business as BusinessIcon,
  Schedule as ScheduleIcon,
  /*Devices as DevicesIcon,
  Fingerprint as FingerprintIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,*/
  CheckCircle as CheckCircleIcon,
  /*Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,*/
} from "@mui/icons-material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import AttachFileIcon from "@mui/icons-material/AttachFile";
//import DescriptionIcon from "@mui/icons-material/Description";
//import PendingIcon from "@mui/icons-material/Pending";
import PersonIcon from "@mui/icons-material/Person";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import { usePermission } from "../../utils/permissions";
import ActionCell from "./ActionCell";
import { format, parse, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import JustificationDrawer from "./JustificationDrawer";
import {
  updateJustification,
  updateJustificationStatus,
} from "../../services/justificationService";

const JustificationTable = ({
  justifications = [],
  /*onEdit,
  onDelete,*/
  onRefresh,
  schedules,
  loading = false,
}) => {
  //const { can } = usePermission();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [orderBy, setOrderBy] = useState("userId");
  const [order, setOrder] = useState("desc");
  const [openRowId, setOpenRowId] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedJustification, setSelectedJustification] = useState(null);

  const [drawer, setDrawer] = useState({ open: false, mode: "create" });
  const open = (mode) => setDrawer({ open: true, mode });
  const close = () => setDrawer((p) => ({ ...p, open: false }));

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
    //setSelectedJustification(null);
  };

  /*const handleEdit = () => {
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
  };*/

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

  // Formatear solo fecha
  const formatDate = (dateInput) => {
    if (!dateInput) return "—";

    const date = parse(dateInput, "yyyy-MM-dd", new Date());

    return format(date, "dd/MM/yyyy", { locale: es });
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

  const menuItems = [];

  if (selectedJustification?.status === "pending") {
    menuItems.push(
      <MenuItem
        key="edit"
        onClick={() => {
          handleMenuClose();
          open("edit");
        }}
      >
        <ListItemIcon>
          <EditOutlinedIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Editar</ListItemText>
      </MenuItem>,
      <Divider key="d1" />,
      <MenuItem
        key="approve"
        onClick={() => {
          handleMenuClose();
          open("approve");
        }}
      >
        <ListItemIcon>
          <CheckCircleOutlineIcon fontSize="small" color="success" />
        </ListItemIcon>
        <ListItemText>Aprobar</ListItemText>
      </MenuItem>,
      <Divider key="d2" />,
      <MenuItem
        key="reject"
        onClick={() => {
          handleMenuClose();
          open("reject");
        }}
      >
        <ListItemIcon>
          <CancelOutlinedIcon fontSize="small" color="error" />
        </ListItemIcon>
        <ListItemText>Rechazar</ListItemText>
      </MenuItem>,
      <Divider key="d3" />,
      <MenuItem
        key="delete"
        onClick={() => {
          handleMenuClose();
          alert("Eliminado");
        }}
      >
        <ListItemIcon>
          <DeleteIcon fontSize="small" color="error" />
        </ListItemIcon>
        <ListItemText>Eliminar</ListItemText>
      </MenuItem>,
    );
  }

  if (selectedJustification?.files?.length > 0) {
    menuItems.push(
      <Divider key="d4" />,
      <MenuItem
        key="preview"
        onClick={() => {
          handleMenuClose();
          open("preview");
        }}
      >
        <ListItemIcon>
          <AttachFileIcon fontSize="small" color="primary" />
        </ListItemIcon>
        <ListItemText>Ver Archivos</ListItemText>
      </MenuItem>,
    );
  }

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
                <TableCell>Justificación</TableCell>
                <TableCell align="right" sx={{ width: 48 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedJustifications.map((justification, index) => {
                const isOpen = openRowId === justification._id;
                const fullName = getFullName(justification.userId);
                const statusConfig = getStatusConfig(justification.status);

                const canEdit = justification.status === "pending";
                const canPreview = justification.files?.length > 0;
                const hasActions = canEdit || canPreview;

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
                      }}
                    >
                      {/* Botón Expandir */}
                      <TableCell sx={{ py: 1, pl: 2 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleRowToggle(justification._id)}
                          sx={{ color: theme.palette.primary.main }}
                        >
                          {isOpen ? (
                            <KeyboardArrowUpIcon />
                          ) : (
                            <KeyboardArrowDownIcon />
                          )}
                        </IconButton>
                      </TableCell>

                      {/* Información */}
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
                                {formatDate(justification.date)}
                              </Typography>
                            </Stack>
                          </Stack>

                          {/* Chips de Tipo y Estado */}

                          <Chip
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
                        </Stack>
                      </TableCell>

                      {/* Menú de Acciones */}
                      <TableCell align="right" sx={{ py: 1, pr: 2 }}>
                        {hasActions && (
                          <IconButton
                            size="small"
                            disableRipple
                            onClick={(e) => handleMenuOpen(e, justification)}
                            sx={{ color: theme.palette.text.secondary }}
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
                              {/* Fecha y Turno */}
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
                                    FECHA:
                                  </Typography>
                                  <Typography variant="body2">
                                    {formatDate(justification.date) || "—"}
                                  </Typography>
                                </Stack>

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
                                    {justification.reason}
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
                                    REVISADO POR:
                                  </Typography>
                                  <Typography variant="body2">
                                    {`${justification.approvedBy?.name || ""} ${justification.approvedBy?.firstSurname || ""} ${justification.approvedBy?.secondSurname || ""}`}
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
                                    FECHA DE REVISIÓN:
                                  </Typography>
                                  <Typography variant="body2">
                                    {format(
                                      parseISO(justification.updatedAt),
                                      "dd/MM/yyyy",
                                      { locale: es },
                                    )}
                                  </Typography>
                                </Stack>
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
        {/* Menu de Acciones Mobile*/}
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
                boxShadow: 1,
              },
            },
          }}
        >
          {menuItems}
        </Menu>
        {console.log(selectedJustification)}
        <JustificationDrawer
          open={drawer.open}
          onClose={close}
          mode={drawer.mode}
          justification={selectedJustification}
          schedules={schedules || []}
          users={[]}
          onSubmit={async (payload, files) => {
            if (drawer.mode === "edit") {
              await updateJustification(
                selectedJustification._id,
                payload,
                files,
              );
            } else if (drawer.mode === "approve" || drawer.mode === "reject") {
              await updateJustificationStatus(
                selectedJustification._id,
                payload,
              );
            }
            onRefresh();
          }}
        />
      </>
    );
  }

  // =============== VISTA DESKTOP ===============
  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: 2,
        //overflow: "hidden",
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
                      label={formatStatus(justification.status)}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        bgcolor: statusConfig.bgcolor,
                        color: statusConfig.color,
                        border: `1px solid ${alpha(statusConfig.color, 0.5)}`,
                        borderRadius: 1,
                        "& .MuiChip-icon": {
                          color: statusConfig.color,
                        },
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

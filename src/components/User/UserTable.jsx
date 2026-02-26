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
  Avatar,
  Grid,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  Business as BusinessIcon,
  Schedule as ScheduleIcon,
  Devices as DevicesIcon,
  CalendarToday as CalendarTodayIcon,
} from "@mui/icons-material";
import { usePermission } from "../../utils/permissions";

const UserTable = ({ users = [], onEdit, onDelete, loading = false }) => {
  const { can } = usePermission();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [orderBy, setOrderBy] = useState("index");
  const [order, setOrder] = useState("asc");
  //const [openRows, setOpenRows] = useState({});
  const [openRowId, setOpenRowId] = useState(null); //Para permitir solo una fila abierta
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleRowToggle = (userId) => {
    setOpenRowId((prev) => (prev === userId ? null : userId));
  };

  // Menu de acciones (mobile)
  const handleMenuOpen = (event, user) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleEdit = () => {
    if (selectedUser && onEdit) {
      onEdit(selectedUser);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedUser && onDelete) {
      onDelete(selectedUser._id);
    }
    handleMenuClose();
  };

  // Formatear nombre completo
  const getFullName = (user) => {
    const parts = [user.name, user.firstSurname, user.secondSurname].filter(
      Boolean,
    );
    return parts.join(" ") || "—";
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Obtener iniciales del nombre
  const getInitials = (user) => {
    const name = user.name?.[0] || "";
    const surname = user.firstSurname?.[0] || "";
    return (name + surname).toUpperCase();
  };

  // Configuración de columnas para Desktop (solo las visibles)
  const visibleColumns = [
    {
      id: "expand",
      label: "",
      sortable: false,
      minWidth: 50,
      align: "center",
    },
    {
      id: "index",
      label: "#",
      sortable: true,
      minWidth: 50,
      align: "center",
    },

    { id: "name", label: "Usuario", sortable: true, minWidth: 200 },
    {
      id: "dni",
      label: "DNI",
      sortable: true,
      minWidth: 100,
      align: "center",
    },
    {
      id: "email",
      label: "Correo Electrónico",
      sortable: true,
      minWidth: 220,
    },
    {
      id: "phone",
      label: "Teléfono",
      sortable: true,
      minWidth: 120,
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
  ];

  // Funciones de ordenamiento
  const getComparator = (order, orderBy) => {
    return order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };

  const descendingComparator = (a, b, orderBy) => {
    // Ordenar por nombre completo
    if (orderBy === "name") {
      const aName = getFullName(a);
      const bName = getFullName(b);
      return bName.localeCompare(aName);
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

  const sortedUsers = useMemo(() => {
    return [...users].sort(getComparator(order, orderBy));
  }, [users, order, orderBy]);

  // Estado vacío
  if (users.length === 0 && !loading) {
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
        <PersonIcon
          sx={{
            fontSize: 64,
            color: theme.palette.text.disabled,
            mb: 2,
          }}
        />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No hay usuarios registrados
        </Typography>
        <Typography variant="body2" color="text.disabled">
          Comienza registrando el primer usuario del sistema
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
                <TableCell>Usuario</TableCell>
                <TableCell align="right" sx={{ width: 48 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedUsers.map((user, index) => {
                //const isOpen = openRows[user._id] || false;
                const isOpen = openRowId === user._id;
                const schedulesCount = user.scheduleIds?.length || 0;
                const devicesCount = user.deviceIds?.length || 0;
                const fullName = getFullName(user);

                return (
                  <React.Fragment key={user._id}>
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
                      onClick={() => handleRowToggle(user._id)}
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

                      {/* Información del Usuario */}
                      <TableCell sx={{ py: 1.5 }}>
                        <Stack spacing={0.5} flex={1}>
                          <Typography variant="body2">{fullName}</Typography>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            flexWrap="wrap"
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {user.roleId?.name || "Sin rol"}
                            </Typography>
                            <Chip
                              label={
                                user.status === "active" ? "Activo" : "Inactivo"
                              }
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: "0.7rem",
                                fontWeight: 600,
                                bgcolor:
                                  user.status === "active"
                                    ? alpha(theme.palette.success.main, 0.15)
                                    : alpha(theme.palette.error.main, 0.15),
                                color:
                                  user.status === "active"
                                    ? theme.palette.success.main
                                    : theme.palette.error.main,
                              }}
                            />
                          </Stack>
                        </Stack>
                      </TableCell>

                      {/* Menú de Acciones */}
                      <TableCell align="right" sx={{ py: 1, pr: 2 }}>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, user)}
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
                                    {user.dni || "—"}
                                  </Typography>
                                </Stack>

                                <Stack
                                  direction="row"
                                  spacing={1}
                                  alignItems="center"
                                >
                                  <EmailIcon
                                    sx={{
                                      fontSize: 16,
                                      color: theme.palette.primary.main,
                                    }}
                                  />
                                  <Typography variant="body2" color="primary">
                                    {user.email || "—"}
                                  </Typography>
                                </Stack>

                                <Stack
                                  direction="row"
                                  spacing={1}
                                  alignItems="center"
                                >
                                  <PhoneIcon
                                    sx={{
                                      fontSize: 16,
                                      color: theme.palette.text.secondary,
                                    }}
                                  />
                                  <Typography variant="body2">
                                    {user.phone || "—"}
                                  </Typography>
                                </Stack>
                              </Stack>

                              <Divider />

                              {/* Departamento y Dispositivo */}
                              <Stack spacing={1.5}>
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  alignItems="center"
                                >
                                  <BusinessIcon
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
                                    DEPARTAMENTO:
                                  </Typography>
                                  <Typography variant="body2">
                                    {user.departmentId?.name ||
                                      "Sin departamento"}
                                  </Typography>
                                </Stack>
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  alignItems="center"
                                >
                                  <CalendarTodayIcon
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
                                    CREACIÓN:
                                  </Typography>
                                  <Typography variant="body2">
                                    {formatDate(user.createdAt)}
                                  </Typography>
                                </Stack>
                              </Stack>

                              <Divider />

                              {/* Horarios */}
                              <Box>
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  spacing={0.5}
                                  mb={1}
                                >
                                  <ScheduleIcon
                                    sx={{
                                      fontSize: 16,
                                      color: theme.palette.text.secondary,
                                    }}
                                  />
                                  <Typography
                                    variant="caption"
                                    fontWeight={600}
                                    color="text.secondary"
                                  >
                                    HORARIOS ASIGNADOS ({schedulesCount})
                                  </Typography>
                                </Stack>
                                {user.scheduleIds?.length ? (
                                  <Stack
                                    direction="row"
                                    flexWrap="wrap"
                                    gap={0.5}
                                  >
                                    {user.scheduleIds.map((schedule) => (
                                      <Chip
                                        key={schedule._id}
                                        label={schedule.name}
                                        size="small"
                                        variant="outlined"
                                        sx={{
                                          fontSize: "0.7rem",
                                          height: 22,
                                          borderColor: alpha(
                                            theme.palette.primary.main,
                                            0.3,
                                          ),
                                          color: theme.palette.primary.main,
                                        }}
                                      />
                                    ))}
                                  </Stack>
                                ) : (
                                  <Typography
                                    variant="body2"
                                    color="text.disabled"
                                    fontStyle="italic"
                                  >
                                    Sin horarios asignados
                                  </Typography>
                                )}
                              </Box>
                              <Divider />
                              {/* Dispositivos */}
                              <Box>
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  spacing={0.5}
                                  mb={1}
                                >
                                  <DevicesIcon
                                    sx={{
                                      fontSize: 16,
                                      color: theme.palette.text.secondary,
                                    }}
                                  />
                                  <Typography
                                    variant="caption"
                                    fontWeight={600}
                                    color="text.secondary"
                                  >
                                    DISPOSITIVOS ASIGNADOS ({devicesCount})
                                  </Typography>
                                </Stack>
                                {user.deviceIds?.length ? (
                                  <Stack
                                    direction="row"
                                    flexWrap="wrap"
                                    gap={0.5}
                                  >
                                    {user.deviceIds.map((device) => (
                                      <Chip
                                        key={device._id}
                                        label={device.name}
                                        size="small"
                                        variant="outlined"
                                        sx={{
                                          fontSize: "0.7rem",
                                          height: 22,
                                          borderColor: alpha(
                                            theme.palette.primary.main,
                                            0.3,
                                          ),
                                          color: theme.palette.primary.main,
                                        }}
                                      />
                                    ))}
                                  </Stack>
                                ) : (
                                  <Typography
                                    variant="body2"
                                    color="text.disabled"
                                    fontStyle="italic"
                                  >
                                    Sin dispositivos asignados
                                  </Typography>
                                )}
                              </Box>
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
                border: (theme) =>
                  theme.palette.mode === "dark"
                    ? "1px solid rgba(255, 255, 255, 0.1)"
                    : "none",
              },
            },
          }}
        >
          {can("users:update") && (
            <MenuItem onClick={handleEdit}>
              <ListItemIcon>
                <EditIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText>Editar</ListItemText>
            </MenuItem>
          )}
          <Divider />
          {can("users:delete") && (
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
          {sortedUsers.map((user, index) => {
            //const isOpen = openRows[user._id] || false;
            const isOpen = openRowId === user._id;
            const schedulesCount = user.scheduleIds?.length || 0;
            const devicesCount = user.deviceIds?.length || 0;
            const fullName = getFullName(user);

            return (
              <React.Fragment key={user._id}>
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
                      onClick={() => handleRowToggle(user._id)}
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
                  {/* Indice */}
                  <TableCell>
                    <Typography variant="body2">{user.index || "—"}</Typography>
                  </TableCell>

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
                        {getInitials(user)}
                      </Avatar>
                      <Typography variant="body2">{fullName}</Typography>
                    </Stack>
                  </TableCell>

                  {/* DNI */}
                  <TableCell align="center">
                    <Typography variant="body2">{user.dni || "—"}</Typography>
                  </TableCell>

                  {/* Email */}
                  <TableCell>
                    <Typography variant="body2" color="primary">
                      {user.email || "—"}
                    </Typography>
                  </TableCell>

                  {/* Teléfono */}
                  <TableCell align="center">
                    <Typography variant="body2">{user.phone || "—"}</Typography>
                  </TableCell>

                  {/* Estado */}
                  <TableCell align="center">
                    <Chip
                      label={user.status === "active" ? "Activo" : "Inactivo"}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        bgcolor:
                          user.status === "active"
                            ? alpha(theme.palette.success.main, 0.15)
                            : alpha(theme.palette.error.main, 0.15),
                        color:
                          user.status === "active"
                            ? theme.palette.success.main
                            : theme.palette.error.main,
                        borderRadius: 1,
                      }}
                    />
                  </TableCell>

                  {/* Acciones */}
                  <TableCell align="center">
                    <Stack
                      direction="row"
                      spacing={0.5}
                      justifyContent="center"
                    >
                      {can("users:update") && (
                        <Tooltip title="Editar usuario" arrow>
                          <IconButton
                            size="small"
                            onClick={() => onEdit && onEdit(user)}
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
                      {can("users:delete") && (
                        <Tooltip title="Eliminar usuario" arrow>
                          <IconButton
                            size="small"
                            onClick={() => onDelete && onDelete(user._id)}
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
                    colSpan={7}
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
                        <Grid container spacing={3}>
                          {/* Columna Izquierda - Información del Usuario */}
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Typography
                              variant="subtitle2"
                              fontWeight={700}
                              color="primary"
                              gutterBottom
                              sx={{ mb: 2 }}
                            >
                              INFORMACIÓN LABORAL
                            </Typography>
                            <Stack spacing={2}>
                              {/* Rol */}
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
                                    ROL:
                                  </Typography>
                                </Stack>
                                <Chip
                                  label={user.roleId?.name || "Sin rol"}
                                  size="small"
                                  sx={{
                                    mt: 0.5,
                                    fontSize: "0.75rem",
                                    height: 26,
                                    bgcolor: alpha(
                                      theme.palette.info.main,
                                      0.1,
                                    ),
                                    color: theme.palette.info.main,
                                    fontWeight: 600,
                                  }}
                                />
                              </Box>

                              {/* Departamento */}
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
                                  {user.departmentId?.name ||
                                    "Sin departamento"}
                                </Typography>
                                {user.departmentId?.location && (
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {user.departmentId.location}
                                  </Typography>
                                )}
                              </Box>

                              {/* Dispositivo */}
                              <Box>
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  alignItems="center"
                                  mb={1}
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
                                    DISPOSITIVOS ASIGNADOS ({devicesCount}):
                                  </Typography>
                                </Stack>
                                {user.deviceIds?.length ? (
                                  <Stack
                                    direction="row"
                                    flexWrap="wrap"
                                    gap={0.5}
                                  >
                                    {user.deviceIds.map((device) => (
                                      <Chip
                                        key={device._id}
                                        label={device.name}
                                        size="small"
                                        variant="outlined"
                                        sx={{
                                          fontSize: "0.7rem",
                                          height: 22,
                                          borderColor: alpha(
                                            theme.palette.primary.main,
                                            0.3,
                                          ),
                                          color: theme.palette.primary.main,
                                        }}
                                      />
                                    ))}
                                  </Stack>
                                ) : (
                                  <Typography
                                    variant="body2"
                                    color="text.disabled"
                                    fontStyle="italic"
                                  >
                                    Sin dispositivos asignados
                                  </Typography>
                                )}
                              </Box>

                              {/* Fecha de Creación */}
                              <Box>
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  alignItems="center"
                                >
                                  <CalendarTodayIcon
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
                                  {formatDate(user.createdAt)}
                                </Typography>
                              </Box>
                            </Stack>
                          </Grid>

                          {/* Columna Derecha - Horarios */}
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Typography
                              variant="subtitle2"
                              fontWeight={700}
                              color="primary"
                              gutterBottom
                              sx={{ mb: 2 }}
                            >
                              HORARIOS ASIGNADOS ({schedulesCount})
                            </Typography>
                            {user.scheduleIds?.length ? (
                              <Stack spacing={1.5}>
                                {user.scheduleIds.map((schedule) => (
                                  <Paper
                                    key={schedule._id}
                                    elevation={0}
                                    sx={{
                                      p: 1.5,
                                      border: `1px solid ${alpha(
                                        theme.palette.primary.main,
                                        0.2,
                                      )}`,
                                      borderRadius: 1.5,
                                      bgcolor: alpha(
                                        theme.palette.primary.main,
                                        0.03,
                                      ),
                                    }}
                                  >
                                    <Stack spacing={0.5}>
                                      <Stack
                                        direction="row"
                                        alignItems="center"
                                        spacing={1}
                                      >
                                        <ScheduleIcon
                                          sx={{
                                            fontSize: 16,
                                            color: theme.palette.primary.main,
                                          }}
                                        />
                                        <Typography
                                          variant="body2"
                                          fontWeight={600}
                                        >
                                          {schedule.name}
                                        </Typography>
                                      </Stack>
                                      {schedule.startTime &&
                                        schedule.endTime && (
                                          <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{ pl: 3 }}
                                          >
                                            🕐 {schedule.startTime} -{" "}
                                            {schedule.endTime}
                                            {schedule.toleranceMinutes && (
                                              <>
                                                {" "}
                                                • Tolerancia:{" "}
                                                {schedule.toleranceMinutes} min
                                              </>
                                            )}
                                          </Typography>
                                        )}
                                      {schedule.days &&
                                        schedule.days.length > 0 && (
                                          <Stack
                                            direction="row"
                                            spacing={0.5}
                                            sx={{ pl: 3, flexWrap: "wrap" }}
                                          >
                                            {schedule.days.map((day) => {
                                              const dayMap = {
                                                monday: "L",
                                                tuesday: "M",
                                                wednesday: "X",
                                                thursday: "J",
                                                friday: "V",
                                                saturday: "S",
                                                sunday: "D",
                                              };
                                              return (
                                                <Chip
                                                  key={day}
                                                  label={dayMap[day] || day}
                                                  size="small"
                                                  sx={{
                                                    height: 18,
                                                    fontSize: "0.65rem",
                                                    fontWeight: 600,
                                                    minWidth: 20,
                                                    "& .MuiChip-label": {
                                                      px: 0.5,
                                                    },
                                                  }}
                                                />
                                              );
                                            })}
                                          </Stack>
                                        )}
                                    </Stack>
                                  </Paper>
                                ))}
                              </Stack>
                            ) : (
                              <Paper
                                elevation={0}
                                sx={{
                                  p: 3,
                                  textAlign: "center",
                                  bgcolor: alpha(theme.palette.grey[500], 0.05),
                                  border: `1px dashed ${alpha(
                                    theme.palette.grey[500],
                                    0.3,
                                  )}`,
                                  borderRadius: 1.5,
                                }}
                              >
                                <ScheduleIcon
                                  sx={{
                                    fontSize: 32,
                                    color: theme.palette.text.disabled,
                                    mb: 1,
                                  }}
                                />
                                <Typography
                                  variant="body2"
                                  color="text.disabled"
                                  fontStyle="italic"
                                >
                                  Sin horarios asignados
                                </Typography>
                              </Paper>
                            )}
                          </Grid>
                        </Grid>
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

export default UserTable;

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
  Edit as EditIcon,
  Delete as DeleteIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  MoreVert as MoreVertIcon,
  VpnKey as VpnKeyIcon,
  Description as DescriptionIcon,
  Security as SecurityIcon,
} from "@mui/icons-material";

const RoleTable = ({ roles = [], onEdit, onDelete, loading = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [orderBy, setOrderBy] = useState("name");
  const [order, setOrder] = useState("asc");
  const [openRows, setOpenRows] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);

  // Toggle row collapse (mobile)
  const handleRowToggle = (roleId) => {
    setOpenRows((prev) => ({
      ...prev,
      [roleId]: !prev[roleId],
    }));
  };

  // Menu de acciones (mobile)
  const handleMenuOpen = (event, role) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedRole(role);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRole(null);
  };

  const handleEdit = () => {
    if (selectedRole && onEdit) {
      onEdit(selectedRole);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedRole && onDelete) {
      onDelete(selectedRole._id);
    }
    handleMenuClose();
  };

  // Configuración de columnas
  const columns = [
    { id: "name", label: "Nombre", sortable: true, minWidth: 180 },
    { id: "description", label: "Descripción", sortable: false, minWidth: 250 },
    {
      id: "permissions",
      label: "Permisos",
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
  ];

  // Funciones de ordenamiento
  const getComparator = (order, orderBy) => {
    return order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };

  const descendingComparator = (a, b, orderBy) => {
    // Caso especial para permisos (ordenar por cantidad)
    if (orderBy === "permissions") {
      const aLength = a.permissions?.length || 0;
      const bLength = b.permissions?.length || 0;
      return bLength - aLength;
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

  const sortedRoles = useMemo(() => {
    return [...roles].sort(getComparator(order, orderBy));
  }, [roles, order, orderBy]);

  // Estado vacío
  if (roles.length === 0 && !loading) {
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
        <SecurityIcon
          sx={{
            fontSize: 64,
            color: theme.palette.text.disabled,
            mb: 2,
          }}
        />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No hay roles registrados
        </Typography>
        <Typography variant="body2" color="text.disabled">
          Comienza creando tu primer rol con permisos personalizados
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
            boxShadow: theme.shadows[2],
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
                <TableCell>Rol</TableCell>
                <TableCell align="right" sx={{ width: 48 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedRoles.map((role, index) => {
                const isOpen = openRows[role._id] || false;
                const permissionsCount = role.permissions?.length || 0;

                return (
                  <React.Fragment key={role._id}>
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
                      onClick={() => handleRowToggle(role._id)}
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

                      {/* Información del Rol */}
                      <TableCell sx={{ py: 1.5 }}>
                        <Stack spacing={0.5}>
                          <Typography variant="body2" fontWeight={600}>
                            {role.name}
                          </Typography>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <Chip
                              label={
                                role.status === "active" ? "Activo" : "Inactivo"
                              }
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: "0.7rem",
                                fontWeight: 600,
                                bgcolor:
                                  role.status === "active"
                                    ? alpha(theme.palette.success.main, 0.15)
                                    : alpha(theme.palette.error.main, 0.15),
                                color:
                                  role.status === "active"
                                    ? theme.palette.success.main
                                    : theme.palette.error.main,
                              }}
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {permissionsCount}{" "}
                              {permissionsCount === 1 ? "permiso" : "permisos"}
                            </Typography>
                          </Stack>
                        </Stack>
                      </TableCell>

                      {/* Menú de Acciones */}
                      <TableCell align="right" sx={{ py: 1, pr: 2 }}>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, role)}
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
                              {/* Descripción */}
                              <Box>
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  spacing={0.5}
                                  mb={0.5}
                                >
                                  {
                                    <DescriptionIcon
                                      sx={{
                                        fontSize: 14,
                                        color: theme.palette.text.secondary,
                                      }}
                                    />
                                  }
                                  <Typography
                                    variant="caption"
                                    fontWeight={600}
                                    color="text.secondary"
                                  >
                                    DESCRIPCIÓN
                                  </Typography>
                                </Stack>
                                <Typography
                                  variant="body2"
                                  color="text.primary"
                                >
                                  {role.description || "Sin descripción"}
                                </Typography>
                              </Box>

                              <Divider />

                              {/* Permisos */}
                              <Box>
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  spacing={0.5}
                                  mb={1}
                                >
                                  {
                                    <VpnKeyIcon
                                      sx={{
                                        fontSize: 14,
                                        color: theme.palette.text.secondary,
                                      }}
                                    />
                                  }
                                  <Typography
                                    variant="caption"
                                    fontWeight={600}
                                    color="text.secondary"
                                  >
                                    PERMISOS ASIGNADOS ({permissionsCount})
                                  </Typography>
                                </Stack>
                                {role.permissions?.length ? (
                                  <Stack
                                    direction="row"
                                    flexWrap="wrap"
                                    gap={0.5}
                                  >
                                    {role.permissions.map((permission) => (
                                      <Chip
                                        key={permission._id}
                                        label={permission.name}
                                        size="small"
                                        variant="outlined"
                                        sx={{
                                          fontSize: "0.7rem",
                                          height: 22,
                                          borderColor: alpha(
                                            theme.palette.primary.main,
                                            0.3
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
                                    Sin permisos asignados
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
              },
            },
          }}
        >
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

  // =============== VISTA DESKTOP ===============
  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: 2,
        boxShadow: theme.shadows[2],
        overflow: "hidden",
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
          {sortedRoles.map((role, index) => {
            const permissionsCount = role.permissions?.length || 0;

            return (
              <TableRow
                key={role._id}
                hover
                sx={{
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                  },
                  "&:last-child td": { borderBottom: 0 },
                  bgcolor:
                    index % 2 === 0
                      ? "transparent"
                      : alpha(theme.palette.grey[500], 0.02),
                }}
              >
                {/* Nombre */}
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {/* <VpnKeyIcon
                      fontSize="small"
                      sx={{ color: theme.palette.primary.main }}
                    /> */}
                    <Typography variant="body2" fontWeight={600}>
                      {role.name || "—"}
                    </Typography>
                  </Stack>
                </TableCell>

                {/* Descripción */}
                <TableCell>
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
                    {role.description || "Sin descripción"}
                  </Typography>
                </TableCell>

                {/* Permisos */}
                <TableCell align="center">
                  <Stack
                    direction="row"
                    spacing={0.5}
                    flexWrap="wrap"
                    gap={0.5}
                    justifyContent="center"
                  >
                    {role.permissions?.length ? (
                      <>
                        {role.permissions.slice(0, 3).map((permission) => (
                          <Chip
                            key={permission._id}
                            label={permission.name}
                            size="small"
                            variant="outlined"
                            sx={{
                              fontSize: "0.75rem",
                              height: 24,
                              borderColor: alpha(
                                theme.palette.primary.main,
                                0.3
                              ),
                              color: theme.palette.primary.main,
                              fontWeight: 500,
                            }}
                          />
                        ))}
                        {permissionsCount > 3 && (
                          <Tooltip
                            title={role.permissions
                              .slice(3)
                              .map((p) => p.name)
                              .join(", ")}
                            arrow
                          >
                            <Chip
                              label={`+${permissionsCount - 3}`}
                              size="small"
                              sx={{
                                fontSize: "0.75rem",
                                height: 24,
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: theme.palette.primary.main,
                                fontWeight: 600,
                              }}
                            />
                          </Tooltip>
                        )}
                      </>
                    ) : (
                      <Typography variant="body2" color="text.disabled">
                        Sin permisos
                      </Typography>
                    )}
                  </Stack>
                </TableCell>

                {/* Estado */}
                <TableCell align="center">
                  <Chip
                    label={role.status === "active" ? "Activo" : "Inactivo"}
                    size="small"
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      bgcolor:
                        role.status === "active"
                          ? alpha(theme.palette.success.main, 0.15)
                          : alpha(theme.palette.error.main, 0.15),
                      color:
                        role.status === "active"
                          ? theme.palette.success.main
                          : theme.palette.error.main,
                      borderRadius: 1,
                    }}
                  />
                </TableCell>

                {/* Acciones */}
                <TableCell align="center">
                  <Stack direction="row" spacing={0.5} justifyContent="center">
                    <Tooltip title="Editar rol" arrow>
                      <IconButton
                        size="small"
                        onClick={() => onEdit && onEdit(role)}
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
                    <Tooltip title="Eliminar rol" arrow>
                      <IconButton
                        size="small"
                        onClick={() => onDelete && onDelete(role._id)}
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
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default RoleTable;

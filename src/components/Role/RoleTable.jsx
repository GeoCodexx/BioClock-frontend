// RoleTable.jsx - Tabla responsive con filas colapsables en mobile
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
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import EventIcon from "@mui/icons-material/Event";
import KeyIcon from '@mui/icons-material/Key';
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MoreVertIcon from "@mui/icons-material/MoreVert";

const RoleTable = ({ roles = [], onEdit, onDelete }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [orderBy, setOrderBy] = useState("name");
  const [order, setOrder] = useState("asc");
  const [openRows, setOpenRows] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);

  // Toggle row collapse
  const handleRowToggle = (roleId) => {
    setOpenRows((prev) => ({
      ...prev,
      [roleId]: !prev[roleId],
    }));
  };

  // Menu de acciones (mobile)
  const handleMenuOpen = (event, role) => {
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
    {
      id: "name",
      label: "Nombre",
      sortable: true,
      minWidth: 200,
    },
    {
      id: "description",
      label: "Descripción",
      sortable: true,
      minWidth: 100,
      align: "center",
    },
    {
      id: "permissions",
      label: "Permisos",
      sortable: true,
      minWidth: 150,
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

  // Función de comparación para ordenamiento
  const getComparator = (order, orderBy) => {
    return order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };

  const descendingComparator = (a, b, orderBy) => {
    let aValue = a[orderBy];
    let bValue = b[orderBy];

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

  const sortedRoles = useMemo(() => {
    return [...roles].sort(getComparator(order, orderBy));
  }, [roles, order, orderBy]);

  // Empty state
  if (roles.length === 0) {
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
          No hay roles registrados
        </Typography>
        <Typography variant="body2" color="text.disabled">
          Comienza agregando tu primer rol
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
                <TableCell>Rol</TableCell>
                <TableCell align="right" sx={{ width: 50 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedRoles.map((role, index) => {
                const isOpen = openRows[role._id] || false;

                return (
                  <React.Fragment key={role._id}>
                    {/* Fila Principal */}
                    <TableRow
                      //key={role._id}
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
                          onClick={() => handleRowToggle(role._id)}
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

                      {/* Nombre del Rol */}
                      <TableCell sx={{ py: 1.5 }}>
                        <Box>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            sx={{ mb: 0.5 }}
                          >
                            {role.name || "—"}
                          </Typography>
                          <Stack
                            direction="row"
                            spacing={0.5}
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
                          </Stack>
                        </Box>
                      </TableCell>

                      {/* Menú de Acciones */}
                      <TableCell align="right" sx={{ py: 1 }}>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, role)}
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
                          <Box sx={{ py: 2, px: 2 }}>
                            <Stack spacing={2}>
                              {/* Descripción */}
                              <Box>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                    mb: 0.5,
                                  }}
                                >
                                  <b>Descripción: </b>
                                  {role.description || "Ninguna"}
                                </Typography>
                              </Box>

                              <Divider />

                              {/* Permisos */}
                              <Box>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                    mb: 0.5,
                                  }}
                                >
                                  <KeyIcon sx={{ fontSize: 14 }} />
                                  Permisos
                                </Typography>
                                <Stack
                                  direction="row"
                                  spacing={0.5}
                                  flexWrap="wrap"
                                  gap={0.5}
                                >
                                  {role.permissions?.length ? (
                                    role.permissions.map((permission) => (
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
                                    ))
                                  ) : (
                                    <Typography
                                      variant="body2"
                                      color="text.disabled"
                                    >
                                      —
                                    </Typography>
                                  )}
                                </Stack>
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

  // VISTA DESKTOP (código original)
  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: 0,
        boxShadow: "none",
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
          {sortedRoles.map((role, index) => (
            <TableRow
              key={role._id}
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
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {/* <EventIcon
                    fontSize="small"
                    sx={{ color: theme.palette.primary.main }}
                  /> */}
                  <Typography variant="body2" fontWeight={500}>
                    {role.name || "—"}
                  </Typography>
                </Box>
              </TableCell>

              <TableCell align="center">
                <Typography variant="body2" fontWeight={500}>
                  {role.description || "—"}
                </Typography>
              </TableCell>

              <TableCell align="center">
                <Stack
                  direction="row"
                  spacing={0.5}
                  justifyContent="start"
                  flexWrap="wrap"
                  gap={0.5}
                >
                  {role.permissions?.length ? (
                    role.permissions.map((permission) => (
                      <Chip
                        key={permission._id}
                        label={permission.name}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontSize: "0.75rem",
                          height: 24,
                          borderColor: alpha(theme.palette.primary.main, 0.3),
                          color: theme.palette.primary.main,
                          fontWeight: 500,
                        }}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.disabled">
                      —
                    </Typography>
                  )}
                </Stack>
              </TableCell>

              <TableCell align="center">
                {role.status ? (
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
                ) : (
                  <Typography variant="body2" color="text.disabled">
                    —
                  </Typography>
                )}
              </TableCell>

              <TableCell align="center">
                <Box
                  sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}
                >
                  <Tooltip title="Editar role" arrow>
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
                  <Tooltip title="Eliminar role" arrow>
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
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default RoleTable;

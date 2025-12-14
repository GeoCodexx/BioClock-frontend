// PermissionTable.jsx - Tabla responsive con filas colapsables en mobile
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
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import DescriptionIcon from "@mui/icons-material/Description";
import PinIcon from "@mui/icons-material/Pin";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MoreVertIcon from "@mui/icons-material/MoreVert";

const PermissionTable = ({ permissions = [], onEdit, onDelete }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [orderBy, setOrderBy] = useState("index");
  const [order, setOrder] = useState("asc");
  //const [openRows, setOpenRows] = useState({});
  const [openRowId, setOpenRowId] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPermission, setSelectedPermission] = useState(null);

  // Toggle row collapse
  /*const handleRowToggle = (permissionId) => {
    setOpenRows((prev) => ({
      ...prev,
      [permissionId]: !prev[permissionId],
    }));
  };*/
  const handleRowToggle = (permissionId) => {
    setOpenRowId((prev) => (prev === permissionId ? null : permissionId));
  };

  // Menu de acciones (mobile)
  const handleMenuOpen = (event, permission) => {
    setAnchorEl(event.currentTarget);
    setSelectedPermission(permission);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPermission(null);
  };

  const handleEdit = () => {
    if (selectedPermission && onEdit) {
      onEdit(selectedPermission);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedPermission && onDelete) {
      onDelete(selectedPermission._id);
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
      id: "name",
      label: "Nombre",
      sortable: true,
      minWidth: 200,
    },
    {
      id: "description",
      label: "Descripción",
      sortable: true,
      minWidth: 150,
      align: "center",
    },
    {
      id: "code",
      label: "Código",
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

  const sortedPermissions = useMemo(() => {
    return [...permissions].sort(getComparator(order, orderBy));
  }, [permissions, order, orderBy]);

  // Empty state
  if (permissions.length === 0) {
    return (
      <Paper
        sx={{
          p: 6,
          textAlign: "center",
          borderRadius: 0,
          bgcolor: alpha(theme.palette.primary.main, 0.02),
        }}
      >
        <VpnKeyIcon
          sx={{
            fontSize: 64,
            color: theme.palette.text.disabled,
            mb: 2,
          }}
        />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No hay permisos registrados
        </Typography>
        <Typography variant="body2" color="text.disabled">
          Comienza agregando tu primer permiso
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
                <TableCell>Permiso</TableCell>
                <TableCell align="right" sx={{ width: 50 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedPermissions.map((permission, index) => {
                //const isOpen = openRows[permission._id] || false;
                const isOpen = openRowId === permission._id;

                return (
                  <React.Fragment key={permission._id}>
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
                          onClick={() => handleRowToggle(permission._id)}
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

                      {/* Código del Permiso */}
                      <TableCell sx={{ py: 1.5 }}>
                        <Box>
                          <Typography variant="body2" sx={{ mb: 0.5 }}>
                            {permission.name || "—"}
                          </Typography>
                          <Stack
                            direction="row"
                            spacing={0.5}
                            alignItems="center"
                          >
                            <Chip
                              label={
                                permission.status === "active"
                                  ? "Activo"
                                  : "Inactivo"
                              }
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: "0.7rem",
                                fontWeight: 600,
                                bgcolor:
                                  permission.status === "active"
                                    ? alpha(theme.palette.success.main, 0.15)
                                    : alpha(theme.palette.error.main, 0.15),
                                color:
                                  permission.status === "active"
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
                          onClick={(e) => handleMenuOpen(e, permission)}
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
                              <Box sx={{ py: 2, px: 2 }}>
                                <Stack spacing={2}>
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
                                      {permission.description ||
                                        "Sin Descripción"}
                                    </Typography>
                                  </Box>
                                </Stack>
                              </Box>

                              <Divider />

                              {/* Código */}
                              <Box sx={{ py: 2, px: 2 }}>
                                <Stack spacing={2}>
                                  <Box>
                                    <Stack
                                      direction="row"
                                      alignItems="center"
                                      spacing={0.5}
                                      mb={0.5}
                                    >
                                      {
                                        <PinIcon
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
                                        CÓDIGO
                                      </Typography>
                                    </Stack>
                                    <Typography
                                      variant="body2"
                                      color="text.primary"
                                    >
                                      {permission.code || "Sin Código"}
                                    </Typography>
                                  </Box>
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
          {sortedPermissions.map((permission, index) => (
            <TableRow
              key={permission._id}
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
                <Typography variant="body2">
                  {permission.index || "—"}
                </Typography>
              </TableCell>
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {/* <EventIcon
                    fontSize="small"
                    sx={{ color: theme.palette.primary.main }}
                  /> */}
                  <Typography variant="body2" fontWeight={500}>
                    {permission.name || "—"}
                  </Typography>
                </Box>
              </TableCell>

              <TableCell align="center">
                <Typography variant="body2" fontWeight={500}>
                  {permission.description || "—"}
                </Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="body2" fontWeight={500}>
                  {permission.code || "—"}
                </Typography>
              </TableCell>

              <TableCell align="center">
                {permission.status ? (
                  <Chip
                    label={
                      permission.status === "active" ? "Activo" : "Inactivo"
                    }
                    size="small"
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      bgcolor:
                        permission.status === "active"
                          ? alpha(theme.palette.success.main, 0.15)
                          : alpha(theme.palette.error.main, 0.15),
                      color:
                        permission.status === "active"
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
                  <Tooltip title="Editar horario" arrow>
                    <IconButton
                      size="small"
                      onClick={() => onEdit && onEdit(permission)}
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
                  <Tooltip title="Eliminar horario" arrow>
                    <IconButton
                      size="small"
                      onClick={() => onDelete && onDelete(permission._id)}
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

export default PermissionTable;

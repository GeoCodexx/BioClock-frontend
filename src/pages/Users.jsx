import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Typography,
  CircularProgress,
  Alert,
  Button,
  Box,
  Breadcrumbs,
  Card,
  Link,
  Stack,
  useTheme,
  useMediaQuery,
  Divider,
} from "@mui/material";
import {
  createUser,
  getPaginatedUsers,
  updateUser,
  deleteUser,
} from "../services/userService";
import UserTable from "../components/User/UserTable";
import UserSearchBar from "../components/User/UserSearchBar";
import UserExportButtons from "../components/User/UserExportButtons";
import { Link as RouterLink } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { Add as AddIcon } from "@mui/icons-material";
import UserDialog from "../components/User/UserDialog";
import DeleteConfirmDialog from "../components/common/DeleteConfirmDialog";
import FloatingAddButton from "../components/common/FloatingAddButton";
import useSnackbarStore from "../store/useSnackbarStore";
import LoadingOverlay from "../components/common/LoadingOverlay";
import { SafeTablePagination } from "../components/common/SafeTablePagination";

export default function Users() {
  const { showSuccess, showError } = useSnackbarStore();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Consolidar estados relacionados
  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 10,
    search: "",
  });

  const [dialog, setDialog] = useState({
    open: false,
    editUser: null,
    error: "",
  });

  const [deleteState, setDeleteState] = useState({
    id: null,
    error: "",
  });

  // Evitar llamadas duplicadas eliminando fetchusers de las dependencias
  useEffect(() => {
    const loadusers = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getPaginatedUsers({
          search: pagination.search,
          page: (pagination.page + 1).toString(),
          limit: pagination.rowsPerPage.toString(),
        });
        setUsers(data.users);
        setTotal(data.total);
      } catch (err) {
        setError(err.response?.data?.message || "Error al cargar usuarios");
      } finally {
        setLoading(false);
      }
    };

    loadusers();
  }, [pagination.search, pagination.page, pagination.rowsPerPage]);

  // Debounce para búsqueda
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== pagination.search) {
        setPagination((prev) => ({
          ...prev,
          search: searchInput,
          page: 0,
        }));
      }
    }, 600);

    return () => clearTimeout(handler);
  }, [searchInput, pagination.search]);

  // Handlers con useCallback
  const refreshUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getPaginatedUsers({
        search: pagination.search,
        page: (pagination.page + 1).toString(),
        limit: pagination.rowsPerPage.toString(),
      });
      setUsers(data.users);
      setTotal(data.total);
    } catch (err) {
      setError(err.response?.data?.message || "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  }, [pagination.search, pagination.page, pagination.rowsPerPage]);

  const handleSubmit = useCallback(
    async (data) => {
      setDialog((prev) => ({ ...prev, error: "" }));

      try {
        const isEditing = !!dialog.editUser;

        if (isEditing) {
          await updateUser(dialog.editUser._id, data);
          showSuccess("Usuario actualizado correctamente");
        } else {
          await createUser(data);
          showSuccess("Usuario creado correctamente");
        }

        setDialog({ open: false, editUser: null, error: "" });
        await refreshUsers();
      } catch (err) {
        const errorMessage =
          err.response?.data?.message ||
          `Error al ${dialog.editUser ? "actualizar" : "crear"} usuario`;

        setDialog((prev) => ({ ...prev, error: errorMessage }));
        showError(errorMessage);
        console.error("Error en handleSubmit:", err);
        throw err;
      }
    },
    [dialog.editUser, showSuccess, showError, refreshUsers]
  );

  const handleEdit = useCallback((user) => {
    setDialog({
      open: true,
      editUser: user,
      error: "",
    });
  }, []);

  const handleDelete = useCallback((userId) => {
    setDeleteState({
      id: userId,
      error: "",
    });
  }, []);

  const confirmDelete = useCallback(async () => {
    setDeleteState((prev) => ({ ...prev, error: "" }));
    try {
      await deleteUser(deleteState.id);
      showSuccess("Usuario eliminado correctamente");
      setDeleteState({ id: null, error: "" });
      await refreshUsers();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Error al eliminar el rol";

      setDeleteState((prev) => ({ ...prev, error: errorMessage }));
      showError(errorMessage);
      console.error("Error en confirmDelete:", err);
    }
  }, [deleteState.id, showSuccess, showError, refreshUsers]);

  const handleClose = useCallback(() => {
    setDialog({ open: false, editUser: null, error: "" });
  }, []);

  const handleChangePage = useCallback((event, newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  }, []);

  const handleChangeRowsPerPage = useCallback((event) => {
    setPagination((prev) => ({
      ...prev,
      rowsPerPage: parseInt(event.target.value, 10),
      page: 0,
    }));
  }, []);

  const handleSearch = useCallback(
    (e) => {
      e.preventDefault();
      setPagination((prev) => ({
        ...prev,
        search: searchInput,
        page: 0,
      }));
    },
    [searchInput]
  );

  const handleOpenDialog = useCallback(() => {
    setDialog({ open: true, editUser: null, error: "" });
  }, []);

  const handleCloseDelete = useCallback(() => {
    setDeleteState({ id: null, error: "" });
  }, []);

  // Memorizar valores reutilizables
  const breadcrumbItems = useMemo(
    () => (
      <Breadcrumbs
        aria-label="breadcrumb"
        separator={<NavigateNextIcon fontSize="small" />}
        sx={isMobile ? { fontSize: "0.875rem" } : undefined}
      >
        <Link
          component={RouterLink}
          to="/"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            color: "text.secondary",
            textDecoration: "none",
            transition: "color 0.2s",
            "&:hover": {
              color: "primary.main",
            },
          }}
        >
          <HomeIcon fontSize="small" />
          {!isMobile && <Typography variant="body2">Inicio</Typography>}
        </Link>
        <Typography variant="body2" color="text.primary">
          Usuarios
        </Typography>
      </Breadcrumbs>
    ),
    [isMobile]
  );

  // Memorizar tabla
  const userTableMemo = useMemo(
    () => (
      <UserTable users={users} onEdit={handleEdit} onDelete={handleDelete} />
    ),
    [users, handleEdit, handleDelete]
  );

  // Estado de carga inicial
  if (loading && users.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          gap: 2,
        }}
      >
        <CircularProgress size={48} />
        <Typography variant="body1" color="text.secondary">
          Cargando rols...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      {/* HEADER CARD - Título y Breadcrumbs */}
      <Card
        sx={{
          borderRadius: isMobile ? 2 : 3,
          mb: 2,
          boxShadow: theme.shadows[1],
        }}
      >
        <Box
          sx={{
            px: isMobile ? 2 : 3,
            py: isMobile ? 2.5 : 4,
          }}
        >
          {isMobile ? (
            <Stack spacing={1.5}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Gestión de Usuarios
                  </Typography>
                </Box>
                <UserExportButtons users={users} />
              </Box>
              {breadcrumbItems}
            </Stack>
          ) : (
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Gestión de Usuarios
                </Typography>
              </Box>
              {breadcrumbItems}
            </Stack>
          )}
        </Box>
      </Card>

      {/* TOOLBAR CARD - Búsqueda y Acciones */}
      <Card
        sx={{
          borderRadius: isMobile ? 2 : 3,
          mb: 2,
          boxShadow: theme.shadows[1],
        }}
      >
        <Box
          sx={{
            px: isMobile ? 2 : 3,
            py: isMobile ? 1.5 : 2,
          }}
        >
          {isTablet ? (
            <Stack spacing={2}>
              <Stack
                direction={isMobile ? "column" : "row"}
                spacing={1}
                sx={{ width: "100%" }}
              >
                <FloatingAddButton onClick={handleOpenDialog} />
              </Stack>
              <UserSearchBar
                searchInput={searchInput}
                setSearchInput={setSearchInput}
                onSearch={handleSearch}
              />
            </Stack>
          ) : (
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              spacing={2}
            >
              <Box sx={{ flex: 1, maxWidth: 400 }}>
                <UserSearchBar
                  searchInput={searchInput}
                  setSearchInput={setSearchInput}
                  onSearch={handleSearch}
                />
              </Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenDialog}
                  sx={{ minWidth: 140 }}
                >
                  Nuevo
                </Button>
                <UserExportButtons users={users} />
              </Stack>
            </Stack>
          )}
        </Box>
      </Card>

      {/* Mensaje de error global */}
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: isMobile ? 2 : 3 }}>
          {error}
        </Alert>
      )}

      {/* TABLE CARD */}
      <Card
        sx={{
          borderRadius: isMobile ? 2 : 3,
          boxShadow: theme.shadows[1],
          overflow: "hidden",
        }}
      >
        <Box sx={{ position: "relative" }}>
          <LoadingOverlay show={loading && users.length > 0} />
          {userTableMemo}
        </Box>

        {users.length > 0 && <Divider />}

        <SafeTablePagination
          component="div"
          count={total}
          page={pagination.page}
          onPageChange={handleChangePage}
          rowsPerPage={pagination.rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage={isMobile ? "Filas:" : "Filas por página:"}
          labelDisplayedRows={({ from, to, count }) =>
            isMobile
              ? `${from}-${to} de ${count}`
              : `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
          rowsPerPageOptions={[5, 10, 25, 50]}
          sx={{
            ".MuiTablePagination-toolbar": {
              flexWrap: isMobile ? "wrap" : "nowrap",
              minHeight: isMobile ? "auto" : 64,
              px: isMobile ? 1 : 2,
            },
            ".MuiTablePagination-selectLabel": {
              fontSize: isMobile ? "0.8rem" : "0.875rem",
            },
            ".MuiTablePagination-displayedRows": {
              fontSize: isMobile ? "0.8rem" : "0.875rem",
            },
          }}
        />
      </Card>

      {/* DIÁLOGOS */}
      <UserDialog
        open={dialog.open}
        onClose={handleClose}
        editUser={dialog.editUser}
        formError={dialog.error}
        onSubmit={handleSubmit}
      />

      <DeleteConfirmDialog
        open={!!deleteState.id}
        onClose={handleCloseDelete}
        onConfirm={confirmDelete}
        deleteError={deleteState.error}
        itemName="usuario"
      />
    </Box>
  );
}

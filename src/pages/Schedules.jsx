import { useState, useEffect, useCallback } from "react";
import {
  Typography,
  CircularProgress,
  Alert,
  TablePagination,
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
  createSchedule,
  getPaginatedSchedules,
  updateSchedule,
  deleteSchedule,
} from "../services/scheduleService";
import ScheduleTable from "../components/Schedule/ScheduleTable";
import ScheduleSearchBar from "../components/Schedule/ScheduleSearchBar";
import ScheduleExportButtons from "../components/Schedule/ScheduleExportButtons";
import { Link as RouterLink } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { Add as AddIcon } from "@mui/icons-material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ScheduleDialog from "../components/Schedule/ScheduleDialog";
import DeleteConfirmDialog from "../components/common/DeleteConfirmDialog";
import FloatingAddButton from "../components/common/FloatingAddButton";
import useSnackbarStore from "../store/useSnackbarStore";

export default function Schedules() {
  const { showSuccess, showError } = useSnackbarStore();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const [schedules, setSchedules] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [editSchedule, setEditSchedule] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Función para obtener los datos
  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getPaginatedSchedules({
        search,
        page: (page + 1).toString(),
        limit: rowsPerPage.toString(),
      });
      setSchedules(data.schedules);
      setTotal(data.total);
    } catch (err) {
      setError(err.response?.data?.message || "Error al cargar horarios");
    } finally {
      setLoading(false);
    }
  }, [search, page, rowsPerPage]);

  // Llamada normal cuando cambian paginación
  useEffect(() => {
    fetchSchedules();
  }, [page, rowsPerPage, search, fetchSchedules]);

  // Debounce solo para búsqueda
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== search) {
        setSearch(searchInput);
        setPage(0); // Reset page on search
      }
    }, 600);

    return () => clearTimeout(handler);
  }, [searchInput, search]);

  // const handleRegister = async (data) => {
  //   setFormError("");
  //   try {
  //     if (editSchedule) {
  //       await updateSchedule(editSchedule._id, data);
  //     } else {
  //       await createSchedule(data);
  //     }
  //     setOpen(false);
  //     setEditSchedule(null);
  //     fetchSchedules();
  //   } catch (err) {
  //     setFormError(
  //       err.response?.data?.message || "Error al guardar el horario"
  //     );
  //   }
  // };
  const handleRegister = async (data) => {
    setFormError("");

    try {
      const isEditing = !!editSchedule;

      if (isEditing) {
        await updateSchedule(editSchedule._id, data);
        showSuccess("Horario actualizado correctamente");
      } else {
        await createSchedule(data);
        showSuccess("Horario creado correctamente");
      }

      // Limpiar estado y recargar
      setOpen(false);
      setEditSchedule(null);
      await fetchSchedules();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        `Error al ${editSchedule ? "actualizar" : "crear"} el horario`;

      setFormError(errorMessage);
      showError(errorMessage);

      console.error("Error en handleRegister:", err);
    }
  };

  const handleEdit = (schedule) => {
    setEditSchedule(schedule);
    setOpen(true);
  };

  const handleDelete = (scheduleId) => {
    setDeleteId(scheduleId);
    setDeleteError("");
  };

  const confirmDelete = async () => {
    setDeleteError("");
    try {
      await deleteSchedule(deleteId);
      showSuccess("Horario eliminado correctamente");
      // Limpiar estado y recargar
      setDeleteId(null);
      await fetchSchedules();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || `Error al eliminar el horario`;

      setDeleteError(errorMessage);
      showError(errorMessage);

      console.error("Error en confirmDelete:", err);

      /*setDeleteError(
        err.response?.data?.message || "Error al eliminar el horario"
      );*/
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditSchedule(null);
    setFormError("");
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    setSearch(searchInput);
  };

  // Estado de carga
  if (loading && schedules.length === 0) {
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
          Cargando horarios...
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
            py: isMobile ? 1.5 : 2,
          }}
        >
          {/* Mobile: Stack vertical */}
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
                  {/* <AccessTimeIcon color="primary" /> */}
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Gestión de Horarios
                  </Typography>
                </Box>

                <ScheduleExportButtons schedules={schedules} />
              </Box>
              <Breadcrumbs
                aria-label="breadcrumb"
                separator={<NavigateNextIcon fontSize="small" />}
                sx={{ fontSize: "0.875rem" }}
              >
                <Link
                  component={RouterLink}
                  to="/"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    color: "inherit",
                    textDecoration: "none",
                    "&:hover": { color: "primary.main" },
                  }}
                >
                  <HomeIcon fontSize="small" />
                </Link>
                <Typography variant="body2" color="text.primary">
                  Horarios
                </Typography>
              </Breadcrumbs>
            </Stack>
          ) : (
            // Desktop: Horizontal con espacio entre
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <AccessTimeIcon color="primary" sx={{ fontSize: 28 }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Gestión de Horarios
                </Typography>
              </Box>
              <Breadcrumbs
                aria-label="breadcrumb"
                separator={<NavigateNextIcon fontSize="small" />}
              >
                <Link
                  component={RouterLink}
                  to="/"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    color: "inherit",
                    textDecoration: "none",
                    "&:hover": { color: "primary.main" },
                  }}
                >
                  <HomeIcon fontSize="small" />
                </Link>
                <Typography variant="body2" color="text.primary">
                  Horarios
                </Typography>
              </Breadcrumbs>
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
          {/* Mobile: Stack vertical */}
          {isTablet ? (
            <Stack spacing={2}>
              {/* Botones de acción */}
              <Stack
                direction={isMobile ? "column" : "row"}
                spacing={1}
                sx={{ width: "100%" }}
              >
                <FloatingAddButton
                  onClick={() => {
                    setOpen(true);
                    setEditSchedule(null);
                  }}
                />
                {/* <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setOpen(true);
                    setEditSchedule(null);
                  }}
                  fullWidth={isMobile}
                  sx={{
                    flex: isMobile ? 1 : "none",
                    minWidth: isMobile ? "auto" : 140,
                  }}
                >
                  Nuevo Horario
                </Button> */}
                {/* <ScheduleExportButtons schedules={schedules} /> */}
              </Stack>
              {/* Barra de búsqueda */}
              <ScheduleSearchBar
                searchInput={searchInput}
                setSearchInput={setSearchInput}
                onSearch={handleSearch}
              />
            </Stack>
          ) : (
            // Desktop: Horizontal
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              spacing={2}
            >
              <Box sx={{ flex: 1, maxWidth: 400 }}>
                <ScheduleSearchBar
                  searchInput={searchInput}
                  setSearchInput={setSearchInput}
                  onSearch={handleSearch}
                />
              </Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setOpen(true);
                    setEditSchedule(null);
                  }}
                  sx={{ minWidth: 140 }}
                >
                  Nuevo
                </Button>
                <ScheduleExportButtons schedules={schedules} />
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
        {/* Tabla con loading overlay */}
        <Box sx={{ position: "relative" }}>
          {loading && schedules.length > 0 && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: "rgba(255, 255, 255, 0.7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
              }}
            >
              <CircularProgress size={40} />
            </Box>
          )}

          <ScheduleTable
            schedules={schedules}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Box>

        {/* Divider antes de paginación */}
        {schedules.length > 0 && <Divider />}

        {/* Paginación */}
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
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
      <ScheduleDialog
        open={open}
        onClose={handleClose}
        editSchedule={editSchedule}
        formError={formError}
        onSubmit={handleRegister}
      />

      <DeleteConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        deleteError={deleteError}
        itemName="horario"
      />
    </Box>
  );
}

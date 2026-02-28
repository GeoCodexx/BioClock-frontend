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
  Tooltip,
  IconButton,
  Paper,
  Grid,
} from "@mui/material";
import {
  createAttendance,
  getPaginatedAttendances,
  updateAttendance,
  deleteAttendance,
} from "../services/attendanceService";
import AttendanceTable from "../components/Attendance/AttendanceTable";
import AttendanceSearchBar from "../components/Attendance/AttendanceSearchBar";
import AttendanceExportButtons from "../components/Attendance/AttendanceExportButtons";
import { Link as RouterLink } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { Add as AddIcon } from "@mui/icons-material";
import AttendanceDialog from "../components/Attendance/AttendanceDialog";
import DeleteConfirmDialog from "../components/common/DeleteConfirmDialog";
import FloatingAddButton from "../components/common/FloatingAddButton";
import useSnackbarStore from "../store/useSnackbarStore";
import LoadingOverlay from "../components/common/LoadingOverlay";
//Filtros
import AttendanceDateRangeFilter from "../components/Attendance/AttendanceDateRangeFilter";
import AttendanceStatusFilter from "../components/Attendance/AttendanceStatusFilter";
import AttendanceTypeFilter from "../components/Attendance/AttendanceTypeFilter";
import FilterListIcon from "@mui/icons-material/FilterList";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";
import ClearIcon from "@mui/icons-material/Clear";
import { SafeTablePagination } from "../components/common/SafeTablePagination";
import { useThemeMode } from "../contexts/ThemeContext";
import { usePermission } from "../utils/permissions";

export default function Attendances() {
  const { can } = usePermission();
  const { showSuccess, showError } = useSnackbarStore();

  const theme = useTheme();
  const { mode } = useThemeMode();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const [attendances, setAttendances] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Consolidar estados relacionados
  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 10,
    search: "",
    startDate: null,
    endDate: null,
    status: "",
    type: "",
  });

  const [dialog, setDialog] = useState({
    open: false,
    editAttendance: null,
    error: "",
  });

  const [deleteState, setDeleteState] = useState({
    id: null,
    error: "",
  });

  //Estado de filtros
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    status: "",
    type: "",
  });

  //Estado para mostrar u ocultar filtros mobile
  const [openFilters, setOpenFilters] = useState(false);

  useEffect(() => {
    const loadAttendances = async () => {
      setLoading(true);
      setError("");
      try {
        const params = {
          search: pagination.search,
          page: (pagination.page + 1).toString(),
          limit: pagination.rowsPerPage.toString(),
        };

        // Agregar filtros solo si tienen valor
        if (pagination.startDate) {
          params.startDate = pagination.startDate.toISOString();
        }
        if (pagination.endDate) {
          params.endDate = pagination.endDate.toISOString();
        }
        if (pagination.status) {
          params.status = pagination.status;
        }
        if (pagination.type) {
          params.type = pagination.type;
        }

        const data = await getPaginatedAttendances(params);
        setAttendances(data.attendances);
        setTotal(data.total);
      } catch (err) {
        setError(err?.message || "Error al cargar asistencias");
      } finally {
        setLoading(false);
      }
    };

    loadAttendances();
  }, [
    pagination.search,
    pagination.page,
    pagination.rowsPerPage,
    pagination.startDate,
    pagination.endDate,
    pagination.status,
    pagination.type,
  ]);

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
    }, 700);

    return () => clearTimeout(handler);
  }, [searchInput, pagination.search]);

  // Handlers con useCallback
  const refreshAttendances = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        search: pagination.search,
        page: (pagination.page + 1).toString(),
        limit: pagination.rowsPerPage.toString(),
      };

      if (pagination.startDate) {
        params.startDate = pagination.startDate.toISOString();
      }
      if (pagination.endDate) {
        params.endDate = pagination.endDate.toISOString();
      }
      if (pagination.status) {
        params.status = pagination.status;
      }
      if (pagination.type) {
        params.type = pagination.type;
      }

      const data = await getPaginatedAttendances(params);
      setAttendances(data.attendances);
      setTotal(data.total);
    } catch (err) {
      setError(err?.message || "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  }, [
    pagination.search,
    pagination.page,
    pagination.rowsPerPage,
    pagination.startDate,
    pagination.endDate,
    pagination.status,
    pagination.type,
  ]);

  //handlers
  // Agrega estos handlers:
  const handleStartDateChange = useCallback((date) => {
    setFilters((prev) => ({ ...prev, startDate: date }));
  }, []);

  const handleEndDateChange = useCallback((date) => {
    setFilters((prev) => ({ ...prev, endDate: date }));
  }, []);

  const handleStatusChange = useCallback((status) => {
    setFilters((prev) => ({ ...prev, status }));
  }, []);

  const handleTypeChange = useCallback((type) => {
    setFilters((prev) => ({ ...prev, type }));
  }, []);

  const handleApplyFilters = useCallback(() => {
    if (
      filters.startDate &&
      filters.endDate &&
      filters.startDate > filters.endDate
    ) {
      showError("La fecha de inicio no puede ser mayor que la fecha de fin");
      return;
    }
    setOpenFilters(false);

    setPagination((prev) => ({
      ...prev,
      ...filters,
      page: 0,
    }));
  }, [filters]);

  const handleClearFilters = useCallback(() => {
    const emptyFilters = {
      startDate: null,
      endDate: null,
      status: "",
      type: "",
    };
    setFilters(emptyFilters);
    setPagination((prev) => ({
      ...prev,
      ...emptyFilters,
      page: 0,
    }));
  }, []);

  const handleSubmit = useCallback(
    async (data) => {
      setDialog((prev) => ({ ...prev, error: "" }));

      try {
        const isEditing = !!dialog.editAttendance;

        if (isEditing) {
          const res = await updateAttendance(dialog.editAttendance._id, data);

          showSuccess(res?.message || "Asistencia actualizada correctamente");
        } else {
          const res = await createAttendance(data);
          showSuccess(res?.message || "Asistencia creada correctamente");
        }

        setDialog({ open: false, editAttendance: null, error: "" });
        await refreshAttendances();
      } catch (err) {
        const errorMessage =
          err.response?.data?.message ||
          `Error al ${
            dialog.editAttendance ? "actualizar" : "crear"
          } asistencia`;

        setDialog((prev) => ({ ...prev, error: errorMessage }));
        showError(errorMessage);
        console.error("Error en handleSubmit:", err);
        throw err;
      }
    },
    [dialog.editAttendance, showSuccess, showError, refreshAttendances],
  );

  const handleEdit = useCallback((attendance) => {
    setDialog({
      open: true,
      editAttendance: attendance,
      error: "",
    });
  }, []);

  const handleDelete = useCallback((userId) => {
    setDeleteState({
      id: userId,
      error: "",
    });
  }, []);

  /*const handleJustify = useCallback((attendance) =>{
    setJustifyDialogOpen(true);
    setSelectedAttendance(attendance);
  })*/

  const confirmDelete = useCallback(async () => {
    setDeleteState((prev) => ({ ...prev, error: "" }));
    try {
      await deleteAttendance(deleteState.id);
      showSuccess("Asistencia eliminado correctamente");
      setDeleteState({ id: null, error: "" });
      await refreshAttendances();
    } catch (err) {
      const errorMessage =
        err?.message|| "Error al eliminar el rol";

      setDeleteState((prev) => ({ ...prev, error: errorMessage }));
      showError(errorMessage);
      console.error("Error en confirmDelete:", err);
    }
  }, [deleteState.id, showSuccess, showError, refreshAttendances]);

  const handleClose = useCallback(() => {
    setDialog({ open: false, editAttendance: null, error: "" });
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
    [searchInput],
  );

  const handleOpenDialog = useCallback(() => {
    setDialog({ open: true, editAttendance: null, error: "" });
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
          Asistencias
        </Typography>
      </Breadcrumbs>
    ),
    [isMobile],
  );

  // Memorizar tabla
  const userTableMemo = useMemo(
    () => (
      <AttendanceTable
        attendances={attendances}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    ),
    [
      attendances,
      handleEdit,
      handleDelete,
      //handleOpenJustifyDialog,
      //handleOpenDeleteJustifyDialog,
    ],
  );

  // Verifica si hay filtros activos
  const hasActiveFilters =
    filters.startDate || filters.endDate || filters.status || filters.type;

  // Estado de carga inicial
  if (loading && attendances.length === 0) {
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
          Cargando asistencias...
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
          borderLeft: mode === "dark" ? "none" : "6px solid",
          borderColor: "primary.main",
        }}
      >
        <Box
          sx={{
            px: isMobile ? 2 : 3,
            py: isMobile ? 2.5 : 3,
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
                    Gestión de Asistencias
                  </Typography>
                </Box>
                <Tooltip
                  title={
                    !attendances || attendances.length === 0
                      ? "No hay asistencias para filtrar"
                      : openFilters
                        ? "Ocultar filtros"
                        : "Mostrar filtros"
                  }
                >
                  <span>
                    <IconButton
                      onClick={() => setOpenFilters((prev) => !prev)}
                      disabled={!attendances || attendances.length === 0}
                      sx={{
                        bgcolor: theme.palette.background.paper,
                        "&:hover": {
                          bgcolor: theme.palette.action.hover,
                        },
                        "&:disabled": {
                          bgcolor: theme.palette.action.disabledBackground,
                        },
                      }}
                    >
                      {openFilters ? <FilterListOffIcon /> : <FilterListIcon />}
                    </IconButton>
                  </span>
                </Tooltip>
                {can("attendances:export") && (
                  <AttendanceExportButtons attendances={attendances} />
                )}
              </Box>
            </Stack>
          ) : (
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Gestión de Asistencias
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
            pt: isMobile ? 0 : 4,
            pb: isMobile ? 1.5 : 4,
          }}
        >
          {isTablet ? (
            <Stack spacing={2}>
              <Stack
                direction={isMobile ? "column" : "row"}
                spacing={1}
                sx={{ width: "100%" }}
              >
                {can("attendances:create") && (
                  <FloatingAddButton onClick={handleOpenDialog} />
                )}
              </Stack>
              <AttendanceSearchBar
                searchInput={searchInput}
                setSearchInput={setSearchInput}
                onSearch={handleSearch}
              />
              {openFilters && (
                <>
                  <Stack spacing={2} sx={{ mt: 2 }}>
                    {/* Filtros de fecha */}
                    <AttendanceDateRangeFilter
                      startDate={filters.startDate}
                      endDate={filters.endDate}
                      onStartDateChange={handleStartDateChange}
                      onEndDateChange={handleEndDateChange}
                    />

                    {/* Filtros de estado y tipo */}
                    <Stack direction={isMobile ? "column" : "row"} spacing={1}>
                      <Box sx={{ flex: 1 }}>
                        <AttendanceStatusFilter
                          status={filters.status}
                          onStatusChange={handleStatusChange}
                        />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <AttendanceTypeFilter
                          type={filters.type}
                          onTypeChange={handleTypeChange}
                        />
                      </Box>
                    </Stack>

                    {/* Botones de filtros */}
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="flex-end"
                    >
                      {hasActiveFilters && (
                        <Button
                          variant="outlined"
                          startIcon={<ClearIcon />}
                          onClick={handleClearFilters}
                          size="small"
                        >
                          Limpiar
                        </Button>
                      )}
                      <Button
                        variant="contained"
                        startIcon={<FilterListIcon />}
                        onClick={handleApplyFilters}
                        size="small"
                      >
                        Aplicar Filtros
                      </Button>
                    </Stack>
                  </Stack>
                </>
              )}
            </Stack>
          ) : (
            <>
              <Grid container alignItems="center" spacing={2}>
                {/* Buscador */}
                <Grid size={{ xs: 6 }}>
                  <AttendanceSearchBar
                    searchInput={searchInput}
                    setSearchInput={setSearchInput}
                    onSearch={handleSearch}
                  />
                </Grid>
                {/* Acciones */}
                <Grid
                  size={{ xs: 6 }}
                  display="flex"
                  justifyContent="flex-end"
                  alignItems="center"
                  gap={1.5}
                >
                  {can("attendances:create") && (
                    <Tooltip title="Nueva Asistencia">
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenDialog}
                        sx={{ minWidth: 140 }}
                      >
                        Nuevo
                      </Button>
                    </Tooltip>
                  )}
                  {can("attendances:export") && (
                    <AttendanceExportButtons attendances={attendances} />
                  )}
                </Grid>
              </Grid>

              <Paper
                variant="outlined"
                sx={{
                  mt: 3,
                  p: 2,
                  borderRadius: 3,
                  backgroundColor: (theme) =>
                    theme.palette.mode === "dark"
                      ? theme.palette.background.paper
                      : "#fafafa",
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{ mb: 2.5 }}
                >
                  <FilterListIcon color="primary" />
                  <Typography variant="h6">Filtros avanzados</Typography>
                </Stack>

                <Grid container spacing={2} alignItems="center">
                  {/* Filtros de fecha */}
                  <Grid size={{ xs: 4 }}>
                    <AttendanceDateRangeFilter
                      startDate={filters.startDate}
                      endDate={filters.endDate}
                      onStartDateChange={handleStartDateChange}
                      onEndDateChange={handleEndDateChange}
                    />
                  </Grid>

                  {/* Filtros de estado y tipo */}
                  <Grid size={{ xs: 2.5 }}>
                    <AttendanceStatusFilter
                      status={filters.status}
                      onStatusChange={handleStatusChange}
                    />
                  </Grid>
                  <Grid size={{ xs: 2.5 }}>
                    <AttendanceTypeFilter
                      type={filters.type}
                      onTypeChange={handleTypeChange}
                    />
                  </Grid>

                  {/* Botones de filtros */}
                  <Grid
                    size={{ xs: 3 }}
                    display="flex"
                    justifyContent="flex-end"
                    alignItems="center"
                    gap={1}
                  >
                    {hasActiveFilters && (
                      <Button
                        variant="outlined"
                        startIcon={<ClearIcon />}
                        onClick={handleClearFilters}
                        size="small"
                      >
                        Limpiar
                      </Button>
                    )}
                    <Button
                      variant="contained"
                      startIcon={<FilterListIcon />}
                      onClick={handleApplyFilters}
                      size="small"
                    >
                      Aplicar Filtros
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </>
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
          <LoadingOverlay show={loading && attendances.length > 0} />
          {userTableMemo}
        </Box>

        {attendances.length > 0 && <Divider />}

        <SafeTablePagination
          component="div"
          count={total}
          page={pagination.page}
          onPageChange={handleChangePage}
          rowsPerPage={pagination.rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          showFirstButton
          showLastButton
          labelRowsPerPage={isMobile ? "Filas:" : "Filas por página:"}
          labelDisplayedRows={({ from, to, count, page }) =>
            isMobile
              ? `${from}-${to} de ${count}`
              : `Página ${page + 1} |  ${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
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
      {
        <AttendanceDialog
          open={dialog.open}
          onClose={handleClose}
          editAttendance={dialog.editAttendance}
          formError={dialog.error}
          onSubmit={handleSubmit}
        />
      }

      <DeleteConfirmDialog
        open={!!deleteState.id}
        onClose={handleCloseDelete}
        onConfirm={confirmDelete}
        deleteError={deleteState.error}
        itemName="asistencia"
      />

      {/* Dialog de justificación */}
      {/* <JustifyAttendanceDialog
        open={justifyDialogOpen}
        onOpenChange={setJustifyDialogOpen}
        attendance={selectedAttendance}
        handleJustifyAttendance={handleJustifyAttendance}
        onSuccess={handleJustifySuccess}
      /> */}

      {/* Dialog de confirmación de eliminar justificación */}
      {/* <ConfirmDeleteJustificationDialog
        open={deleteJustificationDialogOpen}
        onOpenChange={setDeleteJustificationDialogOpen}
        attendance={selectedAttendance}
        onConfirm={handleDeleteJustification}
      /> */}
    </Box>
  );
}

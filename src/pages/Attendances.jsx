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
//import SearchIcon from "@mui/icons-material/Search";
//import FilterAltIcon from '@mui/icons-material/FilterAlt';

export default function Attendances() {
  const { showSuccess, showError } = useSnackbarStore();

  const theme = useTheme();
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

  // Carga de datos llamando a la API
  /*useEffect(() => {
    const loadAttendances = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getPaginatedAttendances({
          search: pagination.search,
          page: (pagination.page + 1).toString(),
          limit: pagination.rowsPerPage.toString(),
        });
        setAttendances(data.attendances);
        setTotal(data.total);
      } catch (err) {
        setError(err.response?.data?.message || "Error al cargar asistencias");
      } finally {
        setLoading(false);
      }
    };

    loadAttendances();
  }, [pagination.search, pagination.page, pagination.rowsPerPage]);*/

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
        setError(err.response?.data?.message || "Error al cargar asistencias");
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
    }, 600);

    return () => clearTimeout(handler);
  }, [searchInput, pagination.search]);

  // Handlers con useCallback
  /*const refreshusers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getPaginatedAttendances({
        search: pagination.search,
        page: (pagination.page + 1).toString(),
        limit: pagination.rowsPerPage.toString(),
      });
      setAttendances(data.attendances);
      setTotal(data.total);
    } catch (err) {
      setError(err.response?.data?.message || "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  }, [pagination.search, pagination.page, pagination.rowsPerPage]);*/
  const refreshusers = useCallback(async () => {
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
      setError(err.response?.data?.message || "Error al cargar usuarios");
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
          await updateAttendance(dialog.editAttendance._id, data);
          showSuccess("Asistencia actualizado correctamente");
        } else {
          await createAttendance(data);
          showSuccess("Asistencia creado correctamente");
        }

        setDialog({ open: false, editAttendance: null, error: "" });
        await refreshusers();
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
    [dialog.editAttendance, showSuccess, showError, refreshusers]
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

  const confirmDelete = useCallback(async () => {
    setDeleteState((prev) => ({ ...prev, error: "" }));
    try {
      await deleteAttendance(deleteState.id);
      showSuccess("Asistencia eliminado correctamente");
      setDeleteState({ id: null, error: "" });
      await refreshusers();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Error al eliminar el rol";

      setDeleteState((prev) => ({ ...prev, error: errorMessage }));
      showError(errorMessage);
      console.error("Error en confirmDelete:", err);
    }
  }, [deleteState.id, showSuccess, showError, refreshusers]);

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
    [searchInput]
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
    [isMobile]
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
    [attendances, handleEdit, handleDelete]
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
                {/* <Tooltip
                  title={
                    !attendances || attendances.length === 0
                      ? "No hay asistencias para buscar"
                      : "Buscar"
                  }
                >
                  <span>
                    <IconButton
                      onClick={() => alert("Prueba de boton busqueda")}
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
                      <SearchIcon />
                    </IconButton>
                  </span>
                </Tooltip> */}
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
                <AttendanceExportButtons attendances={attendances} />
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
            py: isMobile ? 1.5 : 4,
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
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={2}
              >
                <Box sx={{ flex: 1, maxWidth: 400 }}>
                  <AttendanceSearchBar
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
                  <AttendanceExportButtons attendances={attendances} />
                </Stack>
              </Stack>
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
                <Stack direction="row" spacing={1} justifyContent="flex-end">
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
    </Box>
  );
}

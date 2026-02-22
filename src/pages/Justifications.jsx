import React, { useCallback, useEffect, useMemo, useState } from "react";
import { usePermission } from "../utils/permissions";
import useSnackbarStore from "../store/useSnackbarStore";
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CircularProgress,
  Divider,
  IconButton,
  Link,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useThemeMode } from "../contexts/ThemeContext";
import {
  createJustification,
  getPaginatedJustifications,
  updateJustification,
} from "../services/justificationService";
import { Link as RouterLink } from "react-router-dom";
import LoadingOverlay from "../components/common/LoadingOverlay";
import { SafeTablePagination } from "../components/common/SafeTablePagination";
import HomeIcon from "@mui/icons-material/Home";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { Add as AddIcon } from "@mui/icons-material";
import FilterListIcon from "@mui/icons-material/FilterList";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";
import ClearIcon from "@mui/icons-material/Clear";
import FloatingAddButton from "../components/common/FloatingAddButton";
import JustificationSearchBar from "../components/Justification/JustificationSearchBar";
import JustificationDateRangeFilter from "../components/Justification/JustificationDateRangeFilter";
import JustificationScheduleFilter from "../components/Justification/JustificationScheduleFilter";
import JustificationStatusFilter from "../components/Justification/JustificationStatusFilter";
import JustificationTable from "../components/Justification/JustificationTable";
import { getSchedules } from "../services/scheduleService";
import JustificationDrawer from "../components/Justification/JustificationDrawer";
import { getUsers } from "../services/userService";

/*function buildFormData(fields, files = []) {
  const fd = new FormData();
  Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
  files.forEach((file) => fd.append("files", file));
  return fd;
}*/

const Justifications = () => {
  const { can } = usePermission();
  const { showSuccess, showError } = useSnackbarStore();
  const theme = useTheme();
  const { mode } = useThemeMode();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const [justifications, setJustifications] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [users, setUsers] = useState([]); //Exclusivo para crear justififcaciones
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Consolidar estados relacionados
  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 10,
    userName: "",
    startDate: null,
    endDate: null,
    status: "",
    scheduleId: "",
  });

  const [openDrawer, setOpenDrawer] = useState(false);

  const [deleteState, setDeleteState] = useState({
    id: null,
    error: "",
  });

  //Estado de filtros
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    status: "",
    scheduleId: "",
  });

  //Estado para mostrar u ocultar filtros mobile
  const [openFilters, setOpenFilters] = useState(false);

  // Traer los usuarios existentes
  useEffect(() => {
    const fetchUsers = async () => {
      const data = await getUsers();
      setUsers(data || []);
    };
    fetchUsers();
  }, []);

  // Traer los horarios existentes
  useEffect(() => {
    const fetchSchedules = async () => {
      const data = await getSchedules();
      console.log(data);
      setSchedules(data || []);
    };
    fetchSchedules();
  }, []);

  useEffect(() => {
    const loadJustifications = async () => {
      setLoading(true);
      setError("");
      try {
        const params = {
          userName: pagination.userName,
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
        if (pagination.scheduleId) {
          params.scheduleId = pagination.scheduleId;
        }

        const data = await getPaginatedJustifications(params);
        setJustifications(data.justifications);
        setTotal(data.pagination.total);
      } catch (err) {
        console.log(err);
        setError(
          err.response?.data?.message || "Error al cargar justificaciones",
        );
      } finally {
        setLoading(false);
      }
    };

    loadJustifications();
  }, [
    pagination.userName,
    pagination.page,
    pagination.rowsPerPage,
    pagination.startDate,
    pagination.endDate,
    pagination.status,
    pagination.scheduleId,
  ]);

  // Debounce para búsqueda
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== pagination.userName) {
        setPagination((prev) => ({
          ...prev,
          userName: searchInput,
          page: 0,
        }));
      }
    }, 700);

    return () => clearTimeout(handler);
  }, [searchInput, pagination.userName]);

  // Handlers con useCallback
  const refreshJustifications = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        userName: pagination.userName,
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
      if (pagination.scheduleId) {
        params.scheduleId = pagination.scheduleId;
      }

      const data = await getPaginatedJustifications(params);
      setJustifications(data.justifications);
      setTotal(data.pagination.total);
    } catch (err) {
      setError(
        err.response?.data?.message || "Error al cargar justificaciones",
      );
    } finally {
      setLoading(false);
    }
  }, [
    pagination.userName,
    pagination.page,
    pagination.rowsPerPage,
    pagination.startDate,
    pagination.endDate,
    pagination.status,
    pagination.scheduleId,
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

  const handleScheduleChange = useCallback((scheduleId) => {
    setFilters((prev) => ({ ...prev, scheduleId }));
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
      scheduleId: "",
    };
    setFilters(emptyFilters);
    setSearchInput("");
    setPagination((prev) => ({
      ...prev,
      ...emptyFilters,
      page: 0,
    }));
  }, []);

  /*const handleSubmit = useCallback(
    async (data) => {
      setDialog((prev) => ({ ...prev, error: "" }));

      try {
        const isEditing = !!dialog.editJustification;

        if (isEditing) {
          const res = await updateJustification(
            dialog.editJustification._id,
            data,
          );

          showSuccess(
            res?.message || "Justificación actualizada correctamente",
          );
        } else {
          const res = await createAttendance(data);
          showSuccess(res?.message || "Justificación creada correctamente");
        }

        setDialog({ open: false, editJustification: null, error: "" });
        await refreshJustifications();
      } catch (err) {
        const errorMessage =
          err.response?.data?.message ||
          `Error al ${
            dialog.editJustification ? "actualizar" : "crear"
          } justificación`;

        setDialog((prev) => ({ ...prev, error: errorMessage }));
        showError(errorMessage);
        console.error("Error en handleSubmit:", err);
        throw err;
      }
    },
    [dialog.editJustification, showSuccess, showError, refreshJustifications],
  );*/

  /*const handleEdit = useCallback((justification) => {
    setDialog({
      open: true,
      editJustification: justification,
      error: "",
    });
  }, []);*/

  const handleDelete = useCallback((recordId) => {
    setDeleteState({
      id: recordId,
      error: "",
    });
  }, []);

  /*const handleJustify = useCallback((justification) =>{
      setJustifyDialogOpen(true);
      setSelectedAttendance(justification);
    })*/

  const confirmDelete = useCallback(async () => {
    setDeleteState((prev) => ({ ...prev, error: "" }));
    try {
      await deleteAttendance(deleteState.id);
      showSuccess("Justificación eliminada correctamente");
      setDeleteState({ id: null, error: "" });
      await refreshJustifications();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Error al eliminar justificación";

      setDeleteState((prev) => ({ ...prev, error: errorMessage }));
      showError(errorMessage);
      console.error("Error en confirmDelete:", err);
    }
  }, [deleteState.id, showSuccess, showError, refreshJustifications]);

  const handleClose = useCallback(() => {
    setDialog({ open: false, editJustification: null, error: "" });
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
        userName: searchInput,
        page: 0,
      }));
    },
    [searchInput],
  );

  const handleOpenDialog = useCallback(() => {
    setDialog({ open: true, editJustification: null, error: "" });
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
          Justificacións
        </Typography>
      </Breadcrumbs>
    ),
    [isMobile],
  );

  // Memorizar tabla
  const justificationTableMemo = useMemo(
    () => (
      <JustificationTable
        justifications={justifications}
        schedules={schedules}
        /*onEdit={handleEdit}
        onDelete={handleDelete}*/
        onRefresh={refreshJustifications}
      />
    ),
    [
      justifications,
      /*handleEdit,
      handleDelete,*/
      //handleOpenJustifyDialog,
      //handleOpenDeleteJustifyDialog,
    ],
  );

  // Verifica si hay filtros activos
  const hasActiveFilters =
    pagination.userName ||
    filters.startDate ||
    filters.endDate ||
    filters.status ||
    filters.scheduleId;

  // Estado de carga inicial
  if (loading && justifications.length === 0) {
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
          Cargando...
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
                    Gestión de Justificaciones
                  </Typography>
                </Box>
                <Tooltip
                  title={
                    !justifications || justifications.length === 0
                      ? "No hay justificaciones para filtrar"
                      : openFilters
                        ? "Ocultar filtros"
                        : "Mostrar filtros"
                  }
                >
                  <span>
                    <IconButton
                      onClick={() => setOpenFilters((prev) => !prev)}
                      disabled={!justifications || justifications.length === 0}
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
                {/* {can("justifications:export") && (
                  <AttendanceExportButtons justifications={justifications} />
                )} */}
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
                  Gestión de Justificaciones
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
                {can("justifications:create") && (
                  <FloatingAddButton onClick={handleOpenDialog} />
                )}
              </Stack>
              <JustificationSearchBar
                searchInput={searchInput}
                setSearchInput={setSearchInput}
                onSearch={handleSearch}
              />
              {openFilters && (
                <>
                  <Stack spacing={2} sx={{ mt: 2 }}>
                    {/* Filtros de fecha */}
                    <JustificationDateRangeFilter
                      startDate={filters.startDate}
                      endDate={filters.endDate}
                      onStartDateChange={handleStartDateChange}
                      onEndDateChange={handleEndDateChange}
                    />

                    {/* Filtros de estado y turno */}
                    <Stack direction={isMobile ? "column" : "row"} spacing={1}>
                      <Box sx={{ flex: 1 }}>
                        <JustificationScheduleFilter
                          scheduleId={filters.scheduleId}
                          onScheduleChange={handleScheduleChange}
                          schedules={schedules}
                        />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <JustificationStatusFilter
                          status={filters.status}
                          onStatusChange={handleStatusChange}
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
                  <JustificationSearchBar
                    searchInput={searchInput}
                    setSearchInput={setSearchInput}
                    onSearch={handleSearch}
                  />
                </Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  {can("justifications:create") && (
                    <>
                      <Tooltip title="Nueva justificación">
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => setOpenDrawer(true)}
                          sx={{ minWidth: 140 }}
                        >
                          Nuevo
                        </Button>
                      </Tooltip>

                      <JustificationDrawer
                        open={openDrawer}
                        onClose={() => setOpenDrawer(false)}
                        mode="create"
                        schedules={schedules}
                        users={users}
                        onSubmit={async (payload, files) => {
                          // console.log("payload: ", payload);
                          await createJustification(payload, files);
                          refreshJustifications();
                        }}
                      />
                    </>
                  )}
                  {/* {can("justifications:export") && (
                    <AttendanceExportButtons justifications={justifications} />
                  )} */}
                </Stack>
              </Stack>
              <Stack spacing={2} sx={{ mt: 2 }}>
                {/* Filtros de fecha */}
                <JustificationDateRangeFilter
                  startDate={filters.startDate}
                  endDate={filters.endDate}
                  onStartDateChange={handleStartDateChange}
                  onEndDateChange={handleEndDateChange}
                />

                {/* Filtros de estado y tipo */}
                <Stack direction={isMobile ? "column" : "row"} spacing={1}>
                  <Box sx={{ flex: 1 }}>
                    <JustificationScheduleFilter
                      scheduleId={filters.scheduleId}
                      onScheduleChange={handleScheduleChange}
                      schedules={schedules}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <JustificationStatusFilter
                      status={filters.status}
                      onStatusChange={handleStatusChange}
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
          <LoadingOverlay show={loading && justifications.length > 0} />
          {justificationTableMemo}
        </Box>

        {justifications.length > 0 && <Divider />}

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
        // <AttendanceDialog
        //   open={dialog.open}
        //   onClose={handleClose}
        //   editJustification={dialog.editJustification}
        //   formError={dialog.error}
        //   onSubmit={handleSubmit}
        // />
      }

      {/* <DeleteConfirmDialog
        open={!!deleteState.id}
        onClose={handleCloseDelete}
        onConfirm={confirmDelete}
        deleteError={deleteState.error}
        itemName="asistencia"
      /> */}
    </Box>
  );
};

export default Justifications;

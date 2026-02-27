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
  Grid,
  IconButton,
  Link,
  Paper,
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
} from "../services/justificationService";
import { Link as RouterLink } from "react-router-dom";
import LoadingOverlay from "../components/common/LoadingOverlay";
import { SafeTablePagination } from "../components/common/SafeTablePagination";
import HomeIcon from "@mui/icons-material/Home";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { Add as AddIcon } from "@mui/icons-material";
import FilterListIcon from "@mui/icons-material/FilterList";
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
import ExportButtons from "../components/Justification/ExportButtons";
import { format, parse } from "date-fns";
import ActionBar from "../components/Justification/ActionBar";
import JustificationFilterDrawer from "../components/Justification/FilterDrawer";
import ActiveFilterChips from "../components/Justification/ActiveFilterChips";

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
  //const isTablet = useMediaQuery(theme.breakpoints.down("md"));

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
          params.startDate = format(pagination.startDate, "yyyy-MM-dd");
        }
        if (pagination.endDate) {
          params.endDate = format(pagination.endDate, "yyyy-MM-dd");
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
  /*useEffect(() => {
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
  }, [searchInput, pagination.userName]);*/
  useEffect(() => {
    const handler = setTimeout(() => {
      setPagination((prev) => ({
        ...prev,
        userName: searchInput,
        page: 0,
      }));
    }, 700);

    return () => clearTimeout(handler);
  }, [searchInput]);

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

  // Manejar la busqueda en modo desktop:
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

  // Manejar la busqueda en modo mobile:
  const handleSearchBarMobile = (value) => {
    setSearchInput(value);
  };

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

  const handleCloseDrawer = useCallback(() => {
    setOpenDrawer(false);
  }, []);

  const handleSubmitDrawer = useCallback(
    async (payload, files) => {
      await createJustification(payload, files);
      refreshJustifications();
    },
    [createJustification, refreshJustifications],
  );

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
        onRefresh={refreshJustifications}
        users={users}
      />
    ),
    [justifications],
  );

  // Normalizar datos para opcion de exportar
  const exportFilters = useMemo(
    () => ({
      userName: pagination.userName || "",
      status: filters.status || "",
      scheduleId: filters.scheduleId || "",
      startDate: filters.startDate
        ? format(filters.startDate, "yyyy-MM-dd")
        : "",
      endDate: filters.endDate ? format(filters.endDate, "yyyy-MM-dd") : "",
    }),
    [pagination.userName, filters],
  );

  // Helper para transformar clave y valor para chips activos en tabla mobile
  const getReadableFilters = () => {
    const readable = {};

    // 🔹 Fechas combinadas
    if (filters.startDate && filters.endDate) {
      readable["Fechas"] =
        `${format(filters.startDate, "dd/MM/yyyy")} — ${format(
          filters.endDate,
          "dd/MM/yyyy",
        )}`;
    }

    // 🔹 Estado
    if (filters.status) {
      readable["Estado"] = {
        approved: "Aprobado",
        pending: "Pendiente",
        rejected: "Rechazado",
      }[filters.status];
    }

    // 🔹 Horario
    if (filters.scheduleId) {
      const scheduleName = schedules.find(
        (s) => s._id === filters.scheduleId,
      )?.name;

      if (scheduleName) {
        readable["Horario"] = scheduleName;
      }
    }

    return readable;
  };

  const handleRemoveFilter = (label) => {
    if (label === "Fechas") {
      setFilters((prev) => ({
        ...prev,
        startDate: null,
        endDate: null,
      }));

      setPagination((prev) => ({
        ...prev,
        startDate: null,
        endDate: null,
        page: 0,
      }));
      return;
    }

    const reverseMap = {
      Estado: "status",
      Horario: "scheduleId",
    };

    const key = reverseMap[label];

    if (key) {
      setFilters((prev) => ({
        ...prev,
        [key]: "",
      }));
      setPagination((prev) => ({
        ...prev,
        [key]: "",
        page: 0,
      }));
    }
  };

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
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Gestión de Justificaciones
                </Typography>
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

      {isMobile ? (
        <span>
          {can("justifications:create") && (
            <FloatingAddButton onClick={() => setOpenDrawer(true)} />
          )}
        </span>
      ) : (
        <Card
          sx={{
            borderRadius: isMobile ? 2 : 3,
            mb: 2,
            boxShadow: theme.shadows[1],
          }}
        >
          <Box
            sx={{
              px: 3,
              pt: 4,
              pb: 4,
            }}
          >
            {/* ===================== */}
            {/* 🔹 NIVEL 1: HEADER */}
            {/* ===================== */}
            <Grid container alignItems="center" spacing={2}>
              {/* Buscador */}
              <Grid size={{ xs: 6 }}>
                <JustificationSearchBar
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
                {can("justifications:create") && (
                  <Tooltip title="Nueva justificación">
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setOpenDrawer(true)}
                      sx={{ minWidth: 150 }}
                    >
                      Nuevo
                    </Button>
                  </Tooltip>
                )}

                {can("justifications:export") && (
                  <ExportButtons
                    filters={exportFilters}
                    isDisabled={!justifications || justifications.length === 0}
                    variant="desktop"
                  />
                )}
              </Grid>
            </Grid>

            {/* ===================== */}
            {/* 🔹 NIVEL 2: FILTROS */}
            {/* ===================== */}
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
                {/* Fecha inicio */}
                <Grid size={{ xs: 4 }}>
                  <JustificationDateRangeFilter
                    startDate={filters.startDate}
                    endDate={filters.endDate}
                    onStartDateChange={handleStartDateChange}
                    onEndDateChange={handleEndDateChange}
                  />
                </Grid>

                {/* Horario */}
                <Grid size={{ xs: 2.5 }}>
                  <JustificationScheduleFilter
                    scheduleId={filters.scheduleId}
                    onScheduleChange={handleScheduleChange}
                    schedules={schedules}
                  />
                </Grid>

                {/* Estado */}
                <Grid size={{ xs: 2.5 }}>
                  <JustificationStatusFilter
                    status={filters.status}
                    onStatusChange={handleStatusChange}
                  />
                </Grid>

                {/* Botones */}
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
          </Box>{" "}
        </Card>
      )}

      {/* Mensaje de error global */}
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: isMobile ? 2 : 3 }}>
          {error}
        </Alert>
      )}

      {/* ACTIONBAR MODO MOBILE */}
      {isMobile && (
        <ActionBar
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          onSearch={handleSearch}
          onFilterClick={() => setOpenFilters(true)}
          filters={exportFilters}
          isDisabled={!justifications || justifications.length === 0}
          numberOfActiveFilters={
            [
              //pagination.userName,
              pagination.startDate,
              pagination.endDate,
              pagination.status,
              pagination.scheduleId,
            ].filter(Boolean).length
          }
        />
      )}

      {isMobile && (
        <JustificationFilterDrawer
          open={openFilters}
          onClose={() => setOpenFilters(false)}
          onApply={handleApplyFilters}
        >
          <JustificationDateRangeFilter
            startDate={filters.startDate}
            endDate={filters.endDate}
            onStartDateChange={handleStartDateChange}
            onEndDateChange={handleEndDateChange}
          />

          <JustificationScheduleFilter
            scheduleId={filters.scheduleId}
            onScheduleChange={handleScheduleChange}
            schedules={schedules}
          />

          <JustificationStatusFilter
            status={filters.status}
            onStatusChange={handleStatusChange}
          />

          {hasActiveFilters && (
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
            >
              Limpiar filtros
            </Button>
          )}
        </JustificationFilterDrawer>
      )}

      {/* FILTROS ACTIVOS MODO MOBIL*/}
      {isMobile && hasActiveFilters && (
        <ActiveFilterChips
          filters={getReadableFilters()}
          onRemove={handleRemoveFilter}
        />
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
      <JustificationDrawer
        open={openDrawer}
        onClose={handleCloseDrawer}
        mode="create"
        schedules={schedules}
        users={users}
        onSubmit={handleSubmitDrawer}
      />
    </Box>
  );
};

export default Justifications;

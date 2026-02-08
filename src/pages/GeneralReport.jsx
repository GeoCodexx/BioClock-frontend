import {
  useState,
  useEffect,
  useCallback,
  memo,
  useMemo,
  useLayoutEffect,
} from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  Alert,
  Breadcrumbs,
  Link,
  useTheme,
  useMediaQuery,
  Stack,
  Skeleton,
  Fade,
  Chip,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  Collapse,
  IconButton,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { es } from "date-fns/locale";
import { endOfMonth, format, parseISO, startOfMonth } from "date-fns";
import HomeIcon from "@mui/icons-material/Home";
import {
  Search as SearchIcon,
  NavigateNext as NavigateNextIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  ViewDay as ViewDayIcon,
  //ViewWeek,
  ViewModule as ViewModuleIcon,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";

import { getGeneralReport } from "../services/reportService";
import { getSchedules } from "../services/scheduleService";
import SummaryCards from "../components/Reports/GeneralReport/SummaryCards";
import "jspdf-autotable";
import GeneralReportTable from "../components/Reports/GeneralReport/GeneralReportTable";
import GeneralReportExportButtons from "../components/Reports/GeneralReport/GeneralReportExportButtons";
import { SafeSelect } from "../components/common/SafeSelect";
import { SafeTablePagination } from "../components/common/SafeTablePagination";
import { useThemeMode } from "../contexts/ThemeContext";
import AttendanceDrawer from "../components/Reports/GeneralReport/AttendanceDrawer";
import TimelineMatrix from "../components/Reports/GeneralReport/TimeLineMatrix";
import { createJustification } from "../services/attendanceService";
import useSnackbarStore from "../store/useSnackbarStore";

// Constantes
const STATUS_OPTIONS = [
  //{ value: "", label: "Todos los estados" },
  { value: "on_time", label: "A tiempo" },
  { value: "late", label: "Tardanza" },
  { value: "early", label: "Temprano" },
  { value: "early_exit", label: "Salida temprana" },
  { value: "incomplete", label: "Incompleto" },
  { value: "absent", label: "Ausente" },
  { value: "justified", label: "Justificado" },
];

const STATUS_LABELS = {
  on_time: "A tiempo",
  late: "Tardanza",
  early_exit: "Salida temprana",
  imcomplete: "Incompleto",
  absent: "Ausente",
  justified: "Justificado",
};

const ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50, 100];

// Componente Header memoizado
const PageHeader = memo(({ date, isMobile }) => {
  const { mode } = useThemeMode();
  const breadcrumbs = (
    <Breadcrumbs
      aria-label="breadcrumb"
      separator={<NavigateNextIcon fontSize="small" />}
      sx={{ fontSize: isMobile ? "0.813rem" : "0.875rem" }}
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
      <Typography variant="body2" color="text.primary" fontWeight={500}>
        Reporte General de Asistencias
      </Typography>
    </Breadcrumbs>
  );

  return (
    <Card
      elevation={1}
      sx={{
        borderRadius: 3,
        mb: 3,
        borderLeft: mode === "dark" ? "none" : "6px solid",
        borderColor: "primary.main",
      }}
    >
      <CardContent sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2.5, sm: 3 } }}>
        {isMobile ? (
          <Stack spacing={2}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
              spacing={1}
            >
              <Box flex={1}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Reporte General de Asistencias
                </Typography>
                {date && (
                  <Chip
                    label={format(
                      new Date(date + "T00:00:00"),
                      "d 'de' MMMM 'de' yyyy",
                      { locale: es },
                    )}
                    size="small"
                    sx={{
                      //bgcolor: "rgba(255,255,255,0.2)",
                      //color: "white",
                      fontWeight: 500,
                    }}
                  />
                )}
              </Box>
            </Stack>
            {/* <Box sx={{ "& a, & p": { color: "rgba(255,255,255,0.9)" } }}>
              {breadcrumbs}
            </Box> */}
          </Stack>
        ) : (
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Box>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                Reporte General de Asistencias
              </Typography>
              {date && (
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  📅{" "}
                  {format(
                    new Date(date + "T00:00:00"),
                    "EEEE, d 'de' MMMM 'de' yyyy",
                    { locale: es },
                  )}
                </Typography>
              )}
            </Box>
            <Box /*sx={{ "& a, & p": { color: "rgba(255,255,255,0.9)" } }}*/>
              {breadcrumbs}
            </Box>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
});

PageHeader.displayName = "PageHeader";

// Componente de Filtros memoizado
const FiltersCard = memo(
  ({
    search,
    scheduleId,
    status,
    dateFrom,
    dateTo,
    schedules,
    onSearchChange,
    onScheduleChange,
    onStatusChange,
    onDateFromChange,
    onDateToChange,
    onClearFilters,
    onChangeViewMode,
    viewMode,
    /*totalRecords,
    currentRecords,
    loading,*/
    records,
    date,
    isMobile,
    error,
  }) => {
    const handleViewModeChange = useCallback((event, newMode) => {
      // Si el usuario hace click en el modo ya seleccionado, newMode sera null, entonces no cambiar el modo de vista
      if (newMode !== null) {
        //setViewMode(newMode);
        onChangeViewMode(newMode);
      }
    }, []);

    return (
      <Card
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ mb: 2.5 }}
          >
            <FilterListIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Filtros
            </Typography>
          </Stack>

          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <Grid container spacing={2}>
              {/* Búsqueda */}
              <Grid size={{ xs: 12, md: viewMode === "table" ? 3.5 : 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Buscar"
                  placeholder="Nombres, Apellidos o DNI"
                  value={search}
                  onChange={onSearchChange}
                  slotProps={{
                    input: {
                      style: { fontSize: "0.9rem" },
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="action" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>

              {/* Filtro por turno */}
              <Grid
                size={{ xs: 12, sm: 6, md: viewMode === "table" ? 2.25 : 3 }}
              >
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ fontSize: "0.9rem" }}>Turno</InputLabel>
                  <SafeSelect
                    value={scheduleId}
                    label="Turno"
                    disabled={schedules.length === 0}
                    onChange={onScheduleChange}
                    MenuProps={{
                      disableScrollLock: true, // Previene que MUI bloquee el scroll
                    }}
                    sx={{ fontSize: "0.9rem" }}
                  >
                    <MenuItem value="" sx={{ fontSize: "0.9rem" }}>
                      <em>Todos los turnos</em>
                    </MenuItem>
                    {schedules.map((schedule) => (
                      <MenuItem
                        key={schedule._id}
                        value={schedule._id}
                        sx={{ fontSize: "0.9rem" }}
                      >
                        {schedule.name}
                      </MenuItem>
                    ))}
                  </SafeSelect>
                </FormControl>
              </Grid>

              {/* Filtro por estado */}
              <Grid
                size={{ xs: 12, sm: 6, md: viewMode === "table" ? 2.25 : 3 }}
              >
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ fontSize: "0.9rem" }}>Estado</InputLabel>
                  <SafeSelect
                    value={status}
                    label="Estado"
                    onChange={onStatusChange}
                    sx={{ fontSize: "0.9rem" }}
                  >
                    <MenuItem value="" sx={{ fontSize: "0.9rem" }}>
                      <em>Todos los estados</em>
                    </MenuItem>
                    {STATUS_OPTIONS.map((option) => (
                      <MenuItem
                        key={option.value}
                        value={option.value}
                        sx={{ fontSize: "0.9rem" }}
                      >
                        {option.label}
                      </MenuItem>
                    ))}
                  </SafeSelect>
                </FormControl>
              </Grid>

              {viewMode !== "matrix" && (
                <>
                  {/* Fecha Desde */}
                  <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                    <DatePicker
                      label="Desde"
                      value={dateFrom}
                      onChange={onDateFromChange}
                      slotProps={{
                        textField: {
                          size: "small",
                          fullWidth: true,
                          sx: {
                            "& .MuiPickersOutlinedInput-root": {
                              fontSize: "0.9rem",
                            }, // Texto de la fecha
                          },
                          error: error, // Se pone rojo si el rango está mal
                          helperText: error ? "Rango inválido" : "",
                        },
                      }}
                      format="dd/MM/yyyy"
                    />
                  </Grid>

                  {/* Fecha Hasta */}
                  <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                    <DatePicker
                      label="Hasta"
                      value={dateTo}
                      onChange={onDateToChange}
                      minDate={dateFrom}
                      slotProps={{
                        textField: {
                          size: "small",
                          fullWidth: true,
                          sx: {
                            "& .MuiPickersOutlinedInput-root": {
                              fontSize: "0.9rem",
                            }, // Texto de la fecha
                          },
                          // Se pone rojo si falta o si el rango está mal
                          error: error || (dateFrom && !dateTo),
                          helperText: error
                            ? "Debe ser posterior al inicio"
                            : dateFrom && !dateTo
                              ? "Completa el rango"
                              : "",
                        },
                      }}
                      format="dd/MM/yyyy"
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </LocalizationProvider>

          {/* Información de registros y botones de exportación */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent={"space-between"}
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={2}
            sx={{
              mt: 2.5,
              pt: 2.5,
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <ToggleButtonGroup
              color="primary"
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              size="small"
              sx={{
                "& .MuiToggleButton-root": {
                  px: 2,
                  //py: 1,
                  textTransform: "none",
                  fontWeight: 500,
                },
              }}
            >
              <ToggleButton value="matrix" aria-label="vista diaria">
                <ViewModuleIcon sx={{ mr: 1, fontSize: 20 }} />
                Matriz
              </ToggleButton>
              <ToggleButton value="table" aria-label="vista semanal">
                <ViewDayIcon sx={{ mr: 1, fontSize: 20 }} />
                Tabla
              </ToggleButton>
            </ToggleButtonGroup>
            {/* <Typography
              variant="body2"
              color="text.secondary"
              sx={{ display: { xs: "none", sm: "block" } }}
            >
              {loading ? (
                <Skeleton width={200} />
              ) : (
                <>
                  Mostrando <strong>{currentRecords}</strong> de{" "}
                  <strong>{totalRecords}</strong> registros
                </>
              )}
            </Typography> */}
            {/* <ExportButtons records={records} date={date} isMobile={isMobile} /> */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              <Button
                variant="outlined"
                //size="small"
                startIcon={<ClearIcon />}
                onClick={onClearFilters}
                disabled={
                  !search && !scheduleId && !status && !dateFrom && !dateTo
                }
              >
                Limpiar filtros
              </Button>
              <GeneralReportExportButtons
                records={records}
                date={date}
                isMobile={isMobile}
              />
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    );
  },
);

FiltersCard.displayName = "FiltersCard";

// Componente de Loading
/*const LoadingSkeleton = () => (
  <Card elevation={0} sx={{ borderRadius: 2 }}>
    <CardContent>
      <Stack spacing={2}>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={60} />
        ))}
      </Stack>
    </CardContent>
  </Card>
);*/

const TableSkeleton = () => (
  <Card elevation={0} sx={{ borderRadius: 2 }}>
    <CardContent>
      <Stack spacing={2}>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={55} />
        ))}
      </Stack>
    </CardContent>
  </Card>
);

// Componente Principal
export default function GeneralReportPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { showSuccess, showError } = useSnackbarStore();

  // Estados
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [data, setData] = useState({
    records: [],
    pagination: {
      currentPage: 1,
      totalPages: 0,
      totalRecords: 0,
      recordsPerPage: 10,
    },
    date: "",
  });
  const [dataMatrix, setDataMatrix] = useState({
    users: [],
    dates: [],
    matrix: [],
  });
  const [currentMonth, setCurrentMonth] = useState(new Date());
  //const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingTable, setLoadingTable] = useState(false);
  const [loadingMatrix, setLoadingMatrix] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);

  // Estados de filtros
  const [search, setSearch] = useState("");
  const [scheduleId, setScheduleId] = useState("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState(startOfMonth(new Date()));
  const [dateTo, setDateTo] = useState(endOfMonth(new Date()));
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [schedules, setSchedules] = useState([]);

  // Estado para saber si se esta reseteando los filtros y ajustar el debounce
  const [isResetting, setIsResetting] = useState(false);

  //Mostrar u ocultar los statCards
  const [showSummary, setShowSummary] = useState(true);

  //Vista modo matriz o tabla
  const [viewMode, setViewMode] = useState("matrix");

  //Estado para cachear data
  const [matrixCache, setMatrixCache] = useState({});

  //Estado para animación suave entre meses de la matriz
  const [fadeKey, setFadeKey] = useState(0);

  // Asignar key para cada mes que sera almacenado en cache
  const monthKey = useMemo(
    () => format(currentMonth, "yyyy-MM"),
    [currentMonth],
  );

  // Validar rango de fechas
  // Validación de fechas
  const isDateRangeComplete = dateFrom !== null && dateTo !== null;
  const isRangeValid = isDateRangeComplete && dateFrom <= dateTo;

  // Función para filtrar la matriz localmente
  const filterMatrixData = useCallback((matrixData, filters) => {
    const { search, scheduleId, status } = filters;

    // Si no hay filtros, retornar data original
    if (!search && !scheduleId && !status) {
      return matrixData;
    }

    let filteredUsers = [...matrixData.users];
    let filteredMatrix = { ...matrixData.matrix };

    // Filtro por búsqueda (nombre completo o DNI)
    if (search) {
      const searchLower = search.toLowerCase();
      const matchedUserIds = new Set();

      filteredUsers = filteredUsers.filter((user) => {
        const matchesSearch =
          user.fullName?.toLowerCase().includes(searchLower) ||
          user.dni?.includes(search);

        if (matchesSearch) {
          matchedUserIds.add(user.id);
        }
        return matchesSearch;
      });

      // Filtrar la matriz por usuarios que coinciden con la búsqueda
      filteredMatrix = Object.keys(filteredMatrix)
        .filter((userId) => matchedUserIds.has(userId))
        .reduce((acc, userId) => {
          acc[userId] = filteredMatrix[userId];
          return acc;
        }, {});
    }

    // Filtro por scheduleId
    if (scheduleId) {
      const newMatrix = {};

      Object.keys(filteredMatrix).forEach((userId) => {
        const userDates = filteredMatrix[userId];
        const filteredUserDates = {};

        Object.keys(userDates).forEach((date) => {
          const shifts = userDates[date];
          const filteredShifts = shifts.filter(
            (shift) => shift.scheduleId === scheduleId,
          );

          if (filteredShifts.length > 0) {
            filteredUserDates[date] = filteredShifts;
          }
        });

        // Solo incluir usuario si tiene al menos un shift del horario filtrado
        if (Object.keys(filteredUserDates).length > 0) {
          newMatrix[userId] = filteredUserDates;
        }
      });

      filteredMatrix = newMatrix;

      // Actualizar lista de usuarios según matriz filtrada
      const remainingUserIds = new Set(Object.keys(filteredMatrix));
      filteredUsers = filteredUsers.filter((user) =>
        remainingUserIds.has(user.id),
      );
    }

    // Filtro por status
    if (status) {
      const newMatrix = {};

      Object.keys(filteredMatrix).forEach((userId) => {
        const userDates = filteredMatrix[userId];
        const filteredUserDates = {};

        Object.keys(userDates).forEach((date) => {
          const shifts = userDates[date];
          const filteredShifts = shifts.filter(
            (shift) => shift.shiftStatus === status,
          );

          if (filteredShifts.length > 0) {
            filteredUserDates[date] = filteredShifts;
          }
        });

        // Solo incluir usuario si tiene al menos un shift con el status filtrado
        if (Object.keys(filteredUserDates).length > 0) {
          newMatrix[userId] = filteredUserDates;
        }
      });

      filteredMatrix = newMatrix;

      // Actualizar lista de usuarios según matriz filtrada
      const remainingUserIds = new Set(Object.keys(filteredMatrix));
      filteredUsers = filteredUsers.filter((user) =>
        remainingUserIds.has(user.id),
      );
    }

    return {
      users: filteredUsers,
      dates: matrixData.dates, // Se mantiene todas las fechas
      matrix: filteredMatrix,
      stats: matrixData.stats, // Se esta manteniendo los stats del mes actual, si se requiere stats del filtrado, recalcular.
    };
  }, []);

  // Fetch de datos
  const fetchData = useCallback(async () => {
    setError(null);

    if (viewMode === "table") setLoadingTable(true);

    // Revisar cache SOLO para matrix
    if (viewMode === "matrix" && matrixCache[monthKey]) {
      const cachedData = matrixCache[monthKey];

      // Aplicar filtros a la data cacheada
      const filteredData = filterMatrixData(cachedData, {
        search,
        scheduleId,
        status,
      });

      setDataMatrix(filteredData);
      setLoadingMatrix(false);
      setLoadingStats(false);
      return;
    }

    // Revisar para vista tabla si el rango de fechas es null
    if (viewMode === "table" && (!dateFrom || !dateTo)) {
      setData({
        records: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalRecords: 0,
          recordsPerPage: 10,
        },
        date: "",
      });
      setLoadingTable(false);
      setLoadingStats(false);
      return;
    }

    try {
      const startDate = startOfMonth(currentMonth);
      const endDate = endOfMonth(currentMonth);

      const params = new URLSearchParams({
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(endDate, "yyyy-MM-dd"),
      });

      if (viewMode === "table") {
        params.append("page", (page + 1).toString());
        params.append("limit", rowsPerPage.toString());
      }

      if (viewMode === "matrix") params.append("view", "matrix");

      if (search) params.append("search", search);
      if (scheduleId) params.append("scheduleId", scheduleId);
      if (status) params.append("status", status);

      if (dateFrom && viewMode === "table")
        params.set("startDate", format(dateFrom, "yyyy-MM-dd"));
      if (dateTo && viewMode === "table")
        params.set("endDate", format(dateTo, "yyyy-MM-dd"));

      const response = await getGeneralReport(params);

      if (viewMode === "matrix") {
        if (viewMode === "matrix") {
          // Guardar en cache SOLO la data sin filtrar
          setMatrixCache((prev) => ({
            ...prev,
            [monthKey]: response,
          }));

          setDataMatrix(response);
        }
      }
      //setDataMatrix(response);

      if (viewMode === "table") setData(response);
    } catch (err) {
      setError(err.message);
    } finally {
      //setLoading(false);
      setLoadingStats(false);
      if (viewMode === "table") setLoadingTable(false);
      if (viewMode === "matrix") setLoadingMatrix(false);
    }
  }, [
    search,
    currentMonth,
    scheduleId,
    status,
    dateFrom,
    dateTo,
    page,
    rowsPerPage,
    viewMode,
    matrixCache,
    monthKey,
    filterMatrixData,
  ]);

  // Fetch de turnos
  const fetchSchedules = useCallback(async () => {
    try {
      const response = await getSchedules();
      setSchedules(response);
    } catch (err) {
      console.error("Error al cargar turnos:", err);
    }
  }, []);

  // Efectos
  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  useEffect(() => {
    const isReset = dateFrom === null && dateTo === null;
    // BLOQUEO: Si el rango no está completo o es inválido,
    // no hacemos nada, ignorando el cambio de fetchData por ahora.
    if (
      viewMode === "table" &&
      !isReset &&
      (!isDateRangeComplete || !isRangeValid)
    ) {
      return;
    }
    // Si pasó la validación, activamos el loading de stats y el debouncing
    setLoadingStats(true);
    const timeout = isResetting ? 50 : 700; // Si resetea, ejecución inmediata (0ms)

    const handler = setTimeout(() => {
      fetchData();
      setIsResetting(false); // Apagamos la bandera después de ejecutar
    }, timeout);

    // Limpieza: si fetchData cambia antes de los 600ms, cancelamos el anterior
    return () => clearTimeout(handler);
  }, [fetchData, isDateRangeComplete, isRangeValid, dateFrom, dateTo]);

  useEffect(() => {
    if (viewMode === "table") {
      //setDateFrom(startOfMonth(new Date()));
      //setDateTo(endOfMonth(new Date()));
      setLoadingTable(true);
    }

    if (viewMode === "matrix") {
      setLoadingMatrix(true);
      handleClearFilters();
    }
  }, [viewMode]);

  //Solo para cambio del mes en vista matriz
  //useLayoutEffect para sincronización inmediata
  useLayoutEffect(() => {
    if (viewMode === "matrix") {
      const cacheKey = format(currentMonth, "yyyy-MM");

      if (matrixCache[cacheKey]) {
        setDataMatrix(matrixCache[cacheKey]);
        setFadeKey((prev) => prev + 1);
      } else {
        setLoadingMatrix(true);
      }
    }
  }, [currentMonth, viewMode, matrixCache]);

  /*---------- Funciones Auxiliares --------------*/

  /*---------- Handlers --------------*/

  // Handlers memoizados
  const handleSearchChange = useCallback((event) => {
    setSearch(event.target.value);
    setPage(0);
  }, []);

  const handleScheduleChange = useCallback((event) => {
    setScheduleId(event.target.value);
    setPage(0);
  }, []);

  const handleStatusChange = useCallback((event) => {
    setStatus(event.target.value);
    setPage(0);
  }, []);

  const handleDateFromChange = useCallback((newValue) => {
    setDateFrom(newValue);
    setPage(0);
  }, []);

  const handleDateToChange = useCallback((newValue) => {
    setDateTo(newValue);
    setPage(0);
  }, []);

  const handleChangePage = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const handleMonthChange = useCallback((newMonth) => {
    setCurrentMonth(newMonth);
  }, []);

  const handleChangeViewMode = useCallback((newValue) => {
    setViewMode(newValue);
    //setPage(0);
  }, []);

  // Manejar justificación
  const handleJustify = useCallback(async (data) => {
    try {
      const formattedData = {
        userId: data.userId,
        scheduleId: data.scheduleId,
        date: format(parseISO(data.date), "yyyy-MM-dd"),
        reason: data.reason,
      };

      const response = await createJustification(formattedData);

      if (response.data?.success) {
        showSuccess(
          response?.data?.message || "Justificación creada correctamente",
        );

        fetchData();
        // Mostrar notificación de éxito (puedes usar Snackbar)
        console.log(data);
      }
    } catch (error) {
      throw error; // El drawer manejará el error
    }
  }, []);

  // Abrir drawer con registro seleccionado
  /*const handleOpenDrawer = (record) => {
    setSelectedRecord(record);
    setDrawerOpen(true);
  };*/

  // Cerrar drawer
  const handleCloseDrawer = () => {
    //setDrawerOpen(false);
    setTimeout(() => setSelectedRecord(null), 300); // Delay para animación
  };

  const handleClearFilters = useCallback(() => {
    setIsResetting(true); // Bandera para indicar reseteo de filtros
    setSearch("");
    setScheduleId("");
    setStatus("");
    setDateFrom(null);
    setDateTo(null);
    setPage(0);
  }, []);

  const hasRecords = data.records.length > 0;

  // Estado de carga inicial
  /*if (loading) {
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
  }*/

  return (
    <Box sx={{ width: "100%" }}>
      {/* Header */}
      <PageHeader date={data.date} isMobile={isMobile} />
      {/* Resumen - Oculto en mobile */}
      {!isMobile && (
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 1,
              cursor: "pointer",
              bgcolor: theme.palette.background.paper,
              px: 2,
              py: 1,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
            }}
            onClick={() => setShowSummary(!showSummary)}
          >
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Resumen Estadístico
            </Typography>
            <IconButton size="small">
              {showSummary ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>

          <Collapse in={showSummary} timeout={300}>
            <SummaryCards
              data={viewMode === "matrix" ? dataMatrix.stats : data.stats}
              isLoading={loadingStats}
            />
          </Collapse>
        </Box>
      )}

      {/* Filtros */}
      <FiltersCard
        search={search}
        scheduleId={scheduleId}
        status={status}
        dateFrom={dateFrom}
        dateTo={dateTo}
        schedules={schedules}
        onSearchChange={handleSearchChange}
        onScheduleChange={handleScheduleChange}
        onStatusChange={handleStatusChange}
        onDateFromChange={handleDateFromChange}
        onDateToChange={handleDateToChange}
        onClearFilters={handleClearFilters}
        onChangeViewMode={handleChangeViewMode}
        viewMode={viewMode}
        totalRecords={data.pagination.totalRecords}
        currentRecords={data.records.length}
        //loading={loading}
        loading={viewMode === "matrix" ? loadingMatrix : loadingTable}
        records={data.records}
        date={data.date}
        isMobile={isMobile}
      />
      {/* Error */}
      {error && (
        <Fade in>
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        </Fade>
      )}
      {/* Contenido */}

      {/* <Fade in timeout={500}> */}
      <Card
        sx={{
          borderRadius: isMobile ? 2 : 3,
          boxShadow: theme.shadows[1],
          overflow: "hidden",
        }}
      >
        {/* TABLE */}
        {viewMode === "table" &&
          (loadingTable ? (
            <TableSkeleton />
          ) : (
            <Fade in timeout={500}>
              <div>
                <GeneralReportTable
                  attendances={data.records}
                  setSelectedRecord={setSelectedRecord}
                />
              </div>
            </Fade>
          ))}

        {/* MATRIX */}
        {viewMode === "matrix" && (
          <TimelineMatrix
            users={dataMatrix.users}
            dates={dataMatrix.dates}
            matrix={dataMatrix.matrix}
            granularity="day"
            setSelectedShift={setSelectedRecord}
            currentMonth={currentMonth}
            onMonthChange={handleMonthChange}
            loadingMatrix={loadingMatrix}
            fadeKey={fadeKey}
          />
        )}

        {/* Paginación */}
        {hasRecords && viewMode === "table" && (
          <>
            <Divider />
            <SafeTablePagination
              component="div"
              count={data.pagination.totalRecords}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
              labelRowsPerPage={isMobile ? "Filas:" : "Filas por página:"}
              labelDisplayedRows={({ from, to, count }) =>
                isMobile
                  ? `${from}-${to} de ${count}`
                  : `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
              }
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
          </>
        )}
      </Card>
      {/* </Fade> */}
      {/* Drawer de detalles de asistencia */}
      <AttendanceDrawer
        open={Boolean(selectedRecord)}
        record={selectedRecord}
        onClose={handleCloseDrawer}
        onJustify={handleJustify}
      />
    </Box>
  );
}

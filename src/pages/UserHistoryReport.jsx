import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  TablePagination,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  ButtonGroup,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Search as SearchIcon,
  FilterListOff,
  CalendarMonth,
  TableChart,
} from "@mui/icons-material";
import { getUserHistoryReport } from "../services/reportService";
import { getSchedules } from "../services/scheduleService";
import UserReportTable from "../components/Reports/UserReport/UserReportTable";
import SummaryCards from "../components/Reports/DailyReport/SummaryCards";
import UserReportExportButtons from "../components/Reports/UserReport/UserReportExportButtons";
import AttendanceCalendarView from "../components/Reports/UserReport/AttendanceCalendarView";

// Opciones de estado para el filtro
const STATUS_OPTIONS = [
  { value: "", label: "Todos los estados" },
  { value: "complete", label: "Completo" },
  { value: "late", label: "Tardanza" },
  { value: "early_leave", label: "Salida temprana" },
  { value: "late_and_early_leave", label: "Tardanza y salida temprana" },
  { value: "incomplete_no_entry", label: "Sin entrada" },
  { value: "incomplete_no_exit", label: "Sin salida" },
  { value: "absent", label: "Ausente" },
  { value: "justified", label: "Justificado" },
];

// Componente principal
export default function UserHistoryReport() {
  // Estados principales
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [data, setData] = useState({
    records: [],
    pagination: {
      currentPage: 1,
      totalPages: 0,
      totalRecords: 0,
      recordsPerPage: 10,
    },
    dateRange: { startDate: "", endDate: "" },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados de filtros
  const [search, setSearch] = useState("");
  const [scheduleId, setScheduleId] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Estado para vista (calendario o tabla)
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' o 'table'

  // Estados para los turnos disponibles
  const [schedules, setSchedules] = useState([]);

  // Función para obtener los datos
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Construir query params
      const params = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString(),
      });

      if (search) params.append("search", search);
      if (scheduleId) params.append("scheduleId", scheduleId);
      if (status) params.append("status", status);

      // Agregar fechas si están seleccionadas
      if (startDate) {
        params.append("startDate", format(startDate, "yyyy-MM-dd"));
      }
      if (endDate) {
        params.append("endDate", format(endDate, "yyyy-MM-dd"));
      }

      const response = await getUserHistoryReport(params);
      setData(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, scheduleId, status, startDate, endDate, page, rowsPerPage]);

  // Función para obtener los turnos disponibles
  const fetchSchedules = async () => {
    try {
      const response = await getSchedules();
      setSchedules(response);
    } catch (err) {
      console.error("Error al cargar turnos:", err);
    }
  };

  // Efecto para cargar turnos al montar
  useEffect(() => {
    fetchSchedules();
  }, []);

  // Efecto para cargar datos cuando cambien los filtros
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchData();
    }, 500); // Debounce de 500ms para la búsqueda

    return () => clearTimeout(timeoutId);
  }, [fetchData]);

  // Handlers
  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(0);
  };

  const handleScheduleChange = (event) => {
    setScheduleId(event.target.value);
    setPage(0);
  };

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
    setPage(0);
  };

  const handleStartDateChange = (newDate) => {
    setStartDate(newDate);
    setPage(0);
  };

  const handleEndDateChange = (newDate) => {
    setEndDate(newDate);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setScheduleId("");
    setStatus("");
    setStartDate(null);
    setEndDate(null);
    setPage(0);
  };

  const setDatePreset = (preset) => {
    const today = new Date();
    const end = new Date(today);

    switch (preset) {
      case "today":
        setStartDate(today);
        setEndDate(today);
        break;
      case "week":
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - 7);
        setStartDate(weekStart);
        setEndDate(today);
        break;
      case "month":
        const monthStart = new Date(today);
        monthStart.setDate(1);
        setStartDate(monthStart);
        setEndDate(today);
        break;
    }
  };

  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
        <Box sx={{ p: 3 }}>
          {/* Encabezado */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" gutterBottom>
              Reporte de Asistencias por Usuario
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {startDate &&
                endDate &&
                `Período: ${format(startDate, "d 'de' MMMM", {
                  locale: es,
                })} - ${format(endDate, "d 'de' MMMM 'de' yyyy", {
                  locale: es,
                })}`}
            </Typography>
          </Box>

          {/* Resumen */}
          <SummaryCards data={data} />

          {/* Filtros */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <ButtonGroup size="small" sx={{ mb: 1 }} color="secondary">
                  <Button onClick={() => setDatePreset("today")}>Hoy</Button>
                  <Button onClick={() => setDatePreset("week")}>
                    Última semana
                  </Button>
                  <Button onClick={() => setDatePreset("month")}>
                    Este mes
                  </Button>
                </ButtonGroup>
              </Grid>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {/* Búsqueda */}
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    label="Buscar"
                    size="small"
                    placeholder="Nombre, apellido o DNI"
                    value={search}
                    onChange={handleSearchChange}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Grid>

                {/* Fecha inicio */}
                <Grid size={{ xs: 12, md: 2.25 }}>
                  <DatePicker
                    label="Fecha inicio"
                    value={startDate}
                    onChange={handleStartDateChange}
                    maxDate={endDate || undefined}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: "small",
                      },
                      field: {
                        clearable: true,
                      },
                    }}
                  />
                </Grid>

                {/* Fecha fin */}
                <Grid size={{ xs: 12, md: 2.25 }}>
                  <DatePicker
                    label="Fecha fin"
                    value={endDate}
                    onChange={handleEndDateChange}
                    minDate={startDate || undefined}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: "small",
                      },
                      field: {
                        clearable: true,
                      },
                    }}
                  />
                </Grid>

                {/* Filtro por turno */}
                <Grid size={{ xs: 12, md: 2.25 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Turno</InputLabel>
                    <Select
                      value={scheduleId}
                      label="Turno"
                      onChange={handleScheduleChange}
                    >
                      <MenuItem value="">Todos los turnos</MenuItem>
                      {schedules.map((schedule) => (
                        <MenuItem key={schedule._id} value={schedule._id}>
                          {schedule.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Filtro por estado */}
                <Grid size={{ xs: 12, md: 2.25 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Estado</InputLabel>
                    <Select
                      value={status}
                      label="Estado"
                      onChange={handleStatusChange}
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                {/* <Grid size={{ xs: 12, md: 6 }}>
                  {// Resumen de registros}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {loading
                        ? "Cargando..."
                        : `Mostrando ${data.records.length} de ${data.pagination.totalRecords} registros`}
                    </Typography>
                  </Box>
                </Grid> */}
                {/* Controles adicionales */}
                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {loading
                      ? "Cargando..."
                      : `Mostrando ${data.records.length} de ${data.pagination.totalRecords} registros`}
                  </Typography>

                  {/* Toggle entre vista calendario y tabla */}
                  <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={handleViewModeChange}
                    size="small"
                  >
                    <ToggleButton value="calendar">
                      <CalendarMonth sx={{ mr: 1 }} />
                      Calendario
                    </ToggleButton>
                    <ToggleButton value="table">
                      <TableChart sx={{ mr: 1 }} />
                      Tabla
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>
                <Grid
                  size={{ xs: 12, md: 6 }}
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                  }}
                >
                  <Button
                    variant="outlined"
                    startIcon={<FilterListOff />}
                    onClick={handleClearFilters}
                    sx={{ mr: 2 }}
                  >
                    Limpiar Filtros
                  </Button>
                  {/* Botones de exportación */}
                  <UserReportExportButtons
                    records={data.records}
                    dateRange={data.dateRange}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Mensajes de error */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Contenido según vista seleccionada */}
          {/* Tabla */}
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Vista de Calendario */}
              {viewMode === "calendar" && (
                <AttendanceCalendarView records={data.records} />
              )}

              {/* Vista de Tabla */}
              {viewMode === "table" && (
                <>
                  <UserReportTable
                    attendances={data.records}
                    setSelectedRecord={setSelectedRecord}
                  />

                  {/* Paginación */}
                  <TablePagination
                    component="div"
                    count={data.pagination.totalRecords}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25, 50, 100]}
                    labelRowsPerPage="Filas por página:"
                    labelDisplayedRows={({ from, to, count }) =>
                      `${from}-${to} de ${
                        count !== -1 ? count : `más de ${to}`
                      }`
                    }
                  />
                </>
              )}
            </>
          )}
        </Box>
        <Dialog
          open={Boolean(selectedRecord)}
          onClose={() => setSelectedRecord(null)}
        >
          <DialogTitle>Detalles de Asistencia</DialogTitle>
          <DialogContent dividers>
            {/* Mostrar más detalles del registro */}
            <Typography>
              Dispositivo: {selectedRecord?.checkIn?.device?.name}
            </Typography>
            <Typography>
              Justificación: {selectedRecord?.justification}
            </Typography>
            <Typography>Notas: {selectedRecord?.checkIn?.notes}</Typography>
          </DialogContent>
        </Dialog>
      </LocalizationProvider>
    </>
  );
}

// pages/AttendanceMatrixPage.jsx
// Página principal que integra TimelineMatrix con filtros y selector de granularidad
import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  Button,
  Stack,
  CircularProgress,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  CalendarToday,
  ViewDay,
  ViewWeek,
  CalendarMonth,
  Refresh,
  FilterList,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { es } from "date-fns/locale";
import { format, subDays } from "date-fns";
//import TimelineMatrix from "../components/TimelineMatrix";
//import { useAttendanceMatrix } from "../hooks/useAttendanceMatrix";
import { getGeneralReport } from "../services/reportService";
import { getSchedules } from "../services/scheduleService";
import TimelineMatrix from "../components/Reports/GeneralReport/TimeLineMatrix";
import useAttendanceMatrix from "../hooks/useAttendaceMatrix";

const AttendanceMatrixPage = () => {
  // Estados
  const [granularity, setGranularity] = useState("daily");
  const [startDate, setStartDate] = useState(subDays(new Date(), 7));
  const [endDate, setEndDate] = useState(new Date());
  const [scheduleFilter, setScheduleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [schedules, setSchedules] = useState([]);

  // Transformar datos usando el hook
  const matrixData = useAttendanceMatrix(attendanceRecords, granularity);

  // Cargar horarios disponibles
  useEffect(() => {
    fetchSchedules();
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    fetchAttendanceData();
  }, [startDate, endDate, scheduleFilter, statusFilter]);

  // Fetch schedules
  const fetchSchedules = async () => {
    try {
      const response = await getSchedules();
      console.log(response);
      setSchedules(response);
    } catch (err) {
      console.error("Error fetching schedules:", err);
    }
  };

  // Fetch attendance data
  const fetchAttendanceData = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(endDate, "yyyy-MM-dd"),
        page: 1,
        limit: 1000, // Cargar todos los registros para la matriz
      });

      if (scheduleFilter) params.append("scheduleId", scheduleFilter);
      if (statusFilter) params.append("status", statusFilter);
      if (searchQuery) params.append("search", searchQuery);

      const response = await getGeneralReport(params);
      console.log(response)
      setAttendanceRecords(response.records || []);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching attendance data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handler para cambiar granularidad
  const handleGranularityChange = (event, newGranularity) => {
    if (newGranularity !== null) {
      setGranularity(newGranularity);
    }
  };

  // Handler para justificar asistencia
  const handleJustify = async (justificationData) => {
    try {
      const response = await fetch("/api/attendance/justify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(justificationData),
      });

      if (!response.ok) throw new Error("Error al enviar justificación");

      // Recargar datos
      await fetchAttendanceData();
      return true;
    } catch (err) {
      throw new Error(err.message || "Error al justificar asistencia");
    }
  };

  // Handler para refrescar datos
  const handleRefresh = () => {
    fetchAttendanceData();
  };

  // Handler para limpiar filtros
  const handleClearFilters = () => {
    setScheduleFilter("");
    setStatusFilter("");
    setSearchQuery("");
    setStartDate(subDays(new Date(), 7));
    setEndDate(new Date());
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Matriz de Asistencias
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Visualiza las asistencias de todos los usuarios en un formato de
            matriz interactiva
          </Typography>
        </Box>

        {/* Filtros y Controles */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Stack spacing={3}>
            {/* Selector de Granularidad */}
            <Box>
              <Typography variant="subtitle2" gutterBottom sx={{ mb: 1 }}>
                Vista de Granularidad:
              </Typography>
              <ToggleButtonGroup
                value={granularity}
                exclusive
                onChange={handleGranularityChange}
                aria-label="granularity"
                fullWidth
                sx={{
                  "& .MuiToggleButton-root": {
                    py: 1.5,
                  },
                }}
              >
                <ToggleButton value="daily" aria-label="daily">
                  <ViewDay sx={{ mr: 1 }} />
                  Diaria
                </ToggleButton>
                <ToggleButton value="weekly" aria-label="weekly">
                  <ViewWeek sx={{ mr: 1 }} />
                  Semanal
                </ToggleButton>
                <ToggleButton value="monthly" aria-label="monthly">
                  <CalendarMonth sx={{ mr: 1 }} />
                  Mensual
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* Rango de Fechas */}
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <DatePicker
                label="Fecha Inicio"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                  },
                }}
              />
              <DatePicker
                label="Fecha Fin"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                minDate={startDate}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                  },
                }}
              />
            </Stack>

            {/* Filtros Adicionales */}
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                label="Buscar Usuario"
                placeholder="Nombre o DNI"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="small"
                fullWidth
              />

              <FormControl fullWidth size="small">
                <InputLabel>Horario</InputLabel>
                <Select
                  value={scheduleFilter}
                  label="Horario"
                  onChange={(e) => setScheduleFilter(e.target.value)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {schedules.map((schedule) => (
                    <MenuItem key={schedule._id} value={schedule._id}>
                      {schedule.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Estado</InputLabel>
                <Select
                  value={statusFilter}
                  label="Estado"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="on_time">A Tiempo</MenuItem>
                  <MenuItem value="late">Tardanza</MenuItem>
                  <MenuItem value="early_exit">Salida Anticipada</MenuItem>
                  <MenuItem value="incomplete">Incompleto</MenuItem>
                  <MenuItem value="absent">Ausente</MenuItem>
                  <MenuItem value="justified">Justificado</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            {/* Botones de Acción */}
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={handleClearFilters}
              >
                Limpiar Filtros
              </Button>
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={handleRefresh}
                disabled={loading}
              >
                {loading ? "Cargando..." : "Actualizar"}
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Statistics */}
        {matrixData.metadata && (
          <Paper sx={{ p: 2, mb: 3 }}>
            <Stack direction="row" spacing={4}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Total Usuarios
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {matrixData.metadata.totalUsers}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Rango de Fechas
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {matrixData.metadata.totalDates} días
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Vista Actual
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {granularity === "daily"
                    ? "Diaria"
                    : granularity === "weekly"
                      ? "Semanal"
                      : "Mensual"}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        )}

        {/* Timeline Matrix */}
        <TimelineMatrix
          matrixData={matrixData}
          granularity={granularity}
          onJustify={handleJustify}
          loading={loading}
        />
      </Container>
    </LocalizationProvider>
  );
};

export default AttendanceMatrixPage;

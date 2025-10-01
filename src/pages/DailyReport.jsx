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
} from "@mui/material";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Search as SearchIcon } from "@mui/icons-material";
import DailyReportTable from "../components/Reports/DailyReport/DailyReportTable";
import { getDailyReport } from "../services/reportService";
import { getSchedules } from "../services/scheduleService";
import SummaryCards from "../components/Reports/DailyReport/SummaryCards";
import DailyReportExportButtons from "../components/Reports/DailyReport/DailyReportExportButtons";

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
export default function DailyReportPage() {
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados de filtros
  const [search, setSearch] = useState("");
  const [scheduleId, setScheduleId] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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

      /*const response = await fetch(
        `http://localhost:4000/reports/daily?${params}`
      );*/
      const response = await getDailyReport(params);
      setData(response);

      /*if (!response.ok) {
        throw new Error("Error al obtener los datos");
      }*/

      /*const result = await response.json();
      setData(result);*/
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, scheduleId, status, page, rowsPerPage]);

  // Función para obtener los turnos disponibles
  const fetchSchedules = async () => {
    try {
      /*const response = await fetch("http://localhost:4000/schedules");
      if (response.ok) {
        const scheduleData = await response.json();
        setSchedules(scheduleData);
      }*/
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
    setPage(0); // Resetear a la primera página
  };

  const handleScheduleChange = (event) => {
    setScheduleId(event.target.value);
    setPage(0);
  };

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <>
      <Box sx={{ p: 3 }}>
        {/* Encabezado */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Reporte Diario de Asistencias
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {data.date &&
              `Fecha: ${format(new Date(data.date), "d 'de' MMMM 'de' yyyy", {
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
              {/* Búsqueda */}
              <Grid size={{ xs: 12, md: 6 }}>
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

              {/* Filtro por turno */}
              <Grid size={{ xs: 12, md: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Turno</InputLabel>
                  <Select
                    value={scheduleId}
                    label="Turno"
                    size="small"
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
              <Grid size={{ xs: 12, md: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={status}
                    label="Estado"
                    size="small"
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
              <Grid size={{ xs: 12, md: 6 }}>
                {/* Resumen de registros */}
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {loading
                      ? "Cargando..."
                      : `Mostrando ${data.records.length} de ${data.pagination.totalRecords} registros`}
                  </Typography>
                </Box>
              </Grid>
              <Grid
                size={{ xs: 12, md: 6 }}
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                }}
              >
                {/* Botones de exportación */}
                <DailyReportExportButtons
                  records={data.records}
                  date={data.date}
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

        {/* Tabla */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Tabla de asistencias */}
            <DailyReportTable
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
                `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
              }
            />
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
    </>
  );
}

import { useState, useEffect, useCallback, memo } from "react";
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
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { es } from "date-fns/locale";
import { endOfMonth, format, startOfMonth } from "date-fns";
import HomeIcon from "@mui/icons-material/Home";
import {
  Search as SearchIcon,
  NavigateNext as NavigateNextIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";

import { getGeneralReport } from "../services/reportService";
import { getSchedules } from "../services/scheduleService";
import SummaryCards from "../components/Reports/DailyReport/SummaryCards";
//import AttendanceDetailDialog from "../components/Reports/DailyReport/AttendanceDetailDialog";
/*import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";*/
import "jspdf-autotable";
//import GeneralReportTable from "../components/Reports/GeneralReport/GeneralReportTable";
import GeneralReportExportButtons from "../components/Reports/GeneralReport/GeneralReportExportButtons";
import { SafeSelect } from "../components/common/SafeSelect";
import { SafeTablePagination } from "../components/common/SafeTablePagination";
import { useThemeMode } from "../contexts/ThemeContext";
import AttendanceDrawer from "../components/Reports/GeneralReport/AttendanceDrawer";
//import AttendanceMatrixPage from "./AttendanceMatrixPage";
import TimelineMatrix from "../components/Reports/GeneralReport/TimeLineMatrix";

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
    totalRecords,
    currentRecords,
    loading,
    records,
    date,
    isMobile,
  }) => {
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
              <Grid size={{ xs: 12, md: 3.5 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Buscar"
                  placeholder="Nombre, apellido o DNI"
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
              <Grid size={{ xs: 12, sm: 6, md: 2.25 }}>
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
              <Grid size={{ xs: 12, sm: 6, md: 2.25 }}>
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
                    },
                  }}
                  format="dd/MM/yyyy"
                />
              </Grid>
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
              value={"web"}
              exclusive
              //onChange={handleChange}
              aria-label="Platform"
            >
              <ToggleButton value="web">Web</ToggleButton>
              <ToggleButton value="android">Android</ToggleButton>
              <ToggleButton value="ios">iOS</ToggleButton>
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
const LoadingSkeleton = () => (
  <Card elevation={0} sx={{ borderRadius: 2 }}>
    <CardContent>
      <Stack spacing={2}>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={60} />
        ))}
      </Stack>
    </CardContent>
  </Card>
);

// Componente Principal
export default function GeneralReportPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados de filtros
  const [search, setSearch] = useState("");
  const [scheduleId, setScheduleId] = useState("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    fetchData();
  }, [currentMonth]);

  // Fetch de datos
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const startDate = startOfMonth(currentMonth);
      const endDate = endOfMonth(currentMonth);

      const params = new URLSearchParams({
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(endDate, "yyyy-MM-dd"),
        page: (page + 1).toString(),
        //limit: rowsPerPage.toString(),
        limit: 10000,
        view: "matrix",
      });

      if (search) params.append("search", search);
      if (scheduleId) params.append("scheduleId", scheduleId);
      if (status) params.append("status", status);
      if (dateFrom) params.append("startDate", format(dateFrom, "yyyy-MM-dd"));
      if (dateTo) params.append("endDate", format(dateTo, "yyyy-MM-dd"));

      const response = await getGeneralReport(params);
      //setData(response);
      setDataMatrix(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, scheduleId, status, dateFrom, dateTo, page, rowsPerPage]);

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
    const timeoutId = setTimeout(fetchData, 300);
    return () => clearTimeout(timeoutId);
  }, [fetchData]);

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

  const handleCloseDialog = useCallback(() => {
    setSelectedRecord(null);
  }, []);

  const handleMonthChange = useCallback((newMonth) => {
    setCurrentMonth(newMonth);
  }, []);

  // Manejar justificación
  const handleJustify = useCallback(async (data) => {
    try {
      /*const response = await fetch("/api/attendance/justifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(justificationData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al enviar justificación");
      }

      // Recargar datos de la tabla
      await fetchAttendanceRecords();*/

      // Mostrar notificación de éxito (puedes usar Snackbar)
      alert("Justificación enviada correctamente");
      console.log(data);
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
    setSearch("");
    setScheduleId("");
    setStatus("");
    setDateFrom(null);
    setDateTo(null);
    setPage(0);
  }, []);

  const hasRecords = data.records.length > 0;

  return (
    <Box sx={{ width: "100%" }}>
      {/* Header */}
      <PageHeader date={data.date} isMobile={isMobile} />

      {/* Resumen - Oculto en mobile */}
      {!isMobile && (
        <Fade in timeout={500}>
          <div>
            <SummaryCards data={data} />
          </div>
        </Fade>
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
        totalRecords={data.pagination.totalRecords}
        currentRecords={data.records.length}
        loading={loading}
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
      {loading ? (
        <LoadingSkeleton />
      ) : (
        <Fade in timeout={500}>
          <Card
            sx={{
              borderRadius: isMobile ? 2 : 3,
              boxShadow: theme.shadows[1],
              overflow: "hidden",
            }}
          >
            {/* Tabla */}
            {/* <GeneralReportTable
              attendances={data.records}
              setSelectedRecord={setSelectedRecord}
            /> */}
            <TimelineMatrix
              users={dataMatrix.users}
              dates={dataMatrix.dates}
              matrix={dataMatrix.matrix}
              granularity={"day"}
              //onJustify={handleJustify}
              setSelectedShift={setSelectedRecord}
              currentMonth={currentMonth}
              onMonthChange={handleMonthChange}
            />

            {/* Paginación */}
            {hasRecords && (
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
                      : `${from}-${to} de ${
                          count !== -1 ? count : `más de ${to}`
                        }`
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
        </Fade>
      )}

      {/* Dialog de detalles */}
      {/* <AttendanceDetailDialog
        open={Boolean(selectedRecord)}
        record={selectedRecord}
        onClose={handleCloseDialog}
      /> */}

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

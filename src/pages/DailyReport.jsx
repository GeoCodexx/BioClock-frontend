import { useState, useEffect, useCallback, useMemo, memo } from "react";
import {
  Box,
  Typography,
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
} from "@mui/material";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Search as SearchIcon,
  HomeOutlined as HomeIcon,
  NavigateNext as NavigateNextIcon,
  FilterList as FilterListIcon,
} from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import DailyReportTable from "../components/Reports/DailyReport/DailyReportTable";
import { getDailyReport } from "../services/reportService";
import { getSchedules } from "../services/scheduleService";
import SummaryCards from "../components/Reports/DailyReport/SummaryCards";
import DailyReportExportButtons from "../components/Reports/DailyReport/DailyReportExportButtons";
import AttendanceDetailDialog from "../components/Reports/DailyReport/AttendanceDetailDialog";
import { SafeSelect } from "../components/common/SafeSelect";
import { SafeTablePagination } from "../components/common/SafeTablePagination";

// Constantes
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

const ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50, 100];

// Componente Header memoizado
const PageHeader = memo(({ date, isMobile }) => {
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
        Reporte Diario
      </Typography>
    </Breadcrumbs>
  );

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        mb: 3,
        border: "1px solid",
        borderColor: "divider",
        /*background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",*/
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
                  Reporte de Asistencias
                </Typography>
                {date && (
                  <Chip
                    label={format(
                      new Date(date + "T00:00:00"),
                      "d 'de' MMMM 'de' yyyy",
                      { locale: es }
                    )}
                    size="small"
                    sx={{
                     /* bgcolor: "rgba(255,255,255,0.2)",
                      color: "white",*/
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
                Reporte de Asistencias Diarias
              </Typography>
              {date && (
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  📅{" "}
                  {format(
                    new Date(date + "T00:00:00"),
                    "EEEE, d 'de' MMMM 'de' yyyy",
                    { locale: es }
                  )}
                </Typography>
              )}
            </Box>
            <Box /*sx={{ "& a, & p": { color: "rgba(255,255,255,0.9)" } }}*/ >
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
    schedules,
    hasRecords,
    onSearchChange,
    onScheduleChange,
    onStatusChange,
    totalRecords,
    currentRecords,
    loading,
    data,
  }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
          {/* Título de sección */}
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

          <Grid container spacing={2}>
            {/* Búsqueda */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Buscar colaborador"
                placeholder="Nombre, apellido o DNI"
                value={search}
                onChange={onSearchChange}
                slotProps={{
                  input: {
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
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Turno</InputLabel>
                <SafeSelect
                  value={scheduleId}
                  label="Turno"
                  disabled={schedules.length === 0}
                  onChange={onScheduleChange}
                >
                  <MenuItem value="">
                    <em>Todos los turnos</em>
                  </MenuItem>
                  {schedules.map((schedule) => (
                    <MenuItem key={schedule._id} value={schedule._id}>
                      {schedule.name}
                    </MenuItem>
                  ))}
                </SafeSelect>
              </FormControl>
            </Grid>

            {/* Filtro por estado */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Estado</InputLabel>
                <SafeSelect
                  value={status}
                  label="Estado"
                  onChange={onStatusChange}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </SafeSelect>
              </FormControl>
            </Grid>
          </Grid>

          {/* Información de registros */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={2}
            sx={{
              mt: 2.5,
              pt: 2.5,
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {loading ? (
                <Skeleton width={200} />
              ) : (
                <>
                  Mostrando <strong>{currentRecords}</strong> de{" "}
                  <strong>{totalRecords}</strong> registros
                </>
              )}
            </Typography>
            <DailyReportExportButtons records={data.records} date={data.date} />
          </Stack>
        </CardContent>
      </Card>
    );
  }
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
export default function DailyReportPage() {
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados de filtros
  const [search, setSearch] = useState("");
  const [scheduleId, setScheduleId] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [schedules, setSchedules] = useState([]);

  // Fetch de datos
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString(),
      });

      if (search) params.append("search", search);
      if (scheduleId) params.append("scheduleId", scheduleId);
      if (status) params.append("status", status);

      const response = await getDailyReport(params);
      setData(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, scheduleId, status, page, rowsPerPage]);

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

  // Valores computados
  const hasRecords = data.records.length > 0;

  return (
    <Box sx={{ width: "100%" /*, px: { xs: 2, sm: 3 }, py: 3*/ }}>
      {/* Header */}
      <PageHeader date={data.date} isMobile={isMobile} />

      {/* Resumen */}
      <Fade in timeout={500}>
        <div>
          <SummaryCards data={data} />
        </div>
      </Fade>

      {/* Filtros */}
      <FiltersCard
        data={data}
        search={search}
        scheduleId={scheduleId}
        status={status}
        schedules={schedules}
        hasRecords={hasRecords}
        onSearchChange={handleSearchChange}
        onScheduleChange={handleScheduleChange}
        onStatusChange={handleStatusChange}
        totalRecords={data.pagination.totalRecords}
        currentRecords={data.records.length}
        loading={loading}
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
            <DailyReportTable
              attendances={data.records}
              setSelectedRecord={setSelectedRecord}
            />

            {/* Paginación */}
            {hasRecords && (
              // <Card
              //   elevation={0}
              //   sx={{
              //     mt: 2,
              //     borderRadius: 2,
              //     border: "1px solid",
              //     borderColor: "divider",
              //   }}
              // >
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
                  // labelRowsPerPage="Filas por página:"
                  // labelDisplayedRows={({ from, to, count }) =>
                  //   `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
                  // }
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
                  // sx={{
                  //   ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows":
                  //     {
                  //       mb: 0,
                  //     },
                  // }}
                />
              </>
            )}
          </Card>
        </Fade>
      )}

      {/* Dialog de detalles */}
      <AttendanceDetailDialog
        open={Boolean(selectedRecord)}
        record={selectedRecord}
        onClose={handleCloseDialog}
      />
    </Box>
  );
}

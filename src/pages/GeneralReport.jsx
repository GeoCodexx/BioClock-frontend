import { useState, useEffect, useCallback, memo } from "react";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  TablePagination,
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
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { es } from "date-fns/locale";
import { format } from "date-fns";
import {
  Search as SearchIcon,
  HomeOutlined as HomeIcon,
  NavigateNext as NavigateNextIcon,
  FilterList as FilterListIcon,
  /*Download as DownloadIcon,
  PictureAsPdf as PictureAsPdfIcon,
  FileDownload as FileDownloadIcon,*/
} from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";

import { getGeneralReport } from "../services/reportService";
import { getSchedules } from "../services/scheduleService";
import SummaryCards from "../components/Reports/DailyReport/SummaryCards";
import AttendanceDetailDialog from "../components/Reports/DailyReport/AttendanceDetailDialog";
/*import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";*/
import "jspdf-autotable";
import GeneralReportTable from "../components/Reports/GeneralReport/GeneralReportTable";
import GeneralReportExportButtons from "../components/Reports/GeneralReport/GeneralReportExportButtons";
import { SafeSelect } from "../components/common/SafeSelect";

// Constantes
const STATUS_OPTIONS = [
  //{ value: "", label: "Todos los estados" },
  { value: "complete", label: "Completo" },
  { value: "late", label: "Tardanza" },
  { value: "early_leave", label: "Salida temprana" },
  { value: "late_and_early_leave", label: "Tardanza y salida temprana" },
  { value: "incomplete_no_entry", label: "Sin entrada" },
  { value: "incomplete_no_exit", label: "Sin salida" },
  { value: "absent", label: "Ausente" },
  { value: "justified", label: "Justificado" },
];

const STATUS_LABELS = {
  complete: "Completo",
  late: "Tardanza",
  early_leave: "Salida temprana",
  late_and_early_leave: "Tardanza y salida temprana",
  incomplete_no_entry: "Sin entrada",
  incomplete_no_exit: "Sin salida",
  absent: "Ausente",
  justified: "Justificado",
};

const ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50, 100];

// Componente de botones de exportación
/*const ExportButtons = memo(({ records, date, isMobile }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [exporting, setExporting] = useState(false);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleExportExcel = async () => {
    handleClose();
    setExporting(true);
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Reporte Diario");

      worksheet.columns = [
        { header: "DNI", key: "dni", width: 12 },
        { header: "Colaborador", key: "user", width: 30 },
        { header: "Turno", key: "schedule", width: 20 },
        { header: "Hora Entrada", key: "checkIn", width: 15 },
        { header: "Estado Entrada", key: "checkInStatus", width: 15 },
        { header: "Hora Salida", key: "checkOut", width: 15 },
        { header: "Estado Salida", key: "checkOutStatus", width: 15 },
        { header: "Horas Trabajadas", key: "hoursWorked", width: 18 },
        { header: "Estado del Turno", key: "shiftStatus", width: 25 },
        { header: "Dispositivo Entrada", key: "deviceIn", width: 20 },
        { header: "Dispositivo Salida", key: "deviceOut", width: 20 },
        { header: "Justificación", key: "justification", width: 30 },
        { header: "Aprobado Por", key: "approvedBy", width: 25 },
      ];

      worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      worksheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1976D2" },
      };
      worksheet.getRow(1).alignment = {
        vertical: "middle",
        horizontal: "center",
      };

      records.forEach((record) => {
        const row = worksheet.addRow({
          dni: record.user?.dni || "—",
          user: record.user
            ? `${record.user.name || ""} ${record.user.firstSurname || ""} ${
                record.user.secondSurname || ""
              }`.trim()
            : "—",
          schedule: record.schedule?.name || "Sin turno",
          checkIn: record.checkIn?.timestamp
            ? format(new Date(record.checkIn.timestamp), "HH:mm:ss", {
                locale: es,
              })
            : "—",
          checkInStatus: record.checkIn?.status
            ? record.checkIn.status === "on_time"
              ? "A tiempo"
              : record.checkIn.status === "late"
              ? "Tarde"
              : record.checkIn.status === "justified"
              ? "Justificado"
              : "—"
            : "—",
          checkOut: record.checkOut?.timestamp
            ? format(new Date(record.checkOut.timestamp), "HH:mm:ss", {
                locale: es,
              })
            : "—",
          checkOutStatus: record.checkOut?.status
            ? record.checkOut.status === "on_time"
              ? "A tiempo"
              : record.checkOut.status === "early_leave"
              ? "Salida temprana"
              : record.checkOut.status === "justified"
              ? "Justificado"
              : "—"
            : "—",
          hoursWorked: record.hoursWorked || "—",
          shiftStatus: STATUS_LABELS[record.shiftStatus] || "—",
          deviceIn: record.checkIn?.device?.name || "—",
          deviceOut: record.checkOut?.device?.name || "—",
          justification: record.justification || "—",
          approvedBy: record.approvedBy
            ? `${record.approvedBy.name || ""} ${
                record.approvedBy.firstSurname || ""
              } ${record.approvedBy.secondSurname || ""}`.trim()
            : "—",
        });

        const statusColors = {
          complete: "FF4CAF50",
          late: "FFFFC107",
          early_leave: "FFFFC107",
          late_and_early_leave: "FFFF5722",
          incomplete_no_entry: "FFF44336",
          incomplete_no_exit: "FFF44336",
          absent: "FFF44336",
          justified: "FF2196F3",
        };

        if (statusColors[record.shiftStatus]) {
          row.getCell("shiftStatus").fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: statusColors[record.shiftStatus] },
          };
          row.getCell("shiftStatus").font = { color: { argb: "FFFFFFFF" } };
        }
      });

      worksheet.eachRow((row) => {
        row.height = 20;
      });

      worksheet.eachRow((row) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const fileName = `Reporte_Diario_${
        date || format(new Date(), "yyyy-MM-dd")
      }.xlsx`;
      saveAs(new Blob([buffer]), fileName);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
    } finally {
      setExporting(false);
    }
  };

  const handleExportPDF = () => {
    handleClose();
    setExporting(true);
    try {
      const doc = new jsPDF("landscape", "mm", "a4");

      doc.setFontSize(18);
      doc.setTextColor(25, 118, 210);
      doc.text("Reporte Diario de Asistencias", 14, 15);

      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(
        `Fecha: ${
          date
            ? format(new Date(date), "d 'de' MMMM 'de' yyyy", { locale: es })
            : "—"
        }`,
        14,
        22
      );
      doc.text(`Total de registros: ${records.length}`, 14, 28);

      doc.autoTable({
        startY: 35,
        head: [
          [
            "DNI",
            "Colaborador",
            "Turno",
            "Entrada",
            "Salida",
            "Horas",
            "Estado",
          ],
        ],
        body: records.map((record) => [
          record.user?.dni || "—",
          record.user
            ? `${record.user.name || ""} ${
                record.user.firstSurname || ""
              }`.trim()
            : "—",
          record.schedule?.name || "Sin turno",
          record.checkIn?.timestamp
            ? format(new Date(record.checkIn.timestamp), "HH:mm", {
                locale: es,
              })
            : "—",
          record.checkOut?.timestamp
            ? format(new Date(record.checkOut.timestamp), "HH:mm", {
                locale: es,
              })
            : "—",
          record.hoursWorked || "—",
          STATUS_LABELS[record.shiftStatus] || "—",
        ]),
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [25, 118, 210],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "center",
        },
        bodyStyles: {
          textColor: [50, 50, 50],
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 50 },
          2: { cellWidth: 40 },
          3: { cellWidth: 25 },
          4: { cellWidth: 25 },
          5: { cellWidth: 25 },
          6: { cellWidth: 45 },
        },
        didParseCell: function (data) {
          if (data.column.index === 6 && data.section === "body") {
            const record = records[data.row.index];
            const statusColors = {
              complete: [76, 175, 80],
              late: [255, 193, 7],
              early_leave: [255, 193, 7],
              late_and_early_leave: [255, 87, 34],
              incomplete_no_entry: [244, 67, 54],
              incomplete_no_exit: [244, 67, 54],
              absent: [244, 67, 54],
              justified: [33, 150, 243],
            };

            if (statusColors[record.shiftStatus]) {
              data.cell.styles.fillColor = statusColors[record.shiftStatus];
              data.cell.styles.textColor = [255, 255, 255];
              data.cell.styles.fontStyle = "bold";
            }
          }
        },
        margin: { top: 35 },
      });

      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Página ${i} de ${pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: "center" }
        );
        doc.text(
          `Generado el ${format(new Date(), "dd/MM/yyyy HH:mm")}`,
          14,
          doc.internal.pageSize.height - 10
        );
      }

      const fileName = `Reporte_Diario_${
        date || format(new Date(), "yyyy-MM-dd")
      }.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error("Error exporting to PDF:", error);
    } finally {
      setExporting(false);
    }
  };

  if (isMobile) {
    return (
      <>
        <IconButton
          onClick={handleClick}
          disabled={!records || records.length === 0 || exporting}
          color="primary"
          size="small"
          sx={{
            border: "1px solid",
            borderColor: "primary.main",
            borderRadius: 1,
          }}
        >
          <FileDownloadIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <MenuItem onClick={handleExportExcel} disabled={exporting}>
            <ListItemIcon>
              <DownloadIcon fontSize="small" color="success" />
            </ListItemIcon>
            <ListItemText>
              {exporting ? "Exportando..." : "Exportar Excel"}
            </ListItemText>
          </MenuItem>
          <MenuItem onClick={handleExportPDF} disabled={exporting}>
            <ListItemIcon>
              <PictureAsPdfIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>
              {exporting ? "Exportando..." : "Exportar PDF"}
            </ListItemText>
          </MenuItem>
        </Menu>
      </>
    );
  }

  return (
    <Stack direction="row" spacing={1}>
      <Button
        variant="outlined"
        size="small"
        startIcon={<DownloadIcon />}
        onClick={handleExportExcel}
        disabled={!records || records.length === 0 || exporting}
      >
        {exporting ? "Exportando..." : "Excel"}
      </Button>
      <Button
        variant="outlined"
        size="small"
        color="error"
        startIcon={<PictureAsPdfIcon />}
        onClick={handleExportPDF}
        disabled={!records || records.length === 0 || exporting}
      >
        {exporting ? "Exportando..." : "PDF"}
      </Button>
    </Stack>
  );
});

ExportButtons.displayName = "ExportButtons";*/

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
        Reporte General de Asistencias
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
        //background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        //color: "white",
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
                      { locale: es }
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
                    { locale: es }
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
                    MenuProps={{
                      disableScrollLock: true, // Previene que MUI bloquee el scroll
                    }}
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
                    <MenuItem value="">
                      <em>Todos los estados</em>
                    </MenuItem>
                    {STATUS_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </SafeSelect>
                </FormControl>
              </Grid>

              {/* Fecha Desde */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <DatePicker
                  label="Desde"
                  value={dateFrom}
                  onChange={onDateFromChange}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                    },
                  }}
                  format="dd/MM/yyyy"
                />
              </Grid>

              {/* Fecha Hasta */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <DatePicker
                  label="Hasta"
                  value={dateTo}
                  onChange={onDateToChange}
                  minDate={dateFrom}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
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
            {/* <ExportButtons records={records} date={date} isMobile={isMobile} /> */}
            <GeneralReportExportButtons
              records={records}
              date={date}
              isMobile={isMobile}
            />
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
      if (dateFrom) params.append("startDate", format(dateFrom, "yyyy-MM-dd"));
      if (dateTo) params.append("endDate", format(dateTo, "yyyy-MM-dd"));

      const response = await getGeneralReport(params);
      setData(response);
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
            <GeneralReportTable
              attendances={data.records}
              setSelectedRecord={setSelectedRecord}
            />

            {/* Paginación */}
            {hasRecords && (
              <>
                <Divider />
                <TablePagination
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
      <AttendanceDetailDialog
        open={Boolean(selectedRecord)}
        record={selectedRecord}
        onClose={handleCloseDialog}
      />
    </Box>
  );
}

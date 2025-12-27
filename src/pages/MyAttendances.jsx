import React, { useState, useMemo, useCallback, memo, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import {
  format,
  startOfWeek,
  addDays,
  //isToday,
  parseISO,
  //isSameDay,
} from "date-fns";
import { es } from "date-fns/locale";
import {
  CheckCircle,
  Cancel,
  Error as ErrorIcon,
  Info as InfoIcon,
  AccessTime,
  Login,
  Logout,
  LocationOn,
  CalendarMonth,
  Schedule,
  TrendingUp,
} from "@mui/icons-material";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import {
  Box,
  Paper,
  Grid,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Chip,
  useTheme,
  Divider,
  Card,
  useMediaQuery,
  Breadcrumbs,
  Tooltip,
  Avatar,
  alpha,
  Fade,
  Skeleton,
  CardContent,
  Link,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import { Link as RouterLink } from "react-router-dom";
import { getMyAttendance } from "../services/reportService";
import AttendanceWeekView from "../components/MyAttendace/AttendanceWeekView";
import AttendanceMonthCalendar from "../components/MyAttendace/AttendanceMonthCalendar";
import { useThemeMode } from "../contexts/ThemeContext";

// Datos de ejemplo
const mockData = [
  {
    date: "2025-12-05",
    user: {
      _id: "68a20ea06a2ebe9a708ce5d5",
      name: "Paola Olsy",
      firstSurname: "Ojeda",
      secondSurname: "Moya",
      dni: "21622126",
    },
    schedule: { _id: "68a4ff5be98482b0a584af56", name: "Horario Matutino" },
    checkIn: {
      timestamp: "2025-12-05T08:05:00.000Z",
      status: "on_time",
      device: { name: "PC-Oficina-1", location: "Oficina Principal" },
      verificationMethod: "fingerprint",
    },
    checkOut: {
      timestamp: "2025-12-05T13:00:00.000Z",
      status: "on_time",
      device: { name: "PC-Oficina-1", location: "Oficina Principal" },
      verificationMethod: "fingerprint",
    },
    hoursWorked: "4h 55m",
    minutesWorked: 295,
    shiftStatus: "complete",
  },
  {
    date: "2025-12-04",
    user: {
      _id: "68a20ea06a2ebe9a708ce5d5",
      name: "Paola Olsy",
      firstSurname: "Ojeda",
      secondSurname: "Moya",
      dni: "21622126",
    },
    schedule: { _id: "68a4ff5be98482b0a584af56", name: "Horario Vespertino" },
    checkIn: {
      timestamp: "2025-12-04T14:00:00.000Z",
      status: "on_time",
      device: { name: "PC-Oficina-1", location: "Oficina Principal" },
      verificationMethod: "fingerprint",
    },
    checkOut: {
      timestamp: "2025-12-04T19:30:00.000Z",
      status: "on_time",
      device: { name: "PC-Oficina-1", location: "Oficina Principal" },
      verificationMethod: "fingerprint",
    },
    hoursWorked: "5h 30m",
    minutesWorked: 330,
    shiftStatus: "complete",
  },
  {
    date: "2025-12-03",
    user: {
      _id: "68a20ea06a2ebe9a708ce5d5",
      name: "Paola Olsy",
      firstSurname: "Ojeda",
      secondSurname: "Moya",
      dni: "21622126",
    },
    schedule: { _id: "68a4ff5be98482b0a584af56", name: "Horario Matutino" },
    checkIn: {
      timestamp: "2025-12-03T08:15:00.000Z",
      status: "late",
      device: { name: "PC-Oficina-1", location: "Oficina Principal" },
      verificationMethod: "fingerprint",
    },
    checkOut: {
      timestamp: "2025-12-03T13:05:00.000Z",
      status: "on_time",
      device: { name: "PC-Oficina-1", location: "Oficina Principal" },
      verificationMethod: "fingerprint",
    },
    hoursWorked: "5h 15m",
    minutesWorked: 315,
    shiftStatus: "late",
  },
  {
    date: "2025-12-03",
    user: {
      _id: "68a20ea06a2ebe9a708ce5d5",
      name: "Paola Olsy",
      firstSurname: "Ojeda",
      secondSurname: "Moya",
      dni: "21622126",
    },
    schedule: { _id: "68a4ff5be98482b0a584af56", name: "Horario Vespertino" },
    checkIn: {
      timestamp: "2025-12-03T14:15:00.000Z",
      status: "late",
      device: { name: "PC-Oficina-1", location: "Oficina Principal" },
      verificationMethod: "fingerprint",
    },
    checkOut: {
      timestamp: "2025-12-03T19:30:00.000Z",
      status: "on_time",
      device: { name: "PC-Oficina-1", location: "Oficina Principal" },
      verificationMethod: "fingerprint",
    },
    hoursWorked: "5h 15m",
    minutesWorked: 315,
    shiftStatus: "absent",
  },
  {
    date: "2025-12-02",
    user: {
      _id: "68a20ea06a2ebe9a708ce5d5",
      name: "Paola Olsy",
      firstSurname: "Ojeda",
      secondSurname: "Moya",
      dni: "21622126",
    },
    schedule: { _id: "68a4ff5be98482b0a584af56", name: "Horario Matutino" },
    checkIn: {
      timestamp: "2025-12-02T08:00:00.000Z",
      status: "on_time",
      device: { name: "PC-Oficina-1", location: "Oficina Principal" },
      verificationMethod: "fingerprint",
    },
    checkOut: null,
    hoursWorked: null,
    minutesWorked: null,
    shiftStatus: "incomplete_no_exit",
  },
  {
    date: "2025-12-02",
    user: {
      _id: "68a20ea06a2ebe9a708ce5g6",
      name: "Paola Olsy",
      firstSurname: "Ojeda",
      secondSurname: "Moya",
      dni: "21622126",
    },
    schedule: { _id: "68a4ff5be98482b0a584af56", name: "Horario Vespertino" },
    checkIn: {
      timestamp: "2025-12-02T13:00:00.000Z",
      status: "late",
      device: { name: "PC-Oficina-1", location: "Oficina Principal" },
      verificationMethod: "fingerprint",
    },
    checkOut: {
      timestamp: "2025-12-02T18:00:00.000Z",
      status: "on_time",
      device: { name: "PC-Oficina-1", location: "Oficina Principal" },
      verificationMethod: "fingerprint",
    },
    hoursWorked: null,
    minutesWorked: null,
    shiftStatus: "complete",
  },
  {
    date: "2025-12-01",
    user: {
      _id: "68a20ea06a2ebe9a708ce5d5",
      name: "Paola Olsy",
      firstSurname: "Ojeda",
      secondSurname: "Moya",
      dni: "21622126",
    },
    schedule: { _id: "68a4ff5be98482b0a584af56", name: "Horario Vespertino" },
    checkIn: null,
    checkOut: null,
    hoursWorked: null,
    minutesWorked: null,
    shiftStatus: "absent",
    justification: "Cita médica programada",
  },
];

// --- COMPONENTES AUXILIARES ---

// Chip de estado pequeño
const StatusChip = ({ status, label, color }) => (
  <Chip
    label={label}
    size="small"
    icon={
      status === "on_time" || status === "complete" ? (
        <CheckCircle />
      ) : (
        <InfoIcon />
      )
    }
    sx={{
      height: 24,
      bgcolor: `${color}20`, // Transparencia
      color: color,
      fontWeight: 600,
      border: `1px solid ${color}40`,
      "& .MuiChip-icon": { color: "inherit" },
    }}
  />
);

const MyAttendances = () => {
  const theme = useTheme();
  const { mode } = useThemeMode();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  //const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const [selectedDay, setSelectedDay] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState({});

  // Fetch de datos
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getMyAttendance();
      setData(response);
      console.log(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Obtener el día de hoy
  const today = useMemo(() => new Date(), []);

  // Mapear asistencias por fecha
  /*const attendanceByDate = useMemo(() => {
    const map = {};
    mockData.forEach((record) => {
      if (!map[record.date]) map[record.date] = [];
      map[record.date].push(record);
    });
    return map;
  }, []);*/

  // Configuración de colores/etiquetas por estado
  const statusConfig = useMemo(
    () => ({
      on_time: {
        sx: {
          bgcolor: alpha(theme.palette.success.main, 0.1),
          color: theme.palette.success.dark,
          border: `2px solid ${theme.palette.success.main}`,
        },
        label: "A Tiempo",
        Icon: CheckCircle,
        colorHex: "#10b981",
      },
      complete: {
        sx: {
          bgcolor: alpha(theme.palette.success.main, 0.1),
          color: theme.palette.success.dark,
          border: `2px solid ${theme.palette.success.main}`,
        },
        label: "Completo",
        Icon: CheckCircle,
        colorHex: "#10b981",
      },
      late: {
        sx: {
          bgcolor: alpha(theme.palette.warning.main, 0.1),
          color: theme.palette.warning.dark,
          border: `2px solid ${theme.palette.warning.main}`,
        },
        label: "Tardanza",
        Icon: ErrorIcon,
        colorHex: "#f59e0b",
      },
      early: {
        sx: {
          bgcolor: alpha(theme.palette.info.main, 0.1),
          color: theme.palette.info.dark,
          border: `2px solid ${theme.palette.info.main}`,
        },
        label: "Temprano",
        Icon: InfoIcon,
        colorHex: "#3b82f6",
      },
      justified: {
        sx: {
          bgcolor: alpha(theme.palette.info.main, 0.1),
          color: theme.palette.info.dark,
          border: `2px solid ${theme.palette.info.main}`,
        },
        label: "Justificado",
        Icon: InfoIcon,
        colorHex: "#3b82f6",
      },
      incomplete: {
        sx: {
          bgcolor: alpha(theme.palette.error.main, 0.1),
          color: theme.palette.error.dark,
          border: `2px solid ${theme.palette.error.main}`,
        },
        label: "Incompleto",
        Icon: ErrorIcon,
        colorHex: "#f44336",
      },
      early_exit: {
        sx: {
          bgcolor: alpha(theme.palette.error.main, 0.1),
          color: theme.palette.error.dark,
          border: `2px solid ${theme.palette.error.main}`,
        },
        label: "Salida Temprana",
        Icon: ErrorIcon,
        colorHex: "#f44336",
      },
      absent: {
        sx: {
          bgcolor: "transparent",
          color: theme.palette.text.disabled,
          border: `2px dashed ${theme.palette.divider}`,
        },
        label: "Ausente",
        Icon: Cancel,
        colorHex: "#e5e7eb",
      },
    }),
    [theme.palette]
  );

  // Formatear hora usando date-fns
  const formatTime = useCallback((timestamp) => {
    if (!timestamp) return "N/A";
    return format(parseISO(timestamp), "HH:mm", { locale: es });
  }, []);

  // Events para FullCalendar
  /*const calendarEvents = useMemo(() => {
    const events = [];
    Object.entries(attendanceByDate).forEach(([date, records]) => {
      records.forEach((record) => {
        const status = record.shiftStatus;
        let color = statusConfig.incomplete.colorHex;

        if (status === "complete") color = statusConfig.complete.colorHex;
        else if (record.justification) color = statusConfig.justified.colorHex;
        else if (status === "late") color = "#f59e0b";

        events.push({
          title: record.schedule.name,
          date,
          backgroundColor: color,
          borderColor: color,
          extendedProps: { record },
        });
      });
    });
    return events;
  }, [attendanceByDate, statusConfig]);*/

  // Manejar click en evento del calendario
 /* const handleEventClick = useCallback(
    (info) => {
      const date = info.event.start;
      const dateStr = format(date, "yyyy-MM-dd");
      const records = attendanceByDate[dateStr];
      setSelectedDay({ date, records });
      setDialogOpen(true);
    },
    [attendanceByDate]
  );*/

  // Abrir diálogo con detalles
  /*const handleDayClick = useCallback(
    (date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      const records = attendanceByDate[dateStr];
      setSelectedDay({ date, records });
      setDialogOpen(true);
    },
    [attendanceByDate]
  );*/

  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
    setTimeout(() => setSelectedDay(null), 200);
  }, []);

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
          Mi Asistencia
        </Typography>
      </Breadcrumbs>
    );

    return (
      <Card
        elevation={1}
        sx={{
          borderRadius: 3,
          mb: 3,
          borderLeft: mode === "dark" ? "none" : "4px solid",
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
                    Mi Asistencia
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
                  Mi Asistencia
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

  return (
    <Box sx={{ width: "100%", p: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <PageHeader date={""} isMobile={isMobile} />

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {/* Hoy */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              p: { xs: 2, sm: 3 },
              height: "100%",
              border: `1px solid ${theme.palette.divider}`,
              transition: "box-shadow 0.3s",
              "&:hover": {
                boxShadow: theme.shadows[4],
              },
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
              <Avatar sx={{ bgcolor: "primary.main", width: 40, height: 40 }}>
                <CalendarMonth />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Hoy
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {format(today, "EEEE, d 'de' MMMM", { locale: es })}
                </Typography>
              </Box>
            </Stack>

            {data.periods?.today?.records.length > 0 ? (
              <Stack spacing={2}>
                {data.periods?.today?.records.map((record, idx) => (
                  <Card
                    key={idx}
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.02),
                      borderColor: alpha(theme.palette.primary.main, 0.1),
                    }}
                  >
                    <Stack spacing={1.5}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography
                          variant="subtitle2"
                          fontWeight={600}
                          color="primary.main"
                        >
                          {record.schedule.name}
                        </Typography>
                        <Chip
                          icon={
                            statusConfig[record.shiftStatus]?.Icon
                              ? React.createElement(
                                  statusConfig[record.shiftStatus]?.Icon,
                                  { sx: { fontSize: 16 } }
                                )
                              : null
                          }
                          label={statusConfig[record.shiftStatus]?.label}
                          size="small"
                          sx={{
                            ...statusConfig[record.shiftStatus]?.sx,
                            fontWeight: 600,
                            fontSize: "0.75rem",
                          }}
                          color={statusConfig[record.shiftStatus]?.sx.color}
                        />
                      </Stack>

                      <Grid container spacing={2}>
                        <Grid size={{ xs: 6 }}>
                          <Stack spacing={0.5}>
                            <Box display="flex" alignItems="center">
                              <Login
                                fontSize="small"
                                sx={{ mr: 1, color: "success.main" }}
                              />
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Entrada
                              </Typography>
                            </Box>

                            <Typography
                              variant="h6"
                              fontWeight={700}
                              //color="success.main"
                            >
                              {record.checkIn
                                ? formatTime(record.checkIn.timestamp)
                                : "--:--"}
                            </Typography>
                            <Typography
                              variant="caption"
                              fontWeight={700}
                              color="textDisabled"
                            >
                              {record.checkIn &&
                                statusConfig[record.checkIn.status]?.label}
                            </Typography>
                          </Stack>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Stack spacing={0.5}>
                            <Box display="flex" alignItems="center">
                              <Logout
                                fontSize="small"
                                sx={{ mr: 1, color: "error.main" }}
                              />
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Salida
                              </Typography>
                            </Box>
                            <Typography
                              variant="h6"
                              fontWeight={700}
                              //color="error.main"
                            >
                              {record.checkOut
                                ? formatTime(record.checkOut.timestamp)
                                : "--:--"}
                            </Typography>
                            <Typography
                              variant="caption"
                              fontWeight={700}
                              color="textDisabled"
                            >
                              {record.checkOut &&
                                statusConfig[record.checkOut.status]?.label}
                            </Typography>
                          </Stack>
                        </Grid>
                      </Grid>

                      {record.hoursWorked && (
                        <Box
                          sx={{
                            mt: 1,
                            p: 1.5,
                            borderRadius: 1.5,
                            bgcolor: alpha(theme.palette.info.main, 0.1),
                          }}
                        >
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Horas trabajadas
                            </Typography>
                            <Typography
                              variant="subtitle1"
                              fontWeight={700}
                              color="info.main"
                            >
                              {record.hoursWorked}
                            </Typography>
                          </Stack>
                        </Box>
                      )}
                    </Stack>
                  </Card>
                ))}
              </Stack>
            ) : (
              <Box
                sx={{
                  textAlign: "center",
                  py: 6,
                  bgcolor: alpha(theme.palette.grey[500], 0.05),
                  borderRadius: 2,
                }}
              >
                <Schedule
                  sx={{ fontSize: 48, color: "text.disabled", mb: 1 }}
                />
                <Typography color="text.secondary" variant="body2">
                  No hay registros para hoy
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Semana Actual */}
        <Grid size={{ xs: 12, md: 6 }}>
          <AttendanceWeekView data={data} />
        </Grid>

        {/* Calendario */}
        <Grid size={{ xs: 12 }}>
          <AttendanceMonthCalendar data={data} />
          {/* <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              p: { xs: 2, sm: 3 },
              border: `1px solid ${theme.palette.divider}`,
              transition: "box-shadow 0.3s",
              "&:hover": {
                boxShadow: theme.shadows[4],
              },
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
              <Avatar sx={{ bgcolor: "info.main", width: 40, height: 40 }}>
                <CalendarMonth />
              </Avatar>
              <Typography variant="h6" fontWeight={700}>
                Calendario de Asistencias
              </Typography>
            </Stack>

            <Box
              sx={{
                "& .fc": {
                  fontFamily: "inherit",
                  fontSize: isMobile ? "0.85rem" : "1rem",
                },
                "& .fc-button": {
                  textTransform: "capitalize",
                  borderRadius: 2,
                },
                "& .fc-daygrid-day": {
                  cursor: "pointer",
                },
                "& .fc-day-today": {
                  bgcolor: `${alpha(
                    theme.palette.primary.main,
                    0.05
                  )} !important`,
                },
                "& .fc-event": {
                  borderRadius: 1,
                  cursor: "pointer",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "scale(1.05)",
                  },
                },
              }}
            >
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                locale={esLocale}
                events={calendarEvents}
                eventClick={handleEventClick}
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: isMobile ? "" : "dayGridMonth,dayGridWeek",
                }}
                height="auto"
                buttonText={{
                  today: "Hoy",
                  month: "Mes",
                  week: "Semana",
                }}
              />
            </Box>
          </Paper> */}
        </Grid>
      </Grid>

      {/* Dialog Detalles */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
        scroll="paper"
        TransitionComponent={Fade}
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: "90vh",
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar sx={{ bgcolor: "primary.main" }}>
              <CalendarMonth />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Detalles de Asistencia
              </Typography>
              {selectedDay && (
                <Typography variant="body2" color="text.secondary">
                  {format(selectedDay.date, "EEEE, d 'de' MMMM 'de' yyyy", {
                    locale: es,
                  })}
                </Typography>
              )}
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent dividers sx={{ px: { xs: 2, sm: 3 } }}>
          {selectedDay?.records && selectedDay.records.length > 0 ? (
            <Stack spacing={3}>
              {selectedDay.records.map((record, idx) => (
                <Box key={idx}>
                  {idx > 0 && <Divider sx={{ my: 3 }} />}

                  <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        {/* <AccessTime color="primary" /> */}
                        <Box
                          sx={{
                            width: 4,
                            height: 24,
                            bgcolor: "primary.main",
                            borderRadius: 1,
                          }}
                        />
                        <Typography variant="subtitle1" fontWeight={700}>
                          {record.schedule.name}
                        </Typography>
                      </Stack>
                      <StatusChip
                        status={
                          record.shiftStatus === "complete"
                            ? "complete"
                            : "incomplete"
                        }
                        label={
                          record.shiftStatus === "complete"
                            ? "Completo"
                            : "Incompleto"
                        }
                      />
                    </Stack>
                    <Grid container spacing={2}>
                      {/* Entrada */}
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            //bgcolor: alpha(theme.palette.success.main, 0.05),
                            //borderColor: alpha(theme.palette.success.main, 0.2),
                          }}
                        >
                          <Stack spacing={1}>
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={1}
                            >
                              <Login
                                sx={{ fontSize: 18, color: "success.main" }}
                              />
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                fontWeight={600}
                              >
                                ENTRADA
                              </Typography>
                            </Stack>
                            <Typography
                              variant="h5"
                              fontWeight={700}
                              //color="success.main"
                            >
                              {record.checkIn
                                ? formatTime(record.checkIn.timestamp)
                                : "--:--"}
                            </Typography>
                            {record.checkIn?.status && (
                              <Chip
                                label={
                                  record.checkIn.status === "on_time"
                                    ? "A tiempo"
                                    : "Tarde"
                                }
                                size="small"
                                sx={{
                                  bgcolor:
                                    record.checkIn.status === "on_time"
                                      ? alpha(theme.palette.success.main, 0.2)
                                      : alpha(theme.palette.warning.main, 0.2),
                                  color:
                                    record.checkIn.status === "on_time"
                                      ? "success.dark"
                                      : "warning.dark",
                                  fontWeight: 600,
                                  fontSize: "0.7rem",
                                }}
                              />
                            )}
                          </Stack>
                        </Paper>
                      </Grid>

                      {/* Salida */}
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            //bgcolor: alpha(theme.palette.error.main, 0.05),
                            //borderColor: alpha(theme.palette.error.main, 0.2),
                          }}
                        >
                          <Stack spacing={1}>
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={1}
                            >
                              <Logout
                                sx={{ fontSize: 18, color: "error.main" }}
                              />
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                fontWeight={600}
                              >
                                SALIDA
                              </Typography>
                            </Stack>
                            <Typography
                              variant="h5"
                              fontWeight={700}
                              //color="error.main"
                            >
                              {record.checkOut
                                ? formatTime(record.checkOut.timestamp)
                                : "--:--"}
                            </Typography>
                            {record.checkOut?.status && (
                              <Chip
                                label={
                                  record.checkOut.status === "on_time"
                                    ? "A tiempo"
                                    : "Tarde"
                                }
                                size="small"
                                sx={{
                                  bgcolor:
                                    record.checkOut.status === "on_time"
                                      ? alpha(theme.palette.success.main, 0.2)
                                      : alpha(theme.palette.warning.main, 0.2),
                                  color:
                                    record.checkOut.status === "on_time"
                                      ? "success.dark"
                                      : "warning.dark",
                                  fontWeight: 600,
                                  fontSize: "0.7rem",
                                }}
                              />
                            )}
                          </Stack>
                        </Paper>
                      </Grid>

                      {/* Horas Trabajadas */}
                      {record.hoursWorked && (
                        <Grid size={{ xs: 12 }}>
                          <Paper
                            sx={{
                              p: 2.5,
                              borderRadius: 2,
                              //bgcolor: alpha(theme.palette.info.main, 0.08),
                              border: `2px solid ${alpha(
                                theme.palette.info.main,
                                0.2
                              )}`,
                            }}
                          >
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1}
                              >
                                <Schedule sx={{ color: "info.main" }} />
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  fontWeight={600}
                                >
                                  Horas Trabajadas
                                </Typography>
                              </Stack>
                              <Typography
                                variant="h4"
                                fontWeight={800}
                                color="info.main"
                              >
                                {record.hoursWorked}
                              </Typography>
                            </Stack>
                          </Paper>
                        </Grid>
                      )}

                      {/* Dispositivo */}
                      {(record.checkIn?.device || record.checkOut?.device) && (
                        <Grid size={{ xs: 12 }}>
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              bgcolor: alpha(theme.palette.grey[500], 0.02),
                            }}
                          >
                            <Stack
                              direction="row"
                              spacing={2}
                              alignItems="flex-start"
                            >
                              <LocationOn
                                sx={{ color: "text.secondary", fontSize: 20 }}
                              />
                              <Stack spacing={0.5} flex={1}>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  fontWeight={600}
                                >
                                  DISPOSITIVO
                                </Typography>
                                <Typography variant="body1" fontWeight={600}>
                                  {
                                    (
                                      record.checkIn?.device ||
                                      record.checkOut?.device
                                    )?.name
                                  }
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {
                                    (
                                      record.checkIn?.device ||
                                      record.checkOut?.device
                                    )?.location
                                  }
                                </Typography>
                              </Stack>
                            </Stack>
                          </Paper>
                        </Grid>
                      )}

                      {/* Notas / Justificación */}
                      {(record.checkIn?.notes ||
                        record.checkOut?.notes ||
                        record.justification) && (
                        <Grid size={{ xs: 12 }}>
                          <Paper
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              bgcolor: alpha(theme.palette.warning.main, 0.08),
                              border: `1px solid ${alpha(
                                theme.palette.warning.main,
                                0.2
                              )}`,
                            }}
                          >
                            <Stack spacing={1}>
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1}
                              >
                                <InfoIcon
                                  sx={{ fontSize: 18, color: "warning.main" }}
                                />
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  fontWeight={600}
                                >
                                  NOTAS
                                </Typography>
                              </Stack>
                              <Typography variant="body2" color="text.primary">
                                {record.checkIn?.notes ||
                                  record.checkOut?.notes ||
                                  record.justification}
                              </Typography>
                            </Stack>
                          </Paper>
                        </Grid>
                      )}
                    </Grid>
                  </Stack>
                </Box>
              ))}
            </Stack>
          ) : (
            <Box textAlign="center" py={8}>
              <HighlightOffIcon
                sx={{
                  fontSize: 64,
                  color: "text.disabled",
                  mb: 2,
                }}
              />
              <Typography
                variant="h6"
                color="text.secondary"
                fontWeight={600}
                mb={1}
              >
                Sin registros
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No hay registros de asistencia para este día
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button
            onClick={handleCloseDialog}
            variant="contained"
            fullWidth
            size="large"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              py: 1.5,
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyAttendances;

import React, { useState, useMemo, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import {
  format,
  startOfWeek,
  addDays,
  isToday,
  parseISO,
  isSameDay,
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
import { Link as RouterLink } from "react-router-dom";
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
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import { Link } from "react-router-dom";

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
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const [selectedDay, setSelectedDay] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Obtener el día de hoy
  const today = useMemo(() => new Date(), []);

  // Obtener la semana actual usando date-fns
  const getCurrentWeek = useMemo(() => {
    const start = startOfWeek(today, { weekStartsOn: 1 }); // Lunes
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [today]);

  // Mapear asistencias por fecha
  const attendanceByDate = useMemo(() => {
    const map = {};
    mockData.forEach((record) => {
      if (!map[record.date]) map[record.date] = [];
      map[record.date].push(record);
    });
    return map;
  }, []);

  // Obtener registros de hoy
  const todayRecords = useMemo(() => {
    const todayStr = format(today, "yyyy-MM-dd");
    return attendanceByDate[todayStr] || [];
  }, [today, attendanceByDate]);

  // Calcular estadísticas de la semana
  const weekStats = useMemo(() => {
    let complete = 0;
    let late = 0;
    let absent = 0;
    let totalMinutes = 0;

    getCurrentWeek.forEach((day) => {
      const dateStr = format(day, "yyyy-MM-dd");
      const records = attendanceByDate[dateStr] || [];

      if (records.length === 0) {
        absent++;
      } else {
        records.forEach((r) => {
          if (r.shiftStatus === "complete") complete++;
          else if (r.shiftStatus === "late") late++;
          if (r.minutesWorked) totalMinutes += r.minutesWorked;
        });
      }
    });

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return { complete, late, absent, totalHours: `${hours}h ${minutes}m` };
  }, [getCurrentWeek, attendanceByDate]);

  // Función para obtener el estado de un día
  const getDayStatus = useCallback(
    (date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      const records = attendanceByDate[dateStr];

      if (!records || records.length === 0) return "absent";

      const hasJustified = records.some((r) => r.justification);
      if (hasJustified) return "justified";

      const allComplete = records.every((r) => r.shiftStatus === "complete");
      if (allComplete) return "complete";

      const hasIncomplete = records.some(
        (r) =>
          r.shiftStatus === "incomplete_no_exit" ||
          r.shiftStatus === "incomplete_no_entry" ||
          r.shiftStatus === "late"
      );

      if (hasIncomplete) return "incomplete";
      return "absent";
    },
    [attendanceByDate]
  );

  // Configuración de colores/etiquetas por estado
  const statusConfig = useMemo(
    () => ({
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
          bgcolor: alpha(theme.palette.warning.main, 0.1),
          color: theme.palette.warning.dark,
          border: `2px solid ${theme.palette.warning.main}`,
        },
        label: "Incompleto",
        Icon: ErrorIcon,
        colorHex: "#f59e0b",
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
  const calendarEvents = useMemo(() => {
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
  }, [attendanceByDate, statusConfig]);

  // Manejar click en evento del calendario
  const handleEventClick = useCallback(
    (info) => {
      const date = info.event.start;
      const dateStr = format(date, "yyyy-MM-dd");
      const records = attendanceByDate[dateStr];
      setSelectedDay({ date, records });
      setDialogOpen(true);
    },
    [attendanceByDate]
  );

  // Abrir diálogo con detalles
  const handleDayClick = useCallback(
    (date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      const records = attendanceByDate[dateStr];
      setSelectedDay({ date, records });
      setDialogOpen(true);
    },
    [attendanceByDate]
  );

  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
    setTimeout(() => setSelectedDay(null), 200);
  }, []);

  /*const breadcrumbItems = useMemo(
    () => (
      <Breadcrumbs
        aria-label="breadcrumb"
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ fontSize: isMobile ? "0.875rem" : "1rem" }}
      >
        <Link
          component={RouterLink}
          to="/"
          sx={{
            display: "flex",
            alignItems: "center",
            color: "text.secondary",
            textDecoration: "none",
            "&:hover": { color: "primary.main" },
            transition: "color 0.2s",
          }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
          {!isMobile && "Inicio"}
        </Link>
        <Typography variant="body2" color="text.primary" fontWeight={600}>
          Mi Asistencia
        </Typography>
      </Breadcrumbs>
    ),
    [isMobile]
  );*/
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
            color: "inherit",
            textDecoration: "none",
            "&:hover": { color: "primary.main" },
          }}
        >
          <HomeIcon fontSize="small" />
        </Link>
        <Typography variant="body2" color="text.primary">
          Mi Asistencia
        </Typography>
      </Breadcrumbs>
    ),
    [isMobile]
  );

  return (
    <Box sx={{ width: "100%", p: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Card
        //elevation={0}
        /*sx={{
          borderRadius: 3,
          mb: 3,
          border: `1px solid ${theme.palette.divider}`,
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.primary.main,
            0.05
          )} 0%, ${alpha(theme.palette.primary.light, 0.02)} 100%)`,
        }}*/
        sx={{
          borderRadius: isMobile ? 2 : 3,
          mb: 2,
          boxShadow: theme.shadows[1],
        }}
      >
        <Box
          sx={{
            px: isMobile ? 2 : 3,
            py: isMobile ? 1.5 : 2,
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
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Mi Asistencia
                </Typography>
              </Box>
              {breadcrumbItems}
            </Stack>
          ) : (
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Mi Asistencia
              </Typography>
              {breadcrumbItems}
            </Stack>
          )}
        </Box>
      </Card>

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

            {todayRecords.length > 0 ? (
              <Stack spacing={2}>
                {todayRecords.map((record, idx) => (
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
                            statusConfig[
                              record.shiftStatus === "late"
                                ? "incomplete"
                                : record.shiftStatus
                            ]?.Icon
                              ? React.createElement(
                                  statusConfig[
                                    record.shiftStatus === "late"
                                      ? "incomplete"
                                      : record.shiftStatus
                                  ].Icon,
                                  { sx: { fontSize: 16 } }
                                )
                              : null
                          }
                          label={
                            statusConfig[
                              record.shiftStatus === "late"
                                ? "incomplete"
                                : record.shiftStatus
                            ]?.label
                          }
                          size="small"
                          sx={{
                            ...statusConfig[
                              record.shiftStatus === "late"
                                ? "incomplete"
                                : record.shiftStatus
                            ]?.sx,
                            fontWeight: 600,
                            fontSize: "0.75rem",
                          }}
                          color={
                            statusConfig[
                              record.shiftStatus === "late"
                                ? "incomplete"
                                : record.shiftStatus
                            ]?.sx.color
                          }
                        />
                      </Stack>

                      <Grid container spacing={2}>
                        <Grid size={{ xs: 6 }}>
                          <Stack spacing={0.5}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Entrada
                            </Typography>
                            <Typography
                              variant="h6"
                              fontWeight={700}
                              color="success.main"
                            >
                              {record.checkIn
                                ? formatTime(record.checkIn.timestamp)
                                : "--:--"}
                            </Typography>
                          </Stack>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Stack spacing={0.5}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Salida
                            </Typography>
                            <Typography
                              variant="h6"
                              fontWeight={700}
                              color="error.main"
                            >
                              {record.checkOut
                                ? formatTime(record.checkOut.timestamp)
                                : "--:--"}
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
              <Avatar sx={{ bgcolor: "secondary.main", width: 40, height: 40 }}>
                <TrendingUp />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Semana Actual
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {format(getCurrentWeek[0], "d MMM", { locale: es })} -{" "}
                  {format(getCurrentWeek[6], "d MMM", { locale: es })}
                </Typography>
              </Box>
            </Stack>

            {/* Días de la semana */}
            <Grid container spacing={1.5} justifyContent="center" mb={3}>
              {getCurrentWeek.map((day, idx) => {
                const status = getDayStatus(day);
                const cfg = statusConfig[status];
                const dayName = format(day, "EEE", {
                  locale: es,
                }).toUpperCase();
                const dayNumber = format(day, "d");
                const isDayToday = isToday(day);

                return (
                  <Grid key={idx}>
                    <Tooltip title={cfg.label} arrow placement="top">
                      <Stack alignItems="center" spacing={1}>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: isDayToday ? 700 : 600,
                            color: isDayToday
                              ? "primary.main"
                              : "text.secondary",
                            fontSize: "0.7rem",
                          }}
                        >
                          {dayName}
                        </Typography>

                        <Button
                          onClick={() => handleDayClick(day)}
                          variant={
                            status === "absent" ? "outlined" : "contained"
                          }
                          sx={{
                            width: { xs: 44, sm: 56 },
                            height: { xs: 44, sm: 56 },
                            minWidth: 0,
                            borderRadius: 2,
                            ...cfg.sx,
                            boxShadow: status !== "absent" ? 2 : "none",
                            "&:hover": {
                              transform: "scale(1.08)",
                              boxShadow: status !== "absent" ? 4 : "none",
                            },
                            transition: "all 0.2s ease",
                          }}
                        >
                          <Typography variant="body1" fontWeight={700}>
                            {dayNumber}
                          </Typography>
                        </Button>

                        {React.createElement(cfg.Icon, {
                          sx: {
                            fontSize: 18,
                            color: cfg.sx.color,
                          },
                        })}
                      </Stack>
                    </Tooltip>
                  </Grid>
                );
              })}
            </Grid>

            {/* Estadísticas de la semana */}
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid size={{ xs: 4 }}>
                <Box textAlign="center">
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    color="success.main"
                  >
                    {weekStats.complete}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Completos
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 4 }}>
                <Box textAlign="center">
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    color="warning.main"
                  >
                    {weekStats.late}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Tardanzas
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 4 }}>
                <Box textAlign="center">
                  <Typography variant="h5" fontWeight={700} color="error.main">
                    {weekStats.absent}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Ausencias
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    textAlign: "center",
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    mb={0.5}
                  >
                    Total horas trabajadas
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    color="primary.main"
                  >
                    {weekStats.totalHours}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Calendario */}
        <Grid size={{ xs: 12 }}>
          <Paper
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
          </Paper>
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

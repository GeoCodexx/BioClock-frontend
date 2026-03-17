import React, { useState, useMemo, useCallback, memo, useEffect } from "react";

import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  CheckCircle,
  Cancel,
  Error as ErrorIcon,
  Info as InfoIcon,
  AccessTime,
  Login,
  Logout,
  CalendarMonth,
  Schedule,
} from "@mui/icons-material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import {
  Box,
  Paper,
  Grid,
  Typography,
  Stack,
  Chip,
  useTheme,
  Card,
  useMediaQuery,
  Breadcrumbs,
  Avatar,
  alpha,
  CardContent,
  Link,
  CircularProgress,
  Alert,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import { Link as RouterLink } from "react-router-dom";
import { getMyAttendance } from "../services/reportService";
import AttendanceWeekView from "../components/MyAttendace/AttendanceWeekView";
import AttendanceMonthCalendar from "../components/MyAttendace/AttendanceMonthCalendar";
import { useThemeMode } from "../contexts/ThemeContext";

const MyAttendances = () => {
  const theme = useTheme();
  const { mode } = useThemeMode();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
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
      //console.log(response);
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

  // Configuración de colores/etiquetas por estado
  const statusConfig = useMemo(
    () => ({
      on_time: {
        sx: {
          bgcolor: alpha(theme.palette.success.main, 0.1),
          color: theme.palette.success.dark,
          //border: `1px solid ${theme.palette.success.main}`,
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
      in_progress: {
        sx: {
          bgcolor: alpha(theme.palette.secondary.main, 0.1),
          color: theme.palette.secondary.main,
          //border: `2px solid ${theme.palette.secondary.main}`,
        },
        label: "En transcurso",
        Icon: AccessTime,
        colorHex: theme.palette.secondary.main,
      },
    }),
    [theme.palette],
  );

  // Función para procesar registros del día de hoy
  const processTodayRecords = (records) => {
    if (!records || Object.keys(records).length === 0) return [];

    const processed = [];

    // Iterar sobre cada fecha (aunque "today" debería tener solo una fecha)
    Object.entries(records).forEach(([dateStr, dayRecords]) => {
      // Agrupar por scheduleId
      const scheduleGroups = {};

      dayRecords.forEach((record) => {
        const scheduleId = record.scheduleId?._id?.toString();

        if (!scheduleGroups[scheduleId]) {
          scheduleGroups[scheduleId] = {
            schedule: record.scheduleId,
            records: [],
            isVirtual: false,
          };
        }

        scheduleGroups[scheduleId].records.push(record);

        if (record.isVirtual) {
          scheduleGroups[scheduleId].isVirtual = true;
        }
      });

      // Procesar cada grupo de horario
      Object.values(scheduleGroups).forEach((group) => {
        const checkIn = group.records.find((r) => r.type === "IN");
        const checkOut = group.records.find((r) => r.type === "OUT");

        console.log("checkIn", checkIn);

        // Determinar estado del turno
        let shiftStatus = "absent";
        if (checkIn?.isVirtual) {
          shiftStatus = "absent";
        } else if (checkIn && checkOut) {
          // Completo
          if (checkOut.status === "early_exit") {
            shiftStatus = "early_exit";
          } else if (checkIn.status === "late") {
            shiftStatus = "late";
          } else {
            shiftStatus = "on_time";
          }
        } else if (checkIn && !checkOut && checkIn.inProgress) {
          shiftStatus = "in_progress";
        } else if (checkIn && !checkOut) {
          shiftStatus = "incomplete";
        } else if (!checkIn && checkOut) {
          shiftStatus = "incomplete";
        }

        // Calcular horas trabajadas
        let hoursWorked = null;
        if (
          checkIn &&
          checkOut &&
          !checkIn.isVirtual &&
          !checkOut.isVirtual &&
          checkIn.timestamp &&
          checkOut.timestamp
        ) {
          const start = new Date(checkIn.timestamp);
          const end = new Date(checkOut.timestamp);
          const minutesWorked = Math.floor((end - start) / 60000);
          const hours = Math.floor(minutesWorked / 60);
          const mins = minutesWorked % 60;
          hoursWorked = `${hours}h ${mins}m`;
        }

        processed.push({
          schedule: group.schedule,
          shiftStatus,
          checkIn: checkIn?.isVirtual ? null : checkIn || null,
          checkOut: checkOut?.isVirtual ? null : checkOut || null,
          hoursWorked,
          isVirtual: group.isVirtual,
        });
      });
    });

    return processed;
  };

  // Procesar registros de hoy
  const todayRecords = useMemo(
    () => processTodayRecords(data.periods?.today?.records),
    [data.periods?.today?.records],
  );

  // Formatear hora usando date-fns
  const formatTime = useCallback((timestamp) => {
    if (!timestamp) return "N/A";
    return format(parseISO(timestamp), "HH:mm", { locale: es });
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
                    Mi Asistencia
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
                        /* bgcolor: "rgba(255,255,255,0.2)",
                      color: "white",*/
                        fontWeight: 500,
                      }}
                    />
                  )}
                </Box>
              </Stack>
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

  // Estado de carga inicial
  if (loading && Object.keys(data).length === 0) {
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
    <Box sx={{ width: "100%", p: { xs: 2, sm: 3 } }}>
      {/* Header */}
      {isMobile || <PageHeader date={""} isMobile={isMobile} />}

      {/* Mensaje de error global */}
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: isMobile ? 2 : 3 }}>
          {error}
        </Alert>
      )}

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
                            statusConfig[record.shiftStatus]?.Icon
                              ? React.createElement(
                                  statusConfig[record.shiftStatus]?.Icon,
                                  { sx: { fontSize: 16 } },
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
          <AttendanceMonthCalendar data={data} fetchData={fetchData} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default MyAttendances;

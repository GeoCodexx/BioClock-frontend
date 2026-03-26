import React, { useMemo, useState } from "react";
import {
  Paper,
  Stack,
  Box,
  Typography,
  Avatar,
  Grid,
  Divider,
  Tooltip,
  alpha,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import {
  TrendingUp,
  CheckCircle,
  Cancel,
  Error as ErrorIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  AccessTime,
  CalendarToday,
  Schedule,
  Computer,
  Fingerprint,
  Assignment,
} from "@mui/icons-material";
import { format, parseISO, startOfWeek, addDays, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { formatInTimeZone } from "date-fns-tz";

const isSameDayInTimezone = (
  dateA,
  dateB = new Date(),
  timezone = "America/Lima",
) => {
  return (
    formatInTimeZone(dateA, timezone, "yyyy-MM-dd") ===
    formatInTimeZone(dateB, timezone, "yyyy-MM-dd")
  );
};

const AttendanceWeekView = ({ data }) => {
  const timezone = data?.timezone || "America/Lima";
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  const statusConfig = useMemo(
    () => ({
      on_time: {
        label: "A Tiempo",
        Icon: CheckCircle,
        colorHex: "#10b981",
        //colorHex: theme.palette.success.main,
      },
      late: {
        label: "Tardanza",
        Icon: ErrorIcon,
        colorHex: "#f59e0b",
      },
      early: {
        label: "Temprano",
        Icon: InfoIcon,
        colorHex: "#3b82f6",
      },
      early_exit: {
        label: "Salida Temprana",
        Icon: ErrorIcon,
        colorHex: "#f44336",
      },
      absent: {
        label: "Ausente",
        Icon: Cancel,
        colorHex: "#9ca3af",
      },
    }),
    [],
  );

  /**
   * CLAVE: Procesar la estructura del backend
   * Backend devuelve: { "2026-01-19": [{...}, {...}], "2026-01-20": [...] }
   */
  const weekDays = useMemo(() => {
    if (!data?.periods?.week?.dateRange?.start) return [];

    const weekStart = startOfWeek(parseISO(data.periods.week.dateRange.start), {
      weekStartsOn: 1, // Lunes
    });

    const records = data.periods.week.records || {};

    const processShiftRecords = (scheduleRecords) => {
      if (!scheduleRecords || scheduleRecords.length === 0) return null;

      // Ordenar por timestamp por seguridad
      const sortedRecords = [...scheduleRecords].sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
      );

      const checkIn = sortedRecords.find((r) => r.type === "IN");
      const checkOut = sortedRecords.find((r) => r.type === "OUT");

      // Caso ausencia virtual
      if (checkIn?.isVirtual) {
        return {
          schedule: checkIn.scheduleId,
          shiftStatus: "absent",
          checkIn: null,
          checkOut: null,
          minutesWorked: 0,
          hoursWorked: null,
          justification: null,
          isVirtual: true,
        };
      }

      let shiftStatus = "absent";

      if (checkIn && checkOut) {
        if (checkIn.status === "late") {
          shiftStatus = "late";
        } else if (checkOut.status === "early_exit") {
          shiftStatus = "early_exit";
        } else if (checkIn.status === "early") {
          shiftStatus = "early";
        } else {
          shiftStatus = "on_time";
        }
      } else if (checkIn && !checkOut) {
        shiftStatus = checkIn.status || "on_time";
      } else if (!checkIn && checkOut) {
        shiftStatus = checkOut.status || "on_time";
      }

      let minutesWorked = 0;
      if (checkIn && checkOut && !checkIn.isVirtual && !checkOut.isVirtual) {
        const start = new Date(checkIn.timestamp);
        const end = new Date(checkOut.timestamp);
        minutesWorked = Math.max(0, Math.floor((end - start) / 60000));
      }

      return {
        schedule: sortedRecords[0].scheduleId,
        shiftStatus,
        checkIn:
          checkIn && !checkIn.isVirtual
            ? {
                timestamp: checkIn.timestamp,
                status: checkIn.status,
                device: checkIn.deviceId,
                verificationMethod: checkIn.verificationMethod,
              }
            : null,
        checkOut:
          checkOut && !checkOut.isVirtual
            ? {
                timestamp: checkOut.timestamp,
                status: checkOut.status,
                device: checkOut.deviceId,
                verificationMethod: checkOut.verificationMethod,
              }
            : null,
        minutesWorked,
        hoursWorked:
          minutesWorked > 0
            ? `${Math.floor(minutesWorked / 60)}h ${minutesWorked % 60}m`
            : null,
        justification: checkIn?.justification || checkOut?.justification,
        isVirtual: false,
      };
    };

    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(weekStart, i);
      const dateStr = formatInTimeZone(date, timezone, "yyyy-MM-dd");
      const dayRecords = records[dateStr] || [];

      // Agrupar por scheduleId._id
      const groupedBySchedule = dayRecords.reduce((acc, record) => {
        const scheduleKey = record.scheduleId?._id || "unknown";
        if (!acc[scheduleKey]) acc[scheduleKey] = [];
        acc[scheduleKey].push(record);
        return acc;
      }, {});

      // Procesar cada turno
      const shifts = Object.values(groupedBySchedule)
        .map((scheduleRecords) => processShiftRecords(scheduleRecords))
        .filter(Boolean)
        .sort((a, b) => {
          const aStart = a.schedule?.startTime || "99:99";
          const bStart = b.schedule?.startTime || "99:99";
          return aStart.localeCompare(bStart);
        });

      return {
        date,
        dateStr,
        shifts,
        hasRecords: dayRecords.some((r) => !r.isVirtual),
      };
    });
  }, [data]);

  const handleDayClick = (day) => {
    if (day.shifts?.length > 0) {
      setSelectedDay(day);
      setOpenDialog(true);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDay(null);
  };

  const DayCard = ({ day, timezone }) => {
    const { date, shifts, hasRecords } = day;

    const isDayToday = isSameDayInTimezone(date, new Date(), timezone);
    const dayName = format(date, "EEE", { locale: es }).toUpperCase();
    const dayNumber = format(date, "d");

    const shiftCount = shifts.length;
    const firstShift = shifts[0];
    const secondShift = shifts[1];

    if (shiftCount === 0) {
      return (
        <Grid>
          <Stack alignItems="center" spacing={1}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: isDayToday ? 700 : 600,
                color: isDayToday ? "primary.main" : "text.secondary",
                fontSize: "0.7rem",
              }}
            >
              {dayName}
            </Typography>
            <Box
              sx={{
                width: { xs: 44, sm: 56 },
                height: { xs: 44, sm: 56 },
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `2px dashed ${theme.palette.divider}`,
                color: theme.palette.text.disabled,
              }}
            >
              <Typography variant="body1" fontWeight={700}>
                {dayNumber}
              </Typography>
            </Box>
            <Box sx={{ height: 18 }} />
          </Stack>
        </Grid>
      );
    }

    return (
      <Grid>
        <Stack alignItems="center" spacing={1}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: isDayToday ? 700 : 600,
              color: isDayToday ? "primary.main" : "text.secondary",
              fontSize: "0.7rem",
            }}
          >
            {dayName}
          </Typography>

          {shiftCount >= 2 ? (
            <Tooltip
              title={
                <Box>
                  {shifts.slice(0, 2).map((shift, idx) => (
                    <Typography key={idx} variant="caption" display="block">
                      {shift.schedule?.name}:{" "}
                      {statusConfig[shift.shiftStatus]?.label}
                    </Typography>
                  ))}
                  {shiftCount > 2 && (
                    <Typography variant="caption" display="block">
                      +{shiftCount - 2} turno(s) más
                    </Typography>
                  )}
                </Box>
              }
              arrow
              placement="top"
            >
              <Box
                onClick={() => handleDayClick(day)}
                sx={{
                  position: "relative",
                  width: { xs: 44, sm: 56 },
                  height: { xs: 44, sm: 56 },
                  borderRadius: 2,
                  overflow: "hidden",
                  cursor: "pointer",
                  border: `2px solid ${theme.palette.divider}`,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    transform: "scale(1.08)",
                    boxShadow: theme.shadows[4],
                  },
                }}
              >
                {/* Triángulo superior */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: 0,
                    height: 0,
                    borderStyle: "solid",
                    borderWidth: { xs: "44px 44px 0 0", sm: "56px 56px 0 0" },
                    borderColor: `${statusConfig[firstShift.shiftStatus]?.colorHex} transparent transparent transparent`,
                  }}
                />
                {/* Triángulo inferior */}
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: 0,
                    height: 0,
                    borderStyle: "solid",
                    borderWidth: { xs: "0 0 44px 44px", sm: "0 0 56px 56px" },
                    borderColor: `transparent transparent ${statusConfig[secondShift.shiftStatus]?.colorHex} transparent`,
                  }}
                />
                {/* Número */}
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 1,
                    bgcolor: theme.palette.background.card,
                    borderRadius: "50%",
                    width: { xs: 24, sm: 28 },
                    height: { xs: 24, sm: 28 },
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: 2,
                  }}
                >
                  <Typography variant="body2" fontWeight={600}>
                    {dayNumber}
                  </Typography>
                </Box>
              </Box>
            </Tooltip>
          ) : (
            <Tooltip
              title={
                firstShift
                  ? `${firstShift.schedule?.name}: ${statusConfig[firstShift.shiftStatus]?.label}`
                  : ""
              }
              arrow
              placement="top"
            >
              <Box
                onClick={() => handleDayClick(day)}
                sx={{
                  width: { xs: 44, sm: 56 },
                  height: { xs: 44, sm: 56 },
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  bgcolor: alpha(
                    statusConfig[firstShift.shiftStatus]?.colorHex,
                    0.15,
                  ),
                  border: `2px solid ${statusConfig[firstShift.shiftStatus]?.colorHex}`,
                  color: statusConfig[firstShift.shiftStatus]?.colorHex,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    transform: "scale(1.08)",
                    boxShadow: theme.shadows[4],
                  },
                }}
              >
                <Typography variant="body1" fontWeight={700}>
                  {dayNumber}
                </Typography>
              </Box>
            </Tooltip>
          )}

          {hasRecords ? (
            <Box sx={{ height: 18 }}>
              {shiftCount >= 2 ? (
                <Stack direction="row" spacing={0.5}>
                  {React.createElement(
                    statusConfig[firstShift.shiftStatus]?.Icon,
                    {
                      sx: {
                        fontSize: 14,
                        color: statusConfig[firstShift.shiftStatus]?.colorHex,
                      },
                    },
                  )}
                  {React.createElement(
                    statusConfig[secondShift.shiftStatus]?.Icon,
                    {
                      sx: {
                        fontSize: 14,
                        color: statusConfig[secondShift.shiftStatus]?.colorHex,
                      },
                    },
                  )}
                </Stack>
              ) : (
                React.createElement(
                  statusConfig[firstShift.shiftStatus]?.Icon,
                  {
                    sx: {
                      fontSize: 18,
                      color: statusConfig[firstShift.shiftStatus]?.colorHex,
                    },
                  },
                )
              )}
            </Box>
          ) : (
            <Cancel
              sx={{ fontSize: 18, color: statusConfig.absent.colorHex }}
            />
          )}
        </Stack>
      </Grid>
    );
  };

  return (
    <>
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
            <TrendingUp />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Semana Actual
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {data?.periods?.week?.dateRange?.start &&
                format(parseISO(data.periods.week.dateRange.start), "d MMM", {
                  locale: es,
                })}{" "}
              -{" "}
              {data?.periods?.week?.dateRange?.end &&
                format(parseISO(data.periods.week.dateRange.end), "d MMM", {
                  locale: es,
                })}
            </Typography>
          </Box>
        </Stack>

        {/* Días de la semana */}
        <Grid container spacing={1.5} justifyContent="center">
          {weekDays.map((day, idx) => (
            <DayCard key={idx} day={day} />
          ))}
        </Grid>

        {/* Estadísticas */}
        <Divider sx={{ my: 2 }} />
        <Stack spacing={1.5}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{ width: "100%" }}
          >
            <Box
              sx={{
                flex: 1,
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: alpha(theme.palette.success.main, 0.08),
                textAlign: "center",
              }}
            >
              <Typography variant="h5" fontWeight={700} color="success.main">
                {data?.periods?.week?.stats?.present || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                A Tiempo
              </Typography>
            </Box>
            <Box
              sx={{
                flex: 1,
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: alpha(theme.palette.warning.main, 0.08),
                textAlign: "center",
              }}
            >
              <Typography variant="h5" fontWeight={700} color="warning.main">
                {data?.periods?.week?.stats?.late || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Tardanza
              </Typography>
            </Box>
            <Box
              sx={{
                flex: 1,
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                textAlign: "center",
              }}
            >
              <Typography variant="h5" fontWeight={700} color="primary.main">
                {data?.periods?.week?.stats?.early || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Temprano
              </Typography>
            </Box>
          </Stack>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{ width: "100%" }}
          >
            <Box
              sx={{
                flex: 1,
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: alpha(theme.palette.error.main, 0.08),
                textAlign: "center",
              }}
            >
              <Typography variant="h5" fontWeight={700} color="error.main">
                {data?.periods?.week?.stats?.earlyExit || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Salida Temprana
              </Typography>
            </Box>
            <Box
              sx={{
                flex: 1,
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: alpha(theme.palette.text.disabled, 0.08),
                textAlign: "center",
              }}
            >
              <Typography variant="h5" fontWeight={700} color="text.disabled">
                {data?.periods?.week?.stats?.absent || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Ausencias
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }} />
          </Stack>
        </Stack>
      </Paper>

      <AttendanceDetailsDialog
        open={openDialog}
        onClose={handleCloseDialog}
        day={selectedDay}
        statusConfig={statusConfig}
      />
    </>
  );
};

// Componente Dialog (mantiene la misma estructura que tenías)
const AttendanceDetailsDialog = ({ open, onClose, day, statusConfig }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!day) return null;

  const formatTime = (timestamp) => {
    if (!timestamp) return "-";
    return format(new Date(timestamp), "HH:mm:ss", { locale: es });
  };

  const formatDate = (date) => {
    return format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
  };

  const ShiftCard = ({ shift }) => {
    if (!shift) return null;
    console.log(shift);
    const config = statusConfig[shift.shiftStatus];
    const hasCheckIn = shift.checkIn !== null;
    const hasCheckOut = shift.checkOut !== null;
    console.log(config);
    return (
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 2,
          border: `2px solid ${theme.palette.divider}`,
          mb: 2,
        }}
      >
        {/* Header del turno */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Schedule sx={{ color: config.colorHex, fontSize: 24 }} />
            <Typography variant="h6" fontWeight={700}>
              {shift.schedule.name}
            </Typography>
          </Stack>
          <Chip
            icon={React.createElement(config.Icon, {
              sx: { fontSize: 18 },
            })}
            label={config.label}
            size="small"
            sx={{
              bgcolor: alpha(config.colorHex, 0.15),
              color: config.colorHex,
              border: `1px solid ${config.colorHex}`,
              fontWeight: 600,
              // Apuntamos directamente al icono interno
              "& .MuiChip-icon": {
                color: config.colorHex,
              },
            }}
          />
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {/* Check In */}
        <Box mb={2}>
          <Stack direction="row" alignItems="center" spacing={1} mb={1}>
            <LoginIcon
              sx={{ color: theme.palette.primary.main, fontSize: 20 }}
            />
            <Typography variant="subtitle2" fontWeight={700} color="primary">
              Entrada
            </Typography>
          </Stack>
          {hasCheckIn ? (
            <Stack spacing={1} pl={4}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <AccessTime sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography variant="body2">
                  <strong>Hora:</strong> {formatTime(shift.checkIn.timestamp)}
                </Typography>
                <Chip
                  label={
                    statusConfig[shift.checkIn.status]?.label ||
                    shift.checkIn.status
                  }
                  size="small"
                  sx={{
                    bgcolor: alpha(
                      statusConfig[shift.checkIn.status]?.colorHex || "#999",
                      0.1,
                    ),
                    color:
                      statusConfig[shift.checkIn.status]?.colorHex || "#999",
                    fontSize: "0.7rem",
                    height: 20,
                  }}
                />
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Computer sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography variant="body2">
                  <strong>Dispositivo:</strong>{" "}
                  {shift.checkIn.device?.name || "-"}
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Fingerprint sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography variant="body2">
                  <strong>Método:</strong>{" "}
                  {shift.checkIn.verificationMethod || "-"}
                </Typography>
              </Stack>
            </Stack>
          ) : (
            <Typography variant="body2" color="error" pl={4}>
              Sin registro de entrada
            </Typography>
          )}
        </Box>

        {/* Check Out */}
        <Box>
          <Stack direction="row" alignItems="center" spacing={1} mb={1}>
            <LogoutIcon
              sx={{ color: theme.palette.secondary.main, fontSize: 20 }}
            />
            <Typography variant="subtitle2" fontWeight={700} color="secondary">
              Salida
            </Typography>
          </Stack>
          {hasCheckOut ? (
            <Stack spacing={1} pl={4}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <AccessTime sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography variant="body2">
                  <strong>Hora:</strong> {formatTime(shift.checkOut.timestamp)}
                </Typography>
                <Chip
                  label={
                    statusConfig[shift.checkOut.status]?.label ||
                    shift.checkOut.status
                  }
                  size="small"
                  sx={{
                    bgcolor: alpha(
                      statusConfig[shift.checkOut.status]?.colorHex || "#999",
                      0.1,
                    ),
                    color:
                      statusConfig[shift.checkOut.status]?.colorHex || "#999",
                    fontSize: "0.7rem",
                    height: 20,
                  }}
                />
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Computer sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography variant="body2">
                  <strong>Dispositivo:</strong>{" "}
                  {shift.checkOut.device?.name || "-"}
                </Typography>
              </Stack>
            </Stack>
          ) : (
            <Typography variant="body2" color="error" pl={4}>
              Sin registro de salida
            </Typography>
          )}
        </Box>

        {/* Horas trabajadas */}
        {shift.hoursWorked && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.08),
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <AccessTime sx={{ fontSize: 18, color: "primary.main" }} />
              <Typography variant="body2" fontWeight={600}>
                Horas trabajadas: {shift.hoursWorked}
              </Typography>
            </Stack>
          </Box>
        )}

        {/* Justificación */}
        {shift.justification?.approved && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 1,
              bgcolor: alpha(theme.palette.info.main, 0.08),
            }}
          >
            <Stack direction="row" alignItems="flex-start" spacing={1}>
              <Assignment sx={{ fontSize: 18, color: "info.main", mt: 0.2 }} />
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  Justificación:
                </Typography>
                <Typography variant="body2">
                  {shift.justification.reason || ""}
                </Typography>
              </Box>
            </Stack>
          </Box>
        )}
      </Paper>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: "primary.main", width: 48, height: 48 }}>
              <CalendarToday />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Detalles de Asistencia
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDate(day.date)}
              </Typography>
            </Box>
          </Stack>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          {day.shifts?.map((shift, idx) => (
            <ShiftCard key={shift.schedule?._id || idx} shift={shift} />
          ))}

          {day.shifts?.length > 1 && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
              }}
            >
              <Typography
                variant="subtitle2"
                fontWeight={700}
                color="primary"
                mb={1}
              >
                Resumen del Día
              </Typography>
              <Grid container spacing={2}>
                <Grid size={6}>
                  <Typography variant="body2" color="text.secondary">
                    Total de turnos:
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {day.shifts.length} turno{day.shifts.length > 1 ? "s" : ""}
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="body2" color="text.secondary">
                    Horas totales:
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {(() => {
                      const total = day.shifts.reduce(
                        (acc, shift) => acc + (shift.minutesWorked || 0),
                        0,
                      );
                      const hours = Math.floor(total / 60);
                      const mins = total % 60;
                      return `${hours}h ${mins}m`;
                    })()}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} variant="contained" size="large">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AttendanceWeekView;

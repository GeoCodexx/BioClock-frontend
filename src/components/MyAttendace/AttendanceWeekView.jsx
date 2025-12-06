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

// Datos de ejemplo
const mockData = {
  periods: {
    week: {
      dateRange: {
        start: "2025-12-01",
        end: "2025-12-07",
      },
      stats: {
        total: 2,
        onTime: 0,
        late: 1,
        absent: 5,
        incomplete: 1,
        justified: 0,
        earlyExit: 1,
        totalHoursWorked: "0h 4m",
      },
      records: [
        {
          date: "2025-12-05",
          schedule: { _id: "1", name: "Horario Vespertino" },
          checkIn: null,
          checkOut: {
            timestamp: "2025-12-05T23:00:32.218Z",
            status: "on_time",
          },
          shiftStatus: "incomplete",
        },
        {
          date: "2025-12-05",
          schedule: { _id: "2", name: "Horario Matutino" },
          checkIn: { timestamp: "2025-12-05T14:49:47.133Z", status: "late" },
          checkOut: { timestamp: "2025-12-05T14:54:42.864Z", status: "early" },
          shiftStatus: "early_exit",
        },
      ],
    },
  },
};

const AttendanceWeekView = ({ data = mockData }) => {
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  const statusConfig = useMemo(
    () => ({
      on_time: {
        label: "A Tiempo",
        Icon: CheckCircle,
        colorHex: "#10b981",
      },
      /*complete: {
        label: "Completo",
        Icon: CheckCircle,
        colorHex: "#10b981",
      },*/
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
      justified: {
        label: "Justificado",
        Icon: InfoIcon,
        colorHex: "#3b82f6",
      },
      incomplete: {
        label: "Incompleto",
        Icon: ErrorIcon,
        colorHex: "#f44336",
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
    []
  );

  // Generar los 7 días de la semana con sus registros agrupados
  const weekDays = useMemo(() => {
    if (!data?.periods?.week?.dateRange?.start) return [];

    const weekStart = startOfWeek(parseISO(data.periods.week.dateRange.start), {
      weekStartsOn: 1, // Lunes
    });

    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(weekStart, i);
      const dateStr = format(date, "yyyy-MM-dd");

      // Buscar registros para este día
      const dayRecords = (data.periods.week.records || []).filter(
        (record) => record.date === dateStr
      );

      // Separar por horario
      const matutino = dayRecords.find((r) =>
        r.schedule.name.toLowerCase().includes("matutino")
      );
      const vespertino = dayRecords.find((r) =>
        r.schedule.name.toLowerCase().includes("vespertino")
      );

      return {
        date,
        dateStr,
        matutino: matutino || null,
        vespertino: vespertino || null,
        hasRecords: dayRecords.length > 0,
      };
    });
  }, [data]);

  const handleDayClick = (day) => {
    if (day.hasRecords) {
      setSelectedDay(day);
      setOpenDialog(true);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDay(null);
  };

  const DayCard = ({ day }) => {
    const { date, matutino, vespertino, hasRecords } = day;
    const isDayToday = isToday(date);
    const dayName = format(date, "EEE", { locale: es }).toUpperCase();
    const dayNumber = format(date, "d");

    // Determinar si tiene un solo horario o ambos
    const hasBothShifts = matutino && vespertino;
    const singleShift = matutino || vespertino;

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

          {hasBothShifts ? (
            // Cuadro dividido diagonalmente
            <Tooltip
              title={
                <Box>
                  <Typography variant="caption" display="block">
                    Matutino: {statusConfig[matutino.shiftStatus]?.label}
                  </Typography>
                  <Typography variant="caption" display="block">
                    Vespertino: {statusConfig[vespertino.shiftStatus]?.label}
                  </Typography>
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
                {/* Triángulo superior (Matutino) */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: 0,
                    height: 0,
                    borderStyle: "solid",
                    borderWidth: { xs: "44px 44px 0 0", sm: "56px 56px 0 0" },
                    borderColor: `${
                      statusConfig[matutino.shiftStatus]?.colorHex
                    } transparent transparent transparent`,
                  }}
                />

                {/* Triángulo inferior (Vespertino) */}
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: 0,
                    height: 0,
                    borderStyle: "solid",
                    borderWidth: { xs: "0 0 44px 44px", sm: "0 0 56px 56px" },
                    borderColor: `transparent transparent ${
                      statusConfig[vespertino.shiftStatus]?.colorHex
                    } transparent`,
                  }}
                />

                {/* Número del día */}
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 1,
                    bgcolor: "white",
                    borderRadius: "50%",
                    width: { xs: 24, sm: 28 },
                    height: { xs: 24, sm: 28 },
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: 2,
                  }}
                >
                  <Typography variant="body2" fontWeight={700}>
                    {dayNumber}
                  </Typography>
                </Box>
              </Box>
            </Tooltip>
          ) : (
            // Cuadro único
            <Tooltip
              title={
                singleShift
                  ? `${singleShift.schedule.name}: ${
                      statusConfig[singleShift.shiftStatus]?.label
                    }`
                  : statusConfig.absent.label
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
                  bgcolor: singleShift
                    ? alpha(
                        statusConfig[singleShift.shiftStatus]?.colorHex,
                        0.15
                      )
                    : "transparent",
                  border: singleShift
                    ? `2px solid ${
                        statusConfig[singleShift.shiftStatus]?.colorHex
                      }`
                    : `2px dashed ${theme.palette.divider}`,
                  color: singleShift
                    ? statusConfig[singleShift.shiftStatus]?.colorHex
                    : theme.palette.text.disabled,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    transform: "scale(1.08)",
                    boxShadow: singleShift ? theme.shadows[4] : "none",
                  },
                }}
              >
                <Typography variant="body1" fontWeight={700}>
                  {dayNumber}
                </Typography>
              </Box>
            </Tooltip>
          )}

          {/* Icono de estado */}
          {hasRecords && (
            <Box sx={{ height: 18 }}>
              {hasBothShifts ? (
                <Stack direction="row" spacing={0.5}>
                  {React.createElement(
                    statusConfig[matutino.shiftStatus]?.Icon,
                    {
                      sx: {
                        fontSize: 14,
                        color: statusConfig[matutino.shiftStatus]?.colorHex,
                      },
                    }
                  )}
                  {React.createElement(
                    statusConfig[vespertino.shiftStatus]?.Icon,
                    {
                      sx: {
                        fontSize: 14,
                        color: statusConfig[vespertino.shiftStatus]?.colorHex,
                      },
                    }
                  )}
                </Stack>
              ) : (
                React.createElement(
                  statusConfig[singleShift.shiftStatus]?.Icon,
                  {
                    sx: {
                      fontSize: 18,
                      color: statusConfig[singleShift.shiftStatus]?.colorHex,
                    },
                  }
                )
              )}
            </Box>
          )}
          {!hasRecords && (
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
          <Avatar sx={{ bgcolor: "secondary.main", width: 40, height: 40 }}>
            <TrendingUp />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Semana Actual
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {data.periods?.week?.dateRange?.start &&
                format(parseISO(data.periods.week.dateRange.start), "d MMM", {
                  locale: es,
                })}{" "}
              -{" "}
              {data.periods?.week?.dateRange?.end &&
                format(parseISO(data.periods.week.dateRange.end), "d MMM", {
                  locale: es,
                })}
            </Typography>
          </Box>
        </Stack>

        {/* Días de la semana */}
        <Grid container spacing={1.5} justifyContent="center" mb={3}>
          {weekDays.map((day, idx) => (
            <DayCard key={idx} day={day} />
          ))}
        </Grid>

        {/* Estadísticas de la semana */}
        <Divider sx={{ my: 2 }} />
        <Grid container spacing={2}>
          <Grid size={{ xs: 2 }}>
            <Box textAlign="center">
              <Typography variant="h5" fontWeight={700} color="success.main">
                {data?.periods?.week?.stats?.onTime || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                A Tiempo
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 2 }}>
            <Box textAlign="center">
              <Typography variant="h5" fontWeight={700} color="warning.main">
                {data?.periods?.week?.stats?.late || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Tardanza
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 2 }}>
            <Box textAlign="center">
              <Typography variant="h5" fontWeight={700} color="primary.main">
                {data?.periods?.week?.stats?.justified || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Justificado
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 2 }}>
            <Box textAlign="center">
              <Typography variant="h5" fontWeight={700} color="error.main">
                {data?.periods?.week?.stats?.incomplete || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Incompleto
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 2 }}>
            <Box textAlign="center">
              <Typography variant="h5" fontWeight={700} color="secondary.main">
                {data?.periods?.week?.stats?.earlyExit || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Salida temprano
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 2 }}>
            <Box textAlign="center">
              <Typography variant="h5" fontWeight={700} color="text.disabled">
                {data?.periods?.week?.stats?.absent || 0}
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
              <Typography variant="h5" fontWeight={700} color="primary.main">
                {data?.periods?.week?.stats?.totalHoursWorked || "0h 0m"}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Dialog de Detalles */}
      <AttendanceDetailsDialog
        open={openDialog}
        onClose={handleCloseDialog}
        day={selectedDay}
        statusConfig={statusConfig}
      />
    </>
  );
};

// Componente Dialog
const AttendanceDetailsDialog = ({ open, onClose, day, statusConfig }) => {
  const theme = useTheme();

  if (!day) return null;

  const formatTime = (timestamp) => {
    if (!timestamp) return "-";
    return format(parseISO(timestamp), "HH:mm:ss", { locale: es });
  };

  const formatDate = (date) => {
    return format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
  };

  const ShiftCard = ({ shift, shiftName }) => {
    if (!shift) return null;

    const config = statusConfig[shift.shiftStatus];
    const hasCheckIn = shift.checkIn !== null;
    const hasCheckOut = shift.checkOut !== null;

    return (
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 2,
          //border: `2px solid ${config.colorHex}`,
          border: `2px solid ${theme.palette.divider}`,
          //bgcolor: alpha(config.colorHex, 0.05),
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
              sx: { fontSize: 18},
            })}
            color={config.colorHex}
            label={config.label}
            size="small"
            sx={{
              bgcolor: alpha(config.colorHex, 0.15),
              //color: "white",
              color: config.colorHex,
              border: `1px solid ${config.colorHex}`,
              fontWeight: 600,
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
                      0.1
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
                      0.1
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
              <Stack direction="row" alignItems="center" spacing={1}>
                <Fingerprint sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography variant="body2">
                  <strong>Método:</strong>{" "}
                  {shift.checkOut.verificationMethod || "-"}
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
        {shift.justification && (
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
                <Typography variant="body2">{shift.justification}</Typography>
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
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
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
          {/* Turno Matutino */}
          {day.matutino && (
            <ShiftCard shift={day.matutino} shiftName="Matutino" />
          )}

          {/* Turno Vespertino */}
          {day.vespertino && (
            <ShiftCard shift={day.vespertino} shiftName="Vespertino" />
          )}

          {/* Resumen del día */}
          {day.matutino && day.vespertino && (
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
                    2 turnos
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="body2" color="text.secondary">
                    Horas totales:
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {(() => {
                      const mat = day.matutino?.minutesWorked || 0;
                      const vesp = day.vespertino?.minutesWorked || 0;
                      const total = mat + vesp;
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

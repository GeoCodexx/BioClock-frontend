import React, { useState, useMemo } from "react";
import {
  Paper,
  Box,
  Typography,
  Stack,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  IconButton,
  alpha,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  CalendarMonth,
  CheckCircle,
  Cancel,
  Error as ErrorIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  AccessTime,
  Schedule,
  Computer,
  Fingerprint,
  Assignment,
} from "@mui/icons-material";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

// Datos de ejemplo
const mockData = {
  periods: {
    month: {
      dateRange: {
        start: "2025-12-01",
        end: "2025-12-31",
      },
      stats: {
        total: 10,
        onTime: 3,
        late: 2,
        absent: 5,
        incomplete: 2,
        justified: 1,
        earlyExit: 2,
        totalHoursWorked: "48h 30m",
      },
      records: [
        {
          date: "2025-12-05",
          schedule: { _id: "1", name: "Horario Vespertino" },
          checkIn: null,
          checkOut: {
            timestamp: "2025-12-05T23:00:32.218Z",
            status: "on_time",
            device: {
              _id: "1",
              name: "PC-Oficina-1",
              location: "Oficina Principal",
            },
            verificationMethod: "fingerprint",
          },
          hoursWorked: null,
          minutesWorked: null,
          shiftStatus: "incomplete",
        },
        {
          date: "2025-12-05",
          schedule: { _id: "2", name: "Horario Matutino" },
          checkIn: {
            timestamp: "2025-12-05T14:49:47.133Z",
            status: "late",
            device: {
              _id: "1",
              name: "PC-Oficina-1",
              location: "Oficina Principal",
            },
            verificationMethod: "fingerprint",
          },
          checkOut: {
            timestamp: "2025-12-05T14:54:42.864Z",
            status: "early",
            device: {
              _id: "1",
              name: "PC-Oficina-1",
              location: "Oficina Principal",
            },
            verificationMethod: "fingerprint",
          },
          hoursWorked: "0h 4m",
          minutesWorked: 4,
          shiftStatus: "early_exit",
        },
        {
          date: "2025-12-03",
          schedule: { _id: "2", name: "Horario Matutino" },
          checkIn: {
            timestamp: "2025-12-03T08:00:00.000Z",
            status: "on_time",
            device: {
              _id: "1",
              name: "PC-Oficina-1",
              location: "Oficina Principal",
            },
            verificationMethod: "fingerprint",
          },
          checkOut: {
            timestamp: "2025-12-03T17:00:00.000Z",
            status: "on_time",
            device: {
              _id: "1",
              name: "PC-Oficina-1",
              location: "Oficina Principal",
            },
            verificationMethod: "fingerprint",
          },
          hoursWorked: "9h 0m",
          minutesWorked: 540,
          shiftStatus: "complete",
        },
        {
          date: "2025-12-10",
          schedule: { _id: "1", name: "Horario Vespertino" },
          checkIn: {
            timestamp: "2025-12-10T14:05:00.000Z",
            status: "late",
            device: {
              _id: "1",
              name: "PC-Oficina-1",
              location: "Oficina Principal",
            },
            verificationMethod: "facial",
          },
          checkOut: {
            timestamp: "2025-12-10T22:00:00.000Z",
            status: "on_time",
            device: {
              _id: "1",
              name: "PC-Oficina-1",
              location: "Oficina Principal",
            },
            verificationMethod: "facial",
          },
          hoursWorked: "7h 55m",
          minutesWorked: 475,
          shiftStatus: "late",
        },
      ],
    },
  },
};

const AttendanceMonthCalendar = ({ data = mockData }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

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

  // Convertir records a eventos de FullCalendar
  const calendarEvents = useMemo(() => {
    if (!data?.periods?.month?.records) return [];

    return data.periods.month.records.map((record) => {
      const config = statusConfig[record.shiftStatus];
      const isMatutino = record.schedule.name
        .toLowerCase()
        .includes("matutino");
      const abbreviation = isMatutino ? "HM" : "HV";

      return {
        id: `${record.date}-${record.schedule._id}`,
        title: isMobile ? abbreviation : record.schedule.name,
        start: record.date,
        allDay: true,
        backgroundColor: config.colorHex,
        borderColor: config.colorHex,
        textColor: "#ffffff",
        extendedProps: {
          record: record,
          status: record.shiftStatus,
          scheduleName: record.schedule.name,
          isMatutino: isMatutino,
        },
      };
    });
  }, [data, statusConfig, isMobile]);

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event.extendedProps);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEvent(null);
  };

  return (
    <>
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
          <Avatar sx={{ bgcolor: "primary.main", width: 40, height: 40 }}>
            <CalendarMonth />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Mes Actual
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {data.periods?.month?.dateRange?.start &&
                format(
                  parseISO(data.periods.month.dateRange.start),
                  "MMMM yyyy",
                  { locale: es }
                )}
            </Typography>
          </Box>
        </Stack>

        {/* FullCalendar */}
        <Box
          sx={{
            "& .fc": {
              fontSize: isMobile ? "0.75rem" : "0.875rem",
            },
            "& .fc-toolbar-title": {
              fontSize: isMobile ? "1rem" : "1.5rem",
              fontWeight: 700,
            },
            "& .fc-button": {
              fontSize: isMobile ? "0.75rem" : "0.875rem",
              padding: isMobile ? "0.25rem 0.5rem" : "0.4rem 0.65rem",
            },
            "& .fc-daygrid-day": {
              cursor: "pointer",
            },
            "& .fc-event": {
              cursor: "pointer",
              fontSize: isMobile ? "0.65rem" : "0.75rem",
              padding: isMobile ? "1px 2px" : "2px 4px",
              borderRadius: "4px",
              marginBottom: "2px",
              fontWeight: 600,
            },
            "& .fc-daygrid-day-number": {
              fontSize: isMobile ? "0.75rem" : "0.875rem",
              padding: isMobile ? "4px" : "8px",
            },
            "& .fc-col-header-cell-cushion": {
              fontSize: isMobile ? "0.7rem" : "0.875rem",
              fontWeight: 600,
              padding: isMobile ? "4px" : "8px",
            },
          }}
        >
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locale={esLocale}
            headerToolbar={false}  // ← Oculta completamente el header
            /*headerToolbar={{
              left: isMobile ? "prev,next" : "prev,next today",
              center: "title",
              right: isMobile ? "" : "dayGridMonth",
            }}*/
            events={calendarEvents}
            eventClick={handleEventClick}
            height={isMobile ? "auto" : 600}
            dayMaxEvents={isMobile ? 2 : 3}
            moreLinkText={isMobile ? "+" : "más"}
            eventDisplay="block"
            fixedWeekCount={false}
            showNonCurrentDates={false}
          />
        </Box>

        {/* Leyenda */}
        <Box mt={3}>
          <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
            Leyenda de Estados
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {Object.entries(statusConfig).map(([key, config]) => (
              <Chip
                key={key}
                icon={React.createElement(config.Icon, {
                  sx: { fontSize: 16 },
                })}
                label={config.label}
                size="small"
                sx={{
                  bgcolor: alpha(config.colorHex, 0.1),
                  color: config.colorHex,
                  border: `1px solid ${alpha(config.colorHex, 0.3)}`,
                  fontWeight: 600,
                  fontSize: isMobile ? "0.7rem" : "0.75rem",
                }}
              />
            ))}
          </Stack>
          {isMobile && (
            <Typography
              variant="caption"
              color="text.secondary"
              mt={1.5}
              display="block"
            >
              <strong>HM:</strong> Horario Matutino | <strong>HV:</strong>{" "}
              Horario Vespertino
            </Typography>
          )}
        </Box>
      </Paper>

      {/* Dialog de Detalles */}
      <AttendanceEventDialog
        open={openDialog}
        onClose={handleCloseDialog}
        event={selectedEvent}
        statusConfig={statusConfig}
      />
    </>
  );
};

// Componente Dialog para mostrar detalles del evento
const AttendanceEventDialog = ({ open, onClose, event, statusConfig }) => {
  const theme = useTheme();

  if (!event) return null;

  const { record } = event;
  const config = statusConfig[record.shiftStatus];

  const formatTime = (timestamp) => {
    if (!timestamp) return "-";
    return format(parseISO(timestamp), "HH:mm:ss", { locale: es });
  };

  const formatDate = (dateStr) => {
    return format(parseISO(dateStr), "EEEE, d 'de' MMMM 'de' yyyy", {
      locale: es,
    });
  };

  const hasCheckIn = record.checkIn !== null;
  const hasCheckOut = record.checkOut !== null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      /*PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}*/
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
          },
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
            <Avatar
              sx={{
                bgcolor: config.colorHex,
                width: 48,
                height: 48,
              }}
            >
              <Schedule />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {record.schedule.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDate(record.date)}
              </Typography>
            </Box>
          </Stack>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2.5}>
          {/* Estado del turno */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" mb={1}>
              Estado del Turno
            </Typography>
            <Chip
              icon={React.createElement(config.Icon, { sx: { fontSize: 18 } })}
              label={config.label}
              color={config.colorHex}
              sx={{
                bgcolor: `${config.colorHex}15`,
                border: `1px solid ${alpha(config.colorHex, 0.3)}`,
                color: config.colorHex,
                fontWeight: 600,
                fontSize: "0.875rem",
                height: 32,
              }}
            />
          </Box>

          {/* Check In */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
              <LoginIcon
                sx={{ color: theme.palette.primary.main, fontSize: 22 }}
              />
              <Typography variant="subtitle2" fontWeight={700} color="primary">
                Entrada
              </Typography>
            </Stack>
            {hasCheckIn ? (
              <Stack spacing={1.5}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <AccessTime sx={{ fontSize: 18, color: "text.secondary" }} />
                  <Typography variant="body2">
                    <strong>Hora:</strong>{" "}
                    {formatTime(record.checkIn.timestamp)}
                  </Typography>
                  <Chip
                    label={
                      statusConfig[record.checkIn.status]?.label ||
                      record.checkIn.status
                    }
                    size="small"
                    sx={{
                      bgcolor: alpha(
                        statusConfig[record.checkIn.status]?.colorHex || "#999",
                        0.1
                      ),
                      color:
                        statusConfig[record.checkIn.status]?.colorHex || "#999",
                      fontSize: "0.7rem",
                      height: 20,
                      fontWeight: 600,
                    }}
                  />
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Computer sx={{ fontSize: 18, color: "text.secondary" }} />
                  <Typography variant="body2">
                    <strong>Dispositivo:</strong>{" "}
                    {record.checkIn.device?.name || "-"}
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Fingerprint sx={{ fontSize: 18, color: "text.secondary" }} />
                  <Typography
                    variant="body2"
                    sx={{ textTransform: "capitalize" }}
                  >
                    <strong>Método:</strong>{" "}
                    {record.checkIn.verificationMethod || "-"}
                  </Typography>
                </Stack>
              </Stack>
            ) : (
              <Typography variant="body2" color="error" fontWeight={600}>
                ⚠️ Sin registro de entrada
              </Typography>
            )}
          </Paper>

          {/* Check Out */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.secondary.main, 0.05),
              border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
              <LogoutIcon
                sx={{ color: theme.palette.secondary.main, fontSize: 22 }}
              />
              <Typography
                variant="subtitle2"
                fontWeight={700}
                color="secondary"
              >
                Salida
              </Typography>
            </Stack>
            {hasCheckOut ? (
              <Stack spacing={1.5}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <AccessTime sx={{ fontSize: 18, color: "text.secondary" }} />
                  <Typography variant="body2">
                    <strong>Hora:</strong>{" "}
                    {formatTime(record.checkOut.timestamp)}
                  </Typography>
                  <Chip
                    label={
                      statusConfig[record.checkOut.status]?.label ||
                      record.checkOut.status
                    }
                    size="small"
                    sx={{
                      bgcolor: alpha(
                        statusConfig[record.checkOut.status]?.colorHex ||
                          "#999",
                        0.1
                      ),
                      color:
                        statusConfig[record.checkOut.status]?.colorHex ||
                        "#999",
                      fontSize: "0.7rem",
                      height: 20,
                      fontWeight: 600,
                    }}
                  />
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Computer sx={{ fontSize: 18, color: "text.secondary" }} />
                  <Typography variant="body2">
                    <strong>Dispositivo:</strong>{" "}
                    {record.checkOut.device?.name || "-"}
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Fingerprint sx={{ fontSize: 18, color: "text.secondary" }} />
                  <Typography
                    variant="body2"
                    sx={{ textTransform: "capitalize" }}
                  >
                    <strong>Método:</strong>{" "}
                    {record.checkOut.verificationMethod || "-"}
                  </Typography>
                </Stack>
              </Stack>
            ) : (
              <Typography variant="body2" color="error" fontWeight={600}>
                ⚠️ Sin registro de salida
              </Typography>
            )}
          </Paper>

          {/* Horas trabajadas */}
          {record.hoursWorked && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.success.main, 0.08),
                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <AccessTime sx={{ fontSize: 22, color: "success.main" }} />
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Tiempo trabajado
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    color="success.main"
                  >
                    {record.hoursWorked}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          )}

          {/* Justificación */}
          {record.justification && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.info.main, 0.08),
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
              }}
            >
              <Stack direction="row" alignItems="flex-start" spacing={1}>
                <Assignment
                  sx={{ fontSize: 22, color: "info.main", mt: 0.2 }}
                />
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    mb={0.5}
                  >
                    Justificación:
                  </Typography>
                  <Typography variant="body2">
                    {record.justification}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} variant="contained" size="large" fullWidth>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AttendanceMonthCalendar;

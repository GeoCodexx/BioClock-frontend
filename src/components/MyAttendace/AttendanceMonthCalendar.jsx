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
  Divider,
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

const AttendanceMonthCalendar = ({ data }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDayData, setSelectedDayData] = useState(null);

  const statusConfig = useMemo(
    () => ({
      on_time: {
        label: "A Tiempo",
        Icon: CheckCircle,
        colorHex: "#10b981",
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
      incomplete: {
        label: "Incompleto",
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
   * Procesar registros agrupados del backend y convertirlos a eventos de FullCalendar
   * Backend estructura: { "2026-01-19": [{...}, {...}], "2026-01-20": [...] }
   */
  const calendarEvents = useMemo(() => {
    if (!data?.periods?.month?.records) return [];

    const records = data.periods.month.records;
    const events = [];

    Object.entries(records).forEach(([dateStr, dayRecords]) => {
      // Procesar cada horario del día
      const scheduleGroups = {};

      dayRecords.forEach((record) => {
        const scheduleId = record.scheduleId?._id?.toString();
        const scheduleName = record.scheduleId?.name || "Sin horario";

        if (!scheduleGroups[scheduleId]) {
          scheduleGroups[scheduleId] = {
            scheduleName,
            scheduleId,
            records: [],
            isVirtual: false,
          };
        }

        scheduleGroups[scheduleId].records.push(record);

        // Marcar si todo el grupo es virtual (ausencia)
        if (record.isVirtual) {
          scheduleGroups[scheduleId].isVirtual = true;
        }
      });

      // Crear un evento por cada horario
      Object.values(scheduleGroups).forEach((group) => {
        const checkIn = group.records.find((r) => r.type === "IN");
        const checkOut = group.records.find((r) => r.type === "OUT");

        // Determinar estado del turno
        let shiftStatus = "absent";
        if (checkIn?.isVirtual) {
          shiftStatus = "absent";
        } else if (checkIn && checkOut) {
          if (checkOut.status === "early_exit") {
            shiftStatus = "early_exit";
          } else if (checkIn.status === "late") {
            shiftStatus = "late";
          } else {
            shiftStatus = "on_time";
          }
        } else if (checkIn && !checkOut) {
          shiftStatus = "incomplete"; // Falta salida → Incompleto
        } else if (!checkIn && checkOut) {
          shiftStatus = "incomplete"; // Falta entrada → Incompleto
        }

        const config = statusConfig[shiftStatus];
        const isMatutino = group.scheduleName
          .toLowerCase()
          .includes("matutino");
        const abbreviation = isMatutino ? "HM" : "HV";

        events.push({
          id: `${dateStr}-${group.scheduleId}`,
          title: isMobile ? abbreviation : group.scheduleName,
          start: dateStr,
          allDay: true,
          backgroundColor: config.colorHex,
          borderColor: config.colorHex,
          textColor: "#ffffff",
          extendedProps: {
            dateStr,
            scheduleName: group.scheduleName,
            shiftStatus,
            isMatutino,
            checkIn: checkIn?.isVirtual ? null : checkIn,
            checkOut: checkOut?.isVirtual ? null : checkOut,
            isVirtual: group.isVirtual,
          },
        });
      });
    });

    return events;
  }, [data, statusConfig, isMobile]);

  const handleEventClick = (clickInfo) => {
    const eventData = clickInfo.event.extendedProps;
    setSelectedDayData({
      date: clickInfo.event.start,
      dateStr: eventData.dateStr,
      ...eventData,
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDayData(null);
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
              {data?.periods?.month?.dateRange?.start &&
                format(
                  parseISO(data.periods.month.dateRange.start),
                  "MMMM yyyy",
                  { locale: es },
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
            headerToolbar={false}
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
        dayData={selectedDayData}
        statusConfig={statusConfig}
      />
    </>
  );
};

/**
 * Componente Dialog mejorado para mostrar detalles del evento
 */
const AttendanceEventDialog = ({ open, onClose, dayData, statusConfig }) => {
  const theme = useTheme();

  if (!dayData) return null;

  const config = statusConfig[dayData.shiftStatus];

  const formatTime = (timestamp) => {
    if (!timestamp) return "-";
    try {
      return format(new Date(timestamp), "HH:mm:ss", { locale: es });
    } catch (error) {
      return "-";
    }
  };

  const formatDate = (date) => {
    return format(date, "EEEE, d 'de' MMMM 'de' yyyy", {
      locale: es,
    });
  };

  const hasCheckIn =
    dayData.checkIn !== null &&
    !dayData.isVirtual &&
    dayData.checkIn?.timestamp;
  const hasCheckOut =
    dayData.checkOut !== null &&
    !dayData.isVirtual &&
    dayData.checkOut?.timestamp;

  // Calcular horas trabajadas
  let hoursWorked = null;
  if (
    hasCheckIn &&
    hasCheckOut &&
    dayData.checkIn.timestamp &&
    dayData.checkOut.timestamp
  ) {
    const start = new Date(dayData.checkIn.timestamp);
    const end = new Date(dayData.checkOut.timestamp);
    const minutesWorked = Math.floor((end - start) / 60000);
    const hours = Math.floor(minutesWorked / 60);
    const mins = minutesWorked % 60;
    hoursWorked = `${hours}h ${mins}m`;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
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
                {dayData.scheduleName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDate(dayData.date)}
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
              sx={{
                bgcolor: alpha(config.colorHex, 0.15),
                border: `1px solid ${alpha(config.colorHex, 0.3)}`,
                color: config.colorHex,
                fontWeight: 600,
                fontSize: "0.875rem",
                height: 32,
              }}
            />
          </Box>

          {/* Mensaje de ausencia */}
          {dayData.isVirtual && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.warning.main, 0.08),
                border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <InfoIcon sx={{ color: "warning.main", fontSize: 22 }} />
                <Box>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color="warning.main"
                  >
                    Ausencia Detectada
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    No se encontraron registros de asistencia para este turno
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          )}

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
                    {formatTime(dayData.checkIn.timestamp)}
                  </Typography>
                  <Chip
                    label={
                      statusConfig[dayData.checkIn.status]?.label ||
                      dayData.checkIn.status
                    }
                    size="small"
                    sx={{
                      bgcolor: alpha(
                        statusConfig[dayData.checkIn.status]?.colorHex ||
                          "#999",
                        0.1,
                      ),
                      color:
                        statusConfig[dayData.checkIn.status]?.colorHex ||
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
                    {dayData.checkIn.deviceId?.name || "-"}
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Fingerprint sx={{ fontSize: 18, color: "text.secondary" }} />
                  <Typography
                    variant="body2"
                    sx={{ textTransform: "capitalize" }}
                  >
                    <strong>Método:</strong>{" "}
                    {dayData.checkIn.verificationMethod || "-"}
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
                    {formatTime(dayData.checkOut.timestamp)}
                  </Typography>
                  <Chip
                    label={
                      statusConfig[dayData.checkOut.status]?.label ||
                      dayData.checkOut.status
                    }
                    size="small"
                    sx={{
                      bgcolor: alpha(
                        statusConfig[dayData.checkOut.status]?.colorHex ||
                          "#999",
                        0.1,
                      ),
                      color:
                        statusConfig[dayData.checkOut.status]?.colorHex ||
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
                    {dayData.checkOut.deviceId?.name || "-"}
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Fingerprint sx={{ fontSize: 18, color: "text.secondary" }} />
                  <Typography
                    variant="body2"
                    sx={{ textTransform: "capitalize" }}
                  >
                    <strong>Método:</strong>{" "}
                    {dayData.checkOut.verificationMethod || "-"}
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
          {hoursWorked && (
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
                    {hoursWorked}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          )}

          {/* Justificación */}
          {(dayData.checkIn?.justification?.approved ||
            dayData.checkOut?.justification?.approved) && (
            <Paper
              elevation={0}
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
                    variant="subtitle2"
                    fontWeight={700}
                    color="info.main"
                    mb={0.5}
                  >
                    Justificación Aprobada
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {dayData.checkIn?.justification?.reason ||
                      dayData.checkOut?.justification?.reason ||
                      "Sin descripción"}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
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

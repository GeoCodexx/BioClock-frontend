import React, { useState, useMemo, useRef } from "react";
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
  TextField,
  Collapse,
  Alert,
  Grid,
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
  AttachFile,
  Send,
} from "@mui/icons-material";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
//import useAuthStore from "../../store/useAuthStore";
import useSnackbarStore from "../../store/useSnackbarStore";
import { createJustification } from "../../services/justificationService";

const AttendanceMonthCalendar = ({ data, fetchData }) => {
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
        color: theme.palette.success.main,
      },
      late: {
        label: "Tardanza",
        Icon: ErrorIcon,
        colorHex: "#f59e0b",
        color: theme.palette.warning.main,
      },
      early: {
        label: "Temprano",
        Icon: InfoIcon,
        colorHex: "#3b82f6",
        color: theme.palette.info.main,
      },
      early_exit: {
        label: "Salida Temprana",
        Icon: ErrorIcon,
        colorHex: "#9c27b0", //"#9c27b0"
        color: theme.palette.secondary.main,
      },
      incomplete: {
        label: "Incompleto",
        Icon: ErrorIcon,
        colorHex: "#f44336",
        color: theme.palette.warning.dark,
      },
      absent: {
        label: "Ausente",
        Icon: Cancel,
        colorHex: "#9ca3af",
        color: theme.palette.error.main,
      },
      justified: {
        // NUEVO
        label: "Justificado",
        Icon: Assignment,
        colorHex: "#3b82f6", // Púrpura
        color: theme.palette.info.main,
      },
    }),
    [],
  );

  const calendarEvents = useMemo(() => {
    if (!data?.periods?.month?.records) return [];

    const records = data.periods.month.records;
    const events = [];
    const userId = data?.user?.id;

    Object.entries(records).forEach(([dateStr, scheduleGroups]) => {
      // Los datos ya vienen agrupados y procesados desde el backend
      scheduleGroups.forEach((group) => {
        const config = statusConfig[group.shiftStatus] || statusConfig.absent;
        const isMatutino = group.scheduleName
          .toLowerCase()
          .includes("matutino");
        const abbreviation = isMatutino ? "HM" : "HV";

        events.push({
          id: `${dateStr}-${group.scheduleId}`,
          title: isMobile ? abbreviation : group.scheduleName,
          start: dateStr,
          allDay: true,
          backgroundColor: config.color + "14",
          borderColor: config.color + "40",
          //textColor: "#ffffff",
          textColor: config.color,
          extendedProps: {
            dateStr,
            userId,
            scheduleId: group.scheduleId,
            scheduleName: group.scheduleName,
            scheduleInfo: group.scheduleInfo,
            shiftStatus: group.shiftStatus,
            isMatutino,
            checkIn: group.checkIn,
            checkOut: group.checkOut,
            isVirtual: group.isVirtual,
            justification: group.justification, // Nueva propiedad
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
            {Object.entries(statusConfig).map(
              ([key, config]) =>
                key !== "early" && (
                  <Chip
                    key={key}
                    /* icon={React.createElement(config.Icon, {
                  sx: { fontSize: 16 },
                })}*/
                    label={config.label}
                    size="small"
                    sx={{
                      //bgcolor: alpha(config.colorHex, 0.1),
                      bgcolor: config.color + "14",
                      //color: config.colorHex,
                      color: config.color,
                      //border: `1px solid ${alpha(config.colorHex, 0.3)}`,
                      border: `1px solid ${alpha(config.color, 0.5)}`,
                      fontWeight: 600,
                      fontSize: isMobile ? "0.7rem" : "0.75rem",
                    }}
                  />
                ),
            )}
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
        fetchData={fetchData}
      />
    </>
  );
};

/**
 * Componente Dialog mejorado para mostrar detalles del evento
 */
const AttendanceEventDialog = ({
  open,
  onClose,
  dayData,
  statusConfig,
  fetchData,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [showJustificationForm, setShowJustificationForm] = useState(false);
  const [justification, setJustification] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { showSuccess, showError } = useSnackbarStore();

  const justificationInputRef = useRef(null);

  if (!dayData) return null;

  const config = statusConfig[dayData.shiftStatus];

  // Determinar si se puede justificar este turno
  /*const canJustify = ["late", "early_exit", "absent"].includes(
    dayData.shiftStatus,
  );*/

  // Cambiar la lógica para no mostrar justificar si ya existe una
  const canJustify =
    ["late", "early_exit", "absent"].includes(dayData.shiftStatus) &&
    !dayData.justification;

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

  //const hasJustification = dayData.justification !== null;

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

  const handleJustifyClick = () => {
    setShowJustificationForm(true);
    // Enfocar el input después de que el formulario se expanda
    setTimeout(() => {
      justificationInputRef.current?.focus();
    }, 100);
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitJustification = async () => {
    if (!justification.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        userId: dayData.userId,
        reason: justification,
        date: dayData.dateStr,
        scheduleId: dayData.scheduleId,
      };

      const res = await createJustification(payload, selectedFiles);

      showSuccess(res?.data?.message || "Justificación enviada correctamente");

      // Resetear el formulario
      setJustification("");
      setSelectedFiles([]);
      setShowJustificationForm(false);
      fetchData();
      onClose();

      // Aquí podrías mostrar un mensaje de éxito
      //alert("Justificación enviada correctamente");
    } catch (error) {
      console.error("Error al enviar justificación:", error);

      // 1. Verifica que el servidor realmente respondió (error.response existe)
      if (error.response) {
        const status = error.response.status;
        const serverMessage = error.response.data?.message; // <--- AQUÍ está tu mensaje

        if (status === 400) {
          showError(serverMessage || "Datos inválidos, revisa la información.");
        } else {
          showError(serverMessage || `Error del servidor (${status})`);
        }
      }
      // 2. Si no hay respuesta (error de red o servidor caído)
      else if (error.request) {
        showError("No se pudo conectar con el servidor. Revisa tu internet.");
      }
      // 3. Otros errores (configuración)
      else {
        showError("Ocurrió un error inesperado.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelJustification = () => {
    setShowJustificationForm(false);
    setJustification("");
    setSelectedFiles([]);
  };

  const handleClose = () => {
    handleCancelJustification();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
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
                bgcolor: config.color,
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
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2.5}>
          {/* Estado del turno */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="subtitle2" color="text.secondary" mb={1}>
              Estado del Turno:
            </Typography>
            <Chip
              //icon={React.createElement(config.Icon, { sx: { fontSize: 18 } })}
              label={config.label}
              sx={{
                bgcolor: alpha(config.color, 0.15),
                border: `1px solid ${alpha(config.color, 0.3)}`,
                color: alpha(config.color, 0.8),
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
                    //fontWeight={600}
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
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              {" "}
              {/* Check In */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  /*bgcolor: alpha(theme.palette.primary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,*/
                  bgcolor: "background.card",
                  border:
                    theme.palette.mode === "dark"
                      ? "none"
                      : `1px solid ${theme.palette.divider}`,
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                  <LoginIcon
                    sx={{ color: theme.palette.success.main, fontSize: 22 }}
                  />
                  <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    color="success"
                  >
                    Entrada
                  </Typography>
                </Stack>
                {hasCheckIn ? (
                  <Stack spacing={1.5}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <AccessTime
                        sx={{ fontSize: 18, color: "text.secondary" }}
                      />
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
                      <Computer
                        sx={{ fontSize: 18, color: "text.secondary" }}
                      />
                      <Typography variant="body2">
                        <strong>Dispositivo:</strong>{" "}
                        {dayData.checkIn.deviceId?.name || "-"}
                      </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Fingerprint
                        sx={{ fontSize: 18, color: "text.secondary" }}
                      />
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
                  <Typography variant="body2" color="text.secondary">
                    Sin registro de entrada
                  </Typography>
                )}
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              {/* Check Out */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  /*bgcolor: alpha(theme.palette.secondary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,*/
                  bgcolor: "background.card",
                  border:
                    theme.palette.mode === "dark"
                      ? "none"
                      : `1px solid ${theme.palette.divider}`,
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                  <LogoutIcon
                    sx={{ color: theme.palette.error.main, fontSize: 22 }}
                  />
                  <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    color="error"
                  >
                    Salida
                  </Typography>
                </Stack>
                {hasCheckOut ? (
                  <Stack spacing={1.5}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <AccessTime
                        sx={{ fontSize: 18, color: "text.secondary" }}
                      />
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
                      <Computer
                        sx={{ fontSize: 18, color: "text.secondary" }}
                      />
                      <Typography variant="body2">
                        <strong>Dispositivo:</strong>{" "}
                        {dayData.checkOut.deviceId?.name || "-"}
                      </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Fingerprint
                        sx={{ fontSize: 18, color: "text.secondary" }}
                      />
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
                  <Typography variant="body2" color="text.secondary">
                    Sin registro de salida
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
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
          {/* Estado de Justificación si existe*/}
          {dayData.justification && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                //bgcolor: alpha(theme.palette.purple?.[500] || "#9c27b0", 0.08),
                bgcolor:
                  dayData.justification.status === "approved"
                    ? alpha(theme.palette.primary.main, 0.08)
                    : dayData.justification.status === "pending"
                      ? alpha(theme.palette.warning.main, 0.08)
                      : alpha(theme.palette.error.main, 0.08),
                /*border: `1px solid ${alpha(theme.palette.purple?.[500] || "#9c27b0", 0.2)}`,*/
                border: `1px solid ${
                  dayData.justification.status === "approved"
                    ? alpha(theme.palette.primary.main, 0.2)
                    : dayData.justification.status === "pending"
                      ? alpha(theme.palette.warning.main, 0.2)
                      : alpha(theme.palette.error.main, 0.2)
                }`,
              }}
            >
              <Stack spacing={1.5}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Assignment
                    sx={{
                      color:
                        dayData.justification.status === "approved"
                          ? theme.palette.primary.main
                          : dayData.justification.status === "pending"
                            ? theme.palette.warning.main
                            : theme.palette.error.main,
                      fontSize: 22,
                    }}
                  />
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    // sx={{ color: "#9c27b0" }}
                    sx={{
                      color:
                        dayData.justification.status === "approved"
                          ? theme.palette.primary.main
                          : dayData.justification.status === "pending"
                            ? theme.palette.warning.main
                            : theme.palette.error.main,
                    }}
                  >
                    Justificación{" "}
                    {dayData.justification.status === "approved"
                      ? "Aprobada"
                      : dayData.justification.status === "pending"
                        ? "Pendiente"
                        : "Rechazada"}
                  </Typography>
                </Stack>
                <Typography variant="body2">
                  {dayData.justification.reason}
                </Typography>
                {dayData.justification.documents?.length > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    📎 {dayData.justification.documents.length} documento(s)
                    adjunto(s)
                  </Typography>
                )}
              </Stack>
            </Paper>
          )}

          {/* Formulario de justificación */}
          {canJustify && (
            <>
              <Divider sx={{ my: 1 }} />

              {!showJustificationForm ? (
                <Alert
                  severity="info"
                  icon={<Assignment />}
                  action={
                    <Button
                      //color="inherit"
                      size="small"
                      onClick={handleJustifyClick}
                      //startIcon={<Assignment />}
                      variant="outlined"
                    >
                      Justificar
                    </Button>
                  }
                >
                  ¿Quieres agregar una justificación?
                </Alert>
              ) : (
                <Collapse in={showJustificationForm}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.info.main, 0.05),
                      border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                    }}
                  >
                    <Stack spacing={2}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        mb={1}
                      >
                        <Assignment sx={{ color: "info.main", fontSize: 22 }} />
                        <Typography
                          variant="subtitle2"
                          fontWeight={700}
                          color="info.main"
                        >
                          Justificación
                        </Typography>
                      </Stack>

                      <TextField
                        inputRef={justificationInputRef}
                        fullWidth
                        multiline
                        rows={4}
                        placeholder="Describe el motivo de la tardanza, salida temprana o ausencia..."
                        value={justification}
                        onChange={(e) => setJustification(e.target.value)}
                        variant="outlined"
                        disabled={isSubmitting}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            bgcolor: "background.paper",
                          },
                        }}
                      />

                      {/* Área de carga de archivos */}
                      <Box>
                        <Button
                          variant="outlined"
                          component="label"
                          startIcon={<AttachFile />}
                          disabled={isSubmitting}
                          size="small"
                          sx={{ mb: 1 }}
                        >
                          Adjuntar documentos
                          <input
                            type="file"
                            hidden
                            multiple
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={handleFileChange}
                          />
                        </Button>

                        {selectedFiles.length > 0 && (
                          <Stack spacing={1} mt={1}>
                            {selectedFiles.map((file, index) => (
                              <Paper
                                key={index}
                                elevation={0}
                                sx={{
                                  p: 1,
                                  bgcolor: alpha(theme.palette.grey[500], 0.1),
                                  borderRadius: 1,
                                }}
                              >
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  justifyContent="space-between"
                                >
                                  <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={1}
                                  >
                                    <AttachFile sx={{ fontSize: 18 }} />
                                    <Typography variant="body2">
                                      {file.name}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      ({(file.size / 1024).toFixed(1)} KB)
                                    </Typography>
                                  </Stack>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleRemoveFile(index)}
                                    disabled={isSubmitting}
                                  >
                                    <CloseIcon fontSize="small" />
                                  </IconButton>
                                </Stack>
                              </Paper>
                            ))}
                          </Stack>
                        )}
                      </Box>

                      {/* Botones de acción */}
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="flex-end"
                      >
                        <Button
                          variant="outlined"
                          onClick={handleCancelJustification}
                          disabled={isSubmitting}
                        >
                          Cancelar
                        </Button>
                        <Button
                          variant="contained"
                          onClick={handleSubmitJustification}
                          disabled={!justification.trim() || isSubmitting}
                          startIcon={<Send />}
                        >
                          {isSubmitting ? "Enviando..." : "Enviar"}
                        </Button>
                      </Stack>
                    </Stack>
                  </Paper>
                </Collapse>
              )}
            </>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button
          onClick={handleClose}
          variant="contained"
          size="large"
          fullWidth
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AttendanceMonthCalendar;

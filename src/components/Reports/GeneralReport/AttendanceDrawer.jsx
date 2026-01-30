// components/AttendanceDrawer.jsx
// Drawer refactorizado para usarse tanto en tabla como en matriz
import React, { useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Chip,
  Button,
  TextField,
  Collapse,
  Alert,
  Stack,
  Avatar,
  Paper,
  Grid,
  CircularProgress,
} from "@mui/material";
import {
  Close as CloseIcon,
  Schedule as ScheduleIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Timer as TimerIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

/**
 * AttendanceDrawer - Componente reutilizable para mostrar detalles de asistencia
 * @param {boolean} open - Estado del drawer
 * @param {function} onClose - Callback al cerrar
 * @param {object} record - Registro de asistencia (puede venir de tabla o matriz)
 * @param {function} onJustify - Callback para justificar asistencia
 * @param {string} source - Origen: 'table' | 'matrix' (opcional)
 */
const AttendanceDrawer = ({ open, onClose, record, onJustify, source = 'table' }) => {
  const [showJustificationForm, setShowJustificationForm] = useState(false);
  const [justificationReason, setJustificationReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Estados que permiten justificación
  const canJustify = record && ["early_exit", "late", "absent", "incomplete"].includes(
    record?.shiftStatus,
  );

  // Resetear estado al cerrar
  const handleClose = () => {
    setShowJustificationForm(false);
    setJustificationReason("");
    setError(null);
    onClose();
  };

  // Toggle formulario de justificación
  const handleJustifyClick = () => {
    setShowJustificationForm(!showJustificationForm);
    setError(null);
  };

  // Enviar justificación
  const handleSubmitJustification = async () => {
    if (!justificationReason.trim()) {
      setError("Debe ingresar un motivo de justificación");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onJustify({
        userId: record.user._id,
        scheduleId: record.schedule._id,
        date: record.date,
        reason: justificationReason.trim(),
      });

      // Resetear y cerrar
      setJustificationReason("");
      setShowJustificationForm(false);
      handleClose();
    } catch (err) {
      setError(err.message || "Error al enviar la justificación");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancelar justificación
  const handleCancelJustification = () => {
    setShowJustificationForm(false);
    setJustificationReason("");
    setError(null);
  };

  // Función para obtener color según estado
  const getStatusColor = (status) => {
    const colors = {
      on_time: "success",
      late: "warning",
      early_exit: "secondary",
      absent: "error",
      justified: "info",
      incomplete: "warning",
    };
    return colors[status] || "default";
  };

  // Función para obtener etiqueta en español
  const getStatusLabel = (status) => {
    const labels = {
      on_time: "A Tiempo",
      late: "Tardanza",
      early_exit: "Salida Anticipada",
      absent: "Ausente",
      justified: "Justificado",
      incomplete: "Incompleto",
    };
    return labels[status] || status;
  };

  // Función para obtener ícono según estado
  const getStatusIcon = (status) => {
    const icons = {
      on_time: <CheckCircleIcon />,
      late: <WarningIcon />,
      early_exit: <WarningIcon />,
      absent: <CancelIcon />,
      justified: <CheckCircleIcon />,
      incomplete: <WarningIcon />,
    };
    return icons[status] || <WarningIcon />;
  };

  // Formatear fecha
  const formatDate = (dateStr) => {
    try {
      return format(parseISO(dateStr), "EEEE, d 'de' MMMM 'de' yyyy", {
        locale: es,
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Formatear hora
  const formatTime = (timestamp) => {
    if (!timestamp) return "-";
    try {
      return format(new Date(timestamp), "HH:mm:ss");
    } catch (e) {
      return "-";
    }
  };

  if (!record) return null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 450, md: 500 },
          height: "calc(100% - 64px)",
          top: 64,
          backgroundImage: (theme) =>
            theme.palette.mode === 'dark'
              ? "linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))"
              : "none",
        },
      }}
    >
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: "primary.main",
            color: "primary.contrastText",
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            Detalle de Asistencia
          </Typography>
          <IconButton onClick={handleClose} sx={{ color: "inherit" }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: "auto", p: 3 }}>
          {/* Estado General */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 3,
              bgcolor: (theme) => 
                theme.palette.mode === 'dark'
                  ? `${getStatusColor(record.shiftStatus)}.dark`
                  : `${getStatusColor(record.shiftStatus)}.light`,
              border: 1,
              borderColor: `${getStatusColor(record.shiftStatus)}.main`,
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                sx={{
                  bgcolor: `${getStatusColor(record.shiftStatus)}.main`,
                  width: 56,
                  height: 56,
                }}
              >
                {getStatusIcon(record.shiftStatus)}
              </Avatar>
              <Box>
                <Typography variant="overline" color="text.secondary">
                  Estado del Turno
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {getStatusLabel(record.shiftStatus)}
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Información del Usuario */}
          <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: "background.default" }}>
            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
              <Avatar sx={{ bgcolor: "primary.main" }}>
                <PersonIcon />
              </Avatar>
              <Typography variant="h6" fontWeight="medium">
                Información del Usuario
              </Typography>
            </Stack>
            <Stack spacing={1}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Nombre Completo:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {record.user.name} {record.user.firstSurname}{" "}
                  {record.user.secondSurname}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  DNI:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {record.user.dni}
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Información del Turno */}
          <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: "background.default" }}>
            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
              <Avatar sx={{ bgcolor: "secondary.main" }}>
                <ScheduleIcon />
              </Avatar>
              <Typography variant="h6" fontWeight="medium">
                Información del Turno
              </Typography>
            </Stack>
            <Stack spacing={1}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Horario:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {record.schedule.name}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Fecha:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {formatDate(record.date)}
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Registros de Asistencia */}
          <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: "background.default" }}>
            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
              <Avatar sx={{ bgcolor: "info.main" }}>
                <AccessTimeIcon />
              </Avatar>
              <Typography variant="h6" fontWeight="medium">
                Registros
              </Typography>
            </Stack>

            <Grid container spacing={2}>
              {/* Entrada */}
              <Grid size={{ xs: 6 }}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: "center" }}>
                  <LoginIcon color="success" sx={{ fontSize: 32, mb: 1 }} />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Entrada
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {formatTime(record.checkIn?.timestamp)}
                  </Typography>
                  {record.checkIn?.status && (
                    <Chip
                      label={
                        record.checkIn.status === "on_time"
                          ? "A tiempo"
                          : record.checkIn.status === "late"
                            ? "Tarde"
                            : "Temprano"
                      }
                      size="small"
                      color={
                        record.checkIn.status === "on_time"
                          ? "success"
                          : "warning"
                      }
                      sx={{ mt: 1 }}
                    />
                  )}
                </Paper>
              </Grid>

              {/* Salida */}
              <Grid size={{ xs: 6 }}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: "center" }}>
                  <LogoutIcon color="error" sx={{ fontSize: 32, mb: 1 }} />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Salida
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {formatTime(record.checkOut?.timestamp)}
                  </Typography>
                  {record.checkOut?.status && (
                    <Chip
                      label={
                        record.checkOut.status === "early_exit"
                          ? "Salida anticipada"
                          : "Normal"
                      }
                      size="small"
                      color={
                        record.checkOut.status === "early_exit"
                          ? "warning"
                          : "success"
                      }
                      sx={{ mt: 1 }}
                    />
                  )}
                </Paper>
              </Grid>
            </Grid>

            {/* Horas Trabajadas */}
            {record.hoursWorked !== null && (
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  mt: 2,
                  textAlign: "center",
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? "primary.dark"
                      : "primary.light",
                  borderColor: "primary.main",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  justifyContent="center"
                  alignItems="center"
                >
                  <TimerIcon color="primary" />
                  <Typography variant="body2" color="text.secondary">
                    Tiempo trabajado:
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    {record.hoursWorked}h {record.minutesWorked}m
                  </Typography>
                </Stack>
              </Paper>
            )}
          </Paper>

          {/* Dispositivo de Registro */}
          {record.checkIn?.device && (
            <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: "background.default" }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Dispositivo de Registro
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {record.checkIn.device.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {record.checkIn.device.location}
              </Typography>
            </Paper>
          )}

          {/* Justificación Existente */}
          {record.justification?.approved && (
            <Alert severity="info" icon={<CheckCircleIcon />} sx={{ mb: 3 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Justificación Aprobada
              </Typography>
              <Typography variant="body2">
                {record.justification.reason}
              </Typography>
            </Alert>
          )}

          {/* Formulario de Justificación */}
          {canJustify && !record.justification?.approved && (
            <Box>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                startIcon={<DescriptionIcon />}
                onClick={handleJustifyClick}
                sx={{ mb: 2 }}
              >
                {showJustificationForm
                  ? "Ocultar Formulario"
                  : "Justificar Asistencia"}
              </Button>

              <Collapse in={showJustificationForm}>
                <Paper elevation={2} sx={{ p: 3, bgcolor: "background.default" }}>
                  <Typography variant="h6" gutterBottom>
                    Solicitar Justificación
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Por favor, indique el motivo de la{" "}
                    {record.shiftStatus === "absent"
                      ? "ausencia"
                      : record.shiftStatus === "late"
                        ? "tardanza"
                        : "salida anticipada"}
                    .
                  </Typography>

                  {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {error}
                    </Alert>
                  )}

                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Motivo de Justificación"
                    placeholder="Ej: Cita médica, emergencia familiar, trámite personal, etc."
                    value={justificationReason}
                    onChange={(e) => setJustificationReason(e.target.value)}
                    disabled={isSubmitting}
                    sx={{ mb: 2 }}
                    helperText={`${justificationReason.length}/500 caracteres`}
                    inputProps={{ maxLength: 500 }}
                  />

                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={handleSubmitJustification}
                      disabled={isSubmitting || !justificationReason.trim()}
                      startIcon={
                        isSubmitting ? (
                          <CircularProgress size={20} />
                        ) : (
                          <CheckCircleIcon />
                        )
                      }
                    >
                      {isSubmitting ? "Enviando..." : "Enviar Justificación"}
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      fullWidth
                      onClick={handleCancelJustification}
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </Button>
                  </Stack>
                </Paper>
              </Collapse>
            </Box>
          )}
        </Box>

        {/* Footer */}
        <Box
          sx={{
            p: 2,
            borderTop: 1,
            borderColor: "divider",
            bgcolor: "background.default",
          }}
        >
          <Button
            variant="outlined"
            fullWidth
            onClick={handleClose}
            startIcon={<CloseIcon />}
          >
            Cerrar
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default AttendanceDrawer;
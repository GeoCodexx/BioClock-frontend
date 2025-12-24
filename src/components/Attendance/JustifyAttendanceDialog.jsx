import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  AlertTitle,
  Box,
  Typography,
  Chip,
  Paper,
  Grid,
  CircularProgress,
  Divider,
  FormLabel,
  Fade,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  Fingerprint as FingerprintIcon,
  EventNote as EventNoteIcon,
} from "@mui/icons-material";

/**
 * Dialog para justificar un registro de asistencia (Admin/RRHH)
 * @param {boolean} open - Estado del dialog
 * @param {Function} onOpenChange - Función para cambiar el estado del dialog
 * @param {Object} attendance - Objeto del registro de asistencia a justificar
 * @param {Function} handleJustifyAttendance - Handler para justificar
 * @param {Function} onSuccess - Callback cuando se justifica exitosamente
 */
export default function JustifyAttendanceDialog({
  open,
  onOpenChange,
  attendance,
  handleJustifyAttendance,
  onSuccess,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [reason, setReason] = useState("");
  const [approved, setApproved] = useState("true");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [error, setError] = useState("");

  // Animación de entrada de botones en mobile
  useEffect(() => {
    if (open && isMobile) {
      const timer = setTimeout(() => setShowButtons(true), 300);
      return () => clearTimeout(timer);
    } else if (open) {
      setShowButtons(true);
    } else {
      setShowButtons(false);
    }
  }, [open, isMobile]);

  // Reiniciar el formulario cuando cambia la asistencia
  useEffect(() => {
    if (attendance?.justification) {
      setReason(attendance.justification.reason || "");
      setApproved(attendance.justification.approved ? "true" : "false");
    } else {
      setReason("");
      setApproved("true");
    }
  }, [attendance]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validaciones
    if (!reason.trim()) {
      setError("Por favor, ingresa una razón para la justificación");
      console.log("1");
      return;
    }

    if (reason.trim().length < 10) {
      setError("La justificación debe tener al menos 10 caracteres");
      console.log("2");
      return;
    }

    if (reason.trim().length > 500) {
      setError("La justificación no puede exceder 500 caracteres");
      console.log("3");
      return;
    }
    console.log("4");
    setIsSubmitting(true);

    const result = await handleJustifyAttendance(
      attendance._id,
      reason.trim(),
      approved === "true",
      (updatedAttendance) => {
        // Resetear el formulario
        setReason("");
        setApproved("true");
        setError("");
        onOpenChange(false);

        // Llamar al callback de éxito
        if (onSuccess) {
          onSuccess(updatedAttendance);
        }
      }
    );

    console.log(result);

    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setReason("");
      setApproved("true");
      setError("");
      onOpenChange(false);
    }
  };

  // Formatear la fecha para mostrar
  const formatDate = (date) => {
    return new Date(date).toLocaleString("es-PE", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // Obtener el color del chip según el status
  const getStatusConfig = (status) => {
    const statusMap = {
      on_time: { label: "A tiempo", color: "success" },
      late: { label: "Tarde", color: "warning" },
      absent: { label: "Ausente", color: "error" },
      early: { label: "Temprano", color: "info" },
      early_exit: { label: "Salida anticipada", color: "warning" },
    };
    return statusMap[status] || { label: status, color: "default" };
  };

  const statusConfig = attendance ? getStatusConfig(attendance.status) : null;
  const isEditing = Boolean(attendance?.justification);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          component: "form",
          onSubmit: handleSubmit,
        },
      }}
    >
      <DialogTitle
        sx={{ display: "flex", alignItems: "center", gap: 1, pb: 1 }}
      >
        <DescriptionIcon color="primary" />
        {isEditing ? "Editar Justificación" : "Justificar Asistencia"}
      </DialogTitle>

      <DialogContent dividers>
        {/* <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Como administrador o personal de RRHH, puedes justificar registros de
          asistencia y determinar si se aprueban o no.
        </Typography> */}

        {attendance && (
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              mb: 3,
            }}
          >
            {/* Encabezado con nombre y estado */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                mb: 2,
              }}
            >
              <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  {attendance.userId?.name} {attendance.userId?.firstSurname}{" "}
                  {attendance.userId?.secondSurname}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <FingerprintIcon
                    sx={{ fontSize: 14, color: "text.secondary" }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    DNI: {attendance.userId?.dni}
                  </Typography>
                </Box>
              </Box>
              <Chip
                label={statusConfig?.label}
                color={statusConfig?.color}
                size="small"
                sx={{ fontWeight: 500 }}
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Información del registro */}
            <Grid container spacing={2}>
              <Grid size={6}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    mb: 0.5,
                  }}
                >
                  <AccessTimeIcon
                    sx={{ fontSize: 14, color: "text.secondary" }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Fecha y hora:
                  </Typography>
                </Box>
                <Typography variant="body2" fontWeight={500}>
                  {formatDate(attendance.timestamp)}
                </Typography>
              </Grid>

              <Grid size={6}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    mb: 0.5,
                  }}
                >
                  <EventNoteIcon
                    sx={{ fontSize: 14, color: "text.secondary" }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Tipo:
                  </Typography>
                </Box>
                <Typography variant="body2" fontWeight={500}>
                  {attendance.type === "IN" ? "Entrada" : "Salida"}
                </Typography>
              </Grid>

              {attendance.deviceId && (
                <Grid size={12}>
                  <Typography variant="caption" color="text.secondary">
                    Dispositivo:
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {attendance.deviceId.name} - {attendance.deviceId.location}
                  </Typography>
                </Grid>
              )}
            </Grid>

            {/* Alerta con justificación actual */}
            {isEditing && (
              <Alert severity="info" icon={<InfoIcon />} sx={{ mt: 2 }}>
                <AlertTitle sx={{ fontSize: "0.875rem", fontWeight: 600 }}>
                  Justificación actual
                </AlertTitle>
                <Typography variant="caption" component="div">
                  <strong>Razón:</strong> {attendance.justification.reason}
                </Typography>
                <Typography variant="caption" component="div">
                  <strong>Estado:</strong>{" "}
                  {attendance.justification.approved
                    ? "Aprobada"
                    : "No aprobada"}
                </Typography>
              </Alert>
            )}
          </Paper>
        )}

        {/* Campo de razón */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Razón de la justificación"
            placeholder="Ejemplo: El empleado presentó certificado médico por cita de emergencia..."
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError("");
            }}
            disabled={isSubmitting}
            required
            helperText={`${reason.length}/500 caracteres (mínimo 10)`}
            error={Boolean(error)}
            slotProps={{
              htmlInput: { maxLength: 500 },
            }}
          />
        </Box>

        {/* Radio buttons para aprobar/rechazar */}
        {/* <Box sx={{ mb: 2 }}>
          <FormLabel component="legend" sx={{ mb: 1, fontWeight: 500 }}>
            Estado de la justificación
          </FormLabel>
          <RadioGroup
            value={approved}
            onChange={(e) => setApproved(e.target.value)}
          >
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                mb: 1,
                cursor: "pointer",
                "&:hover": { backgroundColor: "action.hover" },
                transition: "background-color 0.2s",
              }}
              onClick={() => !isSubmitting && setApproved("true")}
            >
              <FormControlLabel
                value="true"
                control={<Radio disabled={isSubmitting} />}
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CheckCircleIcon color="success" sx={{ fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        Aprobar justificación
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        La ausencia/retraso será considerada justificada
                      </Typography>
                    </Box>
                  </Box>
                }
                sx={{ m: 0, width: "100%" }}
              />
            </Paper>

            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                cursor: "pointer",
                "&:hover": { backgroundColor: "action.hover" },
                transition: "background-color 0.2s",
              }}
              onClick={() => !isSubmitting && setApproved("false")}
            >
              <FormControlLabel
                value="false"
                control={<Radio disabled={isSubmitting} />}
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CancelIcon color="error" sx={{ fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        No aprobar justificación
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Se registra la razón pero no se considera justificada
                      </Typography>
                    </Box>
                  </Box>
                }
                sx={{ m: 0, width: "100%" }}
              />
            </Paper>
          </RadioGroup>
        </Box> */}

        {/* Alert de error */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        {isMobile && (
          <Fade in={showButtons} timeout={500}>
            <Stack spacing={1.5} sx={{ mt: 3 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
              >
                {isSubmitting
                  ? "Guardando..."
                  : `${isEditing ? "Actualizar" : "Guardar"} Justificación`}
              </Button>

              <Button
                onClick={handleClose}
                disabled={isSubmitting}
                color="inherit"
                variant="outlined"
                size="large"
                fullWidth
              >
                Cancelar
              </Button>
            </Stack>
          </Fade>
        )}
      </DialogContent>

      {/* Acciones solo en desktop */}
      {!isMobile && (
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={handleClose}
            disabled={isSubmitting}
            color="inherit"
            variant="outlined"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {isSubmitting
              ? "Guardando..."
              : `${isEditing ? "Actualizar" : "Guardar"} Justificación`}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}

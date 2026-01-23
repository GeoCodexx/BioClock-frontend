import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Collapse,
  Alert,
  CircularProgress,
  IconButton,
  Chip,
  Paper,
  useTheme,
  useMediaQuery,
  Stack,
  List,
  ListItem,
  Divider,
} from "@mui/material";
import {
  Close as CloseIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Fingerprint as FingerprintIcon,
  Warning as WarningIcon,
  Shield as ShieldIcon,
  AccessTime as TimeIcon,
  Storage as StorageIcon,
} from "@mui/icons-material";
import FingerprintImage from "./FingerprintImage";

const BiometricValidationDialog = ({
  open,
  onClose,
  templateId,
  onApprove,
  onReject,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [showRejectNote, setShowRejectNote] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [accessLog, setAccessLog] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(30);

  const token = localStorage.getItem("token");

  // ✅ CRÍTICO: Validar token
  if (!token) {
    console.error("❌ No hay token disponible");
  }

  // Log de accesos
  const handleAccessLog = (logEntry) => {
    setAccessLog((prev) => [logEntry, ...prev].slice(0, 20));
  };

  // ✅ Timer simplificado - solo cuando el dialog está abierto
  useEffect(() => {
    if (!open) {
      setTimeRemaining(30);
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [open, onClose]);

  // ✅ Reset al abrir/cerrar
  useEffect(() => {
    if (open) {
      setShowRejectNote(false);
      setRejectNote("");
      setError(null);
      setAccessLog([]);
      setTimeRemaining(30);
    }
  }, [open]);

  const handleImageError = (errorMsg) => {
    setError(`Error al cargar imagen: ${errorMsg}`);
  };

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      await onApprove(templateId);
      onClose();
    } catch (err) {
      setError("Error al aprobar la plantilla");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectNote.trim()) {
      setError("Debe proporcionar una nota de rechazo");
      return;
    }

    setSubmitting(true);
    try {
      await onReject(templateId, rejectNote);
      onClose();
    } catch (err) {
      setError("Error al rechazar la plantilla");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectClick = () => {
    setShowRejectNote(!showRejectNote);
    if (showRejectNote) {
      setRejectNote("");
    }
  };

  const getStatusColor = (action) => {
    if (action.includes("ERROR")) return "error";
    if (action.includes("LOADED")) return "success";
    return "info";
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 2,
          minHeight: isMobile ? "100vh" : "600px",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${theme.palette.divider}`,
          pb: 2,
          background:
            theme.palette.mode === "dark"
              ? "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)"
              : "linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <FingerprintIcon sx={{ fontSize: 28, color: theme.palette.primary.main }} />
          <Typography variant="h6" component="div" fontWeight={600}>
            Validación de Huellas Dactilares
          </Typography>
        </Box>
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          disabled={submitting}
          aria-label="cerrar"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ pt: 3, pb: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2, textAlign: "center" }}
        >
          Revise cuidadosamente las huellas dactilares y determine si son válidas.
        </Typography>

        {/* ✅ Timer visible */}
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <TimeIcon fontSize="small" />
            <Typography variant="body2" fontWeight={600}>
              Auto-cierre en {timeRemaining} segundos
            </Typography>
          </Stack>
        </Alert>

        {/* Grid de huellas - ✅ visible siempre que open=true */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
            gap: 3,
            mb: 3,
          }}
        >
          <FingerprintImage
            templateId={templateId}
            finger="rightIndex"
            label="Índice Derecho"
            token={token}
            visible={open} // ✅ CAMBIADO: depende de open, no de showFingerprints
            onImageError={handleImageError}
            onAccessLog={handleAccessLog}
          />

          <FingerprintImage
            templateId={templateId}
            finger="leftIndex"
            label="Índice Izquierdo"
            token={token}
            visible={open} // ✅ CAMBIADO
            onImageError={handleImageError}
            onAccessLog={handleAccessLog}
          />
        </Box>

        {/* Reject Note */}
        <Collapse in={showRejectNote}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              mb: 2,
              bgcolor:
                theme.palette.mode === "dark"
                  ? "rgba(244, 67, 54, 0.08)"
                  : "rgba(244, 67, 54, 0.05)",
              border: `1px solid ${theme.palette.error.main}`,
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <WarningIcon color="error" fontSize="small" />
              <Typography variant="subtitle2" color="error" fontWeight={600}>
                Motivo del Rechazo
              </Typography>
            </Box>

            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Describa detalladamente el motivo del rechazo..."
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              disabled={submitting}
              required
              error={showRejectNote && !rejectNote.trim()}
              helperText={
                showRejectNote && !rejectNote.trim()
                  ? "Este campo es obligatorio para rechazar"
                  : "Proporcione información clara y específica sobre el rechazo"
              }
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: theme.palette.background.paper,
                },
              }}
            />
          </Paper>
        </Collapse>

        {/* Log de accesos */}
        {accessLog.length > 0 && (
          <Box sx={{ mt: 3, pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
              <ShieldIcon color="action" sx={{ fontSize: 18 }} />
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  color: "text.secondary",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Registro de Actividad
              </Typography>
            </Stack>

            <Paper
              variant="outlined"
              sx={{
                bgcolor: (theme) =>
                  theme.palette.mode === "dark" ? "grey.900" : "grey.50",
                maxHeight: 200,
                overflowY: "auto",
                borderRadius: 2,
              }}
            >
              <List disablePadding>
                {accessLog.slice(0, 5).map((log, index) => (
                  <React.Fragment key={index}>
                    <ListItem
                      sx={{
                        flexDirection: "column",
                        alignItems: "flex-start",
                        py: 1.5,
                        px: 2,
                      }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ width: "100%", mb: 0.5 }}
                      >
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <TimeIcon sx={{ fontSize: 14, color: "text.disabled" }} />
                          <Typography
                            variant="caption"
                            sx={{ fontFamily: "monospace", color: "text.secondary" }}
                          >
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </Typography>
                        </Stack>

                        <Chip
                          label={log.action}
                          size="small"
                          color={getStatusColor(log.action)}
                          sx={{ fontWeight: "bold", fontSize: "0.65rem", height: 20 }}
                        />
                      </Stack>

                      {log.size && (
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <StorageIcon sx={{ fontSize: 14, color: "text.disabled" }} />
                          <Typography
                            variant="caption"
                            sx={{ color: "text.primary", fontWeight: 500 }}
                          >
                            Peso: {(log.size / 1024).toFixed(2)} KB
                          </Typography>
                        </Stack>
                      )}
                    </ListItem>
                    {index < 4 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Box>
        )}
      </DialogContent>

      {/* Actions */}
      <DialogActions
        sx={{
          px: 3,
          py: 2.5,
          borderTop: `1px solid ${theme.palette.divider}`,
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? 1.5 : 1,
        }}
      >
        <Button
          variant="outlined"
          color="inherit"
          onClick={onClose}
          disabled={submitting}
          fullWidth={isMobile}
        >
          Cancelar
        </Button>

        <Box sx={{ flex: 1 }} />

        <Button
          variant={showRejectNote ? "contained" : "outlined"}
          color="error"
          startIcon={showRejectNote ? <RejectIcon /> : null}
          onClick={showRejectNote ? handleReject : handleRejectClick}
          disabled={submitting}
          fullWidth={isMobile}
          sx={{ minWidth: 140 }}
        >
          {submitting && showRejectNote ? (
            <CircularProgress size={20} color="inherit" />
          ) : showRejectNote ? (
            "Confirmar Rechazo"
          ) : (
            "Rechazar"
          )}
        </Button>

        <Button
          variant="contained"
          color="success"
          startIcon={<ApproveIcon />}
          onClick={handleApprove}
          disabled={submitting || showRejectNote}
          fullWidth={isMobile}
          sx={{ minWidth: 140 }}
        >
          {submitting && !showRejectNote ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            "Aprobar"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BiometricValidationDialog;
import {
    Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import {
  Warning as WarningIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

/**
 * Dialog de confirmación para eliminar una justificación
 * @param {boolean} open - Estado del dialog
 * @param {Function} onOpenChange - Función para cambiar el estado del dialog
 * @param {Object} attendance - Objeto del registro de asistencia
 * @param {Function} onConfirm - Función a ejecutar al confirmar
 * @param {boolean} isDeleting - Estado de carga durante la eliminación
 */
export function ConfirmDeleteJustificationDialog({
  open,
  onOpenChange,
  attendance,
  onConfirm,
  isDeleting = false,
}) {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(attendance._id);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("es-PE", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <Dialog
      open={open}
      onClose={() => !isDeleting && onOpenChange(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          pb: 1,
          color: "error.main",
        }}
      >
        <WarningIcon />
        Confirmar Eliminación
      </DialogTitle>

      <DialogContent dividers>
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2" fontWeight={500}>
            Esta acción no se puede deshacer
          </Typography>
        </Alert>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          ¿Estás seguro de que deseas eliminar la justificación del siguiente
          registro?
        </Typography>

        {attendance && (
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              mt: 2,
              backgroundColor: "grey.50",
            }}
          >
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              {attendance.userId?.name} {attendance.userId?.firstSurname}{" "}
              {attendance.userId?.secondSurname}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              DNI: {attendance.userId?.dni}
            </Typography>
            <Divider sx={{ my: 1.5 }} />
            <Grid container spacing={1}>
              <Grid size={6}>
                <Typography variant="caption" color="text.secondary">
                  Fecha:
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {formatDate(attendance.timestamp)}
                </Typography>
              </Grid>
              <Grid size={6}>
                <Typography variant="caption" color="text.secondary">
                  Tipo:
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {attendance.type === "IN" ? "Entrada" : "Salida"}
                </Typography>
              </Grid>
            </Grid>

            {attendance.justification && (
              <>
                <Divider sx={{ my: 1.5 }} />
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 1,
                  }}
                >
                  <DescriptionIcon
                    sx={{ fontSize: 16, color: "text.secondary" }}
                  />
                  <Typography variant="caption" fontWeight={600}>
                    Justificación a eliminar:
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    p: 1.5,
                    backgroundColor: "background.paper",
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  {attendance.justification.reason}
                </Typography>
              </>
            )}
          </Paper>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={() => onOpenChange(false)}
          disabled={isDeleting}
          color="inherit"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="error"
          disabled={isDeleting}
          startIcon={
            isDeleting ? <CircularProgress size={20} /> : <DeleteForeverIcon />
          }
        >
          {isDeleting ? "Eliminando..." : "Eliminar Justificación"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

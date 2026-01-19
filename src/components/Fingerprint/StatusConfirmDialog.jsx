import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  Box,
  TextField,
  Collapse,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import { useState } from "react";

export default function StatusConfirmDialog({
  open,
  onClose,
  onConfirm,
  action, // 'approve' o 'reject'
  error = "",
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isApprove = action === "approve";

  const [note, setNote] = useState("");
  const [showNoteError, setShowNoteError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleNoteChange = (e) => {
    const value = e.target.value;
    setNote(value);
    if (showNoteError && value.trim()) {
      setShowNoteError(false);
    }
  };

  const handleConfirm = async () => {
    if (!isApprove && !note.trim()) {
      setShowNoteError(true);
      return;
    }

    setLoading(true); // Activar loading
    try {
      await onConfirm(note); // Esperar a que termine
    } finally {
      setLoading(false); //  Desactivar loading
    }

    /*onConfirm(note);
    setNote("");
    setShowNoteError(false);*/
  };

  const handleClose = () => {
    setNote("");
    setShowNoteError(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          pb: 1,
        }}
      >
        {isApprove ? (
          <CheckCircleOutlineIcon color="success" />
        ) : (
          <CancelOutlinedIcon color="error" />
        )}
        <Typography variant="h6" component="span">
          {isApprove ? "Aprobar" : "Rechazar"} Huella Dactilar
        </Typography>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Typography variant="body1" color="text.secondary">
          {isApprove ? (
            <>
              ¿Está seguro que desea{" "}
              <Box
                component="span"
                sx={{
                  fontWeight: 600,
                  color: "success.main",
                }}
              >
                aprobar
              </Box>{" "}
              esta huella dactilar?
            </>
          ) : (
            <>
              Para{" "}
              <Box
                component="span"
                sx={{
                  fontWeight: 600,
                  color: "error.main",
                }}
              >
                rechazar
              </Box>{" "}
              esta huella dactilar, debe proporcionar una nota que justifique la
              razón del rechazo.
            </>
          )}
        </Typography>

        <Collapse in={!isApprove} timeout={300}>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Motivo del rechazo"
              placeholder="Explique por qué se está rechazando esta huella dactilar..."
              value={note}
              onChange={handleNoteChange}
              error={showNoteError}
              helperText={
                showNoteError ? "Debe proporcionar un motivo para rechazar" : ""
              }
              required
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: showNoteError ? "error.main" : "primary.main",
                  },
                },
              }}
            />
          </Box>
        </Collapse>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          color="inherit"
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color={isApprove ? "success" : "error"}
          disabled={loading}
          startIcon={
            loading ? <CircularProgress size={20} color="inherit" /> : null
          }
          autoFocus
        >
          {loading ? "Procesando..." : isApprove ? "Aprobar" : "Rechazar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

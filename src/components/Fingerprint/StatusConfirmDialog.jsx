import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";

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

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
          ¿Está seguro que desea{" "}
          <Box
            component="span"
            sx={{
              fontWeight: 600,
              color: isApprove ? "success.main" : "error.main",
            }}
          >
            {isApprove ? "aprobar" : "rechazar"}
          </Box>{" "}
          esta huella dactilar?
        </Typography>

        {!isApprove && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1.5, fontStyle: "italic" }}
          >
            Esta acción marcará el registro como rechazado.
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={isApprove ? "success" : "error"}
          autoFocus
        >
          {isApprove ? "Aprobar" : "Rechazar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
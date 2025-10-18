// components/ConfirmDialog.jsx - Dialog de confirmación reutilizable
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = "¿Estás seguro?",
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  severity = "warning", // 'warning' | 'error' | 'info'
  confirmColor = "primary",
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const getIcon = () => {
    switch (severity) {
      case "error":
        return <ErrorOutlineIcon sx={{ fontSize: 48, color: "error.main" }} />;
      case "info":
        return <InfoOutlinedIcon sx={{ fontSize: 48, color: "info.main" }} />;
      case "warning":
      default:
        return (
          <WarningAmberIcon sx={{ fontSize: 48, color: "warning.main" }} />
        );
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          backgroundImage: "none",
        },
      }}
    >
      <DialogContent sx={{ pt: 4, pb: 2, textAlign: "center" }}>
        <Box sx={{ mb: 2 }}>{getIcon()}</Box>

        <DialogTitle
          sx={{
            p: 0,
            mb: 1.5,
            fontSize: "1.25rem",
            fontWeight: 600,
          }}
        >
          {title}
        </DialogTitle>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ px: 2, lineHeight: 1.6 }}
        >
          {message}
        </Typography>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 3,
          pt: 1,
          gap: 1,
          flexDirection: isMobile ? "column-reverse" : "row",
          justifyContent: "center",
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          color="inherit"
          fullWidth={isMobile}
          sx={{ minWidth: isMobile ? "auto" : 120 }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color={confirmColor}
          fullWidth={isMobile}
          sx={{ minWidth: isMobile ? "auto" : 120, ml: isMobile ? "0px !important" : 2 }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;

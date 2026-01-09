// DeleteConfirmDialog.jsx - Componente optimizado para Confirmación de Eliminación
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Typography,
  Box,
  useTheme,
  Fade,
  useMediaQuery,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

const DeleteConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  deleteError,
  itemName = "horario",
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Fade}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          backgroundImage: "none",
        },
      }}
    >
      {/* Header con ícono de advertencia */}
      <DialogTitle sx={{ pb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              bgcolor: theme.palette.error.light + "20",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <WarningAmberIcon color="error" />
          </Box>
          <Typography variant="h6" component="span" fontWeight={600}>
            Confirmar Eliminación
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 1, pb: 3 }}>
        {deleteError && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 1.5 }}>
            {deleteError}
          </Alert>
        )}
        <Typography
          align="center"
          color="text.secondary"
          sx={{ lineHeight: 1.6 }}
        >
          ¿Estás seguro de eliminar{" "}
          {itemName === "asistencia" ? "esta" : "este"} {itemName}?
          <br />
          <strong>Esta acción no se puede deshacer.</strong>
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
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          startIcon={<DeleteOutlineIcon />}
          fullWidth={isMobile}
          sx={{
            minWidth: isMobile ? "auto" : 120,
            ml: isMobile ? "0px !important" : 2,
          }}
        >
          Eliminar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmDialog;

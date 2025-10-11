// ScheduleDialog.jsx - Componente optimizado para Registro/Edición
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  IconButton,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  Slide,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";
import { forwardRef } from "react";
import ScheduleForm from "./ScheduleForm";

// Transición para el diálogo
const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ScheduleDialog = ({
  open,
  onClose,
  editSchedule,
  formError,
  onSubmit,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isEdit = Boolean(editSchedule);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      slots={{
        transition: Transition,
      }}
      slotProps={{
        paper: {
          sx: {
            borderRadius: isMobile ? 0 : 2,
            backgroundImage: "none",
          },
        },
      }}
    >
      {/* Header mejorado */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {isEdit ? <EditIcon color="primary" /> : <SaveIcon color="primary" />}
          <Typography variant="h6" component="span" fontWeight={600}>
            {isEdit ? "Editar Horario" : "Nuevo Horario"}
          </Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          size="small"
          sx={{
            color: theme.palette.grey[500],
            "&:hover": {
              bgcolor: theme.palette.action.hover,
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Contenido */}
      <DialogContent
        sx={{
          pt: 3,
          pb: 2,
        }}
      >
        {formError && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: 1.5,
            }}
            onClose={onClose}
          >
            {formError}
          </Alert>
        )}
        <ScheduleForm onSubmit={onSubmit} defaultValues={editSchedule || {}} />
      </DialogContent>

      {/* Acciones mejoradas */}
      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
          gap: 1,
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          color="inherit"
          sx={{ minWidth: 100 }}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          form="schedule-form"
          variant="contained"
          startIcon={isEdit ? <SaveIcon /> : <SaveIcon />}
          sx={{ minWidth: 140 }}
        >
          {isEdit ? "Guardar Cambios" : "Registrar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScheduleDialog;

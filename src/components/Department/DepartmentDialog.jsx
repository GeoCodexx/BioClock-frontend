// DepartmentDialog.jsx - Optimizado con mejoras UX
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
  Stack,
  Fade,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";
import { forwardRef, useState, useEffect } from "react";
import DepartmentForm from "./DepartmentForm";
import ConfirmDialog from "../common/ConfirmDialog";


const DepartmentDialog = ({
  open,
  onClose,
  editDepartment,
  formError,
  onSubmit,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isEdit = Boolean(editDepartment);

  // Estados para mejoras UX
  const [isLoading, setIsLoading] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);

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

  // Reset estados al abrir/cerrar
  useEffect(() => {
    if (open) {
      setHasChanges(false);
      setIsLoading(false);
    }
  }, [open]);

  // Handler para detectar cambios en el formulario
  const handleFormChange = () => {
    if (!hasChanges) {
      setHasChanges(true);
    }
  };

  // Handler para cerrar con confirmación
  const handleClose = () => {
    if (hasChanges && !isLoading) {
      setShowConfirmClose(true);
    } else {
      onClose();
    }
  };

  // Confirmar cierre sin guardar
  const handleConfirmClose = () => {
    setShowConfirmClose(false);
    onClose();
  };

  // Handler de submit con loading
  const handleSubmit = async (data) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
      // onSubmit debe cerrar el dialog si es exitoso
      setHasChanges(false);
    } catch (error) {
      // El error se maneja en el componente padre
      console.error("Error al guardar:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        slotProps={{
          paper: {
            sx: {
              borderRadius: isMobile ? 0 : 2,
              backgroundImage: "none",
            },
          },
        }}
      >
        {/* Header */}
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 1.5,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {isEdit ? (
              <EditIcon color="primary" />
            ) : (
              <SaveIcon color="primary" />
            )}
            <Typography variant="h6" component="span" fontWeight={600}>
              {isEdit ? "Editar Departamento" : "Nuevo Departamento"}
            </Typography>
          </Box>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            size="small"
            disabled={isLoading}
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
            "&.MuiDialogContent-root": {
              pt: 3,
              pb: isMobile ? 3 : 2,
            },
          }}
        >
          {formError && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 1.5,
              }}
            >
              {formError}
            </Alert>
          )}

          <DepartmentForm
            onSubmit={handleSubmit}
            defaultValues={editDepartment || {}}
            onChange={handleFormChange}
            disabled={isLoading}
          />

          {/* Botones dentro del contenido en mobile con animación */}
          {isMobile && (
            <Fade in={showButtons} timeout={500}>
              <Stack spacing={1.5} sx={{ mt: 3 }}>
                <Button
                  type="submit"
                  form="department-form"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={isLoading}
                  startIcon={
                    isLoading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <SaveIcon />
                    )
                  }
                >
                  {isLoading
                    ? "Guardando..."
                    : isEdit
                    ? "Guardar Cambios"
                    : "Registrar"}
                </Button>
                <Button
                  onClick={handleClose}
                  variant="outlined"
                  size="large"
                  fullWidth
                  color="inherit"
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
              </Stack>
            </Fade>
          )}
        </DialogContent>

        {/* Acciones solo en desktop */}
        {!isMobile && (
          <DialogActions
            sx={{
              px: 3,
              py: 2,
              borderTop: `1px solid ${theme.palette.divider}`,
              gap: 1,
            }}
          >
            <Button
              onClick={handleClose}
              variant="outlined"
              color="inherit"
              disabled={isLoading}
              sx={{ minWidth: 100 }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="department-form"
              variant="contained"
              disabled={isLoading}
              startIcon={
                isLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <SaveIcon />
                )
              }
              sx={{ minWidth: 140 }}
            >
              {isLoading
                ? "Guardando..."
                : isEdit
                ? "Guardar Cambios"
                : "Registrar"}
            </Button>
          </DialogActions>
        )}
      </Dialog>

      {/* Dialog de confirmación para cerrar sin guardar */}
      <ConfirmDialog
        open={showConfirmClose}
        onClose={() => setShowConfirmClose(false)}
        onConfirm={handleConfirmClose}
        title="¿Descartar cambios?"
        message="Tienes cambios sin guardar. ¿Estás seguro de que deseas cerrar sin guardar?"
        confirmText="Descartar"
        cancelText="Continuar editando"
        severity="warning"
      />
    </>
  );
};

export default DepartmentDialog;
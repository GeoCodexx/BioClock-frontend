// PermissionForm.jsx - Formulario optimizado con mejores campos
import { useForm, Controller } from "react-hook-form";
import { Box, TextField, Grid, InputAdornment } from "@mui/material";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import PinIcon from "@mui/icons-material/Pin";
import { useEffect } from "react";

const PermissionForm = ({
  onSubmit,
  defaultValues = {},
  onChange,
  disabled = false,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      name: defaultValues.name || "",
      code: defaultValues.code || "",
      description: defaultValues.description || "",
    },
  });

  // Detectar cambios en el formulario
  useEffect(() => {
    const subscription = watch(() => {
      if (onChange) {
        onChange();
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, onChange]);

  return (
    <Box
      component="form"
      id="schedule-form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <Grid container spacing={2.5}>
        {/* Nombre del Permiso */}
        <Grid size={{ xs: 12 }}>
          <Controller
            name="name"
            control={control}
            rules={{
              required: "El nombre del permiso es obligatorio",
              minLength: {
                value: 3,
                message: "Mínimo 5 caracteres",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Nombre del Permiso"
                fullWidth
                required
                disabled={disabled}
                error={!!errors.name}
                helperText={errors.name?.message}
                placeholder="Ej: Crear Usuario"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment
                        position="start"
                        sx={{ alignSelf: "flex-start", mt: 2 }}
                      >
                        <VpnKeyIcon color="action" fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            )}
          />
        </Grid>

        {/* Código del Permiso */}
        <Grid size={{ xs: 12 }}>
          <Controller
            name="code"
            control={control}
            rules={{
              required: "El código del permiso es obligatorio",
              minLength: {
                value: 3,
                message: "Mínimo 5 caracteres",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Código del Permiso"
                fullWidth
                required
                disabled={disabled}
                error={!!errors.code}
                helperText={errors.code?.message}
                placeholder="Ej: user:create"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment
                        position="start"
                        sx={{ alignSelf: "flex-start", mt: 2 }}
                      >
                        <PinIcon color="action" fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            )}
          />
        </Grid>

        {/* Descripción */}
        <Grid size={{ xs: 12 }}>
          <Controller
            name="description"
            control={control}
            rules={{
              required: "La descripción es obligatoria",
              minLength: {
                value: 5,
                message: "Mínimo 5 caracteres",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Descripción"
                fullWidth
                multiline
                rows={3}
                required
                disabled={disabled}
                error={!!errors.description}
                helperText={errors.description?.message}
                placeholder="Detalle la descripción del permiso aquí"
              />
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default PermissionForm;

// DepartmentForm.jsx - Formulario optimizado con mejores campos
import { useForm, Controller } from "react-hook-form";
import { Box, TextField, Grid, InputAdornment } from "@mui/material";
import ApartmentIcon from "@mui/icons-material/Apartment";
import PlaceIcon from "@mui/icons-material/Place";
import { useEffect } from "react";

const DepartmentForm = ({
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
      location: defaultValues.location || "",
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
      id="department-form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <Grid container spacing={2.5}>
        {/* Nombre del Departamento */}
        <Grid size={{ xs: 12 }}>
          <Controller
            name="name"
            control={control}
            rules={{
              required: "El nombre del departamento es obligatorio",
              minLength: {
                value: 3,
                message: "Mínimo 3 caracteres",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Nombre del Departamento"
                fullWidth
                required
                disabled={disabled}
                error={!!errors.name}
                helperText={errors.name?.message}
                placeholder="Ej: Departamento Administrativo"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment
                        position="start"
                        sx={{ alignSelf: "flex-start", mt: 2 }}
                      >
                        <ApartmentIcon color="action" fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            )}
          />
        </Grid>

        {/* Ubicación */}
        <Grid size={{ xs: 12 }}>
          <Controller
            name="location"
            control={control}
            rules={{
              required: "La ubicación es obligatoria",
              minLength: {
                value: 5,
                message: "Mínimo 5 caracteres",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Ubicación"
                fullWidth
                multiline
                rows={3}
                required
                disabled={disabled}
                error={!!errors.location}
                helperText={errors.location?.message}
                placeholder="Detalles de la ubicación del departamento"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment
                        position="start"
                        sx={{ alignSelf: "flex-start", mt: 2 }}
                      >
                        <PlaceIcon color="action" fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DepartmentForm;

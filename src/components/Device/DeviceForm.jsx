// DeviceForm.jsx - Formulario optimizado con mejores campos
import { useForm, Controller } from "react-hook-form";
import { Box, TextField, Grid, InputAdornment } from "@mui/material";
import DevicesIcon from '@mui/icons-material/Devices';
import PlaceIcon from "@mui/icons-material/Place";
import LanIcon from '@mui/icons-material/Lan';
import { useEffect } from "react";

const DeviceForm = ({
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
      ipAddress: defaultValues.ipAddress || "",
      macAddress: defaultValues.macAddress || "",
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
      id="device-form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <Grid container spacing={2.5}>
        {/* Nombre del Dispositivo */}
        <Grid size={{ xs: 12 }}>
          <Controller
            name="name"
            control={control}
            rules={{
              required: "El nombre del dispositivo es obligatorio",
              minLength: {
                value: 3,
                message: "Mínimo 3 caracteres",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Nombre del Dispositivo"
                fullWidth
                required
                disabled={disabled}
                error={!!errors.name}
                helperText={errors.name?.message}
                placeholder="Ej: Recursos Humanos PC-01"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment
                        position="start"
                        sx={{ alignSelf: "flex-start", mt: 2 }}
                      >
                        <DevicesIcon color="action" fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            )}
          />
        </Grid>

        {/* Dirección MAC */}
        <Grid size={{ xs: 12 }}>
          <Controller
            name="macAddress"
            control={control}
            rules={{
              required: "La dirección MAC es obliatoria",
              minLength: {
                value: 7,
                message: "Mínimo 17 caracteres",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Dirección MAC"
                fullWidth
                required
                disabled={disabled}
                error={!!errors.name}
                helperText={errors.name?.message}
                placeholder="Ej: 11:22:33:44:55:66"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment
                        position="start"
                        sx={{ alignSelf: "flex-start", mt: 2 }}
                      >
                        <LanIcon color="action" fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            )}
          />
        </Grid>

        {/* Dirección IP */}
        <Grid size={{ xs: 12 }}>
          <Controller
            name="ipAddress"
            control={control}
            rules={{
              required: "La dirección IP es obliatoria",
              minLength: {
                value: 7,
                message: "Mínimo 7 caracteres",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Dirección IP"
                fullWidth
                required
                disabled={disabled}
                error={!!errors.ipAddress}
                helperText={errors.ipAddress?.message}
                placeholder="Ej: 192.168.1.10"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment
                        position="start"
                        sx={{ alignSelf: "flex-start", mt: 2 }}
                      >
                        <LanIcon color="action" fontSize="small" />
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
                placeholder="Detalles de la ubicación del dispositivo"
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

export default DeviceForm;

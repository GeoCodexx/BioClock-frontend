import { useForm, Controller } from "react-hook-form";
import {
  Box,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  InputAdornment,
  Chip,
  Typography,
  Paper,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import { useEffect, useState } from "react";
import DescriptionIcon from "@mui/icons-material/Description";
import { getPermissions } from "../../services/permissionService";

const RoleForm = ({
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
      description: defaultValues.description || "",
      permissions: defaultValues.permissions || [],
    },
  });

  const [permissionsOptions, setPermissionsOptions] = useState([]);

  useEffect(() => {
    try {
      const loadPermissions = async () => {
        const response = await getPermissions();
        setPermissionsOptions(response);
      };
      loadPermissions();
    } catch (error) {
      console.error("Error cargando permisos:", error);
    }
  }, []);

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
        {/* Nombre del Rol */}
        <Grid size={{ xs: 12 }}>
          <Controller
            name="name"
            control={control}
            rules={{
              required: "El nombre del rol es obligatorio",
              minLength: {
                value: 3,
                message: "Mínimo 3 caracteres",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Nombre del Rol"
                fullWidth
                required
                disabled={disabled}
                error={!!errors.name}
                helperText={errors.name?.message}
                placeholder="Ej: Asistente, Gerente, etc."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EventIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
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
                value: 3,
                message: "Mínimo 5 caracteres",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Descripción"
                fullWidth
                required
                disabled={disabled}
                error={!!errors.description}
                helperText={errors.description?.message}
                multiline
                rows={3}
                placeholder="Descripción algo breve del rol"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment
                        position="start"
                        sx={{ alignSelf: "flex-start", mt: 2 }}
                      >
                        <DescriptionIcon color="action" fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            )}
          />
        </Grid>

        {/* Permisos */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="permissions"
            control={control}
            rules={{
              required: "Selecciona al menos un permiso",
              validate: (value) =>
                value.length > 0 || "Debe seleccionar al menos un día",
            }}
            render={({ field }) => (
              <FormControl
                fullWidth
                error={!!errors.permissions}
                required
                disabled={disabled}
              >
                <InputLabel id="work-permissions-label">Permisos</InputLabel>
                <Select
                  {...field}
                  labelId="work-permissions-label"
                  multiple
                  label="Permisos"
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((value) => {
                        const day = permissionsOptions.find(
                          (d) => d.value === value
                        );
                        return (
                          <Chip
                            key={value}
                            label={day?.label}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        );
                      })}
                    </Box>
                  )}
                >
                  {permissionsOptions.map((option) => (
                    <MenuItem key={option._id} value={option._id}>
                      {option.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.permissions && (
                  <FormHelperText>{errors.permissions.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>

        {/* Resumen visual */}
        {watch("startTime") && watch("endTime") && (
          <Grid size={{ xs: 12 }}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                bgcolor: "primary.50",
                borderColor: "primary.200",
              }}
            >
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Resumen del Rol:
              </Typography>
              <Box display="flex" alignItems="center">
                <Typography variant="body1" fontWeight={500}>
                  {watch("startTime")} - {watch("endTime")}
                </Typography>
                {watch("toleranceMinutes") > 0 && (
                  <Chip
                    label={`+${watch("toleranceMinutes")} min`}
                    size="small"
                    sx={{ ml: 1 }}
                    color="info"
                  />
                )}
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default RoleForm;

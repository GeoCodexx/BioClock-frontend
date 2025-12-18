import { useForm, Controller } from "react-hook-form";
import { Box, TextField, Grid, MenuItem, Chip } from "@mui/material";

import { useEffect } from "react";

// Configuración de módulos y acciones
const MODULES = [
  { value: "attendances", label: "Asistencias" },
  { value: "departments", label: "Departamentos" },
  { value: "devices", label: "Dispositivos" },
  { value: "fingerprints", label: "Huellas Dactilares" },
  { value: "schedules", label: "Horarios" },
  { value: "my-attendance", label: "Mi Asistencia" },
  { value: "dashboard", label: "Panel Estadístico" },
  { value: "permissions", label: "Permisos" },
  { value: "daily-report", label: "Reporte Diario" },
  { value: "general-report", label: "Reporte General" },
  { value: "roles", label: "Roles" },
  { value: "users", label: "Usuarios" },
];

const ACTIONS = [
  { value: "create", label: "Crear", color: "success" },
  { value: "read", label: "Leer", color: "info" },
  { value: "update", label: "Actualizar", color: "warning" },
  { value: "delete", label: "Eliminar", color: "error" },
];

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
    setValue,
  } = useForm({
    defaultValues: {
      name: defaultValues.name || "",
      description: defaultValues.description || "",
      module: defaultValues.module || "",
      action: defaultValues.action || "",
      code: defaultValues.code || "",
    },
  });

  // Observar cambios en módulo y acciones
  const watchModule = watch("module");
  const watchAction = watch("action");

  // Generar código automáticamente
  useEffect(() => {
    if (watchModule && watchAction) {
      const code = `${watchModule}:${watchAction}`;

      setValue("code", code);
    } else {
      setValue("code", "");
    }
  }, [watchModule, watchAction, setValue]);

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
      id="permission-form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <Grid container spacing={3}>
        {/* Nombre del Permiso */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="name"
            control={control}
            rules={{
              required: "El nombre del permiso es obligatorio",
              minLength: {
                value: 3,
                message: "Mínimo 3 caracteres",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Nombre del Permiso"
                fullWidth
                size="small"
                required
                disabled={disabled}
                error={!!errors.name}
                helperText={errors.name?.message}
                placeholder="Ej: Crear Usuario"
              />
            )}
          />
        </Grid>

        {/* Módulo Referencial */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="module"
            control={control}
            rules={{
              required: "El módulo es obligatorio",
            }}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Módulo Referencial"
                fullWidth
                size="small"
                required
                disabled={disabled}
                error={!!errors.module}
                helperText={errors.module?.message}
                placeholder="Seleccione un módulo"
              >
                {MODULES.map((module) => (
                  <MenuItem key={module.value} value={module.value}>
                    {module.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>

        {/* Acciones (CRUD) */}
        <Grid size={{ xs: 12 }}>
          <Controller
            name="action"
            control={control}
            rules={{
              required: "La acción es obligatoria",
            }}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Acción"
                fullWidth
                size="small"
                required
                disabled={disabled}
                error={!!errors.action}
                helperText={
                  errors.action?.message || "Seleccione una accion (CRUD)"
                }
              >
                {ACTIONS.map((action) => (
                  <MenuItem key={action.value} value={action.value}>
                    {/* <Chip
                      label={action.label}
                      size="small"
                      color={action.color}
                      sx={{ mr: 1 }}
                    /> */}
                    {action.label}
                  </MenuItem>
                ))}
              </TextField>
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

        {/* Código Generado Automáticamente */}
        <Grid size={{ xs: 12 }}>
          <Controller
            name="code"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Código del Permiso"
                fullWidth
                size="small"
                disabled
                placeholder="Se generará automáticamente"
                slotProps={{
                  input: {
                    readOnly: true,
                  },
                }}
                helperText="Código generado automaticamente"
              />
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default PermissionForm;

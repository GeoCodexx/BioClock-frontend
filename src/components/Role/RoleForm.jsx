import { useForm, Controller } from "react-hook-form";
import { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Grid,
  Chip,
  Typography,
  Alert,
  MenuItem,
  Stack,
  CircularProgress,
} from "@mui/material";
import { getPermissions } from "../../services/permissionService";

const RoleForm = ({
  onSubmit,
  defaultValues = {},
  onChange,
  disabled = false,
  //getPermissions, // Servicio para obtener permisos
}) => {
  const [permissions, setPermissions] = useState([]);
  const [loadingPermissions, setLoadingPermissions] = useState(true);
  const [permissionsError, setPermissionsError] = useState(null);

  // Normalizar permisos: si vienen como objetos, extraer solo los IDs
  const normalizePermissions = (permissions) => {
    if (!permissions || permissions.length === 0) return [];

    // Si el primer elemento es un objeto con _id, extraer los IDs
    if (typeof permissions[0] === "object" && permissions[0]._id) {
      return permissions.map((p) => p._id);
    }

    // Si ya son strings (IDs), retornarlos tal cual
    return permissions;
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      name: defaultValues.name || "",
      description: defaultValues.description || "",
      permissions: normalizePermissions(defaultValues.permissions),
    },
  });

  // Obtener permisos de la API
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setLoadingPermissions(true);
        setPermissionsError(null);
        const data = await getPermissions();
        setPermissions(data.filter((p) => p.status === "active"));
      } catch (error) {
        setPermissionsError("Error al cargar los permisos");
        console.error("Error fetching permissions:", error);
      } finally {
        setLoadingPermissions(false);
      }
    };

    if (getPermissions) {
      fetchPermissions();
    }
  }, [getPermissions]);

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
      id="role-form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <Grid container spacing={3}>
        {/* Nombre del Rol */}
        <Grid size={{ xs: 12 /*, md: 6*/ }}>
          <Controller
            name="name"
            control={control}
            rules={{
              required: "El nombre del rol es obligatorio",
              minLength: {
                value: 3,
                message: "Mínimo 3 caracteres",
              },
              maxLength: {
                value: 50,
                message: "Máximo 50 caracteres",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Nombre del Rol"
                fullWidth
                required
                size="small"
                disabled={disabled}
                error={!!errors.name}
                helperText={errors.name?.message}
                placeholder="Ej: Administrador, Gerente, Asistente"
              />
            )}
          />
        </Grid>

        {/* Descripción */}
        <Grid size={{ xs: 12 /*, md: 6*/ }}>
          <Controller
            name="description"
            control={control}
            rules={{
              required: "La descripción es obligatoria",
              minLength: {
                value: 10,
                message: "Mínimo 10 caracteres",
              },
              maxLength: {
                value: 200,
                message: "Máximo 200 caracteres",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Descripción"
                fullWidth
                multiline
                rows={3}
                size="small"
                required
                disabled={disabled}
                error={!!errors.description}
                helperText={errors.description?.message}
                placeholder="Describe las responsabilidades y alcance del rol"
              />
            )}
          />
        </Grid>

        {/* Permisos */}
        <Grid size={{ xs: 12 }}>
          {permissionsError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {permissionsError}
            </Alert>
          )}

          <Controller
            name="permissions"
            control={control}
            rules={{
              required: "Debe seleccionar al menos un permiso",
              validate: (value) =>
                (value && value.length > 0) ||
                "Debe seleccionar al menos un permiso",
            }}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Permisos"
                fullWidth
                size="small"
                required
                disabled={disabled || loadingPermissions}
                error={!!errors.permissions}
                helperText={
                  errors.permissions?.message ||
                  "Seleccione uno o más permisos para este rol"
                }
                slotProps={{
                  select: {
                    //size: "small",
                    multiple: true,
                    renderValue: (selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selected.length === 0 ? (
                          <Typography variant="body2" color="text.secondary">
                            Ningún permiso seleccionado
                          </Typography>
                        ) : (
                          selected.map((id) => {
                            const permission = permissions.find(
                              (p) => p._id === id
                            );
                            return (
                              <Chip
                                key={id}
                                label={permission?.name || id}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            );
                          })
                        )}
                      </Box>
                    ),
                  },
                  input: {
                    startAdornment: loadingPermissions ? (
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                    ) : null,
                  },
                }}
              >
                {permissions.length === 0 && !loadingPermissions ? (
                  <MenuItem disabled>
                    <Typography variant="body2" color="text.secondary">
                      No hay permisos disponibles
                    </Typography>
                  </MenuItem>
                ) : (
                  permissions.map((permission) => (
                    <MenuItem key={permission._id} value={permission._id}>
                      <Stack spacing={0.5}>
                        <Typography variant="body2" fontWeight="medium">
                          {permission.name}
                        </Typography>
                        {permission.description && (
                          <Typography variant="caption" color="text.secondary">
                            {permission.description}
                          </Typography>
                        )}
                      </Stack>
                    </MenuItem>
                  ))
                )}
              </TextField>
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default RoleForm;

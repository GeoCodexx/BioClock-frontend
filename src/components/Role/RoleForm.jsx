import { useForm, Controller } from "react-hook-form";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  TextField,
  Grid,
  Chip,
  Typography,
  Alert,
  Stack,
  CircularProgress,
  Checkbox,
  ListSubheader,
  Divider,
  FormGroup,
  FormControlLabel,
  Paper,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { getPermissions } from "../../services/permissionService";

const RoleForm = ({
  onSubmit,
  defaultValues = {},
  onChange,
  disabled = false,
}) => {
  const [permissions, setPermissions] = useState([]);
  const [loadingPermissions, setLoadingPermissions] = useState(true);
  const [permissionsError, setPermissionsError] = useState(null);

  // Mapeo de módulos a nombres legibles
  const moduleNames = {
    attendances: "Asistencias",
    departments: "Departamentos",
    devices: "Dispositivos",
    fingerprints: "Huellas Dactilares",
    schedules: "Horarios",
    "my-attendance": "Mi Asistencia",
    dashboard: "Panel Estadístico",
    permissions: "Permisos",
    "daily-report": "Reporte Diario",
    "general-report": "Reporte General",
    roles: "Roles",
    users: "Usuarios",
  };

  // Mapeo de acciones a nombres legibles
  const actionNames = {
    create: "Crear",
    read: "Leer",
    update: "Actualizar",
    delete: "Eliminar",
    export: "Exportar",
    justify: "Justificar",
    unjustify: "Desjustificar",
    approve: "Aprobar",
    reject: "Rechazar",
  };

  // Normalizar permisos
  const normalizePermissions = (permissions) => {
    if (!permissions || permissions.length === 0) return [];
    if (typeof permissions[0] === "object" && permissions[0]._id) {
      return permissions.map((p) => p._id);
    }
    return permissions;
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    mode: "onSubmit", // AGREGAR ESTO: valida solo al enviar
    defaultValues: {
      name: defaultValues.name || "",
      description: defaultValues.description || "",
      permissions: normalizePermissions(defaultValues.permissions),
    },
  });

  // Agrupar permisos por módulo
  const groupedPermissions = useMemo(() => {
    return permissions.reduce((acc, permission) => {
      const [module] = permission.code.split(":");
      if (!acc[module]) {
        acc[module] = [];
      }
      acc[module].push(permission);
      return acc;
    }, {});
  }, [permissions]);

  // Ordenar módulos alfabéticamente
  const sortedModules = useMemo(() => {
    return Object.keys(groupedPermissions).sort((a, b) => {
      const nameA = moduleNames[a] || a;
      const nameB = moduleNames[b] || b;
      return nameA.localeCompare(nameB);
    });
  }, [groupedPermissions]);

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
  }, []);

  // Detectar cambios en el formulario con debounce
  useEffect(() => {
    let timeoutId;
    const subscription = watch(() => {
      if (onChange) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          onChange();
        }, 300);
      }
    });
    return () => {
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, [watch, onChange]);

  // Obtener nombre legible del permiso
  const getPermissionLabel = (permission) => {
    // Usar el nombre directamente si ya viene legible
    /* if (permission.name && !permission.name.includes(":")) {
      return permission.name.replace(
        /^(Crear|Leer|Actualizar|Eliminar|Exportar|Justificar|Desjustificar|Aprobar|Rechazar)\s+/i,
        ""
      );
    }*/
    // Si no, extraer del code
    const [module, action] = permission.code.split(":");
    return actionNames[action] || action;
  };

  // Manejar cambio de checkbox
  const handlePermissionToggle = useCallback(
    (permissionId, currentValue) => {
      const newValue = currentValue.includes(permissionId)
        ? currentValue.filter((id) => id !== permissionId)
        : [...currentValue, permissionId];
      setValue("permissions", newValue, { shouldValidate: false });
    },
    [setValue]
  );

  // Verificar si todos los permisos de un módulo están seleccionados
  const isModuleFullySelected = (module, selectedPermissions) => {
    const modulePerms = groupedPermissions[module] || [];
    return modulePerms.every((p) => selectedPermissions.includes(p._id));
  };

  // Verificar si algunos permisos de un módulo están seleccionados
  const isModulePartiallySelected = (module, selectedPermissions) => {
    const modulePerms = groupedPermissions[module] || [];
    const selectedCount = modulePerms.filter((p) =>
      selectedPermissions.includes(p._id)
    ).length;
    return selectedCount > 0 && selectedCount < modulePerms.length;
  };

  // Seleccionar/deseleccionar todos los permisos de un módulo
  const handleModuleToggle = useCallback(
    (module, currentValue) => {
      const modulePerms = groupedPermissions[module] || [];
      const modulePermIds = modulePerms.map((p) => p._id);
      const isFullySelected = isModuleFullySelected(module, currentValue);

      const newValue = isFullySelected
        ? currentValue.filter((id) => !modulePermIds.includes(id))
        : [...new Set([...currentValue, ...modulePermIds])];

      setValue("permissions", newValue, { shouldValidate: false });
    },
    [setValue, groupedPermissions]
  );

  return (
    <Box
      component="form"
      id="role-form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <Grid container spacing={3}>
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
        <Grid size={{ xs: 12 }}>
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
              <Box>
                <Typography
                  variant="body2"
                  color={errors.permissions ? "error" : "text.secondary"}
                  sx={{ mb: 1 }}
                >
                  Permisos *
                </Typography>

                {loadingPermissions ? (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      p: 3,
                    }}
                  >
                    <CircularProgress size={24} />
                    <Typography variant="body2" sx={{ ml: 2 }}>
                      Cargando permisos...
                    </Typography>
                  </Box>
                ) : (
                  <Paper
                    variant="outlined"
                    sx={{
                      maxHeight: 400,
                      overflowY: "auto",
                      p: 2,
                      backgroundColor: disabled
                        ? "action.disabledBackground"
                        : "background.paper",
                    }}
                  >
                    {sortedModules.map((module, index) => (
                      <Box key={module}>
                        {/* Encabezado del módulo con checkbox para seleccionar todos */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mb: 1,
                            backgroundColor: "action.hover",
                            p: 1,
                            borderRadius: 1,
                          }}
                        >
                          <Checkbox
                            checked={isModuleFullySelected(module, field.value)}
                            indeterminate={isModulePartiallySelected(
                              module,
                              field.value
                            )}
                            onChange={() =>
                              handleModuleToggle(module, field.value)
                            }
                            disabled={disabled}
                            checkedIcon={<CheckIcon />}
                            size="small"
                            sx={{ p: 0, mr: 1 }}
                          />
                          <Typography
                            variant="subtitle2"
                            fontWeight={600}
                            color="primary"
                          >
                            {moduleNames[module] || module}
                          </Typography>
                        </Box>

                        {/* Acciones del módulo */}
                        <FormGroup sx={{ pl: 4, mb: 2 }}>
                          {groupedPermissions[module].map((permission) => (
                            <FormControlLabel
                              key={permission._id}
                              control={
                                <Checkbox
                                  checked={field.value?.includes(
                                    permission._id
                                  )}
                                  onChange={() =>
                                    handlePermissionToggle(
                                      permission._id,
                                      field.value
                                    )
                                  }
                                  disabled={disabled}
                                  checkedIcon={<CheckIcon />}
                                  size="small"
                                />
                              }
                              label={
                                <Stack spacing={0}>
                                  <Typography variant="body2">
                                    {getPermissionLabel(permission)}
                                  </Typography>
                                  {permission.description && (
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {permission.description}
                                    </Typography>
                                  )}
                                </Stack>
                              }
                            />
                          ))}
                        </FormGroup>

                        {/* Divider entre módulos */}
                        {index < sortedModules.length - 1 && (
                          <Divider sx={{ my: 2 }} />
                        )}
                      </Box>
                    ))}
                  </Paper>
                )}

                {/* Contador y mensaje de error */}
                <Box sx={{ mt: 1 }}>
                  {errors.permissions ? (
                    <Typography variant="caption" color="error">
                      {errors.permissions.message}
                    </Typography>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      {field.value?.length || 0} permiso(s) seleccionado(s)
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default RoleForm;

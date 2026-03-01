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
  InputAdornment,
  IconButton,
  Skeleton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { getRoles } from "../../services/roleService";
import { getDepartments } from "../../services/departmentService";
import { getSchedules } from "../../services/scheduleService";
import { getDevices } from "../../services/deviceService";

const UserForm = ({
  onSubmit,
  defaultValues = {},
  onChange,
  disabled = false,
  isEditing = false, // Nuevo prop para diferenciar creación de edición
}) => {
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [loadingSchedules, setLoadingSchedules] = useState(true);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [dataError, setDataError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Normalizar scheduleIds y deviceIds: si vienen como objetos, extraer solo los IDs
  const normalizeIds = (items) => {
    if (!items || items.length === 0) return [];
    if (typeof items[0] === "object" && items[0]._id) {
      return items.map((s) => s._id);
    }
    return items;
  };

  // Normalizar roleId y departmentId
  const normalizeId = (value) => {
    if (!value) return "";
    return typeof value === "object" ? value._id : value;
  };

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm({
    defaultValues: {
      name: "",
      firstSurname: "",
      secondSurname: "",
      dni: "",
      email: "",
      phone: "",
      password: "",
      roleId: "",
      departmentId: "",
      scheduleIds: [],
      deviceIds: [],
    },
  });

  // Obtener datos de las APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setDataError(null);

        const [rolesData, deptsData, schedulesData, devicesData] =
          await Promise.all([
            getRoles(),
            getDepartments(),
            getSchedules(),
            getDevices(),
          ]);

        setRoles(rolesData.filter((r) => r.status === "active"));
        setDepartments(deptsData.filter((d) => d.status === "active"));
        setSchedules(schedulesData.filter((s) => s.status === "active"));
        setDevices(devicesData.filter((d) => d.status === "active"));
      } catch (error) {
        console.error("Error fetching form data:", error);
        setDataError("Error al cargar los datos del formulario");
      } finally {
        setLoadingRoles(false);
        setLoadingDepartments(false);
        setLoadingSchedules(false);
        setLoadingDevices(false);
      }
    };

    fetchData();
  }, []);

  // Cuando todos los datos estén listos y haya defaultValues, reseteamos el formulario
  useEffect(() => {
    const allLoaded =
      !loadingRoles &&
      !loadingDepartments &&
      !loadingSchedules &&
      !loadingDevices;

    if (isEditing && allLoaded && Object.keys(defaultValues).length > 0) {
      reset({
        name: defaultValues.name || "",
        firstSurname: defaultValues.firstSurname || "",
        secondSurname: defaultValues.secondSurname || "",
        dni: defaultValues.dni || "",
        email: defaultValues.email || "",
        phone: defaultValues.phone || "",
        password: "",
        roleId: normalizeId(defaultValues.roleId),
        departmentId: normalizeId(defaultValues.departmentId),
        scheduleIds: normalizeIds(defaultValues.scheduleIds),
        deviceIds: normalizeIds(defaultValues.deviceIds),
      });
    }
  }, [
    isEditing,
    defaultValues,
    loadingRoles,
    loadingDepartments,
    loadingSchedules,
    loadingDevices,
    reset,
  ]);

  // Detectar cambios en el formulario
 useEffect(() => {
  if (isDirty && onChange) {
    onChange();
  }
}, [isDirty, onChange]);


  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Si aún se cargan las listas, mostrar un loader o skeleton
  if (
    loadingRoles ||
    loadingDepartments ||
    loadingSchedules ||
    loadingDevices
  ) {
    return (
      <Box sx={{ p: 2 }}>
        <Stack spacing={2}>
          {/* Campos de texto */}
          <Skeleton variant="rounded" height={36} />
          <Skeleton variant="rounded" height={36} />
          <Skeleton variant="rounded" height={36} />

          {/* Selects en dos columnas (roles y departamentos) */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Skeleton variant="rounded" height={36} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Skeleton variant="rounded" height={36} />
            </Grid>
          </Grid>

          {/* Más selects (horarios y dispositivos) */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Skeleton variant="rounded" height={36} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Skeleton variant="rounded" height={36} />
            </Grid>
          </Grid>

          {/* Botón */}
          <Skeleton variant="rounded" height={40} width="30%" />
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      component="form"
      id="user-form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <Grid container spacing={3}>
        {/* Mensaje de error general */}
        {dataError && (
          <Grid size={{ xs: 12 }}>
            <Alert severity="error">{dataError}</Alert>
          </Grid>
        )}

        {/* Nombre */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Controller
            name="name"
            control={control}
            rules={{
              required: "El nombre es obligatorio",
              minLength: {
                value: 2,
                message: "Mínimo 2 caracteres",
              },
              maxLength: {
                value: 50,
                message: "Máximo 50 caracteres",
              },
              pattern: {
                value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
                message: "Solo se permiten letras",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Nombres"
                fullWidth
                required
                size="small"
                disabled={disabled}
                error={!!errors.name}
                helperText={errors.name?.message}
                //placeholder="Ej: Juan"
                // slotProps={{
                //   input: {
                //     startAdornment: (
                //       <InputAdornment position="start">
                //         <Person fontSize="small" color="action" />
                //       </InputAdornment>
                //     ),
                //   },
                // }}
              />
            )}
          />
        </Grid>

        {/* Apellido Paterno */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Controller
            name="firstSurname"
            control={control}
            rules={{
              required: "El apellido paterno es obligatorio",
              minLength: {
                value: 2,
                message: "Mínimo 2 caracteres",
              },
              maxLength: {
                value: 50,
                message: "Máximo 50 caracteres",
              },
              pattern: {
                value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
                message: "Solo se permiten letras",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Apellido Paterno"
                fullWidth
                required
                size="small"
                disabled={disabled}
                error={!!errors.firstSurname}
                helperText={errors.firstSurname?.message}
                //placeholder="Ej: Pérez"
              />
            )}
          />
        </Grid>

        {/* Apellido Materno */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Controller
            name="secondSurname"
            control={control}
            rules={{
              required: "El apellido materno es obligatorio",
              minLength: {
                value: 2,
                message: "Mínimo 2 caracteres",
              },
              maxLength: {
                value: 50,
                message: "Máximo 50 caracteres",
              },
              pattern: {
                value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/,
                message: "Solo se permiten letras",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Apellido Materno"
                fullWidth
                required
                size="small"
                disabled={disabled}
                error={!!errors.secondSurname}
                helperText={errors.secondSurname?.message}
                //placeholder="Ej: García"
              />
            )}
          />
        </Grid>

        {/* DNI */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Controller
            name="dni"
            control={control}
            rules={{
              required: "El DNI es obligatorio",
              pattern: {
                value: /^[0-9]{8}$/,
                message: "El DNI debe tener exactamente 8 dígitos",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="DNI"
                fullWidth
                required
                size="small"
                disabled={disabled}
                error={!!errors.dni}
                helperText={errors.dni?.message}
                //placeholder="12345678"
                inputProps={{ maxLength: 8 }}
                // slotProps={{
                //   input: {
                //     startAdornment: (
                //       <InputAdornment position="start">
                //         <Badge fontSize="small" color="action" />
                //       </InputAdornment>
                //     ),
                //   },
                // }}
              />
            )}
          />
        </Grid>

        {/* Email */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Controller
            name="email"
            control={control}
            rules={{
              required: "El correo electrónico es obligatorio",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Correo electrónico inválido",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Correo Electrónico"
                fullWidth
                required
                size="small"
                type="email"
                disabled={disabled}
                error={!!errors.email}
                helperText={errors.email?.message}
                //placeholder="usuario@example.com"
                // slotProps={{
                //   input: {
                //     startAdornment: (
                //       <InputAdornment position="start">
                //         <Email fontSize="small" color="action" />
                //       </InputAdornment>
                //     ),
                //   },
                // }}
              />
            )}
          />
        </Grid>

        {/* Teléfono */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Controller
            name="phone"
            control={control}
            rules={{
              required: "El teléfono es obligatorio",
              pattern: {
                value: /^[0-9]{9}$/,
                message: "El teléfono debe tener 9 dígitos",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Teléfono"
                fullWidth
                required
                size="small"
                disabled={disabled}
                error={!!errors.phone}
                helperText={errors.phone?.message}
                //placeholder="987654321"
                inputProps={{ maxLength: 9 }}
                // slotProps={{
                //   input: {
                //     startAdornment: (
                //       <InputAdornment position="start">
                //         <Phone fontSize="small" color="action" />
                //       </InputAdornment>
                //     ),
                //   },
                // }}
              />
            )}
          />
        </Grid>

        {/* Contraseña - Solo visible al crear */}
        {!isEditing && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="password"
              control={control}
              rules={{
                required: "La contraseña es obligatoria",
                minLength: {
                  value: 6,
                  message: "Mínimo 6 caracteres",
                },
                maxLength: {
                  value: 50,
                  message: "Máximo 50 caracteres",
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Contraseña"
                  fullWidth
                  required
                  size="small"
                  type={showPassword ? "text" : "password"}
                  disabled={disabled}
                  error={!!errors.password}
                  helperText={
                    errors.password?.message ||
                    "La contraseña debe tener al menos 6 caracteres"
                  }
                  placeholder="Ingrese una contraseña segura"
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleClickShowPassword}
                            edge="end"
                            size="small"
                          >
                            {showPassword ? (
                              <VisibilityOff fontSize="small" />
                            ) : (
                              <Visibility fontSize="small" />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              )}
            />
          </Grid>
        )}

        {/* Rol */}
        <Grid size={{ xs: 12, md: isEditing ? 6 : 6 }}>
          <Controller
            name="roleId"
            control={control}
            rules={{
              required: "Debe seleccionar un rol",
            }}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Rol"
                fullWidth
                size="small"
                required
                disabled={disabled || loadingRoles}
                error={!!errors.roleId}
                helperText={
                  errors.roleId?.message || "Seleccione el rol del usuario"
                }
                slotProps={{
                  input: {
                    startAdornment: loadingRoles ? (
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                    ) : null,
                  },
                }}
              >
                {roles.length === 0 && !loadingRoles ? (
                  <MenuItem disabled>
                    <Typography variant="body2" color="text.secondary">
                      No hay roles disponibles
                    </Typography>
                  </MenuItem>
                ) : (
                  roles.map((role) => (
                    <MenuItem key={role._id} value={role._id}>
                      <Stack spacing={0.5}>
                        <Typography variant="body2" fontWeight="medium">
                          {role.name}
                        </Typography>
                        {role.description && (
                          <Typography variant="caption" color="text.secondary">
                            {role.description}
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

        {/* Departamento */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="departmentId"
            control={control}
            rules={{
              required: "Debe seleccionar un departamento",
            }}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Departamento"
                fullWidth
                size="small"
                required
                disabled={disabled || loadingDepartments}
                error={!!errors.departmentId}
                helperText={
                  errors.departmentId?.message ||
                  "Seleccione el departamento del usuario"
                }
                slotProps={{
                  input: {
                    startAdornment: loadingDepartments ? (
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                    ) : null,
                  },
                }}
              >
                {departments.length === 0 && !loadingDepartments ? (
                  <MenuItem disabled>
                    <Typography variant="body2" color="text.secondary">
                      No hay departamentos disponibles
                    </Typography>
                  </MenuItem>
                ) : (
                  departments.map((dept) => (
                    <MenuItem key={dept._id} value={dept._id}>
                      <Stack spacing={0.5}>
                        <Typography variant="body2" fontWeight="medium">
                          {dept.name}
                        </Typography>
                        {dept.location && (
                          <Typography variant="caption" color="text.secondary">
                            {dept.location}
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

        {/* Horarios (múltiple) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="scheduleIds"
            control={control}
            rules={{
              required: "Debe seleccionar al menos un horario",
              validate: (value) =>
                (value && value.length > 0) ||
                "Debe seleccionar al menos un horario",
            }}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Horarios"
                fullWidth
                size="small"
                required
                disabled={disabled || loadingSchedules}
                error={!!errors.scheduleIds}
                helperText={
                  errors.scheduleIds?.message ||
                  "Seleccione uno o más horarios para el usuario"
                }
                slotProps={{
                  select: {
                    multiple: true,
                    renderValue: (selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selected.length === 0 ? (
                          <Typography variant="body2" color="text.secondary">
                            Ningún horario seleccionado
                          </Typography>
                        ) : (
                          selected.map((id) => {
                            const schedule = schedules.find(
                              (s) => s._id === id,
                            );
                            return (
                              <Chip
                                key={id}
                                label={schedule?.name || id}
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
                    startAdornment: loadingSchedules ? (
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                    ) : null,
                  },
                }}
              >
                {schedules.length === 0 && !loadingSchedules ? (
                  <MenuItem disabled>
                    <Typography variant="body2" color="text.secondary">
                      No hay horarios disponibles
                    </Typography>
                  </MenuItem>
                ) : (
                  schedules.map((schedule) => (
                    <MenuItem key={schedule._id} value={schedule._id}>
                      <Stack spacing={0.5}>
                        <Typography variant="body2" fontWeight="medium">
                          {schedule.name}
                        </Typography>
                        {schedule.startTime && schedule.endTime && (
                          <Typography variant="caption" color="text.secondary">
                            {schedule.startTime} - {schedule.endTime}
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

        {/* Dispositivo */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="deviceIds"
            control={control}
            rules={{
              required: "Debe seleccionar al menos un dispositivo",
            }}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Dispositivos de marcación"
                fullWidth
                size="small"
                required
                disabled={disabled || loadingDevices}
                error={!!errors.deviceIds}
                helperText={
                  errors.deviceIds?.message ||
                  "Seleccione uno o más dispositivos de marcación de asistencia"
                }
                slotProps={{
                  select: {
                    multiple: true,
                    renderValue: (selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selected.length === 0 ? (
                          <Typography variant="body2" color="text.secondary">
                            Ningún dispositivo seleccionado
                          </Typography>
                        ) : (
                          selected.map((id) => {
                            const device = devices.find((s) => s._id === id);
                            return (
                              <Chip
                                key={id}
                                label={device?.name || id}
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
                    startAdornment: loadingDevices ? (
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                    ) : null,
                  },
                }}
              >
                {devices.length === 0 && !loadingDevices ? (
                  <MenuItem disabled>
                    <Typography variant="body2" color="text.secondary">
                      No hay dispositivos disponibles
                    </Typography>
                  </MenuItem>
                ) : (
                  devices.map((dev) => (
                    <MenuItem key={dev._id} value={dev._id}>
                      <Stack spacing={0.5}>
                        <Typography variant="body2" fontWeight="medium">
                          {dev.name}
                        </Typography>
                        {dev.location && (
                          <Typography variant="caption" color="text.secondary">
                            {dev.location}
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

export default UserForm;

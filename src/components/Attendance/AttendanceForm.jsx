import { useForm, Controller } from "react-hook-form";
import { useEffect, useState, useCallback } from "react";
import {
  Box,
  TextField,
  Grid,
  Typography,
  Alert,
  MenuItem,
  Stack,
  CircularProgress,
  Autocomplete,
  Skeleton,
  //Chip,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { es } from "date-fns/locale";
import { getUsers } from "../../services/userService";
import { getDevices } from "../../services/deviceService";
import { getSchedules } from "../../services/scheduleService";
import debounce from "lodash/debounce";

const AttendanceForm = ({
  onSubmit,
  defaultValues = {},
  onChange,
  disabled = false,
  //loading = false,
  //setLoadingData,
}) => {
  // Estados para datos precargados
  const [users, setUsers] = useState([]);
  const [devices, setDevices] = useState([]);
  const [schedules, setSchedules] = useState([]);

  // Estados de carga
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [loadingSchedules, setLoadingSchedules] = useState(false);

  // Estados de error
  const [usersError, setUsersError] = useState(null);
  const [devicesError, setDevicesError] = useState(null);
  const [schedulesError, setSchedulesError] = useState(null);

  // Estado para búsqueda de usuarios
  const [userSearchTerm, setUserSearchTerm] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    //setValue,
  } = useForm({
    /*defaultValues: {
      userId: defaultValues.userId || null,
      deviceId: defaultValues.deviceId?._id || defaultValues.deviceId || "",
      timestamp: defaultValues.timestamp
        ? new Date(defaultValues.timestamp)
        : new Date(),
      type: defaultValues.type || "IN",
      scheduleId:
        defaultValues.scheduleId?._id || defaultValues.scheduleId || "",
      verificationMethod: defaultValues.verificationMethod || "fingerprint",
      justification: defaultValues.justification || "",
      notes: defaultValues.notes || "",
    },*/
    defaultValues: {
      userId: null,
      deviceId: "",
      timestamp: null,
      type: "IN",
      scheduleId: "",
      verificationMethod: "fingerprint",
      justification: "",
      notes: "",
    },
  });

  // Formatear nombre completo del usuario
  const formatUserName = (user) => {
    if (!user) return "";
    const parts = [user.name, user.firstSurname, user.secondSurname].filter(
      Boolean
    );
    return parts.join(" ");
  };

  // Búsqueda de usuarios con debounce
  const debouncedSearchUsers = useCallback(
    debounce(async (searchValue) => {
      if (!searchValue || searchValue.length < 2) {
        setUsers([]);
        return;
      }

      try {
        setLoadingUsers(true);
        setUsersError(null);
        const data = await getUsers({ search: searchValue, limit: 20 });
        setUsers(data.data || data);
      } catch (error) {
        setUsersError("Error al buscar usuarios");
        console.error("Error fetching users:", error);
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    }, 500),
    []
  );

  // Cargar usuario por defecto en modo edición
  useEffect(() => {
    if (defaultValues.userId && typeof defaultValues.userId === "object") {
      setUsers([defaultValues.userId]);
    }
  }, [defaultValues.userId]);

  // Cargar dispositivos
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setLoadingDevices(true);
        setDevicesError(null);
        const data = await getDevices();
        setDevices(data.filter((d) => d.status === "active"));
      } catch (error) {
        setDevicesError("Error al cargar dispositivos");
        console.error("Error fetching devices:", error);
      } finally {
        setLoadingDevices(false);
      }
    };

    fetchDevices();
  }, []);

  // Cargar horarios
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoadingSchedules(true);
        setSchedulesError(null);
        const data = await getSchedules();
        setSchedules(data.filter((s) => s.status === "active"));
      } catch (error) {
        setSchedulesError("Error al cargar horarios");
        console.error("Error fetching schedules:", error);
      } finally {
        setLoadingSchedules(false);
      }
    };

    fetchSchedules();
  }, []);

  // Notificar al componente padre cuando está cargando datos
  /*useEffect(() => {
    const isLoading = loadingDevices || loadingSchedules;
    if (setLoadingData) {
      setLoadingData(isLoading);
    }
  }, [loadingDevices, loadingSchedules, setLoadingData]);*/
  useEffect(() => {
    const allLoaded = !loadingUsers && !loadingSchedules && !loadingDevices;

    if (allLoaded && Object.keys(defaultValues).length > 0) {
      reset({
        userId: defaultValues.userId || null,
        deviceId: defaultValues.deviceId?._id || defaultValues.deviceId || "",
        timestamp: defaultValues.timestamp
          ? new Date(defaultValues.timestamp)
          : new Date(),
        type: defaultValues.type || "IN",
        scheduleId:
          defaultValues.scheduleId?._id || defaultValues.scheduleId || "",
        verificationMethod: defaultValues.verificationMethod || "fingerprint",
        justification: defaultValues.justification || "",
        notes: defaultValues.notes || "",
      });
    }
  }, [
    defaultValues,
    loadingUsers,
    loadingSchedules,
    loadingDevices,
    reset,
  ]);

  // Detectar cambios en el formulario
  useEffect(() => {
    const subscription = watch(() => {
      if (onChange) {
        onChange();
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, onChange]);

  // Tipos de asistencia
  const attendanceTypes = [
    { value: "IN", label: "Entrada", icon: "🔵" },
    { value: "OUT", label: "Salida", icon: "🟠" },
    { value: "BREAK_START", label: "Inicio Descanso", icon: "☕" },
    { value: "BREAK_END", label: "Fin Descanso", icon: "✅" },
  ];

  // Métodos de verificación
  const verificationMethods = [
    { value: "fingerprint", label: "Huella Digital", icon: "👆" },
    { value: "rfid", label: "Tarjeta RFID", icon: "💳" },
    { value: "pin", label: "PIN", icon: "🔢" },
    { value: "face", label: "Reconocimiento Facial", icon: "👤" },
    { value: "manual", label: "Manual", icon: "✍️" },
  ];

  // Si aún se cargan las listas, mostrar un loader o skeleton
  if (loadingUsers || loadingSchedules || loadingDevices) {
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
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box
        component="form"
        id="attendance-form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <Grid container spacing={2.5}>
          {/* Usuario - Autocomplete con búsqueda */}
          <Grid size={{ xs: 12 }}>
            {usersError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {usersError}
              </Alert>
            )}

            <Controller
              name="userId"
              control={control}
              rules={{
                required: "El usuario es obligatorio",
                validate: (value) =>
                  value && typeof value === "object" && value._id
                    ? true
                    : "Seleccione un usuario válido",
              }}
              render={({ field: { onChange, value, ...field } }) => (
                <Autocomplete
                  {...field}
                  options={users}
                  value={value || null}
                  onChange={(event, newValue) => {
                    onChange(newValue);
                  }}
                  onInputChange={(event, newInputValue) => {
                    setUserSearchTerm(newInputValue);
                    debouncedSearchUsers(newInputValue);
                  }}
                  getOptionLabel={(option) =>
                    option ? formatUserName(option) : ""
                  }
                  isOptionEqualToValue={(option, value) =>
                    option._id === value?._id
                  }
                  loading={loadingUsers}
                  disabled={disabled}
                  noOptionsText={
                    userSearchTerm.length < 2
                      ? "Escriba al menos 2 caracteres"
                      : "No se encontraron usuarios"
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Usuario"
                      required
                      size="small"
                      error={!!errors.userId}
                      helperText={
                        errors.userId?.message ||
                        "Busque por nombre, apellido o DNI"
                      }
                      slotProps={{
                        input: {
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loadingUsers ? (
                                <CircularProgress color="inherit" size={20} />
                              ) : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        },
                      }}
                    />
                  )}
                  renderOption={(props, option) => {
                    const { key, ...optionProps } = props;
                    return (
                      <Box
                        key={key}
                        component="li"
                        {...optionProps}
                        sx={{ display: "block !important" }}
                      >
                        <Stack spacing={0.3}>
                          <Typography variant="body2" fontWeight="medium">
                            {formatUserName(option)}
                          </Typography>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              DNI: {option.dni || "Sin DNI"}
                            </Typography>
                            {option.departmentId?.name && (
                              <>
                                <Typography
                                  variant="caption"
                                  color="text.disabled"
                                >
                                  •
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {option.departmentId.name}
                                </Typography>
                              </>
                            )}
                          </Stack>
                        </Stack>
                      </Box>
                    );
                  }}
                />
              )}
            />
          </Grid>

          {/* Fecha y Hora */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="timestamp"
              control={control}
              rules={{
                required: "La fecha y hora son obligatorias",
                validate: (value) => {
                  if (!value) return "Fecha inválida";
                  if (isNaN(value.getTime())) return "Fecha inválida";
                  return true;
                },
              }}
              render={({ field }) => (
                <DateTimePicker
                  {...field}
                  label="Fecha y Hora"
                  disabled={disabled}
                  format="dd/MM/yyyy HH:mm"
                  ampm={false}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      size: "small",
                      error: !!errors.timestamp,
                      helperText: errors.timestamp?.message,
                    },
                  }}
                />
              )}
            />
          </Grid>

          {/* Tipo de Asistencia */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="type"
              control={control}
              rules={{
                required: "El tipo de asistencia es obligatorio",
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Tipo"
                  fullWidth
                  size="small"
                  required
                  disabled={disabled}
                  error={!!errors.type}
                  helperText={errors.type?.message}
                >
                  {attendanceTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography>{type.icon}</Typography>
                        <Typography>{type.label}</Typography>
                      </Stack>
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          {/* Dispositivo */}
          <Grid size={{ xs: 12, md: 6 }}>
            {devicesError && (
              <Alert severity="error" sx={{ mb: 1 }}>
                {devicesError}
              </Alert>
            )}

            <Controller
              name="deviceId"
              control={control}
              rules={{
                required: "El dispositivo es obligatorio",
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Dispositivo"
                  fullWidth
                  size="small"
                  required
                  disabled={disabled || loadingDevices}
                  error={!!errors.deviceId}
                  helperText={errors.deviceId?.message}
                  slotProps={{
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
                    devices.map((device) => (
                      <MenuItem key={device._id} value={device._id}>
                        <Stack spacing={0.3}>
                          <Typography variant="body2" fontWeight="medium">
                            {device.name}
                          </Typography>
                          {device.location && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              📍 {device.location}
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

          {/* Horario */}
          <Grid size={{ xs: 12, md: 6 }}>
            {schedulesError && (
              <Alert severity="error" sx={{ mb: 1 }}>
                {schedulesError}
              </Alert>
            )}

            <Controller
              name="scheduleId"
              control={control}
              rules={{
                required: "El horario es obligatorio",
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Horario"
                  fullWidth
                  size="small"
                  required
                  disabled={disabled || loadingSchedules}
                  error={!!errors.scheduleId}
                  helperText={errors.scheduleId?.message}
                  slotProps={{
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
                        <Stack spacing={0.3}>
                          <Typography variant="body2" fontWeight="medium">
                            {schedule.name}
                          </Typography>
                          {schedule.startTime && schedule.endTime && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              🕐 {schedule.startTime} - {schedule.endTime}
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

          {/* Método de Verificación */}
          <Grid size={{ xs: 12 }}>
            <Controller
              name="verificationMethod"
              control={control}
              rules={{
                required: "El método de verificación es obligatorio",
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Método de Verificación"
                  fullWidth
                  size="small"
                  required
                  disabled={disabled}
                  error={!!errors.verificationMethod}
                  helperText={errors.verificationMethod?.message}
                >
                  {verificationMethods.map((method) => (
                    <MenuItem key={method.value} value={method.value}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography>{method.icon}</Typography>
                        <Typography>{method.label}</Typography>
                      </Stack>
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          {/* Justificación (Opcional) */}
          <Grid size={{ xs: 12 }}>
            <Controller
              name="justification"
              control={control}
              rules={{
                maxLength: {
                  value: 200,
                  message: "Máximo 200 caracteres",
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Justificación"
                  fullWidth
                  multiline
                  rows={2}
                  size="small"
                  disabled={disabled}
                  error={!!errors.justification}
                  helperText={
                    errors.justification?.message ||
                    "Opcional: Indique el motivo de una tardanza o salida temprana"
                  }
                  placeholder="Ej: Cita médica, emergencia familiar, etc."
                />
              )}
            />
          </Grid>

          {/* Notas (Opcional) */}
          <Grid size={{ xs: 12 }}>
            <Controller
              name="notes"
              control={control}
              rules={{
                maxLength: {
                  value: 300,
                  message: "Máximo 300 caracteres",
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Notas Adicionales"
                  fullWidth
                  multiline
                  rows={2}
                  size="small"
                  disabled={disabled}
                  error={!!errors.notes}
                  helperText={
                    errors.notes?.message ||
                    "Opcional: Observaciones o comentarios adicionales"
                  }
                  placeholder="Ej: Registro manual por falla del sistema"
                />
              )}
            />
          </Grid>

          {/* Información del Estado */}
          <Grid size={{ xs: 12 }}>
            <Alert severity="info" sx={{ mt: 1 }}>
              <Typography variant="caption">
                ℹ️ El estado de la asistencia (A Tiempo, Tardanza, etc.) se
                calculará automáticamente según el horario asignado y la hora de
                registro.
              </Typography>
            </Alert>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default AttendanceForm;

import { useForm, Controller } from "react-hook-form";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
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
  Paper,
  Chip,
  Divider,
  AlertTitle,
  //Chip,
} from "@mui/material";
import {
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  Fingerprint as FingerprintIcon,
  EventNote as EventNoteIcon,
} from "@mui/icons-material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { es } from "date-fns/locale";
import { getUsers } from "../../services/userService";
//import debounce from "lodash/debounce";

const AttendanceForm = ({
  onSubmit,
  defaultValues = {},
  onChange,
  disabled = false,
  loading = false,
  //setLoadingData,
}) => {
  // Obtener el color del chip según el status
  const getStatusConfig = (status) => {
    const statusMap = {
      on_time: { label: "A tiempo", color: "success" },
      late: { label: "Tarde", color: "warning" },
      absent: { label: "Ausente", color: "error" },
      early: { label: "Temprano", color: "info" },
      early_exit: { label: "Salida anticipada", color: "warning" },
    };
    return statusMap[status] || { label: status, color: "default" };
  };

  // Estados para datos precargados
  const [users, setUsers] = useState([]);

  // Estados de carga
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [loadingSchedules, setLoadingSchedules] = useState(false);

  // Estados de error
  const [usersError, setUsersError] = useState(null);

  // Estado para búsqueda de usuarios
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [userInputValue, setUserInputValue] = useState("");

  // NUEVO: Controlar inicialización
  const hasInitialized = useRef(false);
  const isInitialLoad = useRef(true);

  const isEditing = Boolean(defaultValues?.justification);
  const isEditMode = Boolean(defaultValues?.timestamp);

  const statusConfig = useMemo(
    () => getStatusConfig(defaultValues?.status),
    [defaultValues?.status]
  );
  const fixedDate = useMemo(
    () => (isEditMode ? new Date(defaultValues.timestamp) : null),
    [isEditMode, defaultValues.timestamp]
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm({
    defaultValues: {
      userId: null,
      timestamp: null,
    },
  });

  // Formatear nombre completo del usuario
  const formatUserName = useCallback((user) => {
    if (!user) return "";
    const parts = [user.name, user.firstSurname, user.secondSurname].filter(
      Boolean
    );
    return parts.join(" ");
  }, []);

  // Cargar usuario por defecto en modo edición
  useEffect(() => {
    if (defaultValues.userId && typeof defaultValues.userId === "object") {
      setUsers([defaultValues.userId]);
    }
  }, [defaultValues.userId]);

  // Cargar TODOS los usuarios una sola vez al montar el componente
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        setUsersError(null);
        const data = await getUsers();
        setUsers(data.data || data);
      } catch (error) {
        setUsersError("Error al cargar usuarios");
        console.error("Error fetching users:", error);
        setUsers([]);
      } finally {
        setLoadingUsers(false);
        isInitialLoad.current = false;
      }
    };

    fetchUsers();
  }, []); // Solo se ejecuta una vez al montar

  useEffect(() => {
    const hasDefaultValues = Object.keys(defaultValues).length > 0;

    if (hasDefaultValues && !hasInitialized.current) {
      hasInitialized.current = true;
      reset({
        userId: defaultValues.userId || null,
        timestamp: defaultValues.timestamp
          ? new Date(defaultValues.timestamp)
          : new Date(),
      });
    }
  }, [defaultValues, reset]);

  // Detectar cambios en el formulario
  const watchedTimestamp = watch("timestamp");

  useEffect(() => {
    if (onChange) onChange();
  }, [watchedTimestamp]);

  // Formatear la fecha para mostrar
  const formatDate = (date) => {
    return new Date(date).toLocaleString("es-PE", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const timeToMinutes = (time) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  const validateEditTime = useCallback(
    (value) => {
      if (!value || isNaN(value.getTime())) return "Hora inválida";
      if (!isEditMode) return true;

      const selectedMinutes = value.getHours() * 60 + value.getMinutes();

      const { startTime, endTime, toleranceMinutes } = defaultValues.scheduleId;

      const start = timeToMinutes(startTime);
      const end = timeToMinutes(endTime);

      let minAllowed =
        defaultValues.type === "IN" ? start - toleranceMinutes : start - 180;

      let maxAllowed = end + toleranceMinutes + 30;

      return selectedMinutes < minAllowed || selectedMinutes >= maxAllowed
        ? "Hora fuera del rango permitido"
        : true;
    },
    [defaultValues, isEditMode]
  );

  const normalizeDateKeepingDay = useCallback(
    (newValue) => {
      if (!newValue || !fixedDate) return newValue;

      const normalized = new Date(fixedDate);
      normalized.setHours(newValue.getHours());
      normalized.setMinutes(newValue.getMinutes());
      normalized.setSeconds(0);
      normalized.setMilliseconds(0);
      return normalized;
    },
    [fixedDate]
  );

  const hasDefaultValues = useMemo(
    () => Object.keys(defaultValues || {}).length > 0,
    [defaultValues]
  );

  // Si aún se cargan las listas, mostrar un loader o skeleton. Solo mostrar skeleton en la carga INICIAL
  if (isInitialLoad.current && (loadingSchedules || loadingDevices)) {
    return (
      <Box sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Skeleton variant="rounded" height={36} />
          <Skeleton variant="rounded" height={36} />
          <Skeleton variant="rounded" height={36} />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Skeleton variant="rounded" height={36} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Skeleton variant="rounded" height={36} />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Skeleton variant="rounded" height={36} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Skeleton variant="rounded" height={36} />
            </Grid>
          </Grid>
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
        onSubmit={handleSubmit((data) =>
          onSubmit({ ...data, verificationMethod: "Manual" })
        )}
        noValidate
      >
        <Grid container spacing={2.5}>
          {hasDefaultValues && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: "grey.50",
                width: "100%",
              }}
            >
              {/* Encabezado con nombre y estado */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  mb: 2,
                }}
              >
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    {defaultValues.userId?.name}{" "}
                    {defaultValues.userId?.firstSurname}{" "}
                    {defaultValues.userId?.secondSurname}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <FingerprintIcon
                      sx={{ fontSize: 14, color: "text.secondary" }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      DNI: {defaultValues.userId?.dni}
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={statusConfig?.label}
                  color={statusConfig?.color}
                  size="small"
                  sx={{ fontWeight: 500 }}
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Información del registro */}
              <Grid container spacing={2}>
                <Grid size={6}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      mb: 0.5,
                    }}
                  >
                    <AccessTimeIcon
                      sx={{ fontSize: 14, color: "text.secondary" }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Fecha y hora:
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={500}>
                    {formatDate(defaultValues.timestamp)}
                  </Typography>
                </Grid>

                <Grid size={6}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      mb: 0.5,
                    }}
                  >
                    <EventNoteIcon
                      sx={{ fontSize: 14, color: "text.secondary" }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Tipo:
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={500}>
                    {defaultValues.type === "IN" ? "Entrada" : "Salida"}
                  </Typography>
                </Grid>
                <Grid size={12}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      mb: 0.5,
                    }}
                  >
                    <EventNoteIcon
                      sx={{ fontSize: 14, color: "text.secondary" }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Horario:
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={500}>
                    {defaultValues.scheduleId.name}
                  </Typography>
                </Grid>

                {defaultValues.deviceId && (
                  <Grid size={12}>
                    <Typography variant="caption" color="text.secondary">
                      Dispositivo:
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {defaultValues.deviceId.name} -{" "}
                      {defaultValues.deviceId.location}
                    </Typography>
                  </Grid>
                )}
              </Grid>

              {/* Alerta con justificación actual */}
              {isEditing && (
                <Alert severity="info" icon={<InfoIcon />} sx={{ mt: 2 }}>
                  <AlertTitle sx={{ fontSize: "0.875rem", fontWeight: 600 }}>
                    Justificación actual
                  </AlertTitle>
                  <Typography variant="caption" component="div">
                    <strong>Razón:</strong> {defaultValues.justification.reason}
                  </Typography>
                  <Typography variant="caption" component="div">
                    <strong>Aprobado por:</strong>{" "}
                    {`${defaultValues.justification.approvedBy.name} ${defaultValues.justification.approvedBy.firstSurname} ${defaultValues.justification.approvedBy.secondSurname}`}
                  </Typography>
                  <Typography variant="caption" component="div">
                    <strong>Fecha:</strong>{" "}
                    {formatDate(defaultValues.justification.approvedAt)}
                  </Typography>
                  <Typography variant="caption" component="div">
                    <strong>Estado:</strong>{" "}
                    {defaultValues.justification.approved
                      ? "Aprobado"
                      : "No aprobado"}
                  </Typography>
                </Alert>
              )}
            </Paper>
          )}

          {/* Usuario - Autocomplete con búsqueda */}
          {!hasDefaultValues && (
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
                    inputValue={userInputValue}
                    filterOptions={(options, { inputValue }) => {
                      if (!inputValue || inputValue.length < 2) return [];

                      const searchTerm = inputValue.toLowerCase();
                      return options.filter((option) => {
                        const fullName = formatUserName(option).toLowerCase();
                        const dni = option.dni?.toString() || "";
                        return (
                          fullName.includes(searchTerm) ||
                          dni.includes(searchTerm)
                        );
                      });
                    }}
                    onChange={(event, newValue) => {
                      onChange(newValue);
                      setUserInputValue(
                        newValue ? formatUserName(newValue) : ""
                      );
                    }}
                    onInputChange={(event, newInputValue, reason) => {
                      setUserInputValue(newInputValue);
                      setUserSearchTerm(newInputValue);

                      if (reason === "clear") {
                        setUserSearchTerm("");
                      }
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
                      loadingUsers
                        ? "Cargando usuarios..."
                        : userSearchTerm.length < 2
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
                    slotProps={{
                      popper: {
                        sx: {
                          zIndex: 1300, // importante en Dialogs
                          "& .MuiPaper-root": {
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 2,
                            boxShadow: (theme) =>
                              theme.palette.mode === "light"
                                ? "0px 8px 24px rgba(0,0,0,0.12)"
                                : "0px 8px 24px rgba(0,0,0,0.6)",
                          },
                          "& .MuiAutocomplete-listbox": {
                            padding: 0.5,
                          },
                          "& .MuiAutocomplete-option": {
                            borderRadius: 1,
                          },
                          "& .MuiAutocomplete-option.Mui-focused": {
                            backgroundColor: "action.hover",
                          },
                          "& .MuiAutocomplete-option[aria-selected='true']": {
                            backgroundColor: "action.selected",
                          },
                        },
                      },
                    }}
                  />
                )}
              />
            </Grid>
          )}

          {/* Fecha y Hora */}
          <Grid size={{ xs: 12 }}>
            <Controller
              name="timestamp"
              control={control}
              rules={{
                required: "La fecha y hora son obligatorias",
                validate: validateEditTime,
              }}
              shouldUnregister={false}
              render={({ field }) => (
                <DateTimePicker
                  {...field}
                  label="Hora de Asistencia"
                  ampm={false}
                  disabled={disabled}
                  format="dd/MM/yyyy HH:mm"
                  minDate={isEditMode ? fixedDate : undefined}
                  maxDate={isEditMode ? fixedDate : undefined}
                  onChange={(newValue) => {
                    const normalized = isEditMode
                      ? normalizeDateKeepingDay(newValue)
                      : newValue;

                    field.onChange(normalized);
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      size: "small",
                      error: !!errors.timestamp,
                      helperText:
                        errors.timestamp?.message ||
                        (isEditMode
                          ? "Solo puede modificar la hora"
                          : undefined),
                    },
                  }}
                />
              )}
            />
          </Grid>

          {/* Información del Estado */}
          <Grid size={{ xs: 12 }}>
            <Alert severity="info" sx={{ mt: 1 }}>
              <Typography variant="caption">
                El tipo de registro y estado de la asistencia (A Tiempo,
                Tardanza, etc.) se calculará automáticamente según el horario
                asignado y la hora de registro.
              </Typography>
            </Alert>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default AttendanceForm;

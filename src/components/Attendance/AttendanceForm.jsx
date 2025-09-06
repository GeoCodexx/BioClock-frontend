import { useEffect, useState } from "react";
import {
  TextField,
  MenuItem,
  FormControl,
  Box,
  FormHelperText,
  InputLabel,
  Select,
  //CircularProgress,
  FormControlLabel,
  RadioGroup,
  FormLabel,
  Radio,
  Collapse,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { getUsers } from "../../services/userService";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
//import { format, parse } from 'date-fns';
import { es } from "date-fns/locale"; // o el locale que necesites

export default function AttendanceForm({
  onSubmit,
  defaultValues = {},
  loading = false,
  setLoadingData,
  //handleFormStatus,
}) {
  const [users, setUsers] = useState([]);
  const [availableSchedules, setAvailableSchedules] = useState([]);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      userId: "",
      scheduleId: "",
      timestamp: null,
      type: "IN",
      status: "justified",
      verificationMethod: "fingerprint",
      notes: "",
      justification: "",
      ...defaultValues,
    },
    mode: "onChange", // Cambiado para validación más temprana
  });

  const isEditing = Boolean(
    defaultValues && Object.keys(defaultValues).length > 0
  );

  // Cargar datos iniciales si es edición
  /*useEffect(() => {
    if (Object.keys(defaultValues).length > 0) {
      const { userId, scheduleId, timestamp, ...rest } = defaultValues;
      reset({
        userId: userId._id,
        //scheduleId: scheduleId._id,
        timestamp: new Date(timestamp),
        ...rest,
      });

      // Esperar a que el select de scheduleId tenga las opciones cargadas
      setTimeout(() => {
        setValue("scheduleId", scheduleId._id);
      }, 500);
    }
  }, [JSON.stringify(defaultValues)]);*/
  useEffect(() => {
    if (isEditing) {
      const { userId, timestamp, scheduleId, ...rest } = defaultValues;
      reset({
        userId: userId._id,
        timestamp: new Date(timestamp),
        scheduleId: scheduleId?._id || "",
        ...rest,
      });
    }
  }, [JSON.stringify(defaultValues)]);

  // Cargar usuarios
  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      //handleFormStatus(true);
      try {
        const usersData = await getUsers();
        setUsers(usersData);
        //setDevices(devicesData);
      } catch (err) {
        setUsers([]);
        //setDevices([]);
      } finally {
        //handleFormStatus(true);
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  // Observar el usuario seleccionado
  // Actualizar horarios disponibles cuando cambie el usuario seleccionado
  const selectedUserId = watch("userId");

  /*useEffect(() => {
    if (selectedUserId) {
      // Buscar usuario seleccionado
      const selectedUser = users.find((u) => u._id === selectedUserId);
      // Actualizar horarios disponibles
      setAvailableSchedules(selectedUser?.scheduleIds || []);
      // Resetear el valor del select de horarios
      setValue("scheduleId", "");
    } else {
      setAvailableSchedules([]);
      setValue("scheduleId", "");
    }
  }, [selectedUserId, users, setValue]);*/
  useEffect(() => {
    if (selectedUserId) {
      const selectedUser = users.find((u) => u._id === selectedUserId);
      const schedules = selectedUser?.scheduleIds || [];
      setAvailableSchedules(schedules);

      // Si NO estamos editando, reseteamos el valor
      if (!isEditing) {
        setValue("scheduleId", "");
      }
    } else {
      setAvailableSchedules([]);
      setValue("scheduleId", "");
    }
  }, [selectedUserId, users]);

  // Setear scheduleId automáticamente cuando las opciones estén listas
  useEffect(() => {
    if (
      isEditing &&
      defaultValues?.scheduleId?._id &&
      availableSchedules.length > 0 &&
      availableSchedules.some((s) => s._id === defaultValues.scheduleId._id)
    ) {
      setValue("scheduleId", defaultValues.scheduleId._id);
    }
  }, [availableSchedules, defaultValues, isEditing]);

  // Controlar cuándo mostrar el formulario
  /*useEffect(() => {
    if (isEditing) {
      const ready =
        users.length > 0 &&
        availableSchedules.length > 0 &&
        !!defaultValues?.scheduleId?._id;
      handleFormStatus(ready);
    } else {
      // En modo registro, basta con que los usuarios estén cargados
      handleFormStatus(users.length > 0);
    }
  }, [users, availableSchedules, defaultValues, isEditing]);*/

  /*const onSubmit = (data) => {
    console.log("Datos enviados:", data);
  };*/

  return (
    <>
      <Box
        id="attendance-form"
        component="form"
        onSubmit={handleSubmit(onSubmit)}
      >
        {/* User Field */}
        <Controller
          name="userId"
          control={control}
          rules={{ required: "Este campo es requerido" }}
          render={({ field }) => (
            <FormControl
              fullWidth
              margin="normal"
              error={!!errors.userId}
              size="small"
            >
              <InputLabel id="demo-simple-select-label">Usuario</InputLabel>
              <Select
                {...field}
                label="Usuario"
                labelId="demo-simple-select-label"
                disabled={loading || !users.length}
                value={users.length > 0 ? field.value : ""} // Manejo seguro del valor inicial
                displayEmpty
              >
                {!users.length && (
                  <MenuItem disabled value="">
                    <em>
                      {loading
                        ? "Cargando usuarios..."
                        : "No hay usuarios disponibles"}
                    </em>
                  </MenuItem>
                )}
                {users.map((user) => (
                  <MenuItem key={user._id} value={user._id}>
                    {`${user.name} ${user.firstSurname} ${user.secondSurname}`}
                  </MenuItem>
                ))}
              </Select>
              {errors.userId && (
                <FormHelperText>{errors.userId.message}</FormHelperText>
              )}
            </FormControl>
          )}
        />

        {/* Schedule Field */}
        <Controller
          name="scheduleId"
          control={control}
          rules={{ required: "Selecciona un horario" }}
          render={({ field }) => (
            <FormControl
              fullWidth
              margin="normal"
              error={!!errors.scheduleId}
              size="small"
            >
              <InputLabel>Horario</InputLabel>
              <Select
                {...field}
                label="Horario"
                disabled={loading || !availableSchedules.length}
                value={availableSchedules.length > 0 ? field.value : ""} // Manejo seguro del valor inicial
                displayEmpty
              >
                {/*!availableSchedules.length && (
                  <MenuItem disabled value="">
                    <em>
                      {loading
                        ? "Cargando horarios..."
                        : "No hay horarios disponibles"}
                    </em>
                  </MenuItem>
                )*/}
                {availableSchedules.map((schedule) => (
                  <MenuItem key={schedule._id} value={schedule._id}>
                    {schedule.name}
                  </MenuItem>
                ))}
              </Select>
              {/*errors.scheduleId && (
                <FormHelperText>{errors.scheduleId.message}</FormHelperText>
              )*/}
              {/* Mensaje dinámico debajo del Select */}
              {loading ? (
                <FormHelperText>Cargando horarios...</FormHelperText>
              ) : !availableSchedules.length ? (
                <FormHelperText>No hay horarios disponibles</FormHelperText>
              ) : errors.scheduleId ? (
                <FormHelperText>{errors.scheduleId.message}</FormHelperText>
              ) : null}
            </FormControl>
          )}
        />

        {/* Type Field*/}
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <FormControl component="fieldset">
              <FormLabel component="legend">Tipo de registro</FormLabel>
              <RadioGroup {...field} row>
                <FormControlLabel
                  value="IN"
                  control={<Radio size="small" />}
                  label="Entrada"
                />
                <FormControlLabel
                  value="OUT"
                  control={<Radio size="small" />}
                  label="Salida"
                />
              </RadioGroup>
            </FormControl>
          )}
        />

        {/* Timestamp Field */}
        <Box sx={{ width: "100%" }}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <Controller
              name="timestamp"
              control={control}
              //defaultValue={null}
              rules={{
                required: "Este campo es obligatorio",
                validate: (value) =>
                  value instanceof Date && !isNaN(value.getTime())
                    ? true
                    : "Fecha inválida",
              }}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <DateTimePicker
                  label={`Fecha y hora de ${
                    watch("type") === "IN" ? "entrada" : "salida"
                  }`}
                  value={value}
                  onChange={onChange}
                  ampm={false}
                  //format="dd/mm/yyyy HH:mm"
                  disableMaskedInput
                  PopperProps={{
                    placement: "bottom-start",
                    disablePortal: true,
                  }}
                  // Forma correcta en MUI v7 + x-date-pickers v8
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: Boolean(error),
                      helperText: error ? error.message : "",
                      size: "small",
                    },
                  }}
                  sx={{ width: "100%" }}
                />
              )}
            />
          </LocalizationProvider>
        </Box>

        {/* Verification Method Field */}
        <Controller
          name="verificationMethod"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth margin="normal" size="small">
              <InputLabel>Método de verificación</InputLabel>
              <Select
                {...field}
                label="Método de verificación"
                disabled={loading}
              >
                <MenuItem value="fingerprint">Huella digital</MenuItem>
                <MenuItem value="pin">PIN</MenuItem>
                <MenuItem value="facial">Reconocimiento facial</MenuItem>
                <MenuItem value="manual">Registro manual</MenuItem>
              </Select>
            </FormControl>
          )}
        />

        {/* Status Field */}
        <Controller
          name="status"
          control={control}
          rules={{ required: "Este campo es requerido" }}
          render={({ field }) => (
            <FormControl
              fullWidth
              margin="normal"
              error={!!errors.status}
              size="small"
            >
              <InputLabel>Estado</InputLabel>
              <Select {...field} label="Estado" disabled={loading}>
                <MenuItem value="on_time">A tiempo</MenuItem>
                <MenuItem value="late">Tarde</MenuItem>
                <MenuItem value="absent">Ausente</MenuItem>
                <MenuItem value="early_leave">Salida temprana</MenuItem>
                <MenuItem value="justified">Justificado</MenuItem>
              </Select>
              {errors.status && (
                <FormHelperText>{errors.status.message}</FormHelperText>
              )}
            </FormControl>
          )}
        />

        {/* Justification Field (shown only when status is 'justified') */}

        <Collapse
          in={watch("status") === "justified"}
          timeout={300}
          unmountOnExit
        >
          <Box sx={{ mt: 1 }}>
            <Controller
              name="justification"
              control={control}
              rules={{
                validate: (value) =>
                  control._formValues.status !== "justified" ||
                  value?.trim() !== "" ||
                  "Debe proporcionar una justificación",
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  margin="normal"
                  label="Justificación"
                  multiline
                  rows={4}
                  error={!!errors.justification}
                  helperText={errors.justification?.message}
                  disabled={loading}
                />
              )}
            />
          </Box>
        </Collapse>

        {/* Notes Field */}
        <Controller
          name="notes"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              margin="normal"
              label="Notas adicionales"
              multiline
              rows={4}
              disabled={loading}
              placeholder="Agrega alguna nota..."
            />
          )}
        />
        {/* Submit Button */}
        {/* <Box mt={3} display="flex" justifyContent="flex-end">
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading ? "Procesando..." : "Guardar"}
          </Button>
        </Box> */}
      </Box>
    </>
  );

  /*return (
    <form id="user-form" onSubmit={handleSubmit(onSubmit)}>
      <TextField
        margin="normal"
        fullWidth
        label="Nombre"
        {...register("name", { required: "Nombre requerido" })}
        error={!!errors.name}
        helperText={errors.name?.message}
      />
      <TextField
        margin="normal"
        fullWidth
        label="Apellido Paterno"
        {...register("firstSurname", {
          required: "Apellido paterno requerido",
        })}
        error={!!errors.firstSurname}
        helperText={errors.firstSurname?.message}
      />
      <TextField
        margin="normal"
        fullWidth
        label="Apellido Materno"
        {...register("secondSurname", {
          required: "Apellido materno requerido",
        })}
        error={!!errors.secondSurname}
        helperText={errors.secondSurname?.message}
      />
      <TextField
        margin="normal"
        fullWidth
        label="DNI"
        {...register("dni", { required: "DNI requerido" })}
        error={!!errors.dni}
        helperText={errors.dni?.message}
      />
      <TextField
        margin="normal"
        fullWidth
        label="Teléfono"
        {...register("phone", { required: "Teléfono requerido" })}
        error={!!errors.phone}
        helperText={errors.phone?.message}
      />
      <TextField
        margin="normal"
        fullWidth
        label="Email"
        type="email"
        {...register("email", { required: "Email requerido" })}
        error={!!errors.email}
        helperText={errors.email?.message}
      />
      <TextField
        margin="normal"
        fullWidth
        label="Contraseña"
        type="password"
        {...register("passwordHash", { required: "Contraseña requerida" })}
        error={!!errors.passwordHash}
        helperText={errors.passwordHash?.message}
      />
      {roles.length > 0 && (
        <FormControl fullWidth margin="normal" error={!!errors.roleId}>
          <InputLabel id="role-label">Rol</InputLabel>
          <Select
            labelId="role-label"
            label="Rol"
            value={defaultValues.roleId?._id || ""}
            defaultValue={defaultValues.roleId?._id || ""}
            {...register("roleId", { required: "Rol requerido" })}
          >
            {loadingData ? (
              <MenuItem value="">
                <CircularProgress size={20} />
              </MenuItem>
            ) : (
              roles.map((role) => (
                <MenuItem key={role._id} value={role._id}>
                  {role.name}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
      )}

      {departments.length > 0 && (
        <FormControl fullWidth margin="normal" error={!!errors.departmentId}>
          <InputLabel id="department-label">Departamento</InputLabel>
          <Select
            labelId="department-label"
            label="Departamento"
            value={defaultValues.departmentId?._id || ""}
            defaultValue={defaultValues.departmentId?._id || ""}
            {...register("departmentId", {
              required: "Departamento requerido",
            })}
          >
            {loadingData ? (
              <MenuItem value="">
                <CircularProgress size={20} />
              </MenuItem>
            ) : (
              departments.map((dep) => (
                <MenuItem key={dep._id} value={dep._id}>
                  {dep.name}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
      )}
    </form>
  );*/
}

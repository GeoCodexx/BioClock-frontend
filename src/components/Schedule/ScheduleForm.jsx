// ScheduleForm.jsx - Formulario optimizado con mejores campos
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
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EventIcon from "@mui/icons-material/Event";
//import DescriptionIcon from "@mui/icons-material/Description";

const ScheduleForm = ({ onSubmit, defaultValues = {} }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      name: defaultValues.name || "",
      startTime: defaultValues.startTime || "",
      endTime: defaultValues.endTime || "",
      toleranceMinutes: defaultValues.toleranceMinutes || 15,
      days: defaultValues.days || [],
      //description: defaultValues.description || "",
    },
  });

  const workDaysOptions = [
    { value: "monday", label: "Lunes" },
    { value: "tuesday", label: "Martes" },
    { value: "wednesday", label: "Miércoles" },
    { value: "thursday", label: "Jueves" },
    { value: "friday", label: "Viernes" },
    { value: "saturday", label: "Sábado" },
    { value: "sunday", label: "Domingo" },
  ];

  return (
    <Box
      component="form"
      id="schedule-form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <Grid container spacing={2.5}>
        {/* Nombre del Horario */}
        <Grid size={{ xs: 12 }}>
          <Controller
            name="name"
            control={control}
            rules={{
              required: "El nombre del horario es obligatorio",
              minLength: {
                value: 3,
                message: "Mínimo 3 caracteres",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Nombre del Horario"
                fullWidth
                required
                error={!!errors.name}
                helperText={errors.name?.message}
                placeholder="Ej: Horario Administrativo"
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

        {/* Hora de Entrada y Salida */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="startTime"
            control={control}
            rules={{ required: "La hora de entrada es obligatoria" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Hora de Entrada"
                type="time"
                fullWidth
                required
                error={!!errors.startTime}
                helperText={errors.startTime?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccessTimeIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="endTime"
            control={control}
            rules={{
              required: "La hora de salida es obligatoria",
              validate: (value) => {
                const entry = watch("startTime");
                if (entry && value && value <= entry) {
                  return "La hora de salida debe ser posterior a la de entrada";
                }
                return true;
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Hora de Salida"
                type="time"
                fullWidth
                required
                error={!!errors.endTime}
                helperText={errors.endTime?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccessTimeIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            )}
          />
        </Grid>

        {/* Tolerancia */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="toleranceMinutes"
            control={control}
            rules={{
              required: "La tolerancia es obligatoria",
              min: {
                value: 0,
                message: "La tolerancia no puede ser negativa",
              },
              max: {
                value: 60,
                message: "La tolerancia máxima es 60 minutos",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Tolerancia (minutos)"
                type="number"
                fullWidth
                required
                error={!!errors.toleranceMinutes}
                helperText={
                  errors.toleranceMinutes?.message ||
                  "Minutos de tolerancia para entrada"
                }
                inputProps={{ min: 0, max: 60 }}
              />
            )}
          />
        </Grid>

        {/* Días Laborales */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="days"
            control={control}
            rules={{
              required: "Selecciona al menos un día laboral",
              validate: (value) =>
                value.length > 0 || "Debe seleccionar al menos un día",
            }}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.days} required>
                <InputLabel id="work-days-label">Días Laborales</InputLabel>
                <Select
                  {...field}
                  labelId="work-days-label"
                  multiple
                  label="Días Laborales"
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((value) => {
                        const day = workDaysOptions.find(
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
                  {workDaysOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.days && (
                  <FormHelperText>{errors.days.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>

        {/* Descripción */}
        {/* <Grid size={{ xs: 12 }}>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Descripción"
                fullWidth
                multiline
                rows={3}
                placeholder="Descripción adicional del horario (opcional)"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 2 }}>
                      <DescriptionIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Grid> */}

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
                Resumen del Horario:
              </Typography>
              {/* <Typography variant="body1" fontWeight={500}>
                {watch("startTime")} - {watch("endTime")}
                {watch("toleranceMinutes") > 0 && (
                  <Chip
                    label={`+${watch("toleranceMinutes")} min`}
                    size="small"
                    sx={{ ml: 1 }}
                    color="info"
                  />
                )}
              </Typography> */}
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

export default ScheduleForm;

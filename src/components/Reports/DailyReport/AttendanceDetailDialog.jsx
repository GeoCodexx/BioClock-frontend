import { memo, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Stack,
  Divider,
  Chip,
  Avatar,
  Card,
  useTheme,
  useMediaQuery,
  alpha,
} from "@mui/material";
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Devices as DevicesIcon,
  Description as DescriptionIcon,
  EventNote as EventNoteIcon,
  CheckCircle,
  Warning,
  ErrorOutline,
  AccessTime,
  Cancel,
  VerifiedUser,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Configuración de estados
const STATUS_CONFIG = {
  complete: {
    label: "Completo",
    color: "success",
    icon: CheckCircle,
  },
  late: {
    label: "Tardanza",
    color: "warning",
    icon: Warning,
  },
  early_leave: {
    label: "Salida temprana",
    color: "warning",
    icon: AccessTime,
  },
  late_and_early_leave: {
    label: "Tardanza y salida temprana",
    color: "error",
    icon: ErrorOutline,
  },
  incomplete_no_entry: {
    label: "Sin entrada",
    color: "error",
    icon: ErrorOutline,
  },
  incomplete_no_exit: {
    label: "Sin salida",
    color: "error",
    icon: ErrorOutline,
  },
  absent: {
    label: "Ausente",
    color: "error",
    icon: Cancel,
  },
  justified: {
    label: "Justificado",
    color: "info",
    icon: VerifiedUser,
  },
  on_time: {
    label: "A tiempo",
    color: "success",
    icon: CheckCircle,
  },
};

// Componente para mostrar el estado con chip
const StatusDisplay = memo(({ status }) => {
  const theme = useTheme();
  const config = STATUS_CONFIG[status] || {
    label: "Desconocido",
    color: "default",
    icon: ErrorOutline,
  };

  const Icon = config.icon;
  const colorValue = theme.palette[config.color]?.main || theme.palette.grey[500];

  return (
    <Chip
      icon={<Icon sx={{ fontSize: 18 }} />}
      label={config.label}
      size="medium"
      sx={{
        fontWeight: 600,
        bgcolor: alpha(colorValue, 0.12),
        color: colorValue,
        border: "none",
        px: 1,
        "& .MuiChip-icon": {
          color: colorValue,
        },
      }}
    />
  );
});

StatusDisplay.displayName = "StatusDisplay";

// Componente para campo de información
const InfoField = memo(({ icon: Icon, label, value, color = "text.primary" }) => {
  if (!value || value === "—") {
    return null;
  }

  return (
    <Stack direction="row" spacing={2} alignItems="flex-start">
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon sx={{ fontSize: 20, color: "primary.main" }} />
      </Box>
      <Box flex={1}>
        <Typography variant="caption" color="text.secondary" fontWeight={500}>
          {label}
        </Typography>
        <Typography variant="body1" fontWeight={500} color={color} sx={{ mt: 0.5 }}>
          {value}
        </Typography>
      </Box>
    </Stack>
  );
});

InfoField.displayName = "InfoField";

// Componente para mostrar entrada/salida
const TimeEntry = memo(({ icon: Icon, label, timestamp, status, color }) => {
  const theme = useTheme();
  
  if (!timestamp) {
    return (
      <Card
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.grey[500], 0.04),
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Icon sx={{ fontSize: 24, color: "text.disabled" }} />
          <Box>
            <Typography variant="body2" fontWeight={600} color="text.secondary">
              {label}
            </Typography>
            <Typography variant="body2" color="text.disabled">
              Sin registro
            </Typography>
          </Box>
        </Stack>
      </Card>
    );
  }

  const formattedTime = format(new Date(timestamp), "HH:mm:ss", { locale: es });
  const formattedDate = format(new Date(timestamp), "d 'de' MMMM", { locale: es });

  return (
    <Card
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 2,
        borderColor: color + ".main",
        bgcolor: alpha(theme.palette[color]?.main || theme.palette.primary.main, 0.04),
      }}
    >
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Icon sx={{ fontSize: 24, color: color + ".main" }} />
          <Box flex={1}>
            <Typography variant="body2" fontWeight={600} color="text.secondary">
              {label}
            </Typography>
            <Typography variant="h6" fontWeight={700} color={color + ".main"}>
              {formattedTime}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formattedDate}
            </Typography>
          </Box>
        </Stack>
        {status && (
          <Box>
            <StatusDisplay status={status} />
          </Box>
        )}
      </Stack>
    </Card>
  );
});

TimeEntry.displayName = "TimeEntry";

// Componente principal del Dialog
const AttendanceDetailDialog = memo(({ open, record, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Calcular información del usuario
  const userInfo = useMemo(() => {
    if (!record?.user) return null;
    const { name, firstSurname, secondSurname, dni } = record.user;
    const fullName = `${name || ""} ${firstSurname || ""} ${secondSurname || ""}`.trim();
    const initials = name && firstSurname
      ? `${name[0]}${firstSurname[0]}`.toUpperCase()
      : name?.[0]?.toUpperCase() || "?";
    return { fullName, initials, dni };
  }, [record]);

  // Calcular fecha de la asistencia
  const attendanceDate = useMemo(() => {
    if (!record?.checkIn?.timestamp) return null;
    return format(
      new Date(record.checkIn.timestamp),
      "EEEE, d 'de' MMMM 'de' yyyy",
      { locale: es }
    );
  }, [record]);

  if (!record) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 3,
          maxHeight: isMobile ? "100%" : "90vh",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
          borderBottom: "1px solid",
          borderColor: "divider",
          py: 2,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Detalles de Asistencia
            </Typography>
            {attendanceDate && (
              <Typography variant="caption" color="text.secondary">
                {attendanceDate}
              </Typography>
            )}
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              bgcolor: "background.paper",
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={3}>
          {/* Información del Usuario */}
          {userInfo && (
            <Card
              variant="outlined"
              sx={{
                p: 2.5,
                borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    bgcolor: "primary.main",
                    fontSize: "1.25rem",
                    fontWeight: 700,
                  }}
                >
                  {userInfo.initials}
                </Avatar>
                <Box flex={1}>
                  <Typography variant="h6" fontWeight={700}>
                    {userInfo.fullName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    DNI: {userInfo.dni || "—"}
                  </Typography>
                </Box>
                {record.shiftStatus && (
                  <StatusDisplay status={record.shiftStatus} />
                )}
              </Stack>
            </Card>
          )}

          {/* Turno */}
          {record.schedule && (
            <InfoField
              icon={ScheduleIcon}
              label="Turno Asignado"
              value={record.schedule.name}
            />
          )}

          <Divider />

          {/* Entrada y Salida */}
          <Box>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
              Registro de Asistencia
            </Typography>
            <Stack spacing={2}>
              <TimeEntry
                icon={LoginIcon}
                label="Hora de Entrada"
                timestamp={record.checkIn?.timestamp}
                status={record.checkIn?.status}
                color="success"
              />
              <TimeEntry
                icon={LogoutIcon}
                label="Hora de Salida"
                timestamp={record.checkOut?.timestamp}
                status={record.checkOut?.status}
                color="info"
              />
            </Stack>
          </Box>

          {/* Horas Trabajadas */}
          {record.hoursWorked && (
            <Card
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                borderColor: "primary.main",
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: "primary.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <AccessTime sx={{ fontSize: 24, color: "white" }} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    Horas Trabajadas
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="primary.main">
                    {record.hoursWorked}
                  </Typography>
                </Box>
              </Stack>
            </Card>
          )}

          <Divider />

          {/* Información Adicional */}
          <Box>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
              Información Adicional
            </Typography>
            <Stack spacing={2}>
              <InfoField
                icon={DevicesIcon}
                label="Dispositivo de Registro"
                value={record.checkIn?.device?.name}
              />
              
              {record.justification && (
                <InfoField
                  icon={DescriptionIcon}
                  label="Justificación"
                  value={record.justification}
                />
              )}
              
              {record.checkIn?.notes && (
                <InfoField
                  icon={EventNoteIcon}
                  label="Notas"
                  value={record.checkIn.notes}
                />
              )}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
});

AttendanceDetailDialog.displayName = "AttendanceDetailDialog";

export default AttendanceDetailDialog;
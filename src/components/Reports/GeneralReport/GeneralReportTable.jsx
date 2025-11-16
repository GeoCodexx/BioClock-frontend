import { memo, useMemo, useCallback } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
  Typography,
  Avatar,
  Stack,
  alpha,
  useTheme,
  Fade,
  useMediaQuery,
} from "@mui/material";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  CheckCircle,
  Warning,
  ErrorOutline,
  AccessTime,
  Cancel,
  VerifiedUser,
  PersonOutline,
  Schedule as ScheduleIcon,
  AccessTimeOutlined,
} from "@mui/icons-material";

// Configuración de estados con sus colores y iconos
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
};

// Mapeo de estados a etiquetas descriptivas
const TIME_STATUS_LABELS = {
  late: "Tarde",
  early_leave: "Temprano",
  on_time: "A tiempo",
  justified: "Justificado",
};

// Componente para renderizar el estado con chip - Memoizado
const StatusChip = memo(({ status, size = "small" }) => {
  const theme = useTheme();
  const config = STATUS_CONFIG[status] || {
    label: "Desconocido",
    color: "default",
    icon: ErrorOutline,
  };

  const Icon = config.icon;
  const colorValue =
    theme.palette[config.color]?.main || theme.palette.grey[500];

  return (
    <Chip
      icon={<Icon sx={{ fontSize: size === "small" ? 18 : 20 }} />}
      label={config.label}
      size={size}
      sx={{
        fontWeight: 500,
        bgcolor: alpha(colorValue, 0.1),
        color: colorValue,
        border: "none",
        "& .MuiChip-icon": {
          color: colorValue,
        },
      }}
    />
  );
});

StatusChip.displayName = "StatusChip";

// Componente para formatear fecha y hora - Memoizado
const TimeDisplay = memo(({ timestamp, showStatus, status }) => {
  const formattedTime = useMemo(() => {
    if (!timestamp) return null;
    return format(new Date(timestamp), "HH:mm:ss", { locale: es });
  }, [timestamp]);

  const statusLabel = useMemo(() => {
    return showStatus && status ? TIME_STATUS_LABELS[status] : null;
  }, [showStatus, status]);

  if (!formattedTime) {
    return (
      <Typography variant="body2" color="text.secondary" fontWeight={500}>
        —
      </Typography>
    );
  }

  return (
    <Stack spacing={0.5}>
      <Typography variant="body2" fontWeight={600}>
        {formattedTime}
      </Typography>
      {statusLabel && (
        <Chip
          label={statusLabel}
          size="small"
          color={
            status === "late" || status === "early_leave"
              ? "warning"
              : status === "justified"
              ? "info"
              : "success"
          }
          sx={{
            height: 20,
            fontSize: "0.688rem",
            fontWeight: 500,
            "& .MuiChip-label": { px: 1 },
          }}
        />
      )}
    </Stack>
  );
});

TimeDisplay.displayName = "TimeDisplay";

// Componente para mostrar información del usuario - Memoizado
const UserCell = memo(({ user, compact = false }) => {
  const { fullName, initials } = useMemo(() => {
    if (!user) {
      return { fullName: "—", initials: "?" };
    }

    const name = `${user.name || ""} ${user.firstSurname || ""} ${
      user.secondSurname || ""
    }`.trim();

    const names = name.split(" ");
    const init =
      names.length >= 2
        ? `${names[0][0]}${names[1][0]}`.toUpperCase()
        : names[0]?.[0]?.toUpperCase() || "?";

    return { fullName: name, initials: init };
  }, [user]);

  if (!user) {
    return <Typography variant="body2">—</Typography>;
  }

  return (
    <Stack direction="row" spacing={compact ? 1 : 1.5} alignItems="center">
      {/* <Avatar
        sx={{
          width: compact ? 32 : 36,
          height: compact ? 32 : 36,
          bgcolor: "primary.main",
          fontSize: compact ? "0.75rem" : "0.875rem",
          fontWeight: 600,
        }}
      >
        {initials}
      </Avatar> */}
      <Box>
        <Typography
          variant="body2"
          fontWeight={600}
          sx={{
            fontSize: compact ? "0.813rem" : "0.875rem",
            lineHeight: compact ? 1.3 : 1.5,
          }}
        >
          {fullName}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontSize: compact ? "0.688rem" : "0.75rem" }}
        >
          DNI: {user.dni || "—"}
        </Typography>
      </Box>
    </Stack>
  );
});

UserCell.displayName = "UserCell";

// Componente de fila de tabla DESKTOP - Memoizado
const TableRowDesktop = memo(({ record, onClick }) => {
  const formattedDate = useMemo(() => {
    return format(new Date(record.date), "dd/MM/yyyy", { locale: es });
  }, [record.date]);

  const handleClick = useCallback(() => {
    onClick(record);
  }, [record, onClick]);

  return (
    <TableRow
      hover
      onClick={handleClick}
      sx={{
        cursor: "pointer",
        transition: "background-color 0.2s",
        "&:hover": {
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
        },
      }}
    >
      {/* Fecha */}
      <TableCell>
        <Typography variant="body2" fontWeight={500}>
          {formattedDate}
        </Typography>
      </TableCell>

      {/* Colaborador */}
      <TableCell>
        <UserCell user={record.user} />
      </TableCell>

      {/* Turno */}
      <TableCell>
        <Stack direction="row" spacing={1} alignItems="center">
          <ScheduleIcon sx={{ fontSize: 18, color: "text.secondary" }} />
          <Typography variant="body2" fontWeight={500}>
            {record.schedule?.name || "Sin turno"}
          </Typography>
        </Stack>
      </TableCell>

      {/* Entrada */}
      <TableCell>
        <TimeDisplay
          timestamp={record.checkIn?.timestamp}
          showStatus
          status={record.checkIn?.status}
        />
      </TableCell>

      {/* Salida */}
      <TableCell>
        <TimeDisplay
          timestamp={record.checkOut?.timestamp}
          showStatus
          status={record.checkOut?.status}
        />
      </TableCell>

      {/* Horas Trabajadas */}
      <TableCell>
        <Stack direction="row" spacing={1} alignItems="center">
          <AccessTimeOutlined
            sx={{
              fontSize: 18,
              color: record.hoursWorked ? "primary.main" : "text.secondary",
            }}
          />
          <Typography
            variant="body2"
            fontWeight={600}
            color={record.hoursWorked ? "primary.main" : "text.secondary"}
          >
            {record.hoursWorked || "—"}
          </Typography>
        </Stack>
      </TableCell>

      {/* Estado */}
      <TableCell>
        <StatusChip status={record.shiftStatus} />
      </TableCell>
    </TableRow>
  );
});

TableRowDesktop.displayName = "TableRowDesktop";

// Componente de fila de tabla MOBILE - Memoizado
const TableRowMobile = memo(({ record, onClick }) => {
  const formattedDate = useMemo(() => {
    return format(new Date(record.date), "dd/MM/yyyy", { locale: es });
  }, [record.date]);

  const handleClick = useCallback(() => {
    onClick(record);
  }, [record, onClick]);

  return (
    <TableRow
      hover
      onClick={handleClick}
      sx={{
        cursor: "pointer",
        transition: "background-color 0.2s",
        "&:hover": {
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
        },
      }}
    >
      {/* Fecha y Colaborador */}
      <TableCell sx={{ py: 1.5, width: "30%" }}>
        <Typography variant="caption" color="text.secondary" display="block">
          {formattedDate}
        </Typography>
        <UserCell user={record.user} compact />
      </TableCell>

      {/* Estado y Horas */}
      <TableCell align="right" sx={{ py: 1.5, width: "70%" }}>
        <Stack spacing={0.5} alignItems="flex-end">
          <StatusChip status={record.shiftStatus} size="small" />
          {record.hoursWorked && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: "0.688rem" }}
            >
              {record.hoursWorked}
            </Typography>
          )}
        </Stack>
      </TableCell>
    </TableRow>
  );
});

TableRowMobile.displayName = "TableRowMobile";

// Estado vacío mejorado
const EmptyState = memo(() => (
  <Box
    sx={{
      p: 8,
      textAlign: "center",
      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
    }}
  >
    <PersonOutline
      sx={{
        fontSize: 64,
        color: "text.secondary",
        opacity: 0.3,
        mb: 2,
      }}
    />
    <Typography variant="h6" color="text.secondary" gutterBottom>
      No hay registros para mostrar
    </Typography>
    <Typography variant="body2" color="text.secondary">
      Los registros de asistencia aparecerán aquí
    </Typography>
  </Box>
));

EmptyState.displayName = "EmptyState";

// Componente de encabezado de tabla - Memoizado
const TableHeader = memo(({ isMobile }) => (
  <TableHead>
    <TableRow
      sx={{
        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
      }}
    >
      <TableCell sx={{ fontWeight: 700 }}>
        {isMobile ? "Colaborador" : "Fecha"}
      </TableCell>
      {!isMobile && (
        <>
          <TableCell sx={{ fontWeight: 700 }}>Colaborador</TableCell>
          <TableCell sx={{ fontWeight: 700 }}>Turno</TableCell>
          <TableCell sx={{ fontWeight: 700 }}>Entrada</TableCell>
          <TableCell sx={{ fontWeight: 700 }}>Salida</TableCell>
          <TableCell sx={{ fontWeight: 700 }}>Horas Trabajadas</TableCell>
        </>
      )}
      <TableCell sx={{ fontWeight: 700 }} align={isMobile ? "right" : "left"}>
        Estado
      </TableCell>
    </TableRow>
  </TableHead>
));

TableHeader.displayName = "TableHeader";

// Componente principal
const GeneralReportTable = memo(({ attendances, setSelectedRecord }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Generar keys únicas de forma optimizada
  const recordsWithKeys = useMemo(() => {
    if (!attendances || attendances.length === 0) return [];
    return attendances.map((record, index) => ({
      record,
      key: `${record._id || index}-${record.user?._id || "no-user"}-${
        record.date || index
      }`,
    }));
  }, [attendances]);

  // Memoizar el componente de fila según el tipo
  const RowComponent = useMemo(
    () => (isMobile ? TableRowMobile : TableRowDesktop),
    [isMobile]
  );

  // Si no hay registros
  if (!attendances || attendances.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
        }}
      >
        <EmptyState />
      </Paper>
    );
  }

  return (
    <Fade in timeout={500}>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 0,
          borderColor: "divider",
          overflow: "hidden",
        }}
      >
        <Table>
          <TableHeader isMobile={isMobile} />
          <TableBody>
            {recordsWithKeys.map(({ record, key }) => (
              <RowComponent
                key={key}
                record={record}
                onClick={setSelectedRecord}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Fade>
  );
});

GeneralReportTable.displayName = "GeneralReportTable";

export default GeneralReportTable;
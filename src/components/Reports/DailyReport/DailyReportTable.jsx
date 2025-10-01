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
} from "@mui/material";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { memo } from "react";
import {
  CheckCircle,
  Warning,
  ErrorOutline,
  AccessTime,
  Cancel,
  VerifiedUser,
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

// Componente para renderizar el estado con chip
const StatusChip = ({ status }) => {
  const config = STATUS_CONFIG[status] || {
    label: "Desconocido",
    color: "default",
    icon: ErrorOutline,
  };

  const Icon = config.icon;

  return (
    <Chip
      icon={<Icon />}
      label={config.label}
      color={config.color}
      size="small"
      variant="outlined"
    />
  );
};

// Componente para formatear fecha y hora
const TimeDisplay = ({ timestamp, showStatus, status }) => {
  if (!timestamp) {
    return <Typography color="text.secondary">—</Typography>;
  }

  return (
    <Box>
      <Typography variant="body2">
        {format(new Date(timestamp), "HH:mm:ss", { locale: es })}
      </Typography>
      {showStatus && status && (
        <Typography variant="caption" color="text.secondary">
          {status === "late"
            ? "Tarde"
            : status === "early_leave"
            ? "Temprano"
            : status === "on_time"
            ? "A tiempo"
            : status === "justified"
            ? "Justificado"
            : ""}
        </Typography>
      )}
    </Box>
  );
};

const DailyReportTable = memo(({ attendances, setSelectedRecord }) => {
  // Si no hay registros
  if (!attendances || attendances.length === 0) {
    return (
      <TableContainer component={Paper}>
        <Box p={4} textAlign="center">
          <Typography variant="body1" color="text.secondary">
            No hay registros para mostrar
          </Typography>
        </Box>
      </TableContainer>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>DNI</TableCell>
            <TableCell>Colaborador</TableCell>
            <TableCell>Turno</TableCell>
            <TableCell>Entrada</TableCell>
            <TableCell>Salida</TableCell>
            <TableCell>Horas Trabajadas</TableCell>
            <TableCell>Estado</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {attendances.map((record, index) => {
            // Generar una key única combinando varios campos
            const key = `${record.user?._id || index}-${
              record.schedule?._id || "no-schedule"
            }`;

            return (
              <TableRow
                key={key}
                hover
                onClick={() => setSelectedRecord(record)}
                sx={{ cursor: "pointer" }}
              >
                {/* DNI */}
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {record.user?.dni || "—"}
                  </Typography>
                </TableCell>

                {/* Colaborador */}
                <TableCell>
                  <Typography variant="body2">
                    {record.user
                      ? `${record.user.name || ""} ${
                          record.user.firstSurname || ""
                        } ${record.user.secondSurname || ""}`.trim()
                      : "—"}
                  </Typography>
                </TableCell>

                {/* Turno */}
                <TableCell>
                  <Typography variant="body2">
                    {record.schedule?.name || "Sin turno"}
                  </Typography>
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
                  <Typography
                    variant="body2"
                    fontWeight="medium"
                    color={record.hoursWorked ? "primary" : "text.secondary"}
                  >
                    {record.hoursWorked || "—"}
                  </Typography>
                </TableCell>

                {/* Estado */}
                <TableCell>
                  <StatusChip status={record.shiftStatus} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
});

DailyReportTable.displayName = "DailyReportTable";

export default DailyReportTable;

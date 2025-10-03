import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Divider,
} from "@mui/material";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Circle,
  CheckCircle,
  Warning,
  ErrorOutline,
  AccessTime,
  Cancel,
  VerifiedUser,
  EventNote,
} from "@mui/icons-material";

// Configuración de colores por estado
const STATUS_CONFIG = {
  complete: {
    label: "Completo",
    color: "#4CAF50",
    icon: CheckCircle,
  },
  late: {
    label: "Tardanza",
    color: "#FFC107",
    icon: Warning,
  },
  early_leave: {
    label: "Salida temprana",
    color: "#FF9800",
    icon: AccessTime,
  },
  late_and_early_leave: {
    label: "Tardanza y salida temprana",
    color: "#FF5722",
    icon: ErrorOutline,
  },
  incomplete_no_entry: {
    label: "Sin entrada",
    color: "#F44336",
    icon: ErrorOutline,
  },
  incomplete_no_exit: {
    label: "Sin salida",
    color: "#F44336",
    icon: ErrorOutline,
  },
  absent: {
    label: "Ausente",
    color: "#9E9E9E",
    icon: Cancel,
  },
  justified: {
    label: "Justificado",
    color: "#2196F3",
    icon: VerifiedUser,
  },
};

// Componente de leyenda
const CalendarLegend = () => {
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography
        variant="subtitle2"
        gutterBottom
        sx={{ display: "flex", alignItems: "center", gap: 1 }}
      >
        <EventNote fontSize="small" />
        Leyenda de Estados
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
          <Chip
            key={key}
            icon={<Circle sx={{ fontSize: 12 }} />}
            label={config.label}
            size="small"
            sx={{
              bgcolor: "transparent",
              /*color: [
                "complete",
                "incomplete_no_entry",
                "incomplete_no_exit",
                "justified",
              ].includes(key)
                ? "white"
                : "text.primary",*/
              "& .MuiChip-icon": {
                color: [
                  "complete",
                  "late",
                  "incomplete_no_entry",
                  "incomplete_no_exit",
                  "justified",
                ].includes(key)
                  ? config.color
                  : "text.primary",
              },
            }}
          />
        ))}
      </Stack>
    </Paper>
  );
};

// Modal de detalles del día
const DayDetailsModal = ({ open, onClose, dayData }) => {
  if (!dayData) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <EventNote color="primary" />
          Detalles del día -{" "}
          {format(new Date(dayData.date), "d 'de' MMMM 'de' yyyy", {
            locale: es,
          })}
        </Box>
      </DialogTitle>
      <DialogContent>
        {dayData.records.map((record, index) => {
          const config = STATUS_CONFIG[record.shiftStatus];
          const Icon = config?.icon || EventNote;

          return (
            <Box key={index} sx={{ mb: 3 }}>
              {index > 0 && <Divider sx={{ mb: 2 }} />}

              <Grid container spacing={2}>
                {/* Usuario y Turno */}
                <Grid size={12}>
                  <Typography variant="h6" gutterBottom>
                    {record.user
                      ? `${record.user.name || ""} ${
                          record.user.firstSurname || ""
                        } ${record.user.secondSurname || ""}`.trim()
                      : "Usuario desconocido"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    DNI: {record.user?.dni || "—"} | Turno:{" "}
                    {record.schedule?.name || "Sin turno"}
                  </Typography>
                </Grid>

                {/* Estado */}
                <Grid size={12}>
                  <Chip
                    icon={<Icon />}
                    label={config?.label || "Desconocido"}
                    sx={{
                      bgcolor: config?.color,
                      color: [
                        "complete",
                        "incomplete_no_entry",
                        "incomplete_no_exit",
                        "justified",
                      ].includes(record.shiftStatus)
                        ? "white"
                        : "text.primary",
                      fontWeight: "bold",
                    }}
                  />
                </Grid>

                {/* Horarios */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Entrada
                  </Typography>
                  <Typography variant="body1">
                    {record.checkIn?.timestamp
                      ? format(new Date(record.checkIn.timestamp), "HH:mm:ss", {
                          locale: es,
                        })
                      : "—"}
                  </Typography>
                  {record.checkIn?.status && (
                    <Typography variant="caption" color="text.secondary">
                      {record.checkIn.status === "late"
                        ? "⚠️ Tarde"
                        : record.checkIn.status === "on_time"
                        ? "✅ A tiempo"
                        : record.checkIn.status === "justified"
                        ? "ℹ️ Justificado"
                        : ""}
                    </Typography>
                  )}
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Salida
                  </Typography>
                  <Typography variant="body1">
                    {record.checkOut?.timestamp
                      ? format(
                          new Date(record.checkOut.timestamp),
                          "HH:mm:ss",
                          { locale: es }
                        )
                      : "—"}
                  </Typography>
                  {record.checkOut?.status && (
                    <Typography variant="caption" color="text.secondary">
                      {record.checkOut.status === "early_leave"
                        ? "⚠️ Salida temprana"
                        : record.checkOut.status === "on_time"
                        ? "✅ A tiempo"
                        : record.checkOut.status === "justified"
                        ? "ℹ️ Justificado"
                        : ""}
                    </Typography>
                  )}
                </Grid>

                {/* Horas trabajadas */}
                <Grid size={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Horas trabajadas
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {record.hoursWorked || "—"}
                  </Typography>
                </Grid>

                {/* Dispositivos */}
                {(record.checkIn?.device || record.checkOut?.device) && (
                  <Grid size={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Dispositivos
                    </Typography>
                    <Typography variant="body2">
                      Entrada: {record.checkIn?.device?.name || "—"} | Salida:{" "}
                      {record.checkOut?.device?.name || "—"}
                    </Typography>
                  </Grid>
                )}

                {/* Justificación */}
                {record.justification && (
                  <Grid size={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Justificación
                    </Typography>
                    <Typography variant="body2">
                      {record.justification}
                    </Typography>
                  </Grid>
                )}

                {/* Aprobado por */}
                {record.approvedBy && (
                  <Grid size={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Aprobado por
                    </Typography>
                    <Typography variant="body2">
                      {`${record.approvedBy.name || ""} ${
                        record.approvedBy.firstSurname || ""
                      } ${record.approvedBy.secondSurname || ""}`.trim()}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          );
        })}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

// Componente principal del calendario
export default function AttendanceCalendarView({ records }) {
  const [selectedDay, setSelectedDay] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Agrupar registros por fecha
  const groupRecordsByDate = () => {
    const grouped = {};

    records.forEach((record) => {
      if (record.date) {
        if (!grouped[record.date]) {
          grouped[record.date] = [];
        }
        grouped[record.date].push(record);
      }
    });

    return grouped;
  };

  // Convertir registros a eventos del calendario
  const calendarEvents = records.map((record, index) => {
    const config = STATUS_CONFIG[record.shiftStatus] || STATUS_CONFIG.absent;

    // Si hay múltiples turnos el mismo día, usar un color especial
    const sameDate = records.filter((r) => r.date === record.date);
    const hasMultipleShifts = sameDate.length > 1;

    return {
      id: `${record.date}-${index}`,
      date: record.date,
      title: hasMultipleShifts
        ? `${sameDate.length} turnos`
        : record.schedule?.name || "Asistencia",
      backgroundColor: hasMultipleShifts ? "#9C27B0" : config.color,
      borderColor: hasMultipleShifts ? "#7B1FA2" : config.color,
      textColor: [
        "complete",
        "incomplete_no_entry",
        "incomplete_no_exit",
        "justified",
        "#9C27B0",
      ].includes(hasMultipleShifts ? "#9C27B0" : config.color)
        ? "white"
        : "#000000",
      extendedProps: {
        shiftStatus: record.shiftStatus,
        fullRecord: record,
        hasMultipleShifts,
      },
    };
  });

  // Manejar click en un día
  const handleDateClick = (info) => {
    const groupedRecords = groupRecordsByDate();
    const dayRecords = groupedRecords[info.dateStr];

    if (dayRecords && dayRecords.length > 0) {
      setSelectedDay({
        date: info.dateStr,
        records: dayRecords,
      });
      setModalOpen(true);
    }
  };

  // Manejar click en un evento
  const handleEventClick = (info) => {
    const dateStr = info.event.startStr;
    const groupedRecords = groupRecordsByDate();
    const dayRecords = groupedRecords[dateStr];

    if (dayRecords && dayRecords.length > 0) {
      setSelectedDay({
        date: dateStr,
        records: dayRecords,
      });
      setModalOpen(true);
    }
  };

  return (
    <Box>
      {/* Leyenda */}
      <CalendarLegend />

      {/* Calendario */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <EventNote />
          Vista de Calendario
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Haz click en un día para ver los detalles completos
        </Typography>

        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={esLocale}
          events={calendarEvents}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          height="auto"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,dayGridWeek",
          }}
          buttonText={{
            today: "Hoy",
            month: "Mes",
            week: "Semana",
          }}
          dayMaxEvents={3}
          eventDisplay="block"
          displayEventTime={false}
          fixedWeekCount={false}
          showNonCurrentDates={true}
          // Estilos personalizados
          eventClassNames="custom-event"
          dayCellClassNames="custom-day-cell"
        />
      </Paper>

      {/* Modal de detalles */}
      <DayDetailsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        dayData={selectedDay}
      />

      {/* Estilos CSS personalizados */}
      <style jsx="true" global="true">{`
        .fc {
          font-family: "Roboto", sans-serif;
        }

        .fc .fc-button {
          text-transform: capitalize;
          font-size: 0.875rem;
        }

        .fc .fc-button-primary {
          background-color: #1976d2;
          border-color: #1976d2;
        }

        .fc .fc-button-primary:hover {
          background-color: #1565c0;
          border-color: #1565c0;
        }

        .fc .fc-button-primary:disabled {
          background-color: #e0e0e0;
          border-color: #e0e0e0;
        }

        .fc-event {
          cursor: pointer;
          border-radius: 4px;
          padding: 2px 4px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .fc-event:hover {
          opacity: 0.85;
        }

        .fc-daygrid-day {
          cursor: pointer;
        }

        .fc-daygrid-day:hover {
          background-color: rgba(25, 118, 210, 0.04);
        }

        .fc-day-today {
          background-color: rgba(25, 118, 210, 0.08) !important;
        }

        .fc-col-header-cell {
          background-color: #f5f5f5;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.75rem;
        }
      `}</style>
    </Box>
  );
}

import React, { useMemo } from "react";
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Stack, 
  LinearProgress, 
  Divider,
  useTheme 
} from "@mui/material";
import { 
  CheckCircle, 
  Cancel, 
  Info, 
  Error as ErrorIcon 
} from "@mui/icons-material";
import { 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isAfter, 
  format, 
  isSameDay 
} from "date-fns";
import { es } from "date-fns/locale";

const MonthlySummary = ({ attendanceMap }) => {
  const theme = useTheme();

  // Calcular estadísticas del mes actual
  const stats = useMemo(() => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    
    // Generar todos los días del mes hasta HOY (no contamos días futuros)
    const daysInMonth = eachDayOfInterval({ start, end });
    
    let counts = {
      complete: 0,
      justified: 0,
      incomplete: 0,
      absent: 0,
      totalWorkingDays: 0
    };

    daysInMonth.forEach((day) => {
      // Ignorar días futuros
      if (isAfter(day, now) && !isSameDay(day, now)) return;

      // Ignorar fines de semana (opcional, depende de tu lógica de negocio)
      const dayOfWeek = day.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) return; 

      counts.totalWorkingDays++;

      const dateKey = format(day, "yyyy-MM-dd");
      const records = attendanceMap[dateKey];

      if (!records || records.length === 0) {
        counts.absent++;
      } else {
        // Lógica de prioridad (Idéntica a getDayStatus del componente padre)
        if (records.some(r => r.justification)) {
          counts.justified++;
        } else if (records.some(r => r.shiftStatus.includes("incomplete") || r.shiftStatus === "late")) {
          counts.incomplete++;
        } else if (records.every(r => r.shiftStatus === "complete")) {
          counts.complete++;
        } else {
          counts.absent++;
        }
      }
    });

    return counts;
  }, [attendanceMap]);

  // Porcentaje de cumplimiento (Completas / Días totales transcurridos)
  const completionRate = stats.totalWorkingDays > 0 
    ? Math.round((stats.complete / stats.totalWorkingDays) * 100) 
    : 0;

  // Componente interno para fila de resumen
  const StatRow = ({ label, count, color, Icon }) => (
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 1 }}>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Box 
          sx={{ 
            bgcolor: `${color}15`, 
            p: 0.8, 
            borderRadius: 1.5,
            display: "flex",
            color: color 
          }}
        >
          <Icon fontSize="small" color="inherit" />
        </Box>
        <Typography variant="body2" fontWeight={600} color="text.secondary">
          {label}
        </Typography>
      </Stack>
      <Typography variant="subtitle1" fontWeight={700} color="text.primary">
        {count}
      </Typography>
    </Stack>
  );

  return (
    <Card 
      elevation={0} 
      sx={{ 
        height: "100%", 
        border: `1px solid ${theme.palette.divider}`, 
        borderRadius: 3 
      }}
    >
      <CardContent>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Resumen {format(new Date(), "MMMM", { locale: es })}
        </Typography>
        
        {/* Barra de Progreso General */}
        <Box sx={{ mb: 3, mt: 1 }}>
          <Stack direction="row" justifyContent="space-between" mb={0.5}>
            <Typography variant="caption" fontWeight={600} color="text.secondary">
              Tasa de Asistencia
            </Typography>
            <Typography variant="caption" fontWeight={700} color={completionRate > 80 ? "success.main" : "warning.main"}>
              {completionRate}%
            </Typography>
          </Stack>
          <LinearProgress 
            variant="determinate" 
            value={completionRate} 
            sx={{ 
              height: 8, 
              borderRadius: 4,
              bgcolor: theme.palette.grey[100],
              "& .MuiLinearProgress-bar": {
                bgcolor: completionRate > 80 ? theme.palette.success.main : theme.palette.warning.main,
                borderRadius: 4
              }
            }} 
          />
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Stack spacing={0.5}>
          <StatRow 
            label="Completas" 
            count={stats.complete} 
            color={theme.palette.success.main} 
            Icon={CheckCircle} 
          />
          <StatRow 
            label="Justificadas" 
            count={stats.justified} 
            color={theme.palette.info.main} 
            Icon={Info} 
          />
          <StatRow 
            label="Incompletas" 
            count={stats.incomplete} 
            color={theme.palette.warning.main} 
            Icon={ErrorIcon} 
          />
          <StatRow 
            label="Ausencias" 
            count={stats.absent} 
            color={theme.palette.error.main} 
            Icon={Cancel} 
          />
        </Stack>
      </CardContent>
    </Card>
  );
};

export default MonthlySummary;
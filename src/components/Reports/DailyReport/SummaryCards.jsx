import { memo, useMemo } from "react";
import {
  Card,
  CardContent,
  Grid,
  Typography,
  Box,
  alpha,
  useTheme,
  Skeleton,
  Fade,
} from "@mui/material";
import {
  Groups as GroupsIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  ErrorOutline as ErrorOutlineIcon,
  ExitToApp as ExitToAppIcon,
  Cancel as CancelIcon,
  VerifiedUser as VerifiedUserIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";

// Configuración de las tarjetas de resumen
const SUMMARY_CONFIG = [
  {
    id: "total",
    label: "Total Empleados",
    icon: GroupsIcon,
    color: "primary",
    getValue: (data) => data.pagination.totalRecords,
  },
  {
    id: "on_time",
    label: "A tiempo",
    //subtitle: "A tiempo",
    icon: CheckCircleIcon,
    color: "success",
    getValue: (records) =>
      records.filter((r) => r.shiftStatus === "complete").length,
  },
  {
    id: "late",
    label: "Tardanzas",
    icon: AccessTimeIcon,
    color: "warning",
    getValue: (records) =>
      records.filter(
        (r) =>
          r.shiftStatus === "late" || r.shiftStatus === "late_and_early_leave"
      ).length,
  },
  {
    id: "incomplete",
    label: "Incompletos",
    subtitle: "Sin entrada o salida",
    icon: ErrorOutlineIcon,
    color: "error",
    getValue: (records) =>
      records.filter((r) => r.shiftStatus === "incomplete").length,
  },
  {
    id: "early_exit",
    label: "Salida Temprana",
    icon: ExitToAppIcon,
    color: "warning",
    getValue: (records) =>
      records.filter((r) => r.shiftStatus === "early_exit").length,
  },
  {
    id: "absent",
    label: "Ausentes",
    icon: CancelIcon,
    color: "error",
    getValue: (records) =>
      records.filter((r) => r.shiftStatus === "absent").length,
  },
  {
    id: "justified",
    label: "Justificados",
    icon: VerifiedUserIcon,
    color: "info",
    getValue: (records) =>
      records.filter((r) => r.shiftStatus === "justified").length,
  },
  {
    id: "attendance_rate",
    label: "Tasa de Asistencia",
    icon: TrendingUpIcon,
    color: "primary",
    isPercentage: true,
    getValue: (records, total) => {
      const present = records.filter(
        (r) =>
          r.shiftStatus === "on_time" ||
          r.shiftStatus === "late" ||
          r.shiftStatus === "early_exit" ||
          r.shiftStatus === "justified"
      ).length;
      return total > 0 ? ((present / total) * 100).toFixed(1) : 0;
    },
  },
];

// Componente individual de tarjeta de estadística
const StatCard = memo(
  ({ label, subtitle, value, icon: Icon, color, isPercentage, isLoading }) => {
    const theme = useTheme();

    const colorValue = theme.palette[color]?.main || theme.palette.primary.main;
    const bgColor = alpha(colorValue, 0.08);

    return (
      <Fade in timeout={500}>
        <Card
          elevation={0}
          sx={{
            height: "100%",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              borderColor: color + ".main",
              transform: "translateY(-4px)",
              boxShadow: `0 8px 16px ${alpha(colorValue, 0.15)}`,
            },
          }}
        >
          <CardContent
            sx={{
              p: { xs: 2, sm: 2.5 },
              "&:last-child": { pb: { xs: 2, sm: 2.5 } },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                mb: 1.5,
              }}
            >
              <Box flex={1}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight={500}
                  sx={{ mb: 0.5 }}
                >
                  {label}
                </Typography>
                {subtitle && (
                  <Typography variant="caption" color="text.secondary">
                    {subtitle}
                  </Typography>
                )}
              </Box>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: bgColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon sx={{ color: colorValue, fontSize: 24 }} />
              </Box>
            </Box>

            {isLoading ? (
              <Skeleton variant="text" width="60%" height={48} />
            ) : (
              <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
                <Typography
                  variant="h3"
                  fontWeight={700}
                  color={color + ".main"}
                  sx={{
                    lineHeight: 1,
                    fontSize: { xs: "2rem", sm: "2.5rem" },
                  }}
                >
                  {value}
                </Typography>
                {isPercentage && (
                  <Typography
                    variant="h5"
                    color={color + ".main"}
                    fontWeight={600}
                  >
                    %
                  </Typography>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      </Fade>
    );
  }
);

StatCard.displayName = "StatCard";

// Componente principal
const SummaryCards = memo(({ data, isLoading = false }) => {
  // Calcular todas las estadísticas de una sola vez
  const stats = useMemo(() => {
    if (!data || !data.records) {
      return SUMMARY_CONFIG.map((config) => ({
        ...config,
        value: 0,
      }));
    }

    return SUMMARY_CONFIG.map((config) => {
      let value;
      if (config.id === "total") {
        value = config.getValue(data);
      } else if (config.isPercentage) {
        value = config.getValue(data.records, data.pagination.totalRecords);
      } else {
        value = config.getValue(data.records);
      }

      return {
        ...config,
        value,
      };
    });
  }, [data]);

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {stats.map((stat, index) => (
        <Grid
          key={stat.id}
          size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
          sx={{
            animation: isLoading
              ? "none"
              : `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
            "@keyframes fadeInUp": {
              from: {
                opacity: 0,
                transform: "translateY(20px)",
              },
              to: {
                opacity: 1,
                transform: "translateY(0)",
              },
            },
          }}
        >
          <StatCard
            label={stat.label}
            subtitle={stat.subtitle}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            isPercentage={stat.isPercentage}
            isLoading={isLoading}
          />
        </Grid>
      ))}
    </Grid>
  );
});

SummaryCards.displayName = "SummaryCards";

export default SummaryCards;

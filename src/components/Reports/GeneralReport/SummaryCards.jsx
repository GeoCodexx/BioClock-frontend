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
    id: "totalRecords",
    label: "Total Registros",
    icon: GroupsIcon,
    color: "primary",
    getValue: (data) => data.totalRecords ?? 0,
  },
  {
    id: "on_time",
    label: "A tiempo",
    icon: CheckCircleIcon,
    color: "success",
    getValue: (data) => data.on_time ?? 0,
  },
  {
    id: "late",
    label: "Tardanzas",
    icon: AccessTimeIcon,
    color: "warning",
    getValue: (data) => data.late ?? 0,
  },
  {
    id: "incomplete",
    label: "Incompletos",
    subtitle: "Sin entrada o salida",
    icon: ErrorOutlineIcon,
    color: "disabled",
    getValue: (data) => data.incomplete ?? 0,
  },
  {
    id: "early_exit",
    label: "Salida anticipada",
    icon: ExitToAppIcon,
    color: "secondary",
    getValue: (data) => data.early_exit ?? 0,
  },
  {
    id: "absent",
    label: "Ausentes",
    icon: CancelIcon,
    color: "error",
    getValue: (data) => data.absent ?? 0,
  },
  {
    id: "justified",
    label: "Justificados",
    icon: VerifiedUserIcon,
    color: "info",
    getValue: (data) => data.justified ?? 0,
  },
  {
    id: "attendance_rate",
    label: "Tasa de Asistencia",
    icon: TrendingUpIcon,
    color: "success",
    isPercentage: true,
    getValue: (data) => Number(data.attendance_rate ?? 0),
  },
];

// Componente individual de tarjeta de estadística (valor numerico)
const StatValue = memo(({ value, color, isPercentage, isLoading }) => {
  if (isLoading) {
    return <Skeleton variant="text" width="50%" height={40} />;
  }

  return (
    <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
      <Typography
        variant="h3"
        fontWeight={700}
        color={color === "disabled" ? "text." + color : color + ".main"}
        sx={{
          lineHeight: 1,
          fontSize: { xs: "2rem", sm: "2.5rem" },
        }}
      >
        {value}
      </Typography>

      {isPercentage && (
        <Typography variant="h5" color={color + ".main"} fontWeight={600}>
          %
        </Typography>
      )}
    </Box>
  );
});

StatValue.displayName = "StatValue";

// Componente individual de tarjeta de estadística
const StatCard = memo(({ label, subtitle, icon: Icon, color, children }) => {
  const theme = useTheme();

  const colorValue =
    color === "disabled"
      ? theme.palette.text.disabled
      : color !== "disabled"
        ? theme.palette[color]?.main
        : theme.palette.grey[500];
  const bgColor = alpha(colorValue, 0.08);

  return (
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
        {/* Header estático */}
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

        {/* SOLO el valor es dinámico */}
        {children}
      </CardContent>
    </Card>
  );
});

StatCard.displayName = "StatCard";

// Componente principal
const SummaryCards = memo(({ data, isLoading = false }) => {
  const stats = useMemo(() => {
    return SUMMARY_CONFIG.map((config) => ({
      ...config,
      value: data ? config.getValue(data) : 0,
    }));
  }, [data]);

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {stats.map((stat, index) => (
        <Grid
          key={stat.id}
          size={{ xs: 12, sm: 6, md: 3, lg: 3 }}
          //   sx={{
          //     animation: isLoading
          //       ? "none"
          //       : `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
          //     "@keyframes fadeInUp": {
          //       from: {
          //         opacity: 0,
          //         transform: "translateY(20px)",
          //       },
          //       to: {
          //         opacity: 1,
          //         transform: "translateY(0)",
          //       },
          //     },
          //   }}
        >
          <StatCard
            label={stat.label}
            subtitle={stat.subtitle}
            icon={stat.icon}
            color={stat.color}
          >
            <StatValue
              value={stat.value}
              color={stat.color}
              isPercentage={stat.isPercentage}
              isLoading={isLoading}
            />
          </StatCard>
        </Grid>
      ))}
    </Grid>
  );
});

SummaryCards.displayName = "SummaryCards";

export default SummaryCards;

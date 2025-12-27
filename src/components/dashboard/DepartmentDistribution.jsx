import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  useTheme,
} from "@mui/material";
import ReactApexChart from "react-apexcharts";
import PieChartIcon from "@mui/icons-material/PieChart";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { useThemeMode } from "../../contexts/ThemeContext";

const DepartmentDistribution = ({ attendanceByStatus }) => {
  const theme = useTheme();
  const { mode } = useThemeMode(); // 'light' o 'dark'
  // Mapeo de estados y sus configuraciones
  const statusConfig = {
    on_time: {
      label: "A tiempo",
      //color: "#00E676",
      color: theme.palette.success.main,
      icon: "✓",
    },
    late: {
      label: "Tarde",
      //color: "#FFC107",
      color: theme.palette.warning.main,
      icon: "⏰",
    },
    early: {
      label: "Ingreso temprano",
      //color: "#2196F3",
      color: theme.palette.primary.main,
      icon: "↑",
    },
    early_exit: {
      label: "Salida temprana",
      //color: "#FF5722",
      color: theme.palette.secondary.main,
      icon: "↓",
    },
    incomplete: {
      label: "Incompleto",
      color: "#9E9E9E",
      icon: "◐",
    },
    absent: {
      label: "Ausente",
      //color: "#F44336",
      color: theme.palette.error.main,
      icon: "✗",
    },
  };

  // Extraer datos del nuevo formato
  const statusCounts = attendanceByStatus?.statusCounts || {
    on_time: 0,
    late: 0,
    early: 0,
    early_exit: 0,
    incomplete: 0,
    absent: 0,
  };

  const period = attendanceByStatus?.period || {};
  const totalRecords = attendanceByStatus?.totalRecords || 0;

  // Preparar datos para el gráfico (solo mostrar estados con valores > 0)
  const chartData = Object.entries(statusCounts)
    .filter(([_, count]) => count > 0)
    .map(([status, count]) => ({
      status,
      count,
      label: statusConfig[status]?.label || status,
      color: statusConfig[status]?.color || "#999999",
      percentage:
        totalRecords > 0 ? ((count / totalRecords) * 100).toFixed(1) : 0,
    }));

  const series = chartData.map((item) => item.count);
  const labels = chartData.map((item) => item.label);
  const colors = chartData.map((item) => item.color);

  // Obtener nombre del mes en español
  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  const monthName = period.month ? monthNames[period.month - 1] : "Mes actual";
  const year = period.year || new Date().getFullYear();

  const options = {
    theme: {
      mode: mode,
    },
    chart: {
      type: "donut",
      background: "transparent",
      height: 380,
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150,
        },
      },
    },
    labels: labels,
    colors: colors,
    legend: {
      show: false, // Ocultamos la leyenda por defecto para usar una personalizada
    },
    plotOptions: {
      pie: {
        donut: {
          size: "60%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "16px",
              fontWeight: 600,
              // color: "#666",
              color: theme.palette.text.primary,
            },
            value: {
              show: true,
              fontSize: "28px",
              fontWeight: 700,
              //color: "#1a1a1a",
              formatter: (val) => val,
            },
            total: {
              show: true,
              label: "Total",
              fontSize: "14px",
              fontWeight: 600,
              // color: "#666",
              formatter: () => totalRecords.toString(),
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 2,
      colors: ["#fff"],
    },
    tooltip: {
      y: {
        formatter: (val, opts) => {
          const percentage = chartData[opts.seriesIndex]?.percentage || 0;
          return `${val} registros (${percentage}%)`;
        },
      },
      style: {
        fontSize: "13px",
      },
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          chart: {
            height: 320,
          },
        },
      },
    ],
  };

  // Calcular el estado más frecuente
  const topStatus =
    chartData.length > 0
      ? chartData.reduce((prev, current) =>
          prev.count > current.count ? prev : current
        )
      : null;

  return (
    <Card
      sx={{
        borderRadius: 4,
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
        position: "relative",
        overflow: "hidden",
        height: "100%",
        /*'&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${colors.join(', ')})`,
        }*/
      }}
    >
      <CardContent sx={{ p: 4 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                //background: 'linear-gradient(135deg, #673AB7 0%, #512DA8 100%)',
                background: theme.palette.secondary.main,
                borderRadius: 2,
                color: "white",
                boxShadow: "0 4px 12px rgba(103, 58, 183, 0.3)",
              }}
            >
              <PieChartIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, lineHeight: 1.2 }}
              >
                Resumen de Asistencias
              </Typography>
              <Typography
                variant="caption"
                //sx={{ color: "#666", fontWeight: 500 }}
              >
                {monthName} {year}
              </Typography>
            </Box>
          </Box>

          {topStatus && (
            <Chip
              icon={
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: "16px",
                  }}
                >
                  {statusConfig[topStatus.status]?.icon}
                </Box>
              }
              label={`${topStatus.label}: ${topStatus.percentage}%`}
              sx={{
                bgcolor: `${topStatus.color}20`,
                color: topStatus.color,
                fontWeight: 700,
                border: `2px solid ${topStatus.color}40`,
                "& .MuiChip-icon": {
                  color: topStatus.color,
                },
              }}
            />
          )}
        </Box>

        {/* Gráfico */}
        {series.length > 0 ? (
          <Box sx={{ mt: 2 }}>
            <ReactApexChart
              options={options}
              series={series}
              type="donut"
              height={380}
            />
          </Box>
        ) : (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              color: "#999",
            }}
          >
            <Typography variant="h6">
              No hay datos disponibles para este período
            </Typography>
          </Box>
        )}

        {/* Leyenda personalizada con estadísticas */}
        {chartData.length > 0 && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              },
              gap: 2,
              mt: 3,
              pt: 3,
              borderTop: "1px solid rgba(0, 0, 0, 0.08)",
            }}
          >
            {chartData.map((item, index) => (
              <Box
                key={item.status}
                sx={{
                  p: 2,
                  background: `${item.color}08`,
                  borderRadius: 2,
                  //border: `1px solid ${item.color}20`,
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: `0 8px 16px ${item.color}30`,
                    background: `${item.color}15`,
                  },
                  animation: `fadeInUp 0.5s ease ${index * 0.1}s both`,
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
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    mb: 1,
                  }}
                >
                  {/* <Box
                    sx={{
                      width: 32,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: item.color,
                      borderRadius: 1.5,
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '14px',
                      boxShadow: `0 4px 8px ${item.color}40`
                    }}
                  >
                    {statusConfig[item.status]?.icon}
                  </Box> */}
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 600, /*color: "#666",*/ flex: 1 }}
                  >
                    {item.label}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 800,
                      color: item.color,
                    }}
                  >
                    {item.count}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ /*color: "#999",*/ fontWeight: 600 }}
                  >
                    ({item.percentage}%)
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}

        {/* Resumen total */}
        {totalRecords > 0 && (
          <Box
            sx={{
              mt: 3,
              p: 2.5,
              background:
                "linear-gradient(135deg, rgba(33, 150, 243, 0.05) 0%, rgba(103, 58, 183, 0.05) 100%)",
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <TrendingUpIcon
                sx={{ color: theme.palette.primary.main, fontSize: 28 }}
              />
              <Box>
                <Typography variant="caption" sx={{ display: "block" }}>
                  Total de registros
                </Typography>
                <Typography variant="h4">
                  {totalRecords.toLocaleString()}
                </Typography>
              </Box>
            </Box>

            {statusCounts.on_time > 0 && totalRecords > 0 && (
              <Box sx={{ textAlign: "right" }}>
                <Typography variant="caption" sx={{ display: "block" }}>
                  Tasa de puntualidad
                </Typography>
                <Typography
                  variant="h5"
                  color={theme.palette.success.main}
                  /*sx={{
                    fontWeight: 800,
                    background:
                      "linear-gradient(135deg, #00E676 0%, #00C853 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}*/
                >
                  {((statusCounts.on_time / totalRecords) * 100).toFixed(1)}%
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default DepartmentDistribution;

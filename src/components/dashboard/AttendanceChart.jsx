import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  useTheme,
} from "@mui/material";
import ReactApexChart from "react-apexcharts";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { useThemeMode } from "../../contexts/ThemeContext";

const AttendanceChart = ({ weeklyAttendances }) => {
  const theme = useTheme();
  const { mode } = useThemeMode(); // 'light' o 'dark'
  const onTimeStatusData =
    Array.isArray(weeklyAttendances) && weeklyAttendances.length === 7
      ? weeklyAttendances.map((c) => c.on_time)
      : [0, 0, 0, 0, 0, 0, 0];

  const lateStatusData =
    Array.isArray(weeklyAttendances) && weeklyAttendances.length === 7
      ? weeklyAttendances.map((c) => c.late)
      : [0, 0, 0, 0, 0, 0, 0];

  const absentStatusData =
    Array.isArray(weeklyAttendances) && weeklyAttendances.length === 7
      ? weeklyAttendances.map((c) => c.absent)
      : [0, 0, 0, 0, 0, 0, 0];

  const dateLabels =
    Array.isArray(weeklyAttendances) && weeklyAttendances.length === 7
      ? weeklyAttendances.map((c) => c.date)
      : [null, null, null, null, null, null, null];

  const dayNameLabels =
    Array.isArray(weeklyAttendances) && weeklyAttendances.length === 7
      ? weeklyAttendances.map((c) => c.day)
      : [null, null, null, null, null, null, null];

  const dayLabels = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  // Cálculo de estadísticas
  const totalOnTime = onTimeStatusData.reduce((a, b) => a + b, 0);
  const totalLate = lateStatusData.reduce((a, b) => a + b, 0);
  const totalAbsent = absentStatusData.reduce((a, b) => a + b, 0);
  const totalWeek = totalOnTime + totalLate + totalAbsent;
  const avgDaily = totalWeek > 0 ? Math.round(totalWeek / 7) : 0;
  const punctualityRate =
    totalWeek > 0 ? Math.round((totalOnTime / totalWeek) * 100) : 0;

  const chartData = {
    series: [
      { name: "A tiempo", data: onTimeStatusData },
      { name: "Tarde", data: lateStatusData },
      { name: "Ausente", data: absentStatusData },
    ],
    options: {
      theme: {
        mode: mode,
      },
      chart: {
        type: "area",
        background: "transparent",
        height: 380,
        toolbar: { show: false },
        zoom: { enabled: false },
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 800,
          animateGradually: {
            enabled: true,
            delay: 150,
          },
          dynamicAnimation: {
            enabled: true,
            speed: 350,
          },
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
        width: 3,
        lineCap: "round",
      },
      xaxis: {
        categories: dayLabels,
        labels: {
          style: {
            fontSize: "13px",
            fontWeight: 600,
            colors: "#666",
          },
        },
        tooltip: {
          enabled: false, // ← Agregar esta línea
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        title: {
          text: "Número de Asistencias",
          style: {
            fontSize: "13px",
            fontWeight: 600,
            color: "#666",
          },
        },
        labels: {
          style: {
            fontSize: "12px",
            colors: "#666",
          },
        },
      },
      colors: ["#2196F3", "#673AB7", "#F44336"],
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.6,
          opacityTo: 0.05,
          stops: [0, 90, 100],
        },
      },
      grid: {
        borderColor: "#f0f0f0",
        strokeDashArray: 5,
        xaxis: { lines: { show: false } },
      },
      legend: {
        show: false,
      },
      tooltip: {
        shared: true,
        intersect: false,
        x: {
          formatter: function (val, opts) {
            const date = dateLabels[opts.dataPointIndex];
            const day = dayNameLabels[opts.dataPointIndex];
            return date ? `${day} - ${date}` : val;
          },
        },
        style: {
          fontSize: "13px",
        },
      },
      markers: {
        size: 0,
        hover: {
          size: 6,
          sizeOffset: 3,
        },
      },
    },
  };

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
          background: 'linear-gradient(90deg, #2196F3 0%, #673AB7 50%, #F44336 100%)',
        }*/
      }}
    >
      <CardContent sx={{ p: 4 }}>
        {/* Header con título y leyenda */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
            mb: 3.5,
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
                //background: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
                background: theme.palette.primary.main,
                borderRadius: 2,
                color: "white",
                //boxShadow: "0 4px 12px rgba(33, 150, 243, 0.3)",
              }}
            >
              <AssignmentIcon sx={{ fontSize: 20 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Asistencia de la semana
            </Typography>
          </Box>

          {/* Leyenda personalizada */}
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Chip
              icon={
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    bgcolor: theme.palette.primary.main,
                  }}
                />
              }
              label={`A tiempo: ${totalOnTime}`}
              sx={{
                bgcolor: "rgba(0, 0, 0, 0.03)",
                fontWeight: 600,
                /*"&:hover": {
                  bgcolor: "rgba(0, 0, 0, 0.06)",
                  transform: "translateY(-2px)",
                  transition: "all 0.3s ease",
                },*/
              }}
            />
            <Chip
              icon={
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    bgcolor: theme.palette.secondary.main,
                  }}
                />
              }
              label={`Tarde: ${totalLate}`}
              sx={{
                bgcolor: "rgba(0, 0, 0, 0.03)",
                fontWeight: 600,
              }}
            />
            <Chip
              icon={
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    bgcolor: theme.palette.error.main,
                  }}
                />
              }
              label={`Ausente: ${totalAbsent}`}
              sx={{
                bgcolor: "rgba(0, 0, 0, 0.03)",
                fontWeight: 600,
              }}
            />
          </Box>
        </Box>

        {/* Gráfico */}
        <Box sx={{ mt: 2 }}>
          <ReactApexChart
            options={chartData.options}
            series={chartData.series}
            type="area"
            height={380}
          />
        </Box>

        {/* Estadísticas resumen */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
            gap: 2,
            mt: 3,
            pt: 3,
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box
            sx={{
              textAlign: "center",
              p: 2,
              /*/background:
                "linear-gradient(135deg, rgba(33, 150, 243, 0.05) 0%, rgba(33, 150, 243, 0.02) 100%)",*/
              background: theme.palette.primary.main + "0A",
              borderRadius: 2,
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
                //boxShadow:`0 8px 16px ${theme.palette.primary.main}20`
              },
            }}
          >
            <Typography
              variant="caption"
              sx={{
                //color: "#666",
                //textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontWeight: 600,
              }}
            >
              Total Semana
            </Typography>
            <Typography
              variant="h4"
              color={theme.palette.primary.main}
              /*sx={{
                fontWeight: 800,
                mt: 1,
                background: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}*/
            >
              {totalWeek}
            </Typography>
          </Box>

          <Box
            sx={{
              textAlign: "center",
              p: 2,
              /*background:
                "linear-gradient(135deg, rgba(103, 58, 183, 0.05) 0%, rgba(103, 58, 183, 0.02) 100%)",*/
              background: theme.palette.secondary.main + "0A",
              borderRadius: 2,
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
              },
            }}
          >
            <Typography
              variant="caption"
              sx={{
                /*color: "#666",
                textTransform: "uppercase",*/
                letterSpacing: "0.5px",
                fontWeight: 600,
              }}
            >
              Promedio Diario
            </Typography>
            <Typography
              variant="h4"
              color={theme.palette.secondary.main}
              /*sx={{
                fontWeight: 800,
                mt: 1,
                background: "linear-gradient(135deg, #673AB7 0%, #512DA8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}*/
            >
              {avgDaily}
            </Typography>
          </Box>

          <Box
            sx={{
              textAlign: "center",
              p: 2,
              /*background:
                "linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(76, 175, 80, 0.02) 100%)",*/
              background: theme.palette.success.main + "0A",
              borderRadius: 2,
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
              },
            }}
          >
            <Typography
              variant="caption"
              sx={{
                /* color: "#666",
                textTransform: "uppercase",*/
                letterSpacing: "0.5px",
                fontWeight: 600,
              }}
            >
              Tasa Puntualidad
            </Typography>
            <Typography
              variant="h4"
              color={theme.palette.success.main}
              /*sx={{
                fontWeight: 800,
                mt: 1,
                background: "linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}*/
            >
              {punctualityRate}%
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AttendanceChart;

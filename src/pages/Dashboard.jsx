import {
  Grid,
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import StatisticsCard from "../components/dashboard/StatisticsCard";
import AttendanceChart from "../components/dashboard/AttendanceChart";
import RecentActivity from "../components/dashboard/RecentActivity";
import DepartmentDistribution from "../components/dashboard/DepartmentDistribution";

// Iconos
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import BusinessIcon from "@mui/icons-material/Business";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import dashboardService from "../services/dashboardService";
import { memo, useEffect, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para cada tipo de dato
  const [generalStats, setGeneralStats] = useState(null);
  const [weeklyAttendances, setWeeklyAttendances] = useState([]);
  const [attendanceByStatus, setAttendanceByStatus] = useState(null);
  const [topUsers, setTopUsers] = useState([]);

  // Cargar todos los datos al montar el componente
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Ejecutar todas las peticiones en paralelo
      const [statsRes, weeklyRes, statusRes, topUsersRes] = await Promise.all([
        dashboardService.getGeneralStats(),
        dashboardService.getWeeklyAttendances(),
        dashboardService.getAttendanceByStatus(),
        dashboardService.getTopUsers(),
      ]);

      setGeneralStats(statsRes.data);
      setWeeklyAttendances(weeklyRes.data);
      setAttendanceByStatus(statusRes);
      setTopUsers(topUsersRes.data);
    } catch (err) {
      setError(err.message || "Error al cargar los datos del dashboard");
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Componente Header memoizado
  const PageHeader = memo(({ date, isMobile }) => {
    return (
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          mb: 3,
          border: "1px solid",
          borderColor: "divider",
          //background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          //color: "white",
        }}
      >
        <CardContent sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2.5, sm: 3 } }}>
          {isMobile ? (
            <Stack spacing={2}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
                spacing={1}
              >
                <Box flex={1}>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    Panel
                  </Typography>
                  <Chip
                    label={format(new Date(), "d 'de' MMMM 'de' yyyy", {
                      locale: es,
                    })}
                    size="small"
                    sx={{
                      fontWeight: 500,
                    }}
                  />
                </Box>
              </Stack>
            </Stack>
          ) : (
            <Box>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                Panel Estadístico
              </Typography>

              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", {
                  locale: es,
                })}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  });

  if (loading) {
    return <div className="loading">Cargando dashboard...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <p>Error: {error}</p>
        <button onClick={fetchDashboardData}>Reintentar</button>
      </div>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      {/* Header */}
      <PageHeader isMobile={isMobile} />

      {/* Tarjetas de Estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          {
            title: "Total Colaboradores",
            count: generalStats?.totalActiveUsers || 0,
            icon: <PeopleOutlineIcon />,
            color: "#2196F3",
            trend: "+12%",
          },
          {
            title: "Departamentos",
            count: generalStats?.totalDepartments || 0,
            icon: <BusinessIcon />,
            color: "#673AB7",
            trend: "+3",
          },
          {
            title: "Asistencias Hoy",
            count: generalStats?.todayAttendances || 0,
            icon: <AssignmentIndIcon />,
            color: "#00E676",
            trend: "+5%",
          },
          {
            title: "Tasa Asistencia",
            count: `${generalStats?.attendanceRate || 0}%`,
            icon: <TrendingUpIcon />,
            color: "#FFC107",
            trend: "+2.3%",
          },
        ].map((stat, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
            <StatisticsCard {...stat} />
          </Grid>
        ))}
      </Grid>
      {/* <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          {
            title: "Total Colaboradores",
            count: generalStats?.totalActiveUsers || 0,
            icon: <PeopleOutlineIcon />,
            color: "#2196F3",
          },
          {
            title: "Departamentos",
            count: generalStats?.totalDepartments || 0,
            icon: <BusinessIcon />,
            color: "#673AB7",
          },
          {
            title: "Asistencias Hoy",
            count: generalStats?.todayAttendances || 0,
            icon: <AssignmentIndIcon />,
            color: "#00E676",
          },
          {
            title: "Tasa Asistencia",
            count: `${generalStats?.attendanceRate || 0}%`,
            icon: <TrendingUpIcon />,
            color: "#FFC107",
          },
        ].map((stat, index) => (
          <Grid
            key={index}
            size={{ xs: 12, sm: 6, md: 3 }}
            sx={{
              animation: `fadeInUp 0.6s ease ${index * 0.1}s both`,
              "@keyframes fadeInUp": {
                from: { opacity: 0, transform: "translateY(30px)" },
                to: { opacity: 1, transform: "translateY(0)" },
              },
            }}
          >
            <StatisticsCard {...stat} />
          </Grid>
        ))}
      </Grid> */}
      {/* <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatisticsCard
            title="Total Colaboradores"
            count={generalStats?.totalActiveUsers || 0}
            icon={<PeopleOutlineIcon />}
            color="#2196F3"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatisticsCard
            title="Departamentos"
            count={generalStats?.totalDepartments || 0}
            icon={<BusinessIcon />}
            color="#673AB7"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatisticsCard
            title="Asistencias Hoy"
            count={generalStats?.todayAttendances || 0}
            icon={<AssignmentIndIcon />}
            color="#00E676"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatisticsCard
            title="Tasa Asistencia"
            count={`${generalStats?.attendanceRate || 0}%`}
            icon={<TrendingUpIcon />}
            color="#FFC107"
          />
        </Grid>
      </Grid> */}

      {/* Gráficos y Tablas */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <AttendanceChart weeklyAttendances={weeklyAttendances} />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <DepartmentDistribution attendanceByStatus={attendanceByStatus} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;

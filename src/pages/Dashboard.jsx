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
  CircularProgress,
} from "@mui/material";
import StatisticsCard from "../components/dashboard/StatisticsCard";
import AttendanceChart from "../components/dashboard/AttendanceChart";
import DepartmentDistribution from "../components/dashboard/DepartmentDistribution";

// Iconos
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import BusinessIcon from "@mui/icons-material/Business";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import dashboardService from "../services/dashboardService";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useThemeMode } from "../contexts/ThemeContext";
import TopUsersRanking from "../components/dashboard/TopUsersRanking";

const Dashboard = () => {
  const theme = useTheme();
  const { mode } = useThemeMode();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para cada tipo de dato
  const [generalStats, setGeneralStats] = useState(null);
  const [weeklyAttendances, setWeeklyAttendances] = useState([]);
  const [attendanceByStatus, setAttendanceByStatus] = useState(null);
  const [topUsersData, setTopUsersData] = useState(null);
  const [topUsersPeriod, setTopUsersPeriod] = useState("monthly");
  const [rankingLoading, setRankingLoading] = useState(false);

  // Cargar todos los datos al montar el componente (una sola vez)
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Ejecutar todas las peticiones en paralelo
      const [statsRes, weeklyRes, statusRes] = await Promise.all([
        dashboardService.getGeneralStats(),
        dashboardService.getWeeklyAttendances(),
        dashboardService.getAttendanceByStatus(),
      ]);

      setGeneralStats(statsRes.data);
      setWeeklyAttendances(weeklyRes.data);
      setAttendanceByStatus(statusRes);
    } catch (err) {
      setError(err.message || "Error al cargar los datos del dashboard");
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fectch exclusivo para el ranking de usuarios
  const fetchTopUsers = useCallback(async (period) => {
    setRankingLoading(true);
    try {
      const res = await dashboardService.getTopUsers(period);
      setTopUsersData(res);
    } catch (err) {
      console.error("Error al cargar ranking:", err);
    } finally {
      setRankingLoading(false);
    }
  }, []);

  // useEffect SOLO para el ranking
  useEffect(() => {
    fetchTopUsers(topUsersPeriod);
  }, [topUsersPeriod, fetchTopUsers]);

  const handleSelectPeriod = useCallback((value) => {
    setTopUsersPeriod(value);
  }, []);

  const memoizedTopUsersData = useMemo(() => {
  return topUsersData;
}, [topUsersData]);

  // Componente Header memoizado
  const PageHeader = memo(({ date, isMobile }) => {
    return (
      <Card
        elevation={1}
        sx={{
          borderRadius: 3,
          mb: 3,
          /* border: "1px solid",
          borderColor: "divider",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",*/
          borderLeft: mode === "dark" ? "none" : "6px solid",
          borderColor: "primary.main",
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
                    Panel Estadístico
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

  // Estado de carga inicial
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          gap: 2,
        }}
      >
        <CircularProgress size={48} />
        <Typography variant="body1" color="text.secondary">
          Cargando...
        </Typography>
      </Box>
    );
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
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {[
          {
            title: "Total Colaboradores",
            count: generalStats?.totalActiveUsers || 0,
            icon: <PeopleOutlineIcon />,
            color: theme.palette.primary.main,
            trend: "+12%",
          },
          {
            title: "Departamentos",
            count: generalStats?.totalDepartments || 0,
            icon: <BusinessIcon />,
            color: theme.palette.secondary.main,
            trend: "+3",
          },
          {
            title: "Asistencias Hoy",
            count: generalStats?.todayAttendances || 0,
            icon: <AssignmentIndIcon />,
            color: theme.palette.success.main,
            trend: "+5%",
          },
          {
            title: "Tasa Asistencia",
            count: `${generalStats?.attendanceRate || 0}%`,
            icon: <TrendingUpIcon />,
            color: theme.palette.warning.main,
            trend: "+2.3%",
          },
        ].map((stat, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
            <StatisticsCard {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* Gráficos y Tablas */}
      <Grid container spacing={2} alignItems={"stretch"}>
        <Grid size={{ xs: 12, md: 7 }}>
          <AttendanceChart weeklyAttendances={weeklyAttendances} />
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <DepartmentDistribution attendanceByStatus={attendanceByStatus} />
        </Grid>

        <Grid size={12}>
          <TopUsersRanking
            data={memoizedTopUsersData}
            loading={rankingLoading}
            onSelectPeriod={handleSelectPeriod}
            period={topUsersPeriod}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;

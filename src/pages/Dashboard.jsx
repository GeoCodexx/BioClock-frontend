import { Grid, Box, Typography } from "@mui/material";
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
import { useEffect, useState } from "react";

const Dashboard = () => {
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
    <Box>
      {/* Título del Dashboard */}
      <Typography variant="h4" sx={{ mb: 4 }}>
        Dashboard
      </Typography>

      {/* Tarjetas de Estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
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
      </Grid>

      {/* Gráficos y Tablas */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <AttendanceChart weeklyAttendances={weeklyAttendances} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <DepartmentDistribution attendanceByStatus={attendanceByStatus} />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <RecentActivity topUsers={topUsers} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;

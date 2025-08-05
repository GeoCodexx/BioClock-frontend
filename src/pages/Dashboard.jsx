import { Grid, Box, Typography } from '@mui/material';
import StatisticsCard from '../components/dashboard/StatisticsCard';
import AttendanceChart from '../components/dashboard/AttendanceChart';
import RecentActivity from '../components/dashboard/RecentActivity';
import DepartmentDistribution from '../components/dashboard/DepartmentDistribution';

// Iconos
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import BusinessIcon from '@mui/icons-material/Business';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const Dashboard = () => {
  return (
    <Box>
      {/* Título del Dashboard */}
      <Typography variant="h4" sx={{ mb: 4 }}>
        Dashboard
      </Typography>

      {/* Tarjetas de Estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatisticsCard
            title="Total Empleados"
            count="150"
            icon={<PeopleOutlineIcon />}
            color="#2196F3"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatisticsCard
            title="Departamentos"
            count="8"
            icon={<BusinessIcon />}
            color="#673AB7"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatisticsCard
            title="Asistencias Hoy"
            count="125"
            icon={<AssignmentIndIcon />}
            color="#00E676"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatisticsCard
            title="Tasa Asistencia"
            count="83%"
            icon={<TrendingUpIcon />}
            color="#FFC107"
          />
        </Grid>
      </Grid>

      {/* Gráficos y Tablas */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <AttendanceChart />
        </Grid>
        <Grid item xs={12} md={4}>
          <DepartmentDistribution />
        </Grid>
        <Grid item xs={12}>
          <RecentActivity />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
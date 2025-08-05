import { Card, CardContent, Typography } from '@mui/material';
import ReactApexChart from 'react-apexcharts';

const DepartmentDistribution = () => {
  const chartData = {
    series: [44, 55, 13, 43, 22],
    options: {
      chart: {
        type: 'pie',
        height: 350
      },
      labels: ['TI', 'RRHH', 'Ventas', 'Marketing', 'Operaciones'],
      colors: ['#2196F3', '#673AB7', '#00E676', '#FFC107', '#FF5722'],
      legend: {
        position: 'bottom'
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 200
          },
          legend: {
            position: 'bottom'
          }
        }
      }]
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Distribución por Departamento
        </Typography>
        <ReactApexChart
          options={chartData.options}
          series={chartData.series}
          type="pie"
          height={350}
        />
      </CardContent>
    </Card>
  );
};

export default DepartmentDistribution;
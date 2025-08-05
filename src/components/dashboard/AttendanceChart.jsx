import { Card, CardContent, Typography } from '@mui/material';
import ReactApexChart from 'react-apexcharts';

const AttendanceChart = () => {
  const chartData = {
    series: [{
      name: 'Asistencias',
      data: [88, 92, 85, 89, 94, 90, 88]
    }],
    options: {
      chart: {
        type: 'area',
        height: 350,
        toolbar: {
          show: false
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth',
        width: 2
      },
      xaxis: {
        categories: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
      },
      yaxis: {
        title: {
          text: 'Número de Asistencias'
        }
      },
      colors: ['#2196F3'],
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.2,
          stops: [0, 90, 100]
        }
      },
      tooltip: {
        x: {
          format: 'dd/MM/yy HH:mm'
        },
      }
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Tendencia de Asistencias
        </Typography>
        <ReactApexChart
          options={chartData.options}
          series={chartData.series}
          type="area"
          height={350}
        />
      </CardContent>
    </Card>
  );
};

export default AttendanceChart;
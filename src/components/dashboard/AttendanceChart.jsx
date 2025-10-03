import { Card, CardContent, Typography } from "@mui/material";
import ReactApexChart from "react-apexcharts";

const AttendanceChart = ({ weeklyAttendances }) => {
  /* const attendanceData =
    Array.isArray(weeklyAttendances) && weeklyAttendances.length === 7
      ? weeklyAttendances.map((c) => c.count)
      : [0, 0, 0, 0, 0, 0, 0];*/

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

  // Extraer fechas si están disponibles
  const dateLabels =
    Array.isArray(weeklyAttendances) && weeklyAttendances.length === 7
      ? weeklyAttendances.map((c) => c.date)
      : [null, null, null, null, null, null, null];

  // Extraer dias si están disponibles
  const dayNameLabels =
    Array.isArray(weeklyAttendances) && weeklyAttendances.length === 7
      ? weeklyAttendances.map((c) => c.day)
      : [null, null, null, null, null, null, null];

  const dayLabels = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  const chartData = {
    series: [
      /* {
        name: "Asistencias",
        data: attendanceData,
      },*/
      {
        name: "A tiempo",
        data: onTimeStatusData,
      },
      {
        name: "Tarde",
        data: lateStatusData,
      },
      {
        name: "Ausente",
        data: absentStatusData,
      },
    ],
    options: {
      chart: {
        type: "area",
        height: 350,
        toolbar: {
          show: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
        width: 2,
      },
      xaxis: {
        categories: dayLabels,
      },
      yaxis: {
        title: {
          text: "Número de Asistencias",
        },
      },
      colors: ["#2196F3", "#673AB7", "#F44336"],
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.2,
          stops: [0, 90, 100],
        },
      },
      tooltip: {
        x: {
          formatter: function (val, opts) {
            const date = dateLabels[opts.dataPointIndex];
            const day = dayNameLabels[opts.dataPointIndex];
            return date ? `${day} - ${date}` : val;
          },
        },
      },
    },
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Asistencia de la semana
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

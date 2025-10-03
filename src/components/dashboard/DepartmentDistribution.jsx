import { Card, CardContent, Typography } from "@mui/material";
import ReactApexChart from "react-apexcharts";

const DepartmentDistribution = ({ attendanceByStatus }) => {
  const data =
    Array.isArray(attendanceByStatus?.data) &&
    attendanceByStatus?.data?.length === 5
      ? attendanceByStatus?.data?.map((c) => c.count)
      : [44, 55, 13, 43, 22];
  const labelStatus =
    Array.isArray(attendanceByStatus?.data) &&
    attendanceByStatus?.data?.length === 5
      ? attendanceByStatus?.data?.map((c) => {
          switch (c.status) {
            case "on_time":
              return "A tiempo";
            case "late":
              return "Tarde";
            case "early_leave":
              return "Salida tempra";
            case "justified":
              return "Justificado";
            case "absent":
              return "Ausente";
            default:
              return c.status;
          }
        })
      : ["A tiempo", "Tarde", "Salida tempra", "Justificado", "Ausente"];

  const chartData = {
    series: data,
    options: {
      chart: {
        type: "pie",
        height: 350,
      },
      labels: labelStatus,
      colors: ["#2196F3", "#673AB7", "#00E676", "#FFC107", "#FF5722"],
      legend: {
        position: "bottom",
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              position: "bottom",
            },
          },
        },
      ],
    },
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {attendanceByStatus
            ? `Resúmen mensual - ${attendanceByStatus.month}`
            : "Distribución por Departamento"}
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

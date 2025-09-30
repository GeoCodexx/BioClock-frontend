import { useState } from "react";
import {
  Grid,
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper
} from "@mui/material";

export default function MonthlyReport() {
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [data, setData] = useState(null);

  const fetchReport = async () => {
    if (!month || !year) return;
    try {
      const res = await fetch(`/api/reports/monthly?month=${month}&year=${year}`);
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error("Error fetching monthly report:", error);
    }
  };

  return (
    <Box p={2}>
      <Typography variant="h5" gutterBottom>
        Reporte Mensual Consolidado
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            type="number"
            label="Mes (1-12)"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            type="number"
            label="Año (YYYY)"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            variant="contained"
            fullWidth
            onClick={fetchReport}
          >
            Generar
          </Button>
        </Grid>
      </Grid>

      {data && (
        <Box mt={3}>
          <Typography variant="subtitle1">
            Total empleados: {data.total}
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Empleado</TableCell>
                  <TableCell>Departamento</TableCell>
                  <TableCell>Rol</TableCell>
                  <TableCell>Asistencias</TableCell>
                  <TableCell>Tardanzas</TableCell>
                  <TableCell>Ausencias</TableCell>
                  <TableCell>Parciales</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.records.map((r) => (
                  <TableRow key={r.userId}>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>{r.department}</TableCell>
                    <TableCell>{r.role}</TableCell>
                    <TableCell>{r.totalAsistencias}</TableCell>
                    <TableCell>{r.tardanzas}</TableCell>
                    <TableCell>{r.ausencias}</TableCell>
                    <TableCell>{r.parciales}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
}

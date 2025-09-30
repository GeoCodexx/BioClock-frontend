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

export default function UserHistoryReport() {
  const [userId, setUserId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState(null);

  const fetchReport = async () => {
    if (!userId) return;
    try {
      let url = `/api/reports/user/${userId}`;
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }
      const res = await fetch(url);
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error("Error fetching user history:", error);
    }
  };

  return (
    <Box p={2}>
      <Typography variant="h5" gutterBottom>
        Historial Individual de Asistencia
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="ID Usuario"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            type="date"
            label="Desde"
            InputLabelProps={{ shrink: true }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            type="date"
            label="Hasta"
            InputLabelProps={{ shrink: true }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            variant="contained"
            fullWidth
            onClick={fetchReport}
          >
            Buscar
          </Button>
        </Grid>
      </Grid>

      {data && (
        <Box mt={3}>
          <Typography variant="subtitle1">
            Total registros: {data.total}
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Hora Entrada</TableCell>
                  <TableCell>Hora Salida</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.records.map((r) => (
                  <TableRow key={r._id}>
                    <TableCell>
                      {new Date(r.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{r.status}</TableCell>
                    <TableCell>{r.checkIn || "-"}</TableCell>
                    <TableCell>{r.checkOut || "-"}</TableCell>
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

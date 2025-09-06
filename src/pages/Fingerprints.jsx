import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Pagination,
  Stack,
} from "@mui/material";
import FingerprintTable from "../components/Fingerprint/FingerprintTable";
import {
  getFingerprintTemplates,
  updateFingerprintStatus,
} from "../services/fingerprintService";

export default function Fingerprint() {
  const [templates, setTemplates] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data, totalPages } = await getFingerprintTemplates({
        page,
        limit: 10,
        status: statusFilter || undefined,
        search: search || undefined,
        sortField: "createdAt",
        sortOrder: "desc",
      });
      setTemplates(data);
      setTotalPages(totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateFingerprintStatus(id, status);
      fetchTemplates(); // recarga lista
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [page, statusFilter]);

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>
        Gestión de Plantillas Biométricas
      </Typography>

      {/* Filtros */}
      <Stack direction="row" spacing={2} mb={2}>
        <TextField
          label="Buscar por nombre o DNI"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && fetchTemplates()}
        />
        <TextField
          label="Estado"
          select
          size="small"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ width: "190px" }}
        >
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="pending">Pendiente</MenuItem>
          <MenuItem value="approved">Aprobado</MenuItem>
          <MenuItem value="rejected">Rechazado</MenuItem>
        </TextField>
        <Button variant="contained" onClick={() => fetchTemplates()}>
          Buscar
        </Button>
      </Stack>

      {/* Tabla */}
      <FingerprintTable
        data={templates}
        loading={loading}
        onStatusChange={handleStatusChange}
      />

      {/* Paginación */}
      <Stack mt={2} alignItems="center">
        <Pagination
          count={totalPages}
          page={page}
          onChange={(e, value) => setPage(value)}
        />
      </Stack>
    </Box>
  );
}

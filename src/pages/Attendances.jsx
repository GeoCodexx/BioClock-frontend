import { useEffect, useState } from "react";
import {
  Typography,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TablePagination,
  Button,
  Stack,
  Box,
  Grid,
} from "@mui/material";
import AttendanceForm from "../components/Attendance/AttendanceForm";
import AttendanceTable from "../components/Attendance/AttendanceTable";
import AttendanceExportButtons from "../components/Attendance/AttendanceExportButtons";
import AttendanceSearchBar from "../components/Attendance/AttendanceSearchBar";
import {
  getPaginatedAttendances,
  createAttendance,
  updateAttendance,
  deleteAttendance,
} from "../services/attendanceService";
//import FilterButton from "../components/Attendance/FilterButton";
import { Add as AddIcon } from "@mui/icons-material";
import DateRangeFilter from "../components/Attendance/DateRangeFilter";
import FilterSelect from "../components/Attendance/FilterSelectByStatus";
import FilterSelectByStatus from "../components/Attendance/FilterSelectByStatus";
import FilterSelectByType from "../components/Attendance/FilterSelectByType";

export default function Attendances() {
  const [attendances, setAttendances] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true); //fetchData in useEffect
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [editAttendance, setEditAttendance] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  //const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    status: "todos",
    type: "todos",
    startDate: null,
    endDate: null,
    page: 0,
    limit: 10,
  });
  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    status: "todos",
    type: "todos",
    startDate: null,
    endDate: null,
    page: 0,
    limit: 10,
  });
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingData, setLoadingData] = useState(false); //Controla la data de los select Usuario y Device

  /*useEffect(() => {
    fetchAttendances();
  }, [filters]);*/

  useEffect(() => {
    fetchAttendances();
  }, [appliedFilters]);

  // Helper: resetea page=0 solo cuando NO cambias la página explícitamente
  const updateFilters = (patch, { resetPage = true } = {}) => {
    setFilters((prev) => ({
      ...prev,
      ...patch,
      ...(resetPage && !("page" in patch) ? { page: 0 } : {}),
    }));
  };

  const fetchAttendances = async () => {
    try {
      setLoading(true);
      const data = await getPaginatedAttendances({
        page: appliedFilters.page + 1,
        limit: appliedFilters.limit,
        search: appliedFilters.search || undefined,
        status:
          appliedFilters.status !== "todos" ? appliedFilters.status : undefined,
        type: appliedFilters.type !== "todos" ? appliedFilters.type : undefined,
        startDate: appliedFilters.startDate
          ? appliedFilters.startDate.toISOString()
          : undefined,
        endDate: appliedFilters.endDate
          ? appliedFilters.endDate.toISOString()
          : undefined,
        sortField: "createdAt",
        sortOrder: "desc",
      });
      setAttendances(data.data);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
      setError("Error al cargar asistencias");
    } finally {
      setLoading(false);
    }
  };

  // Handlers UI
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilters({ search: searchInput }); // resetea page a 0 implícito
  };

  const handleSearch = () => {
    setAppliedFilters({ ...filters }); // Aplica los filtros actuales
  };

  const handleClear = () => {
    const defaultFilters = {
      search: "",
      status: "todos",
      type: "todos",
      startDate: null,
      endDate: null,
      page: 0,
      limit: 10,
    };

    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters); // Limpia también los filtros aplicados
  };

  const handleRegister = async (data) => {
    console.log(data);
    setFormError("");
    setLoadingSubmit(true);
    try {
      const { timestamp, ...rest } = data;
      const formattedData = {
        ...rest,
        timestamp: data.timestamp?.toISOString(),
      };

      let resp;

      if (editAttendance) {
        resp = await updateAttendance(editAttendance._id, formattedData);
      } else {
        resp = await createAttendance(formattedData);
        console.log(resp);
      }

      // Si la respuesta indica que la asistencia NO es válida
      if (resp?.isValid === false && resp?.reason) {
        setFormError(resp.reason); // Mostramos el motivo exacto
        return; // No cerrar el diálogo todavía
      }

      setOpen(false);
      setEditAttendance(null);
      fetchAttendances();
    } catch (err) {
      // Si el backend responde con reason, lo mostramos
      const backendMsg =
        err?.reason || err?.message || "Error al guardar asistencia";
      setFormError(backendMsg);
      /*setFormError(
        err.response?.data?.message || "Error al guardar asistencia"
      );*/
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleEdit = (attendance) => {
    setEditAttendance(attendance);
    setOpen(true);
  };

  const handleDelete = (attendanceId) => {
    setDeleteId(attendanceId);
    setDeleteError("");
  };

  const confirmDelete = async () => {
    setDeleteError("");
    try {
      await deleteAttendance(deleteId);
      setDeleteId(null);
      fetchAttendances();
    } catch (err) {
      setDeleteError(
        err.response?.data?.message || "Error al eliminar asistencia"
      );
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditAttendance(null);
    setFormError("");
  };

  if (loading) return <CircularProgress sx={{ mt: 4 }} />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <>
      <Grid container spacing={2}>
        <Grid size={12}>
          <Typography
            variant="h5"
            gutterBottom
            align="center"
            sx={{
              mb: 2,
            }}
          >
            Gestión de Asistencias
          </Typography>
        </Grid>
        <Grid
          size={12}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          {/*Lado izquierdo */}
          <Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setOpen(true);
                setEditAttendance(null);
              }}
            >
              Nuevo
            </Button>
          </Box>
          {/*Lado derecho */}
          <Stack direction="row" spacing={2} mb={2}>
            {/* Botones de exportación */}
            <AttendanceExportButtons attendances={attendances} />
          </Stack>
        </Grid>
        <Grid
          size={12}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          component="form"
          onSubmit={handleSearch}
          //sx={{ mb: 2, border: "1px solid #ccc", p: 2, borderRadius: 1 }}
        >
          <Grid size={10}>
            <Box
              display="flex"
              justifyContent={"space-between"}
              alignItems={"center"}
              gap={2}
              mb={2}
            >
              {/* Filtro de rango de fechas */}
              <DateRangeFilter
                startDate={filters.startDate}
                endDate={filters.endDate}
                allowSingle={false} // o true si quieres permitir filtrar solo por desde/hasta
                /*onApply={({ startDate, endDate }) =>
                  setFilters((prev) => ({
                    ...prev,
                    startDate,
                    endDate,
                    page: 0,
                  }))
                }*/
                updateFilters={updateFilters}
                /* onClear={() =>
                  setFilters((prev) => ({
                    ...prev,
                    startDate: null,
                    endDate: null,
                    page: 0,
                  }))
                }*/
              />

              {/* Botón de filtro por estado */}
              <FilterSelectByStatus
                statusFilter={filters.status}
                onFilterChange={(val) => updateFilters({ status: val })}
              />
              {/* Botón de filtro por tipo */}
              <FilterSelectByType
                statusFilter={filters.type}
                onFilterChange={(val) => updateFilters({ type: val })}
              />
            </Box>

            <Box>
              {/* Barra de búsqueda */}
              {/* <AttendanceSearchBar
                searchInput={filters.search}
                setSearchInput={(val) => updateFilters({ search: val })}
                /*searchInput={searchInput}
                setSearchInput={setSearchInput}
                //onSearch={handleSearchSubmit}
                //onAdd={() => setOpen(true)}
                //handleClear={handleClear}
              /> */}
              <AttendanceSearchBar
                searchInput={filters.search}
                setSearchInput={(val) => updateFilters({ search: val })}
                onSearch={handleSearch}
                handleClear={() => updateFilters({ search: "" })}
              />
            </Box>
          </Grid>
          <Grid
            size={2}
            display="flex"
            flexDirection={"column"}
            justifyContent={"space-between"}
            alignItems={"center"}
            gap={1}
          >
            <Button
              variant="contained"
              color="secondary"
              onClick={handleSearch}
              type="submit"
              sx={{ textTransform: "none" }}
              //size="small"
            >
              Buscar
            </Button>

            <Button
              variant="outlined"
              color="secondary"
              onClick={handleClear}
              sx={{ textTransform: "none" }}
              //size="small"
            >
              Limpiar
            </Button>
          </Grid>
        </Grid>

        <AttendanceTable
          attendances={attendances}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        {/**Paginacion */}
        <TablePagination
          component="div"
          count={total}
          page={filters.page}
          onPageChange={(e, newPage) =>
            updateFilters({ page: newPage }, { resetPage: false })
          }
          rowsPerPage={filters.limit}
          onRowsPerPageChange={(e) =>
            updateFilters(
              { limit: parseInt(e.target.value, 10), page: 0 },
              { resetPage: false }
            )
          }
          labelRowsPerPage="Filas por página"
        />

        <Dialog
          open={open}
          onClose={handleClose}
          fullWidth
          maxWidth="sm"
          slotProps={{
            paper: {
              sx: {
                minWidth: 320, // Tamaño mínimo fijo
                maxWidth: 500, // Tamaño máximo fijo
                transition: "height 0.3s ease", // Suaviza el cambio de altura
              },
            },
          }}
        >
          {loadingData ? (
            <CircularProgress />
          ) : (
            <>
              <DialogTitle>
                {editAttendance ? "Editar Asistencia" : "Registrar Asistencia"}
              </DialogTitle>
              <DialogContent>
                {formError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {formError}
                  </Alert>
                )}
                <AttendanceForm
                  onSubmit={handleRegister}
                  defaultValues={editAttendance || {}}
                  loading={loadingSubmit}
                  setLoadingData={() => setLoadingData}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose}>Cancelar</Button>
                <Button
                  type="submit"
                  form="attendance-form"
                  variant="contained"
                  disabled={loadingSubmit}
                  startIcon={loadingSubmit && <CircularProgress size={20} />}
                >
                  {editAttendance ? "Guardar Cambios" : "Registrar"}
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
          <DialogTitle>Confirmar eliminación</DialogTitle>
          <DialogContent>
            {deleteError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {deleteError}
              </Alert>
            )}
            ¿Estás seguro de que deseas eliminar este asistencia?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteId(null)}>Cancelar</Button>
            <Button color="error" variant="contained" onClick={confirmDelete}>
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>
      </Grid>
    </>
  );
}

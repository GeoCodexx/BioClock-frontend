import { useState, useEffect } from "react";
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
} from "@mui/material";
import {
  createSchedule,
  getPaginatedSchedules,
  updateSchedule,
  deleteSchedule,
} from "../services/scheduleService";
import ScheduleForm from "../components/Schedule/ScheduleForm";
import ScheduleTable from "../components/Schedule/ScheduleTable";
import ScheduleSearchBar from "../components/Schedule/ScheduleSearchBar";
import ScheduleExportButtons from "../components/Schedule/ScheduleExportButtons";

export default function Schedules() {
  const [schedules, setSchedules] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [editSchedule, setEditSchedule] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    fetchSchedules();
    // eslint-disable-next-line
  }, [page, rowsPerPage, search]);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const data = await getPaginatedSchedules({
        search,
        page: page + 1,
        limit: rowsPerPage,
      });
      setSchedules(data.schedules);
      setTotal(data.total);
    } catch (err) {
      setError("Error al cargar horarios");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (data) => {
    setFormError("");
    try {
      if (editSchedule) {
        await updateSchedule(editSchedule._id, data);
      } else {
        await createSchedule(data);
      }
      setOpen(false);
      setEditSchedule(null);
      fetchSchedules();
    } catch (err) {
      setFormError(
        err.response?.data?.message || "Error al guardar el horario"
      );
    }
  };

  const handleEdit = (schedule) => {
    setEditSchedule(schedule);
    setOpen(true);
  };

  const handleDelete = (scheduleId) => {
    setDeleteId(scheduleId);
    setDeleteError("");
  };

  const confirmDelete = async () => {
    setDeleteError("");
    try {
      await deleteSchedule(deleteId);
      setDeleteId(null);
      fetchSchedules();
    } catch (err) {
      setDeleteError(
        err.response?.data?.message || "Error al eliminar el horario"
      );
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditSchedule(null);
    setFormError("");
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    setSearch(searchInput);
  };

  if (loading) return <CircularProgress sx={{ mt: 4 }} />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <>
      <Typography variant="h5" gutterBottom>
        Gestión de Horarios
      </Typography>
      <ScheduleSearchBar
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        onSearch={handleSearch}
        onAdd={() => {
          setOpen(true);
          setEditPermission(null);
        }}
      />
      <ScheduleExportButtons schedules={schedules}/>
      <ScheduleTable
        schedules={schedules}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Filas por página"
      />
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {editSchedule ? "Editar Horario" : "Registrar Horario"}
        </DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <ScheduleForm
            onSubmit={handleRegister}
            defaultValues={editSchedule || {}}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button type="submit" form="permission-form" variant="contained">
            {editSchedule ? "Guardar Cambios" : "Registrar"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          {deleteError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {deleteError}
            </Alert>
          )}
          <Typography>
            ¿Estás seguro de que deseas eliminar este horario?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

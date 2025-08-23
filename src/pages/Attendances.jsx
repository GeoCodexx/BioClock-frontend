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

export default function Attendances() {
  const [attendances, setAttendances] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [editAttendance, setEditAttendance] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    fetchAttendances();
    // eslint-disable-next-line
  }, [page, rowsPerPage, search]);

  const fetchAttendances = async () => {
    setLoading(true);
    try {
      const data = await getPaginatedAttendances({
        search,
        page: page + 1,
        limit: rowsPerPage,
      });
      setAttendances(data.data);
      //console.log("Data Attendances useEffect: ", data);
      setTotal(data.total);
    } catch (err) {
      setError("Error al cargar asistencias");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (data) => {
    setFormError("");
    try {
      if (editAttendance) {
        await updateAttendance(editAttendance._id, data);
      } else {
        await createAttendance(data);
      }
      setOpen(false);
      setEditAttendance(null);
      fetchAttendances();
    } catch (err) {
      setFormError(
        err.response?.data?.message || "Error al guardar asistencia"
      );
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
        Gestión de Asistencias
      </Typography>
      <AttendanceSearchBar
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        onSearch={handleSearch}
        onAdd={() => {
          setOpen(true);
          setEditAttendance(null);
        }}
      />
      <AttendanceExportButtons attendances={attendances} />
      <AttendanceTable
        attendances={attendances}
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
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button type="submit" form="attendance-form" variant="contained">
            {editAttendance ? "Guardar Cambios" : "Registrar"}
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
          ¿Estás seguro de que deseas eliminar este asistencia?
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

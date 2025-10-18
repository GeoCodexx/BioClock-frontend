import React, { useState, useEffect } from "react";
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
import DepartmentForm from "../components/Department/DepartmentForm";
import DepartmentTable from "../components/Department/DepartmentTable";
import DepartmentSearchBar from "../components/Department/DepartmentSearchBar";
import {
  getPaginatedDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../services/departmentService";
import DepartmentExportButtons from "../components/Department/DepartmentExportButtons";

export default function Departments() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  
  const [departments, setDepartments] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [editDepartment, setEditDepartment] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    fetchDepartments();
    // eslint-disable-next-line
  }, [page, rowsPerPage, search]);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const data = await getPaginatedDepartments({
        search,
        page: page + 1,
        limit: rowsPerPage,
      });
      setDepartments(data.departments);
      setTotal(data.total);
      console.log(data);
    } catch (err) {
      setError("Error al cargar departamentos");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (data) => {
    setFormError("");
    try {
      if (editDepartment) {
        await updateDepartment(editDepartment._id, data);
      } else {
        await createDepartment(data);
      }
      setOpen(false);
      setEditDepartment(null);
      fetchDepartments();
    } catch (err) {
      setFormError(
        err.response?.data?.message || "Error al guardar departamento"
      );
    }
  };

  const handleEdit = (department) => {
    setEditDepartment(department);
    setOpen(true);
  };

  const handleDelete = (departmentId) => {
    setDeleteId(departmentId);
    setDeleteError("");
  };

  const confirmDelete = async () => {
    try {
      await deleteDepartment(deleteId);
      setDeleteId(null);
      setDeleteError("");
      fetchDepartments();
    } catch (err) {
      setDeleteError(
        err.response?.data?.message || "Error al eliminar departamento"
      );
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditDepartment(null);
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
        Departments
      </Typography>
      <DepartmentSearchBar
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        onSearch={handleSearch}
        onAdd={() => {
          setOpen(true);
          setEditDepartment(null);
        }}
      />
      <DepartmentExportButtons departments={departments} />
      <DepartmentTable
        departments={departments}
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
          {editDepartment ? "Editar departamento" : "Nuevo departamento"}
        </DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <DepartmentForm
            onSubmit={handleRegister}
            defaultValues={editDepartment || {}}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button type="submit" form="department-form" variant="contained">
            {editDepartment ? "Guardar Cambios" : "Registrar"}
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
            ¿Estás seguro de querer eliminar este departamento?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancelar</Button>
          <Button onClick={confirmDelete} color="error">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

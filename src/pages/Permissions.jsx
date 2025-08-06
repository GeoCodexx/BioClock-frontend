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
  createPermission,
  getPaginatedPermissions,
  updatePermission,
  deletePermission,
} from "../services/permissionService";
import PermissionForm from "../components/Permission/PermissionForm";
import PermissionTable from "../components/Permission/PermissionTable";
import PermissionSearchBar from "../components/Permission/PermissionSearchBar";
import PermissionExportButtons from "../components/Permission/PermissionExportButtons";

export default function Permissions() {
  const [permissions, setPermissions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [editPermission, setEditPermission] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    fetchPermissions();
    // eslint-disable-next-line
  }, [page, rowsPerPage, search]);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const data = await getPaginatedPermissions({
        search,
        page: page + 1,
        limit: rowsPerPage,
      });
      setPermissions(data.permissions);
      setTotal(data.total);
    } catch (err) {
      setError("Error al cargar permisos");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (data) => {
    setFormError("");
    try {
      if (editPermission) {
        await updatePermission(editPermission._id, data);
      } else {
        await createPermission(data);
      }
      setOpen(false);
      setEditPermission(null);
      fetchPermissions();
    } catch (err) {
      setFormError(err.response?.data?.message || "Error al guardar permiso");
    }
  };
  const handleEdit = (permission) => {
    setEditPermission(permission);
    setOpen(true);
  };

  const handleDelete = (permissionId) => {
    setDeleteId(permissionId);
    setDeleteError("");
  };

  const confirmDelete = async () => {
    setDeleteError("");
    try {
      await deletePermission(deleteId);
      setDeleteId(null);
      fetchPermissions();
    } catch (err) {
      setDeleteError(
        err.response?.data?.message || "Error al eliminar permiso"
      );
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditPermission(null);
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
        Gestión de Permisos
      </Typography>
      <PermissionSearchBar
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        onSearch={handleSearch}
        onAdd={() => {
          setOpen(true);
          setEditPermission(null);
        }}
      />
      <PermissionExportButtons permissions={permissions}/>
      <PermissionTable
        permissions={permissions}
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
          {editPermission ? "Editar Permiso" : "Registrar Permiso"}
        </DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <PermissionForm
            onSubmit={handleRegister}
            defaultValues={editPermission || {}}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button type="submit" form="permission-form" variant="contained">
            {editPermission ? "Guardar Cambios" : "Registrar"}
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
            ¿Estás seguro de que deseas eliminar este permiso?
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

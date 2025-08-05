import React, { useEffect, useState } from 'react';
import { Typography, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TablePagination, Button } from '@mui/material';
import RoleForm from '../components/Role/RoleForm';
import RoleTable from '../components/Role/RoleTable';
import RoleSearchBar from '../components/Role/RoleSearchBar';
import { getRoles, createRole, updateRole, deleteRole } from '../services/roleService';

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [editRole, setEditRole] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    fetchRoles();
    // eslint-disable-next-line
  }, [page, rowsPerPage, search]);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const data = await getRoles({ search, page: page + 1, limit: rowsPerPage });
      setRoles(data.roles);
      setTotal(data.total);
    } catch (err) {
      setError('Error al cargar roles');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (data) => {
    setFormError('');
    try {
      if (editRole) {
        await updateRole(editRole._id, data);
      } else {
        await createRole(data);
      }
      setOpen(false);
      setEditRole(null);
      fetchRoles();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error al guardar rol');
    }
  };

  const handleEdit = (role) => {
    setEditRole(role);
    setOpen(true);
  };

  const handleDelete = (roleId) => {
    setDeleteId(roleId);
    setDeleteError('');
  };

  const confirmDelete = async () => {
    setDeleteError('');
    try {
      await deleteRole(deleteId);
      setDeleteId(null);
      fetchRoles();
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Error al eliminar rol');
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditRole(null);
    setFormError('');
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
      <Typography variant="h5" gutterBottom>Roles</Typography>
      <RoleSearchBar
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        onSearch={handleSearch}
        onAdd={() => { setOpen(true); setEditRole(null); }}
      />
      <RoleTable roles={roles} onEdit={handleEdit} onDelete={handleDelete} />
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
        <DialogTitle>{editRole ? 'Editar Rol' : 'Registrar Rol'}</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <RoleForm onSubmit={handleRegister} defaultValues={editRole || {}} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button type="submit" form="role-form" variant="contained">{editRole ? 'Guardar Cambios' : 'Registrar'}</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          {deleteError && <Alert severity="error" sx={{ mb: 2 }}>{deleteError}</Alert>}
          ¿Estás seguro de que deseas eliminar este rol?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>Eliminar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

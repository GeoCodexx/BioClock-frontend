import { useEffect, useState } from 'react';
import { Typography, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TablePagination, Button } from '@mui/material';
import UserForm from '../components/User/UserForm';
import UserTable from '../components/User/UserTable';
import UserExportButtons from '../components/User/UserExportButtons';
import UserSearchBar from '../components/User/UserSearchBar';
import { getPaginatedUsers, createUser, updateUser, deleteUser } from '../services/userService';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [page, rowsPerPage, search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getPaginatedUsers({ search, page: page + 1, limit: rowsPerPage });
      setUsers(data.users);
      setTotal(data.total);
    } catch (err) {
      setError('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (data) => {
    setFormError('');
    try {
      if (editUser) {
        await updateUser(editUser._id, data);
      } else {
        await createUser(data);
      }
      setOpen(false);
      setEditUser(null);
      fetchUsers();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error al guardar usuario');
    }
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setOpen(true);
  };

  const handleDelete = (userId) => {
    setDeleteId(userId);
    setDeleteError('');
  };

  const confirmDelete = async () => {
    setDeleteError('');
    try {
      await deleteUser(deleteId);
      setDeleteId(null);
      fetchUsers();
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Error al eliminar usuario');
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditUser(null);
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
      <Typography variant="h5" gutterBottom>Usuarios</Typography>
      <UserSearchBar
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        onSearch={handleSearch}
        onAdd={() => { setOpen(true); setEditUser(null); }}
      />
      <UserExportButtons users={users} />
      <UserTable users={users} onEdit={handleEdit} onDelete={handleDelete} />
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
        <DialogTitle>{editUser ? 'Editar Usuario' : 'Registrar Usuario'}</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <UserForm onSubmit={handleRegister} defaultValues={editUser || {}} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button type="submit" form="user-form" variant="contained">{editUser ? 'Guardar Cambios' : 'Registrar'}</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          {deleteError && <Alert severity="error" sx={{ mb: 2 }}>{deleteError}</Alert>}
          ¿Estás seguro de que deseas eliminar este usuario?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>Eliminar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 
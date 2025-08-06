import { useState, useEffect } from 'react';
import { Typography, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TablePagination, Button } from '@mui/material';
import DeviceForm from '../components/Device/DeviceForm';
import DeviceTable from '../components/Device/DeviceTable';
import DeviceSearchBar from '../components/Device/DeviceSearchBar';
import { getPaginatedDevices, createDevice, updateDevice, deleteDevice } from '../services/deviceService';

export default function Devices() {
    const [devices, setDevices] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [open, setOpen] = useState(false);
    const [formError, setFormError] = useState('');
    const [editDevice, setEditDevice] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [deleteError, setDeleteError] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');

    useEffect(() => {
        fetchDevices();
        // eslint-disable-next-line
    }, [page, rowsPerPage, search]);

    const fetchDevices = async () => {
        setLoading(true);
        try {
            const data = await getPaginatedDevices({ search, page: page + 1, limit: rowsPerPage });
            setDevices(data.devices);
            setTotal(data.total);
            console.log(data);
        } catch (err) {
            setError('Error al cargar dispositivos');
        } finally {
            setLoading(false);
        }
    };

   

    const handleRegister = async (data) => {
        setFormError('');
        try {
            if (editDevice) {
                await updateDevice(editDevice._id, data);
            } else {
                await createDevice(data);
            }
            setOpen(false);
            setEditDevice(null);
            fetchDevices();
        } catch (err) {
            setFormError(err.response?.data?.message || 'Error al guardar dispositivo');
        }
    };

    const handleEdit = (device) => {
        setEditDevice(device);
        setOpen(true);
    };

    const handleDelete = (deviceId) => {
        setDeleteId(deviceId);
        setDeleteError('');
    };

    const confirmDelete = async () => {
        try {
            await deleteDevice(deleteId);
            setDeleteId(null);
            setDeleteError('');
            fetchDevices();
        } catch (err) {
            setDeleteError(err.response?.data?.message || 'Error al eliminar dispositivo');
        }
    };

    const handleClose = () => {
        setOpen(false);
        setEditDevice(null);
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
            <Typography variant="h5" gutterBottom>Devices</Typography>
            <DeviceSearchBar
                searchInput={searchInput}
                setSearchInput={setSearchInput}
                onSearch={handleSearch}
                onAdd={() => { setOpen(true); setEditDevice(null); }}
            />
            <DeviceTable devices={devices} onEdit={handleEdit} onDelete={handleDelete} />
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
                <DialogTitle>{editDevice ? 'Editar dispositivo' : 'Registrar dispositivo'}</DialogTitle>
                <DialogContent>
                    {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
                    <DeviceForm onSubmit={handleRegister} defaultValues={editDevice || {}} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancelar</Button>
                    <Button type="submit" form="device-form" variant="contained">{editDevice ? 'Guardar Cambios' : 'Registrar'}</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
                <DialogTitle>Confirmar eliminación</DialogTitle>
                <DialogContent>
                    {deleteError && <Alert severity="error" sx={{ mb: 2 }}>{deleteError}</Alert>}
                    <Typography>¿Estás seguro de querer eliminar este dispositivo?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteId(null)}>Cancelar</Button>
                    <Button onClick={confirmDelete} color="error">Eliminar</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
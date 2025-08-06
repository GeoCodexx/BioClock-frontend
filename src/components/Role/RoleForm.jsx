import { useEffect, useState } from 'react';
import { TextField, MenuItem, Select, InputLabel, FormControl, CircularProgress, Button } from '@mui/material';
import { useForm } from 'react-hook-form';
import { getPermissions } from '../../services/permissionService';

export default function RoleForm({ onSubmit, defaultValues = {}, loading }) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues });
    const [permissions, setPermissions] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        if (Object.keys(defaultValues).length > 0) {
            reset(defaultValues);
        }
        // eslint-disable-next-line
    }, [JSON.stringify(defaultValues)]);

    useEffect(() => {
        const fetchData = async () => {
            setLoadingData(true);
            try {
                const [permissionsData] = await Promise.all([
                    getPermissions()
                ]);
                setPermissions(permissionsData);
            } catch (err) {
                setPermissions([]);
            } finally {
                setLoadingData(false);
            }
        };
        fetchData();
    }, []);

    return (
        <form id="role-form" onSubmit={handleSubmit(onSubmit)}>
            <TextField
                margin="normal"
                fullWidth
                label="Nombre"
                {...register('name', { required: 'Nombre requerido' })}
                error={!!errors.name}
                helperText={errors.name?.message}
            />
            <TextField
                margin="normal"
                fullWidth
                label="Descripción"
                {...register('description')}
                error={!!errors.description}
                helperText={errors.description?.message}
            />
            <FormControl margin="normal" fullWidth>
                <InputLabel>Permisos</InputLabel>
                <Select
                    multiple
                    {...register('permissions')}
                    error={!!errors.permissions}
                    helperText={errors.permissions?.message}
                >
                    {permissions.map(permission => (
                        <MenuItem key={permission._id} value={permission._id}>
                            {permission.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <Button
                type="submit"
                variant="contained"
                disabled={loadingData}
            >
                {loading ? <CircularProgress size={20} /> : 'Guardar'}
            </Button>
        </form>
    );
}
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { TextField } from '@mui/material';

export default function DeviceForm({ onSubmit, defaultValues = {}, loading }) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues });

    useEffect(() => {
        if (Object.keys(defaultValues).length > 0) {
            reset(defaultValues);
        }
    }, [JSON.stringify(defaultValues)]);

    return (
        <form id="device-form" onSubmit={handleSubmit(onSubmit)}>
            <TextField
                margin="normal"
                fullWidth
                label="ID del dispositivo"
                {...register('deviceId', { required: 'deviceId requerido' })}
                error={!!errors.deviceId}
                helperText={errors.deviceId?.message}
            />
            <TextField
                margin="normal"
                fullWidth
                label="Nombre del dispositivo"
                {...register('name', { required: 'Nombre del dispositivo requerido' })}
                error={!!errors.name}
                helperText={errors.name?.message}
            />
            <TextField
                margin="normal"
                fullWidth
                label="Ubicación"
                {...register('location', { required: 'Ubicación requerida' })}
                error={!!errors.location}
                helperText={errors.location?.message}
            />
            <TextField
                margin="normal"
                fullWidth
                label="IP"
                {...register('ipAddress', { required: 'IP requerida' })}
                error={!!errors.ipAddress}
                helperText={errors.ipAddress?.message}
            />
            <TextField
                margin="normal"
                fullWidth
                label="MAC"
                {...register('macAddress', { required: 'MAC requerida' })}
                error={!!errors.macAddress}
                helperText={errors.macAddress?.message}
            />
            <TextField
                margin="normal"
                fullWidth
                label="Usuario registrador"
                {...register('registeredBy', { required: 'Usuario registrador requerido' })}
                error={!!errors.registeredBy}
                helperText={errors.registeredBy?.message}
            />
            <TextField
                margin="normal"
                fullWidth
                label="Estado"
                {...register('status', { required: 'Estado requerido' })}
                error={!!errors.status}
                helperText={errors.status?.message}
            />
        </form>
    );
}
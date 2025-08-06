import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { TextField } from '@mui/material';

export default function ScheduleForm({ onSubmit, defaultValues = {}, loading }) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues });

    useEffect(() => {
        if (Object.keys(defaultValues).length > 0) {
            reset(defaultValues);
        }
    }, [JSON.stringify(defaultValues)]);
    return (
        <form id="schedule-form" onSubmit={handleSubmit(onSubmit)}>
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
                label="Días"
                {...register('days', { required: 'Días requeridos' })}
                error={!!errors.days}
                helperText={errors.days?.message}
            />
            <TextField
                margin="normal"
                fullWidth
                label="Hora de inicio"
                {...register('startTime', { required: 'Hora de inicio requerida' })}
                error={!!errors.startTime}
                helperText={errors.startTime?.message}
            />
            <TextField
                margin="normal"
                fullWidth
                label="Hora de fin"
                {...register('endTime', { required: 'Hora de fin requerida' })}
                error={!!errors.endTime}
                helperText={errors.endTime?.message}
            />
            <TextField
                margin="normal"
                fullWidth
                label="Tolerancia (minutos)"
                {...register('toleranceMinutes', { required: 'Tolerancia requerida' })}
                error={!!errors.toleranceMinutes}
                helperText={errors.toleranceMinutes?.message}
            />
        </form>
    );
}
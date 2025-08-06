import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { TextField } from '@mui/material';

export default function PermissionForm({ onSubmit, defaultValues = {}, loading }) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues });

    useEffect(() => {
        if (Object.keys(defaultValues).length > 0) {
            reset(defaultValues);
        }
    }, [JSON.stringify(defaultValues)]);

    return (
        <form id="permission-form" onSubmit={handleSubmit(onSubmit)}>
            <TextField
                margin="normal"
                fullWidth
                label="Código"
                {...register('code', { required: 'Código requerido' })}
                error={!!errors.code}
                helperText={errors.code?.message}
            />
            <TextField
                margin="normal"
                fullWidth
                label="Descripción"
                {...register('description', { required: 'Descripción requerida' })}
                error={!!errors.description}
                helperText={errors.description?.message}
            />
        </form>
    );
}
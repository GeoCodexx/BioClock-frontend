import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { TextField } from '@mui/material';

export default function DepartmentForm({ onSubmit, defaultValues = {}, loading }) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues });


    useEffect(() => {
        if (Object.keys(defaultValues).length > 0) {
            reset(defaultValues);
        }
    }, [JSON.stringify(defaultValues)]);

    return (
        <form id="department-form" onSubmit={handleSubmit(onSubmit)}>
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
                label="Ubicación"
                {...register('location', { required: 'Ubicación requerida' })}
                error={!!errors.location}
                helperText={errors.location?.message}
            />
        </form>
    );
}
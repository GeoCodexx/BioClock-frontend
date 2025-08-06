import React from 'react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

export default function DepartmentTable({ departments, onEdit, onDelete }) {

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Nombre</TableCell>
                        <TableCell>Ubicación</TableCell>
                        <TableCell>Estado</TableCell>
                        <TableCell>Acciones</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {departments.map(department => (
                        <TableRow key={department._id}>
                            <TableCell>{department.name}</TableCell>
                            <TableCell>{department.location}</TableCell>
                            <TableCell>{department.status}</TableCell>
                            <TableCell>
                                <IconButton color="primary" size="small" onClick={() => onEdit && onEdit(department)}>
                                    <EditIcon />
                                </IconButton>
                                <IconButton color="error" size="small" onClick={() => onDelete && onDelete(department._id)}>
                                    <DeleteIcon />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
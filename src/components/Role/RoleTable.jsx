import React from 'react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

export default function RoleTable({ roles, onEdit, onDelete }) {
    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Nombre</TableCell>
                        <TableCell>Descripción</TableCell>
                        <TableCell>Permisos</TableCell>
                        <TableCell>Estado</TableCell>
                        <TableCell>Acciones</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {roles.map((role) => (
                        <TableRow key={role._id}>
                            <TableCell>{role.name}</TableCell>
                            <TableCell>{role.description}</TableCell>
                            <TableCell>
                                {Array.isArray(role.permissions)
                                    ? role.permissions.map((perm) =>
                                        typeof perm === 'object' && perm !== null
                                            ? perm.name
                                            : perm
                                    ).join(', ')
                                    : ''}
                            </TableCell>
                            <TableCell>{role.status}</TableCell>
                            <TableCell>
                                <IconButton color="primary" size="small" onClick={() => onEdit && onEdit(role)}>
                                    <EditIcon />
                                </IconButton>
                                <IconButton color="error" size="small" onClick={() => onDelete && onDelete(role._id)}>
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

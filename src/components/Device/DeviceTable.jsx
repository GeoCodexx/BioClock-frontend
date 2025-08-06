import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

export default function DeviceTable({ devices, onEdit, onDelete }) {

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>ID del dispositivo</TableCell>
                        <TableCell>Nombre del dispositivo</TableCell>
                        <TableCell>Ubicación</TableCell>
                        <TableCell>Estado</TableCell>
                        <TableCell>IP</TableCell>
                        <TableCell>MAC</TableCell>
                        <TableCell>Usuario registrador</TableCell>
                        <TableCell>Estado</TableCell>
                        <TableCell>Acciones</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {devices.map(device => (
                        <TableRow key={device._id}>
                            <TableCell>{device.deviceId}</TableCell>
                            <TableCell>{device.name}</TableCell>
                            <TableCell>{device.location}</TableCell>
                            <TableCell>{device.status}</TableCell>
                            <TableCell>{device.ipAddress}</TableCell>
                            <TableCell>{device.macAddress}</TableCell>
                            <TableCell>{device.registeredBy}</TableCell>
                            <TableCell>{device.status}</TableCell>
                            <TableCell>
                                <IconButton color="primary" size="small" onClick={() => onEdit && onEdit(device)}>
                                    <EditIcon />
                                </IconButton>
                                <IconButton color="error" size="small" onClick={() => onDelete && onDelete(device._id)}>
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
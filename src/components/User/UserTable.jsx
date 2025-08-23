import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

export default function UserTable({ users, onEdit, onDelete }) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nombre</TableCell>
            <TableCell>Apellido Paterno</TableCell>
            <TableCell>Apellido Materno</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Rol</TableCell>
            <TableCell>Departamento</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user._id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.firstSurname}</TableCell>
              <TableCell>{user.secondSurname}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.roleId?.name || ''}</TableCell>
              <TableCell>{user.departmentId?.name || ''}</TableCell>
              <TableCell>{user.status}</TableCell>
              <TableCell>
                <IconButton color="primary" size="small" onClick={() => onEdit && onEdit(user)}>
                  <EditIcon />
                </IconButton>
                <IconButton color="error" size="small" onClick={() => onDelete && onDelete(user._id)}>
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
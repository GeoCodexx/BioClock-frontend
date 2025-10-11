import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  useTheme,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function ScheduleTable({ schedules, onEdit, onDelete }) {
  const theme = useTheme();
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nombre</TableCell>
            <TableCell>Días</TableCell>
            <TableCell>Hora de inicio</TableCell>
            <TableCell>Hora de fin</TableCell>
            <TableCell>Tolerancia (minutos)</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {schedules.map((schedule) => (
            <TableRow key={schedule._id} hover>
              <TableCell>{schedule.name || "—"}</TableCell>
              <TableCell>{schedule.days || "—"}</TableCell>
              <TableCell>{schedule.startTime || "—"}</TableCell>
              <TableCell>{schedule.endTime || "—"}</TableCell>
              <TableCell>{schedule.toleranceMinutes || "—"}</TableCell>
              <TableCell>
                {schedule.status ? (
                  schedule.status === "active" ? (
                    <Chip
                      label={schedule.status}
                      // sx={{ bgColor: `${theme.palette.success.main}15` }}
                      sx={{
                        backgroundColor: `${theme.palette.success.main}15`,
                        color: theme.palette.success.main,
                      }}
                    />
                  ) : (
                    <Chip label={schedule.status} sx={{
                        backgroundColor: `${theme.palette.error.main}15`,
                        color: theme.palette.error.main,
                      }}/>
                  )
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell>
                <IconButton
                  color="primary"
                  size="small"
                  onClick={() => onEdit && onEdit(schedule)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  color="error"
                  size="small"
                  onClick={() => onDelete && onDelete(schedule._id)}
                >
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

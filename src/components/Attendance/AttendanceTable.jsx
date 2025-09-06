import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { format } from "date-fns";

export default function AttendanceTable({ attendances, onEdit, onDelete }) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Colaborador</TableCell>
            <TableCell>Dispositivo</TableCell>
            <TableCell>Fecha</TableCell>
            <TableCell>Tipo</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell>Horario</TableCell>
            <TableCell>Método</TableCell>
            <TableCell>Justificación</TableCell>
            <TableCell>Aprobador</TableCell>
            <TableCell>Notas</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {attendances.map((attendance) => (
            <TableRow key={attendance?._id}>
              <TableCell>{`${attendance?.userId?.name || "—"} ${
                attendance?.userId?.firstSurname || "—"
              } ${attendance?.userId?.secondSurname || "—"}`}</TableCell>
              <TableCell>{attendance?.deviceId?.name || "—"}</TableCell>
              <TableCell>{format(new Date(attendance?.timestamp), "dd/MM/yyyy HH:mm:ss")}</TableCell>
              <TableCell>
                {attendance?.type === "IN"
                  ? "Entrada"
                  : attendance?.type === "OUT"
                  ? "Salida"
                  : "—"}
              </TableCell>
              <TableCell>
                {attendance?.status === "on_time"
                  ? "A tiempo"
                  : attendance?.status === "late"
                  ? "Tarde"
                  : attendance?.status === "early_leave"
                  ? "Salida temprana"
                  : attendance?.status === "absent"
                  ? "Ausente"
                  : attendance?.status === "justified"
                  ? "Jusiificado"
                  : "—"}
              </TableCell>
              <TableCell>{attendance.scheduleId?.name || "—"}</TableCell>
              <TableCell>
                {attendance?.verificationMethod === "fingerprint"
                  ? "Huella dactilar"
                  : "—"}
              </TableCell>
              <TableCell>{attendance?.justification || "—"}</TableCell>
              <TableCell>{`${attendance?.aprovedBy?.name || "—"} ${
                attendance?.aprovedBy?.firstSurname || "—"
              } ${attendance?.aprovedBy?.secondSurname || "—"}`}</TableCell>
              <TableCell>{attendance?.notes || "—"}</TableCell>
              <TableCell>
                <IconButton
                  color="primary"
                  size="small"
                  onClick={() => onEdit && onEdit(attendance)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  color="error"
                  size="small"
                  onClick={() => onDelete && onDelete(attendance._id)}
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

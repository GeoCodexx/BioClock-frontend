import React from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Chip,
  Button,
  CircularProgress,
} from "@mui/material";

export default function FingerprintTable({ data, loading, onStatusChange }) {
  const statusColor = {
    pending: "warning",
    approved: "success",
    rejected: "error",
  };

  if (loading) {
    return (
      <TableContainer component={Paper} sx={{ p: 3, textAlign: "center" }}>
        <CircularProgress />
      </TableContainer>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Usuario</TableCell>
            <TableCell>DNI</TableCell>
            <TableCell>Dedo</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell>Aprobado por</TableCell>
            <TableCell>Fecha creación</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center">
                No hay registros
              </TableCell>
            </TableRow>
          ) : (
            data.map((tpl) => (
              <TableRow key={tpl._id}>
                <TableCell>
                  {tpl.userId
                    ? `${tpl.userId.name || ""} ${
                        tpl.userId.firstSurname || ""
                      } ${tpl.userId.secondSurname || ""}`.trim() || "—"
                    : "—"}
                </TableCell>
                {<TableCell>{tpl.userId?.dni || "—"}</TableCell>}
                <TableCell>{tpl.finger}</TableCell>
                <TableCell>
                  <Chip label={tpl.status} color={statusColor[tpl.status]} />
                </TableCell>
                <TableCell>
                  {tpl.approvedBy
                    ? `${tpl.approvedBy.name || ""} ${
                        tpl.approvedBy.firstSurname || ""
                      } ${tpl.approvedBy.secondSurname || ""}`.trim() || "—"
                    : "—"}
                </TableCell>
                <TableCell>
                  {new Date(tpl.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    color="success"
                    onClick={() => onStatusChange(tpl._id, "approved")}
                    disabled={tpl.status === "approved"}
                  >
                    Aprobar
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    sx={{ ml: 1 }}
                    onClick={() => onStatusChange(tpl._id, "rejected")}
                    disabled={tpl.status === "rejected"}
                  >
                    Rechazar
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

import { useState } from "react";
import { IconButton, Tooltip, Stack } from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import JustificationDrawer from "./JustificationDrawer";
import {
  createJustification,
  updateJustification,
  updateJustificationStatus,
} from "../../services/justificationService";

/*function buildFormData(fields, files = []) {
  const fd = new FormData();
  Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
  files.forEach((file) => fd.append("files", file));
  return fd;
}*/

export default function ActionCell({ row, onRefresh, schedules }) {
  const [drawer, setDrawer] = useState({ open: false, mode: "create" });

  const open = (mode) => setDrawer({ open: true, mode });
  const close = () => setDrawer((p) => ({ ...p, open: false }));

  const hasFiles = row.files?.length > 0;
  const isPending = row.status === "pending";


  return (
    <>
      <Stack direction="row" spacing={0.5}>
        {/* Editar — solo pendientes */}
        {isPending && (
          <Tooltip title="Editar">
            <IconButton size="small" onClick={() => open("edit")}>
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}

        {/* Aprobar — solo pendientes */}
        {isPending && (
          <Tooltip title="Aprobar">
            <IconButton
              size="small"
              color="success"
              onClick={() => open("approve")}
            >
              <CheckCircleOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}

        {/* Rechazar — solo pendientes */}
        {isPending && (
          <Tooltip title="Rechazar">
            <IconButton
              size="small"
              color="error"
              onClick={() => open("reject")}
            >
              <CancelOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}

        {/* Previsualizar archivos — si hay adjuntos */}
        {hasFiles && (
          <Tooltip title={`Ver archivos (${row.files.length})`}>
            <IconButton
              size="small"
              color="info"
              onClick={() => open("preview")}
            >
              <AttachFileIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Stack>

      <JustificationDrawer
        open={drawer.open}
        onClose={close}
        mode={drawer.mode}
        justification={row}
        schedules={schedules || []} // pasa tu lista de schedules
        users={[]} // pasa tu lista de users
        onSubmit={async (payload, files) => {
          if (drawer.mode === "create") {
            //const fd = buildFormData(payload, files);
            await createJustification(payload, files);
          } else if (drawer.mode === "edit") {
            //const fd = buildFormData(payload, files);
            await updateJustification(row._id, payload, files);
          } else if (drawer.mode === "approve" || drawer.mode === "reject") {
            await updateJustificationStatus(row._id, payload);
          }
          onRefresh(); // recarga la tabla
        }}
      />
    </>
  );
}

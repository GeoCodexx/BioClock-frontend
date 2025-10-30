import React, { memo } from "react";
import { TextField, MenuItem } from "@mui/material";

const AttendanceStatusFilter = memo(({ status, onStatusChange }) => {
  const statusOptions = [
    { value: "", label: "Todos los estados" },
    { value: "present", label: "Presente" },
    { value: "absent", label: "Ausente" },
    { value: "late", label: "Tarde" },
    { values: "early", label: "Temprano" },
    { value: "justified", label: "Justificado" },
  ];

  return (
    <TextField
      select
      label="Estado"
      value={status}
      onChange={(e) => onStatusChange(e.target.value)}
      size="small"
      fullWidth
    >
      {statusOptions.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
});

AttendanceStatusFilter.displayName = "AttendanceStatusFilter";

export default AttendanceStatusFilter;

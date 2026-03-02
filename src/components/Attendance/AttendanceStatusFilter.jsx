import { memo } from "react";
import { MenuItem, FormControl, InputLabel } from "@mui/material";
import { SafeSelect } from "../common/SafeSelect";

const AttendanceStatusFilter = memo(({ status, onStatusChange }) => {
  const statusOptions = [
    { value: "", label: "Todos los estados" },
    { value: "on_time", label: "A tiempo" },
    { value: "late", label: "Tardanza" },
    { value: "early", label: "Temprano" },
    { value: "early_exit", label: "Salida anticipada" },
  ];

  return (
    <FormControl fullWidth size="small">
      <InputLabel>Estado</InputLabel>
      <SafeSelect
        label="Estado"
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
      >
        <MenuItem value="">
          <em>Todos los estados</em>
        </MenuItem>
        {statusOptions.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </SafeSelect>
    </FormControl>
  );
});

AttendanceStatusFilter.displayName = "AttendanceStatusFilter";

export default AttendanceStatusFilter;

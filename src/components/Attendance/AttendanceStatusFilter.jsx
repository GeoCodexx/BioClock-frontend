import { memo } from "react";
import { MenuItem, FormControl, InputLabel } from "@mui/material";
import { SafeSelect } from "../common/SafeSelect";

const AttendanceStatusFilter = memo(({ status, onStatusChange }) => {
  const statusOptions = [
    //{ value: "", label: "Todos los estados" },
    { value: "present", label: "A tiempo" },
    { value: "absent", label: "Ausente" },
    { value: "late", label: "Tardanza" },
    { values: "early", label: "Temprano" },
    { values: "early_exit", label: "Salida anticipada" },
    { value: "justified", label: "Justificado" },
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

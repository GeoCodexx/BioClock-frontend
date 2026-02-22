import { memo } from "react";
import { MenuItem, FormControl, InputLabel } from "@mui/material";
import { SafeSelect } from "../common/SafeSelect";

const JustificationStatusFilter = memo(({ status, onStatusChange }) => {
  const statusOptions = [
    //{ value: "", label: "Todos los estados" },
    { value: "approved", label: "Aprobado" },
    { value: "pending", label: "Pendiente" },
    { value: "rejected", label: "Rechazado" },
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

JustificationStatusFilter.displayName = "JustificationStatusFilter";

export default JustificationStatusFilter;

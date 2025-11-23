import { memo } from "react";
import { FormControl, InputLabel, MenuItem } from "@mui/material";
import { SafeSelect } from "../common/SafeSelect";

const AttendanceTypeFilter = memo(({ type, onTypeChange }) => {
  const typeOptions = [
    //{ value: "", label: "Todos los tipos" },
    { value: "IN", label: "Entrada" },
    { value: "OUT", label: "Salida" },
    /*{ value: 'break', label: 'Descanso' },
    { value: 'meeting', label: 'Reunión' },*/
  ];

  return (
    <FormControl fullWidth size="small">
      <InputLabel>Tipo</InputLabel>
      <SafeSelect
        label="Tipo"
        value={type}
        onChange={(e) => onTypeChange(e.target.value)}
      >
        <MenuItem value="">
          <em>Todo</em>
        </MenuItem>
        {typeOptions.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </SafeSelect>
    </FormControl>
  );
});

AttendanceTypeFilter.displayName = "AttendanceTypeFilter";

export default AttendanceTypeFilter;

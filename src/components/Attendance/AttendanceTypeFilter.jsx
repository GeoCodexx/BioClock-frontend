import React, { memo } from 'react';
import { TextField, MenuItem } from '@mui/material';

const AttendanceTypeFilter = memo(({ type, onTypeChange }) => {
  const typeOptions = [
    { value: '', label: 'Todos los tipos' },
    { value: 'IN', label: 'Entrada' },
    { value: 'OUT', label: 'Salida' },
    /*{ value: 'break', label: 'Descanso' },
    { value: 'meeting', label: 'Reunión' },*/
  ];

  return (
    <TextField
      select
      label="Tipo"
      value={type}
      onChange={(e) => onTypeChange(e.target.value)}
      size="small"
      fullWidth
    >
      {typeOptions.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
});

AttendanceTypeFilter.displayName = 'AttendanceTypeFilter';

export default AttendanceTypeFilter;
import { FormControl, Select, MenuItem, InputAdornment } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";

export default function StatusFilter({ value, onChange }) {
  return (
    <FormControl size="small" sx={{ minWidth: 150 }}>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        displayEmpty
        startAdornment={
          <InputAdornment position="start">
            <FilterListIcon fontSize="small" />
          </InputAdornment>
        }
        sx={{
          "& .MuiSelect-select": {
            py: 1,
            display: "flex",
            alignItems: "center",
          },
        }}
      >
        <MenuItem value="">
          <em>Todos los estados</em>
        </MenuItem>
        <MenuItem value="pending">Pendiente</MenuItem>
        <MenuItem value="approved">Aprobado</MenuItem>
        <MenuItem value="rejected">Rechazado</MenuItem>
      </Select>
    </FormControl>
  );
}
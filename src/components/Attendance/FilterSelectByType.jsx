import { useMemo } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Box,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import CheckIcon from "@mui/icons-material/Check";

const filters = [
  { text: "Todos", value: "todos" },
  { text: "Entrada", value: "IN" },
  { text: "Salida", value: "OUT" },
];

export default function FilterSelectByType({ statusFilter, onFilterChange }) {
  const selectedFilter = useMemo(
    () => filters.find((f) => f.value === statusFilter) || filters[0],
    [statusFilter]
  );

  const handleChange = (event) => {
    onFilterChange(event.target.value);
  };

  return (
    <FormControl
      variant="outlined"
      size="small"
      sx={{
        minWidth: 200,
      }}
    >
      <InputLabel id="filter-select-label-type">Tipo</InputLabel>

      <Select
        labelId="filter-select-label-type"
        label = "Tipo"
        value={selectedFilter.value}
        onChange={handleChange}
        renderValue={(selected) => {
          const filter = filters.find((f) => f.value === selected);
          return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <FilterListIcon fontSize="small" />
              {filter ? filter.text : ""}
            </Box>
          );
        }}
      >
        {filters.map((filter) => (
          <MenuItem key={filter.value} value={filter.value}>
            <ListItemText primary={filter.text} />
            {selectedFilter.value === filter.value && (
              <ListItemIcon>
                <CheckIcon color="primary" />
              </ListItemIcon>
            )}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

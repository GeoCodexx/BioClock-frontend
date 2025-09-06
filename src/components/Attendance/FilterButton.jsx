import React, { useState } from "react";
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import CheckIcon from "@mui/icons-material/Check";

const filters = [
  { text: "Todos", value: "todos" },
  { text: "A tiempo", value: "on_time" },
  { text: "Tarde", value: "late" },
  { text: "Justificado", value: "justified" },
  { text: "Salida temprana", value: "early_leave" },
  { text: "Ausente", value: "absent" },
];

export default function FilterButton({ statusFilter, onFilterChange }) {
  const [anchorEl, setAnchorEl] = useState(null);
  //const [selectedFilter, setSelectedFilter] = useState(filters[0]); // Por defecto "Todos"
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (filter) => {
    setAnchorEl(null);
    if (filter) {
      onFilterChange(filter.value); // Mandamos el valor al padre para consultar el backend
    }
  };

  const selectedFilter =
    filters.find((f) => f.value === statusFilter) || filters[0];

  //  console.log("Despues: ", selectedFilter);

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<FilterListIcon />}
        onClick={handleClick}
        sx={{
          textTransform: "none",
          //borderRadius: "12px",
          padding: "6px 16px",
          fontWeight: "bold",
        }}
      >
        {selectedFilter.text}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => handleClose()}
        PaperProps={{
          sx: {
            borderRadius: "12px",
            minWidth: 180,
            boxShadow: 4,
          },
        }}
      >
        {filters.map((filter) => (
          <MenuItem
            key={filter.value}
            onClick={() => handleClose(filter)}
            selected={selectedFilter.value === filter.value}
          >
            <ListItemText primary={filter.text} />
            {selectedFilter.value === filter.value && (
              <ListItemIcon>
                <CheckIcon color="primary" />
              </ListItemIcon>
            )}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

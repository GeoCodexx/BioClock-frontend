// import { useState } from "react";
// import {
//   Button,
//   Menu,
//   MenuItem,
//   ListItemIcon,
//   ListItemText,
// } from "@mui/material";
// import FilterListIcon from "@mui/icons-material/FilterList";
// import CheckIcon from "@mui/icons-material/Check";

// const filters = [
//   { text: "Todos", value: "todos" },
//   { text: "A tiempo", value: "on_time" },
//   { text: "Tarde", value: "late" },
//   { text: "Justificado", value: "justified" },
//   { text: "Salida temprana", value: "early_leave" },
//   { text: "Ausente", value: "absent" },
// ];

// export default function FilterButton({ statusFilter, onFilterChange }) {
//   const [anchorEl, setAnchorEl] = useState(null);
//   const open = Boolean(anchorEl);

//   const handleClick = (event) => {
//     setAnchorEl(event.currentTarget);
//   };

//   const handleClose = (filter) => {
//     setAnchorEl(null);
//     if (filter) {
//       onFilterChange(filter.value); // Mandamos el valor al padre para consultar el backend
//     }
//   };

//   const selectedFilter =
//     filters.find((f) => f.value === statusFilter) || filters[0];

//   //  console.log("Despues: ", selectedFilter);

//   return (
//     <>
//       <Button
//         variant="outlined"
//         startIcon={<FilterListIcon />}
//         onClick={handleClick}
//         sx={{
//           textTransform: "none",
//           //borderRadius: "12px",
//           padding: "6px 16px",
//           fontWeight: "bold",
//         }}
//       >
//         {selectedFilter.text}
//       </Button>

//       <Menu
//         anchorEl={anchorEl}
//         open={open}
//         onClose={() => handleClose()}
//         PaperProps={{
//           sx: {
//             borderRadius: "12px",
//             minWidth: 180,
//             boxShadow: 4,
//           },
//         }}
//       >
//         {filters.map((filter) => (
//           <MenuItem
//             key={filter.value}
//             onClick={() => handleClose(filter)}
//             selected={selectedFilter.value === filter.value}
//           >
//             <ListItemText primary={filter.text} />
//             {selectedFilter.value === filter.value && (
//               <ListItemIcon>
//                 <CheckIcon color="primary" />
//               </ListItemIcon>
//             )}
//           </MenuItem>
//         ))}
//       </Menu>
//     </>
//   );
// }

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
  { text: "A tiempo", value: "on_time" },
  { text: "Tarde", value: "late" },
  { text: "Justificado", value: "justified" },
  { text: "Salida temprana", value: "early_leave" },
  { text: "Ausente", value: "absent" },
];

export default function FilterSelectByStatus({ statusFilter, onFilterChange }) {
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
      <InputLabel
        id="filter-select-label"
      >
        Estado
      </InputLabel>

      <Select
        labelId="filter-select-label"
        label= "Estado"
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

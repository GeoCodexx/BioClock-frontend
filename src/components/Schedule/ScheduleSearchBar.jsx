import { Box, TextField, Button } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";

export default function ScheduleSearchBar({
  searchInput,
  setSearchInput,
  onSearch,
}) {
  return (
    <Box component="form" onSubmit={onSearch} sx={{ display: "flex", gap: 2 }}>
      <TextField
        label="Buscar horario"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        size="small"
      />
      <Button type="submit" variant="outlined">
        Buscar
      </Button>
    </Box>
  );
}

import { Box, TextField, Button, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
//import { Add as AddIcon } from '@mui/icons-material';

export default function AttendanceSearchBar({
  searchInput,
  setSearchInput,
  onSearch,
}) {
  return (
    <Box
      component="form"
      onSubmit={onSearch}
      sx={{ display: "flex", gap: 2, mb: 2 }}
    >
      <TextField
        label="Buscar asistencia"
        placeholder="Nombres o Apellidos..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        size="small"
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon />
              </InputAdornment>
            ),
          },
        }}
      />
      {/* <Button type="submit" variant="outlined">
        Buscar
      </Button> */}
    </Box>
  );
}

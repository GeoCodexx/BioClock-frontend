/*import { Box, TextField, InputAdornment } from "@mui/material";
import { Search } from "@mui/icons-material";

export default function ScheduleSearchBar({
  searchInput,
  setSearchInput,
  onSearch,
}) {
  return (
    <Box component="form" onSubmit={onSearch} sx={{ display: "flex", gap: 2 }}>
      <TextField
        fullWidth
        label="Buscar"
        size="small"
        placeholder="Nombre de horario"
        value={searchInput}
        type="search"
        onChange={(e) => setSearchInput(e.target.value)}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <Search />
              </InputAdornment>
            ),
          },
        }}
      />
    </Box>
  );
}*/

// ScheduleSearchBar.jsx - Versión optimizada y responsive
import { 
  Box, 
  TextField, 
  InputAdornment, 
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Search, Clear } from "@mui/icons-material";

export default function ScheduleSearchBar({
  searchInput,
  setSearchInput,
  onSearch,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleClear = () => {
    setSearchInput("");
  };

  return (
    <Box 
      component="form" 
      onSubmit={onSearch} 
      sx={{ width: "100%" }}
    >
      <TextField
        fullWidth
        label={isMobile ? "Buscar" : "Buscar horarios"}
        size="small"
        placeholder={isMobile ? "Nombre..." : "Buscar por nombre de horario"}
        value={searchInput}
        //type="search"
        onChange={(e) => setSearchInput(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: searchInput && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={handleClear}
                  edge="end"
                  sx={{
                    "&:hover": {
                      bgcolor: theme.palette.action.hover,
                    },
                  }}
                >
                  <Clear fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            bgcolor: theme.palette.background.paper,
            transition: "all 0.2s ease",
            "&:hover": {
              bgcolor: theme.palette.action.hover,
            },
            "&.Mui-focused": {
              bgcolor: theme.palette.background.paper,
              "& .MuiOutlinedInput-notchedOutline": {
                borderWidth: 2,
              },
            },
          },
        }}
      />
    </Box>
  );
}

import { 
  Box, 
  TextField, 
  InputAdornment, 
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Search, Clear } from "@mui/icons-material";

export default function DeviceSearchBar({
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
        label={isMobile ? "Buscar" : "Buscar dispositivos"}
        size="small"
        placeholder={isMobile ? "Nombre..." : "Buscar por nombre"}
        value={searchInput}
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

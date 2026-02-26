import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Search, Clear } from "@mui/icons-material";

export default function JustificationSearchBar({
  searchInput,
  setSearchInput,
  onSearch,
  handleCloseSearchBar = null,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleClear = () => {
    if (handleCloseSearchBar) {
      handleCloseSearchBar();
      setSearchInput("");
    } else {
      setSearchInput("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape" && searchInput) {
      setSearchInput("");
    }
  };

  return (
    <Box component="form" onSubmit={onSearch} sx={{ width: "100%" }}>
      <TextField
        fullWidth
        label="Buscar por usuario"
        size="small"
        placeholder={isMobile ? "Usuario..." : "Buscar por nombres o apellidos"}
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onKeyDown={handleKeyDown}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: isMobile ? (
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
            ) : (
              searchInput && (
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
              )
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

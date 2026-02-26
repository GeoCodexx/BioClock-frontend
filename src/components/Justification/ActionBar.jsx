import { Stack, IconButton, Tooltip, Paper, Badge } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import ExportButtons from "./ExportButtons";
import { TextField, InputAdornment, Collapse } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";
import JustificationSearchBar from "./JustificationSearchBar";

export default function ActionBar({
  searchInput,
  setSearchInput,
  onSearch,
  onFilterClick,
  exportFilters,
  isDisabled,
  numberOfActiveFilters = 0,
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const handleClose = () => {
    setSearchOpen(false);
  };

  return (
    <Paper
      elevation={1}
      sx={{
        px: 2,
        py: 1,
        borderRadius: 3,
        mb: 1,
      }}
    >
      <Collapse in={searchOpen} timeout="auto" unmountOnExit>
        <JustificationSearchBar
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          onSearch={onSearch}
          handleCloseSearchBar={handleClose}
        />
        {/* <TextField
          fullWidth
          size="small"
          autoFocus
          placeholder="Buscar por usuario..."
          value={searchValue}
          onChange={(e) => onSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && handleClose()}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleClose} size="small">
                  <CloseIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        /> */}
      </Collapse>

      {!searchOpen && (
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ width: "100%" }}
        >
          <Tooltip title="Buscar">
            <IconButton onClick={() => setSearchOpen(true)}>
              <SearchIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Filtros">
            <IconButton
              onClick={onFilterClick}
              sx={{
                color:
                  numberOfActiveFilters > 0 ? "primary.main" : "text.secondary",
              }}
            >
              <Badge
                badgeContent={numberOfActiveFilters}
                color="primary"
                overlap="circular"
              >
                <TuneIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <ExportButtons
            filters={exportFilters}
            isDisabled={isDisabled}
            variant="mobile"
          />
        </Stack>
      )}
    </Paper>
  );
}

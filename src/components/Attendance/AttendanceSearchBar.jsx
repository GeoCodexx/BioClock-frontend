import { TextField, IconButton, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { useImperativeHandle, useState } from "react";

export default function AttendanceSearchBar({ onSearch, ref }) {
  const [localInput, setLocalInput] = useState("");

  // Expone métodos al padre
  useImperativeHandle(ref, () => ({
    getValue: () => localInput, // padre puede leer valor
    clear: () => setLocalInput(""), // padre puede limpiar
  }));

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onSearch(localInput);
    }
    if (e.key === "Escape") {
      setLocalInput("");
      onSearch("");
    }
  };
  return (
    <TextField
      label="Buscar asistencia"
      placeholder="Búsqueda por nombre, apellido o DNI"
      value={localInput}
      onChange={(e) => setLocalInput(e.target.value)}
      onKeyDown={handleKeyDown}
      size="small"
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              {localInput ? (
                <IconButton
                  aria-label="clear"
                  onClick={() => {
                    setLocalInput("");
                    onSearch("");
                  }}
                  edge="end"
                  size="small"
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              ) : (
                <SearchIcon />
              )}
            </InputAdornment>
          ),
        },
      }}
      sx={{ width: "100%" }}
    />
  );
}

// import { Box, TextField, IconButton, InputAdornment } from "@mui/material";
// import SearchIcon from "@mui/icons-material/Search";
// import ClearIcon from "@mui/icons-material/Clear";
// import { useEffect } from "react";

// export default function AttendanceSearchBar({
//   searchInput,
//   setSearchInput,
//   onSearch,
//   handleClear,
// }) {
//   //const [searchInput, setSearchInput] = useState("");

//   // Manejar tecla ESC para limpiar input
//   useEffect(() => {
//     const handleKeyDown = (e) => {
//       if (e.key === "Escape" && searchInput) {
//         setSearchInput("");
//       }
//     };

//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, [searchInput]);

//   /*const handleClear = () => {
//     setSearchInput("");
//   };*/

//   return (
//     <>
//       <TextField
//         label="Buscar asistencia"
//         placeholder="Búsqueda por nombre, apellido o dni"
//         value={searchInput}
//         onChange={(e) => setSearchInput(e.target.value)}
//         size="small"
//         slotProps={{
//           input: {
//             endAdornment: (
//               <InputAdornment position="end">
//                 {/* Mostrar X si hay texto */}
//                 {searchInput ? (
//                   <IconButton
//                     aria-label="clear"
//                     onClick={handleClear()}
//                     edge="end"
//                     size="small"
//                   >
//                     <ClearIcon fontSize="small" />
//                   </IconButton>
//                 ) : (
//                   <SearchIcon />
//                 )}
//               </InputAdornment>
//             ),
//           },
//         }}
//         sx={{ width: "100%" }}
//       />
//     </>
//   );
// }

import { Box, TextField, IconButton, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { useEffect } from "react";

export default function AttendanceSearchBar({
  searchInput,
  setSearchInput,
  onSearch, // 🔧 Recibe función para ejecutar búsqueda
  handleClear, // 🔧 Función para limpiar input
}) {
  // 🔧 Manejar tecla ESC para limpiar input y tecla ENTER para buscar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && searchInput) {
        handleClear(); // 🔧 Limpia
      } else if (e.key === "Enter") {
        onSearch(); // 🔧 Busca
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchInput, handleClear, onSearch]); // 🔧 Dependencias completas

  return (
    <TextField
      label="Buscar asistencia"
      placeholder="Búsqueda por nombre, apellido o DNI"
      value={searchInput}
      onChange={(e) => setSearchInput(e.target.value)}
      size="small"
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            {/* 🔧 Mostrar botón "X" si hay texto */}
            {searchInput ? (
              <IconButton
                aria-label="clear"
                onClick={handleClear} // 🔧 Corregido: no ejecutamos directamente
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
      }}
      sx={{ width: "100%" }}
    />
  );
}

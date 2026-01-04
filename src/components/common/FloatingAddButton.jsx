import { Fab, useMediaQuery } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useTheme } from "@mui/material/styles";

export default function FloatingAddButton({ onClick }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!isMobile) return null; // Oculta el botón en escritorio

  return (
    <Fab
      color="primary"
      aria-label="add"
      onClick={onClick}
      sx={{
        position: "fixed",
        bottom: theme.spacing(3),
        right: theme.spacing(3),
        boxShadow: 4,
        zIndex: 1200,
      }}
    >
      <AddIcon />
    </Fab>
  );
}

import { Box, CircularProgress } from "@mui/material";
import { memo } from "react";

// Componente LoadingOverlay memorizado
const LoadingOverlay = memo(({ show }) => {
  if (!show) return null;

  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: (theme) =>
          theme.palette.mode === "light"
            ? "rgba(255, 255, 255, 0.7)"
            : "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
      }}
    >
      <CircularProgress size={40} />
    </Box>
  );
});

export default LoadingOverlay;

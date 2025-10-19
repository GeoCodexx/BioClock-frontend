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
        bgcolor: "rgba(255, 255, 255, 0.7)",
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
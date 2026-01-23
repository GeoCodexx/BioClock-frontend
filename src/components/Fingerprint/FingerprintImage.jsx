import { Box, Chip, Paper, Skeleton, Typography, useTheme, CircularProgress, Alert } from "@mui/material";
import { Fingerprint, CheckCircle } from '@mui/icons-material';
import useSecureBiometricImage from "../../hooks/useSecureBiometricImage";

const FingerprintImage = ({
  templateId,
  finger,
  label,
  token,
  visible,
  onImageError,
  onAccessLog,
}) => {
  const theme = useTheme();
  
  const apiUrl = `http://192.168.1.72:4000/biometric-templates/image/${templateId}/${finger}`;

  const { imageData, loading, error, progress } = useSecureBiometricImage(
    apiUrl,
    token,
    {
      autoRevoke: true,
      revokeDelay: 30000,
      onAccessLog,
      enabled: visible,
    }
  );

  // ✅ Notificar errores al padre
  if (error && onImageError) {
    onImageError(error);
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 8px 24px rgba(99, 102, 241, 0.15)"
              : "0 8px 24px rgba(0, 0, 0, 0.08)",
          transform: "translateY(-2px)",
        },
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Chip
          icon={<Fingerprint />}
          label={label}
          color="primary"
          variant="outlined"
          size="small"
          sx={{ fontWeight: 600 }}
        />
        {imageData && (
          <Chip
            icon={<CheckCircle />}
            label="Cargada"
            color="success"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        )}
      </Box>

      {/* Contenedor de imagen */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          paddingTop: "100%", // Aspect ratio 1:1
          borderRadius: 2,
          overflow: "hidden",
          bgcolor:
            theme.palette.mode === "dark"
              ? "rgba(255, 255, 255, 0.05)"
              : "rgba(0, 0, 0, 0.02)",
          border: `2px dashed ${theme.palette.divider}`,
        }}
      >
        {/* Loading state */}
        {loading && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
            }}
          >
            <CircularProgress size={40} />
            <Typography variant="caption" color="text.secondary">
              Cargando huella... {progress}%
            </Typography>
            <Box sx={{ width: "80%", bgcolor: "grey.300", borderRadius: 1, height: 8 }}>
              <Box
                sx={{
                  width: `${progress}%`,
                  bgcolor: "primary.main",
                  height: "100%",
                  borderRadius: 1,
                  transition: "width 0.3s ease",
                }}
              />
            </Box>
          </Box>
        )}

        {/* Error state */}
        {error && !loading && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 2,
            }}
          >
            <Alert severity="error" sx={{ width: "100%" }}>
              {error}
            </Alert>
          </Box>
        )}

        {/* Imagen */}
        {imageData && !loading && !error && (
          <img
            src={imageData}
            alt={`Huella ${label}`}
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
              padding: "8px",
              display: "block", // ✅ CORREGIDO: Siempre visible cuando imageData existe
            }}
          />
        )}

        {/* Empty state */}
        {!imageData && !loading && !error && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
            }}
          >
            <Fingerprint sx={{ fontSize: 48, color: "grey.400", opacity: 0.3 }} />
            <Typography variant="caption" color="text.secondary">
              Esperando...
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default FingerprintImage;
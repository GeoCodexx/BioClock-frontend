// src/components/Logo/LogoUploader.jsx
import { useRef } from "react";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Button,
  CircularProgress,
  Alert,
  Collapse,
  alpha,
  useTheme,
} from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import UploadIcon from "@mui/icons-material/Upload";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import UndoIcon from "@mui/icons-material/Undo";

import { useLogoContext } from "../../contexts/LogoContext";

/**
 * Componente autocontenido: lee y escribe el LogoContext directamente.
 * No necesita props.
 */
const LogoUploader = () => {
  const theme = useTheme();
  const inputRef = useRef(null);
  const {
    previewUrl,
    hasPendingChanges,
    loading,
    error,
    selectLogo,
    markLogoForRemoval,
    discardChanges,
    saveChanges,
  } = useLogoContext();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Validar tamaño (2 MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("El archivo supera el límite de 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => selectLogo(ev.target.result, file);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <Box sx={{ px: 1.5, pb: 1.25 }}>
      {/* Label */}
      <Typography
        variant="caption"
        sx={{
          color: theme.palette.text.disabled,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          display: "block",
          mb: 1,
          pl: 0.5,
        }}
      >
        Logo del Sistema
      </Typography>

      {/* Drop zone / preview row */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          p: 1.25,
          borderRadius: 2,
          border: `1px dashed ${
            hasPendingChanges
              ? theme.palette.warning.main
              : alpha(theme.palette.divider, 0.5)
          }`,
          bgcolor: hasPendingChanges
            ? alpha(theme.palette.warning.main, 0.04)
            : alpha(theme.palette.action.hover, 0.3),
          transition: "all 0.2s ease",
          "&:hover": {
            borderColor: theme.palette.primary.main,
            bgcolor: alpha(theme.palette.primary.main, 0.04),
          },
        }}
      >
        {/* Thumbnail */}
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 1.5,
            overflow: "hidden",
            border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
            bgcolor: theme.palette.background.default,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {previewUrl ? (
            <Box
              component="img"
              src={previewUrl}
              alt="logo preview"
              sx={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          ) : (
            <ImageIcon sx={{ fontSize: 18, color: theme.palette.text.disabled }} />
          )}
        </Box>

        {/* Info */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="caption"
            sx={{
              color: hasPendingChanges
                ? theme.palette.warning.dark
                : theme.palette.text.secondary,
              display: "block",
              fontSize: "0.75rem",
              fontWeight: hasPendingChanges ? 600 : 400,
            }}
          >
            {hasPendingChanges ? "Cambios sin guardar" : previewUrl ? "Logo activo" : "Sin logo"}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: theme.palette.text.disabled, fontSize: "0.65rem" }}
          >
            PNG, SVG · Máx 2 MB
          </Typography>
        </Box>

        {/* Action buttons */}
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Tooltip title="Subir logo" arrow>
            <IconButton
              size="small"
              onClick={() => inputRef.current?.click()}
              disabled={loading}
              sx={{
                width: 28,
                height: 28,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.2) },
              }}
            >
              <UploadIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>

          {previewUrl && (
            <Tooltip title="Eliminar logo" arrow>
              <IconButton
                size="small"
                onClick={markLogoForRemoval}
                disabled={loading}
                sx={{
                  width: 28,
                  height: 28,
                  bgcolor: alpha(theme.palette.error.main, 0.08),
                  color: theme.palette.error.main,
                  "&:hover": { bgcolor: alpha(theme.palette.error.main, 0.15) },
                }}
              >
                <DeleteOutlineIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Error */}
      <Collapse in={!!error}>
        <Alert
          severity="error"
          sx={{ mt: 1, py: 0, fontSize: "0.72rem", borderRadius: 1.5 }}
        >
          {error}
        </Alert>
      </Collapse>

      {/* Save / Discard — solo visible si hay cambios pendientes */}
      <Collapse in={hasPendingChanges}>
        <Box sx={{ display: "flex", gap: 0.75, mt: 1 }}>
          <Button
            size="small"
            variant="contained"
            startIcon={
              loading ? (
                <CircularProgress size={12} color="inherit" />
              ) : (
                <SaveOutlinedIcon sx={{ fontSize: 14 }} />
              )
            }
            onClick={saveChanges}
            disabled={loading}
            sx={{
              flex: 1,
              py: 0.5,
              fontSize: "0.75rem",
              fontWeight: 600,
              textTransform: "none",
              borderRadius: 1.5,
              boxShadow: "none",
              "&:hover": { boxShadow: "none" },
            }}
          >
            {loading ? "Guardando…" : "Guardar"}
          </Button>

          <Tooltip title="Descartar cambios" arrow>
            <IconButton
              size="small"
              onClick={discardChanges}
              disabled={loading}
              sx={{
                width: 30,
                height: 30,
                bgcolor: alpha(theme.palette.action.hover, 0.6),
                "&:hover": { bgcolor: alpha(theme.palette.divider, 0.4) },
              }}
            >
              <UndoIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Collapse>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/svg+xml,image/jpeg,image/webp"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </Box>
  );
};

export default LogoUploader;
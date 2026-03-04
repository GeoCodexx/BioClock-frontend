// src/components/Logo/LogoUploaderDialog.jsx
import { useState, useRef, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Collapse,
  Chip,
  Divider,
  useTheme,
  useMediaQuery,
  alpha,
  Fade,
  Zoom,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import UndoIcon from "@mui/icons-material/Undo";
import ImageSearchIcon from "@mui/icons-material/ImageSearch";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import BrokenImageIcon from "@mui/icons-material/BrokenImage";

import { useLogoContext } from "../../contexts/LogoContext";

// ─── Constantes ───────────────────────────────────────────────────────────────
const MAX_SIZE_MB = 2;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const ALLOWED_MIMES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
];
const ALLOWED_LABEL = "PNG, JPEG, WebP, SVG";

const LOGO_RECOMMENDATIONS = [
  { label: "Resolución sugerida", value: "200 × 60 px", icon: "📐" },
  { label: "Formato óptimo", value: "SVG o PNG", icon: "🖼️" },
  { label: "Fondo", value: "Transparente", icon: "✨" },
  { label: "Tamaño máximo", value: `${MAX_SIZE_MB} MB`, icon: "⚖️" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatBytes = (bytes) => {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const validateFile = (file) => {
  if (!ALLOWED_MIMES.includes(file.type))
    return `Formato no permitido. Solo ${ALLOWED_LABEL}.`;
  if (file.size > MAX_SIZE_BYTES)
    return `El archivo supera el límite de ${MAX_SIZE_MB} MB (${formatBytes(file.size)}).`;
  return null;
};

// ─── LogoPreview ──────────────────────────────────────────────────────────────
const LogoPreview = ({ src, removed }) => {
  const theme = useTheme();
  const [imgError, setImgError] = useState(false);

  // Reset error cuando cambia la src
  const prevSrc = useRef(src);
  if (prevSrc.current !== src) {
    prevSrc.current = src;
    if (imgError) setImgError(false);
  }

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: 160,
        borderRadius: 3,
        overflow: "hidden",
        border: `1.5px solid ${alpha(theme.palette.divider, 0.2)}`,
        bgcolor:
          theme.palette.mode === "dark"
            ? alpha("#fff", 0.03)
            : alpha("#000", 0.02),
        // Patrón tablero de ajedrez para fondo transparente
        backgroundImage: `
          linear-gradient(45deg, ${alpha(theme.palette.divider, 0.08)} 25%, transparent 25%),
          linear-gradient(-45deg, ${alpha(theme.palette.divider, 0.08)} 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, ${alpha(theme.palette.divider, 0.08)} 75%),
          linear-gradient(-45deg, transparent 75%, ${alpha(theme.palette.divider, 0.08)} 75%)
        `,
        backgroundSize: "16px 16px",
        backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.3s ease",
      }}
    >
      {removed ? (
        <Fade in>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
              opacity: 0.4,
            }}
          >
            <BrokenImageIcon
              sx={{ fontSize: 40, color: theme.palette.error.main }}
            />
            <Typography variant="caption" color="error">
              Logo eliminado
            </Typography>
          </Box>
        </Fade>
      ) : src && !imgError ? (
        <Fade in key={src}>
          <Box
            component="img"
            src={src}
            alt="Vista previa del logo"
            onError={() => setImgError(true)}
            sx={{
              maxWidth: "80%",
              maxHeight: "80%",
              objectFit: "contain",
              filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.15))",
              transition: "all 0.3s ease",
            }}
          />
        </Fade>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
            opacity: 0.35,
          }}
        >
          <ImageSearchIcon
            sx={{ fontSize: 44, color: theme.palette.text.secondary }}
          />
          <Typography variant="caption" color="text.secondary">
            Sin logo configurado
          </Typography>
        </Box>
      )}
    </Box>
  );
};

// ─── DropZone ─────────────────────────────────────────────────────────────────
const DropZone = ({ onFile, disabled }) => {
  const theme = useTheme();
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState(null);

  const processFile = useCallback(
    (file) => {
      setLocalError(null);
      const err = validateFile(file);
      if (err) {
        setLocalError(err);
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => onFile(ev.target.result, file);
      reader.readAsDataURL(file);
    },
    [onFile],
  );

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  return (
    <Box>
      <Box
        onDragEnter={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragging(false);
        }}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        sx={{
          position: "relative",
          width: "100%",
          minHeight: 110,
          borderRadius: 2.5,
          border: `2px dashed ${
            dragging
              ? theme.palette.primary.main
              : localError
                ? theme.palette.error.main
                : alpha(theme.palette.divider, 0.5)
          }`,
          bgcolor: dragging
            ? alpha(theme.palette.primary.main, 0.06)
            : localError
              ? alpha(theme.palette.error.main, 0.04)
              : theme.palette.background.paper,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          cursor: disabled ? "not-allowed" : "pointer",
          transition: "all 0.22s ease",
          userSelect: "none",
          "&:hover": !disabled
            ? {
                borderColor: theme.palette.primary.main,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
              }
            : {},
        }}
      >
        <Zoom in={dragging} style={{ position: "absolute" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <UploadFileIcon
              sx={{ fontSize: 36, color: theme.palette.primary.main }}
            />
            <Typography variant="body2" color="primary" fontWeight={600}>
              Suelta aquí
            </Typography>
          </Box>
        </Zoom>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0.75,
            opacity: dragging ? 0 : 1,
            transition: "opacity 0.2s",
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <UploadFileIcon
              sx={{ fontSize: 22, color: theme.palette.primary.main }}
            />
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" fontWeight={600} color="text.primary">
              Arrastra tu logo aquí
            </Typography>
            <Typography variant="caption" color="text.secondary">
              o{" "}
              <Box
                component="span"
                sx={{
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                  textDecoration: "underline",
                }}
              >
                haz clic para seleccionar
              </Box>
            </Typography>
          </Box>
          <Typography variant="caption" color="text.disabled">
            {ALLOWED_LABEL} · Máx. {MAX_SIZE_MB} MB
          </Typography>
        </Box>
      </Box>

      <Collapse in={!!localError}>
        <Alert
          severity="error"
          sx={{ mt: 1, py: 0.25, borderRadius: 1.5, fontSize: "0.78rem" }}
        >
          {localError}
        </Alert>
      </Collapse>

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_MIMES.join(",")}
        style={{ display: "none" }}
        onChange={handleChange}
      />
    </Box>
  );
};

// ─── LogoUploaderDialog ───────────────────────────────────────────────────────
/**
 * @param {object}   props
 * @param {boolean}  props.open
 * @param {function} props.onClose
 */
const LogoUploaderDialog = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const mobileInputRef = useRef(null);

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

  // Detectar si el pending es una eliminación (previewUrl === null y hasPendingChanges)
  const isPendingRemoval = hasPendingChanges && !previewUrl;

  const handleSave = async () => {
    await saveChanges();
    if (!error) onClose();
  };

  const handleDiscard = () => {
    discardChanges();
  };

  const handleClose = () => {
    if (loading) return;
    discardChanges();
    onClose();
  };

  const handleMobileFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateFile(file);
    if (err) {
      alert(err);
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => selectLogo(ev.target.result, file);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 200 }}
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: isMobile ? 0 : 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
          boxShadow: `0 24px 64px ${alpha(theme.palette.common.black, 0.18)}`,
          overflow: "hidden",
        },
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <DialogTitle
        sx={{
          px: 3,
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          background: `linear-gradient(135deg,
            ${alpha(theme.palette.primary.main, 0.06)} 0%,
            ${alpha(theme.palette.background.paper, 0)} 100%)`,
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={700} fontSize="1rem">
            Logo del Sistema
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Imagen que representa tu organización en toda la app
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          disabled={loading}
          size="small"
          sx={{
            color: theme.palette.text.secondary,
            "&:hover": { bgcolor: alpha(theme.palette.divider, 0.3) },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <DialogContent
        sx={{
          px: 3,
          py: 2.5,
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
        }}
      >
        {/* Vista previa */}
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Typography
              variant="caption"
              fontWeight={700}
              color="text.disabled"
              sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
            >
              Vista previa
            </Typography>
            {hasPendingChanges && (
              <Chip
                label={isPendingRemoval ? "Se eliminará" : "Cambio pendiente"}
                size="small"
                color={isPendingRemoval ? "error" : "warning"}
                variant="outlined"
                sx={{
                  height: 20,
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  "& .MuiChip-label": { px: 1 },
                }}
              />
            )}
          </Box>
          <LogoPreview src={previewUrl} removed={isPendingRemoval} />

          {/* Acciones sobre el logo actual */}
          {previewUrl && !isPendingRemoval && (
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
              <Tooltip title="Eliminar logo actual" arrow>
                <Button
                  size="small"
                  color="error"
                  variant="text"
                  startIcon={<DeleteOutlineIcon sx={{ fontSize: 15 }} />}
                  onClick={markLogoForRemoval}
                  disabled={loading}
                  sx={{ fontSize: "0.75rem", textTransform: "none", py: 0.25 }}
                >
                  Eliminar logo
                </Button>
              </Tooltip>
            </Box>
          )}
        </Box>

        <Divider sx={{ borderColor: alpha(theme.palette.divider, 0.12) }} />

        {/* Zona de carga */}
        <Box>
          <Typography
            variant="caption"
            fontWeight={700}
            color="text.disabled"
            sx={{
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              display: "block",
              mb: 1.25,
            }}
          >
            {hasPendingChanges && !isPendingRemoval
              ? "Cambiar imagen"
              : "Cargar imagen"}
          </Typography>

          {isMobile ? (
            // Mobile: botón simple
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Button
                variant="outlined"
                startIcon={<UploadFileIcon />}
                onClick={() => mobileInputRef.current?.click()}
                disabled={loading}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  borderColor: alpha(theme.palette.primary.main, 0.4),
                  "&:hover": {
                    borderColor: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                  },
                }}
              >
                Seleccionar imagen
              </Button>
              <input
                ref={mobileInputRef}
                type="file"
                accept={ALLOWED_MIMES.join(",")}
                style={{ display: "none" }}
                onChange={handleMobileFile}
              />
            </Box>
          ) : (
            // Desktop: drag & drop
            <DropZone onFile={selectLogo} disabled={loading} />
          )}
        </Box>

        {/* Recomendaciones */}
        <Box
          sx={{
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
            bgcolor: alpha(theme.palette.info.main, 0.04),
            p: 1.75,
          }}
        >
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1.25 }}
          >
            <InfoOutlinedIcon
              sx={{ fontSize: 15, color: theme.palette.info.main }}
            />
            <Typography
              variant="caption"
              fontWeight={700}
              color="info.main"
              sx={{ textTransform: "uppercase", letterSpacing: "0.06em" }}
            >
              Recomendaciones para mejor resultado
            </Typography>
          </Box>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 0.75,
            }}
          >
            {LOGO_RECOMMENDATIONS.map(({ label, value, icon }) => (
              <Box
                key={label}
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 0.75,
                  p: 1,
                  borderRadius: 1.5,
                  bgcolor: alpha(theme.palette.background.paper, 0.6),
                  border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                }}
              >
                <Typography sx={{ fontSize: "0.9rem", lineHeight: 1.4 }}>
                  {icon}
                </Typography>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    sx={{
                      fontSize: "0.65rem",
                      display: "block",
                      lineHeight: 1.2,
                    }}
                  >
                    {label}
                  </Typography>
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    color="text.primary"
                    sx={{ fontSize: "0.75rem" }}
                  >
                    {value}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Nota sobre encaje en la app */}
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: 0.75,
              mt: 1.25,
            }}
          >
            <CheckCircleIcon
              sx={{
                fontSize: 13,
                color: theme.palette.success.main,
                mt: "2px",
                flexShrink: 0,
              }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: "0.72rem", lineHeight: 1.5 }}
            >
              Un logo horizontal en formato SVG con fondo transparente garantiza
              el mejor encaje tanto en el <strong>Header</strong> como en el{" "}
              <strong>Sidebar</strong> y la pantalla de <strong>Login</strong>,
              en modo claro y oscuro.
            </Typography>
          </Box>
        </Box>

        {/* Error global del contexto */}
        <Collapse in={!!error}>
          <Alert severity="error" sx={{ borderRadius: 2, fontSize: "0.8rem" }}>
            {error}
          </Alert>
        </Collapse>
      </DialogContent>

      {/* ── Actions ────────────────────────────────────────────────────────── */}
      <DialogActions
        sx={{
          px: 3,
          py: 2,
          gap: 1,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          flexDirection: isMobile ? "column-reverse" : "row",
          "& > *": isMobile
            ? { width: "100% !important", ml: "0 !important" }
            : {},
        }}
      >
        {/* Descartar cambios */}
        {hasPendingChanges && (
          <Button
            variant="text"
            startIcon={<UndoIcon sx={{ fontSize: 16 }} />}
            onClick={handleDiscard}
            disabled={loading}
            sx={{
              textTransform: "none",
              fontWeight: 500,
              color: theme.palette.text.secondary,
              mr: "auto",
              "&:hover": { bgcolor: alpha(theme.palette.divider, 0.3) },
            }}
          >
            Descartar
          </Button>
        )}

        <Button
          variant="outlined"
          onClick={handleClose}
          disabled={loading}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2,
            borderColor: alpha(theme.palette.divider, 0.4),
            color: theme.palette.text.secondary,
            "&:hover": {
              borderColor: theme.palette.divider,
              bgcolor: alpha(theme.palette.divider, 0.15),
            },
          }}
        >
          Cancelar
        </Button>

        <Button
          variant="contained"
          disabled={!hasPendingChanges || loading}
          onClick={handleSave}
          startIcon={
            loading ? (
              <CircularProgress size={14} color="inherit" />
            ) : (
              <SaveOutlinedIcon sx={{ fontSize: 16 }} />
            )
          }
          sx={{
            textTransform: "none",
            fontWeight: 700,
            borderRadius: 2,
            boxShadow: "none",
            minWidth: 120,
            "&:hover": { boxShadow: "none" },
            "&.Mui-disabled": { opacity: 0.5 },
          }}
        >
          {loading ? "Guardando…" : "Guardar cambios"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LogoUploaderDialog;

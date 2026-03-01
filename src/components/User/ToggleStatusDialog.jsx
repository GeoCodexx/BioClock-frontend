import React from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Avatar,
  Chip,
  IconButton,
  useTheme,
  alpha,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";

// ─────────────────────────────────────────────
// COMPONENTE REUTILIZABLE
// Props:
//   open          boolean
//   onClose       () => void
//   onConfirm     () => void
//   user          { name: string, email: string, avatarUrl?: string }
//   currentStatus "active" | "inactive"
// ─────────────────────────────────────────────
export function ToggleStatusDialog({
  open,
  onClose,
  onConfirm,
  user,
  currentStatus,
}) {
  const theme = useTheme();
  const isActive = currentStatus === "active";

  // Colores semánticos según la acción a realizar
  const actionColor = isActive
    ? (theme.palette.error?.main ?? "#E65100") // desactivar → error/rojo
    : (theme.palette.success?.main ?? "#2E7D32"); // activar    → success/verde

  const actionColorBg = alpha(actionColor, 0.1);

  // Tokens del tema primario
  const primaryMain = theme.palette.primary.main;
  const primaryLight = theme.palette.primary.light;
  const primaryDark = theme.palette.primary.dark;

  const Icon = isActive ? PersonOffOutlinedIcon : HowToRegOutlinedIcon;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: 3.5,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
          bgcolor: "background.paper",
        },
      }}
      BackdropProps={{
        sx: {
          backdropFilter: "blur(4px)",
          backgroundColor: alpha(primaryDark, 0.45),
        },
      }}
    >
      {/* Barra de acento superior — hereda primary.main del tema */}
      <Box sx={{ height: 4, bgcolor: primaryMain }} />

      <DialogContent sx={{ pt: 3, pb: 1, px: 3 }}>
        {/* Botón cerrar */}
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            position: "absolute",
            top: 14,
            right: 14,
            color: "text.secondary",
            "&:hover": { bgcolor: alpha(primaryLight, 0.15) },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        {/* Ícono de acción */}
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: 2.5,
            bgcolor: actionColorBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 2.5,
          }}
        >
          <Icon sx={{ color: actionColor, fontSize: 26 }} />
        </Box>

        {/* Título */}
        <Typography
          variant="subtitle1"
          fontWeight={700}
          color="text.primary"
          mb={0.5}
        >
          {isActive ? "Desactivar usuario" : "Activar usuario"}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          mb={2.5}
          lineHeight={1.6}
        >
          {isActive
            ? "El usuario perderá acceso al sistema de forma inmediata."
            : "El usuario recuperará su acceso al sistema de forma inmediata."}
        </Typography>

        {/* Tarjeta del usuario */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: 1.5,
            borderRadius: 2,
            bgcolor: alpha(primaryMain, 0.06),
            border: "1px solid",
            borderColor: alpha(primaryMain, 0.15),
          }}
        >
          <Avatar
            src={user?.avatarUrl}
            sx={{
              width: 38,
              height: 38,
              fontSize: 15,
              fontWeight: 700,
              bgcolor: primaryMain,
              color: theme.palette.primary.contrastText,
            }}
          >
            {user?.name?.[0]?.toUpperCase()}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              fontWeight={600}
              color="text.primary"
              noWrap
            >
              {user?.name}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              display="block"
            >
              {user?.email}
            </Typography>
          </Box>

          <Chip
            label={isActive ? "Inactivo" : "Activo"}
            size="small"
            sx={{
              bgcolor: actionColorBg,
              color: actionColor,
              fontWeight: 600,
              fontSize: 11,
              height: 22,
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 2, gap: 1 }}>
        {/* Cancelar */}
        <Button
          onClick={onClose}
          variant="outlined"
          size="medium"
          fullWidth
          sx={{
            borderColor: "divider",
            color: "text.secondary",
            fontWeight: 600,
            textTransform: "none",
            borderRadius: 2,
            "&:hover": {
              borderColor: primaryLight,
              bgcolor: alpha(primaryLight, 0.08),
            },
          }}
        >
          Cancelar
        </Button>

        {/* Confirmar */}
        <Button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          variant="contained"
          size="medium"
          fullWidth
          disableElevation
          sx={{
            bgcolor: actionColor,
            color: "#fff",
            fontWeight: 600,
            textTransform: "none",
            borderRadius: 2,
            "&:hover": {
              bgcolor: actionColor,
              filter: "brightness(0.88)",
            },
          }}
        >
          {isActive ? "Desactivar" : "Activar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ToggleStatusDialog;

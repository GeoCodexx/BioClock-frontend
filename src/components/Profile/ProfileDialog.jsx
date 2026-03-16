/**
 * ProfileDialog — versión simplificada.
 * Solo muestra un resumen rápido del usuario y ofrece ir a la ProfilePage completa.
 * Toda la edición de datos y cambio de contraseña ocurre en ProfilePage.
 */
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Avatar,
  Divider,
  Button,
  IconButton,
  Chip,
  Stack,
} from "@mui/material";
import {
  Close,
  PersonOutline,
  OpenInNewOutlined,
  AdminPanelSettingsOutlined,
} from "@mui/icons-material";
import { alpha, useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
//import useAuthStore from "../../store/useAuthStore";

export default function ProfileDialog({ open, onClose, user }) {
  const theme = useTheme();
  const navigate = useNavigate();
  //const user = useAuthStore((s) => s.user);

  console.log(user);

  const fullName = [user?.name, user?.firstSurname, user?.secondSurname]
    .filter(Boolean)
    .join(" ");

  const initials = [user?.name, user?.firstSurname]
    .filter(Boolean)
    .map((s) => s[0])
    .join("")
    .toUpperCase();

  const handleGoToProfile = () => {
    onClose();
    navigate("/profile"); // ajusta esta ruta según tu router
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      disableScrollLock
      PaperProps={{
        sx: { borderRadius: 3, overflow: "hidden" },
      }}
    >
      {/* Header con gradiente */}
      <Box
        sx={{
          /*background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.9)}, ${alpha(
            theme.palette.primary.dark,
            0.95,
          )})`,*/
          bgcolor: theme.palette.primary.main,
          pt: 3,
          pb: 2.5,
          px: 3,
          color: "#fff",
          position: "relative",
        }}
      >
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            position: "absolute",
            top: 10,
            right: 10,
            color: "rgba(255,255,255,0.7)",
            "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.1)" },
          }}
        >
          <Close fontSize="small" />
        </IconButton>

        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: "rgba(255,255,255,0.2)",
              color: "#fff",
              fontSize: "1.25rem",
              fontWeight: 700,
              border: "2px solid rgba(255,255,255,0.35)",
            }}
          >
            {initials || <PersonOutline />}
          </Avatar>
          <Box>
            <Typography fontWeight={700} sx={{ lineHeight: 1.2, mb: 0.4 }}>
              {fullName || "Usuario"}
            </Typography>
            <Typography
              variant="caption"
              sx={{ opacity: 0.85, display: "block", mb: 0.75 }}
            >
              {user?.email}
            </Typography>
            {user?.role && (
              <Chip
                icon={
                  <AdminPanelSettingsOutlined
                    sx={{
                      fontSize: "0.8rem !important",
                      color: "rgba(255,255,255,0.9) !important",
                    }}
                  />
                }
                label={user.role}
                size="small"
                sx={{
                  bgcolor: "rgba(255,255,255,0.18)",
                  color: "#fff",
                  fontSize: "0.68rem",
                  fontWeight: 600,
                  height: 22,
                  border: "1px solid rgba(255,255,255,0.25)",
                }}
              />
            )}
          </Box>
        </Stack>
      </Box>

      <DialogContent sx={{ px: 3, py: 2 }}>
        <Stack spacing={0.5}>
          {user?.position && <InfoRow label="Cargo" value={user.position} />}
          {user?.department && (
            <InfoRow label="Departamento" value={user.department} />
          )}
          {user?.phone && <InfoRow label="Teléfono" value={user.phone} />}
        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
        <Button
          onClick={onClose}
          size="small"
          sx={{
            textTransform: "none",
            borderRadius: 2,
            color: "text.secondary",
          }}
        >
          Cerrar
        </Button>
        <Button
          variant="contained"
          disableElevation
          size="small"
          endIcon={<OpenInNewOutlined sx={{ fontSize: "0.9rem !important" }} />}
          onClick={handleGoToProfile}
          sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600 }}
        >
          Ver perfil completo
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* Fila de dato simple */
function InfoRow({ label, value }) {
  return (
    <Box sx={{ display: "flex", gap: 1, py: 0.5 }}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 110 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500}>
        {value}
      </Typography>
    </Box>
  );
}

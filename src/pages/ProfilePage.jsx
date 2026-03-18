import {
  Box,
  Typography,
  Avatar,
  Divider,
  Button,
  TextField,
  IconButton,
  Stack,
  LinearProgress,
  Alert,
  CircularProgress,
  InputAdornment,
  //useMediaQuery,
  Paper,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Fade,
  Snackbar,
} from "@mui/material";
import {
  LockResetOutlined,
  Visibility,
  VisibilityOff,
  PersonOutline,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  BadgeOutlined,
  EmailOutlined,
  PhoneOutlined,
  HomeOutlined,
  WorkOutlineOutlined,
  GroupsOutlined,
  ScheduleOutlined,
  ExpandMore,
  AdminPanelSettingsOutlined,
} from "@mui/icons-material";
import { alpha, useTheme } from "@mui/material/styles";
import { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import zxcvbn from "zxcvbn";
import useAuthStore from "../store/useAuthStore";
import {
  changePassword,
  reAuthenticate,
  updateUserProfile,
} from "../services/authService";
import { useNavigate } from "react-router-dom";

/* ─────────────────────────────────────────────
   Sub-componente: campo de info con edición inline
───────────────────────────────────────────── */
function InfoField({ icon: Icon, label, value, editable = false, onSave }) {
  const theme = useTheme();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!draft.trim()) return;
    setSaving(true);
    try {
      await onSave(draft.trim());
      setEditing(false);
    } catch {
      /* el padre maneja el error */
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft(value || "");
    setEditing(false);
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1.5,
        py: 1.25,
        px: 1,
        borderRadius: 2,
        transition: "background 0.2s",
        "&:hover": editable
          ? { bgcolor: alpha(theme.palette.primary.main, 0.04) }
          : {},
      }}
    >
      {/* Icono */}
      <Box
        sx={{
          mt: 0.3,
          color: "primary.main",
          display: "flex",
          flexShrink: 0,
        }}
      >
        <Icon fontSize="small" />
      </Box>

      {/* Contenido */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            display: "block",
            lineHeight: 1.2,
            mb: 0.25,
          }}
        >
          {label}
        </Typography>

        {editing ? (
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              size="small"
              autoFocus
              fullWidth
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") handleCancel();
              }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
            <Tooltip title="Guardar">
              <span>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={handleSave}
                  disabled={saving || !draft.trim()}
                >
                  {saving ? (
                    <CircularProgress size={14} />
                  ) : (
                    <CheckOutlined fontSize="small" />
                  )}
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Cancelar">
              <IconButton size="small" color="default" onClick={handleCancel}>
                <CloseOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        ) : (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color: value ? "text.primary" : "text.disabled",
                flex: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {value || "—"}
            </Typography>
            {editable && (
              <Tooltip title={`Editar ${label.toLowerCase()}`}>
                <IconButton
                  size="small"
                  onClick={() => setEditing(true)}
                  sx={{
                    opacity: 0.5,
                    transition: "opacity 0.2s",
                    "&:hover": { opacity: 1, color: "primary.main" },
                    p: 0.5,
                  }}
                >
                  <EditOutlined sx={{ fontSize: 15 }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}

/* ─────────────────────────────────────────────
   Sub-componente: sección agrupada de info
───────────────────────────────────────────── */
function InfoSection({ title, children }) {
  return (
    <Box sx={{ mb: 0.5 }}>
      <Typography
        variant="overline"
        sx={{
          color: "text.disabled",
          fontSize: "0.65rem",
          fontWeight: 700,
          letterSpacing: "0.08em",
          px: 1,
          display: "block",
          mb: 0.5,
        }}
      >
        {title}
      </Typography>
      <Paper
        variant="outlined"
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          "& > *:not(:last-child)": {
            borderBottom: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`,
          },
        }}
      >
        {children}
      </Paper>
    </Box>
  );
}

/* ─────────────────────────────────────────────
   Componente principal: ProfilePage
───────────────────────────────────────────── */
export default function ProfilePage() {
  //const theme = useTheme();
  // const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const updateUser = useAuthStore((state) => state.updateUser);

  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState(null);
  const [inlineAlert, setInlineAlert] = useState(null);

  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm({ mode: "onChange" });

  const newPassword = watch("newPassword");
  const score = useMemo(
    () => (newPassword ? zxcvbn(newPassword).score : 0),
    [newPassword],
  );

  const strengthLabel = [
    "Muy débil",
    "Débil",
    "Aceptable",
    "Fuerte",
    "Muy fuerte",
  ];
  const strengthColor = ["error", "error", "warning", "info", "success"];

  const handleReAuth = async ({ currentPassword }) => {
    try {
      setLoading(true);
      setInlineAlert(null);
      await reAuthenticate(currentPassword);
      setVerified(true);
    } catch (error) {
      setInlineAlert({
        type: "error",
        msg: error.message || "Error al verificar identidad",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const response = await changePassword(data);
      if (response.forceLogout) {
        logout(
          response.message ||
            "Contraseña actualizada. Inicia sesión nuevamente.",
        );
        navigate("/login", { replace: true });
      }
    } catch (error) {
      setInlineAlert({
        type: error.isClientError ? "warning" : "error",
        msg: error.message || "Error al cambiar contraseña",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAccordionClose = () => {
    setVerified(false);
    setInlineAlert(null);
    reset({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handleSaveField = (field) => async (value) => {
    try {
      //await onUpdateField?.({ [field]: value });
      await updateUserProfile({ [field]: value });

      updateUser({ [field]: value });
      setSnackbar({ type: "success", msg: "Campo actualizado correctamente" });
    } catch {
      setSnackbar({ type: "error", msg: "Error al actualizar el campo" });
      throw new Error("update failed");
    }
  };

  const fullName = [user?.name, user?.firstSurname, user?.secondSurname]
    .filter(Boolean)
    .join(" ");

  const initials = [user?.name, user?.firstSurname]
    .filter(Boolean)
    .map((s) => s[0])
    .join("")
    .toUpperCase();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: (t) =>
          t.palette.mode === "dark"
            ? alpha(t.palette.background.default, 1)
            : alpha(t.palette.grey[100], 1),
        py: { xs: 2, sm: 4 },
        px: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: 720, mx: "auto" }}>
        {/* ── HEADER ── */}
        <Fade in timeout={400}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              p: { xs: 3, sm: 4 },
              mb: 2.5,
              background: (t) =>
                `linear-gradient(135deg, ${alpha(t.palette.primary.dark, 0.9)} 0%, ${alpha(
                  t.palette.primary.main,
                  0.95,
                )} 100%)`,
              color: "#fff",
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "center", sm: "flex-start" },
              gap: 3,
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                width: 200,
                height: 200,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.06)",
                top: -60,
                right: -40,
                pointerEvents: "none",
              },
              "&::after": {
                content: '""',
                position: "absolute",
                width: 120,
                height: 120,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.04)",
                bottom: -30,
                left: 60,
                pointerEvents: "none",
              },
            }}
          >
            <Avatar
              sx={{
                width: { xs: 72, sm: 80 },
                height: { xs: 72, sm: 80 },
                bgcolor: "rgba(255,255,255,0.2)",
                color: "#fff",
                fontSize: { xs: "1.5rem", sm: "1.75rem" },
                fontWeight: 700,
                border: "3px solid rgba(255,255,255,0.35)",
                flexShrink: 0,
              }}
            >
              {initials || <PersonOutline />}
            </Avatar>

            <Box
              sx={{
                textAlign: { xs: "center", sm: "left" },
                flex: 1,
                zIndex: 1,
              }}
            >
              <Typography
                variant="h5"
                fontWeight={700}
                sx={{ lineHeight: 1.2, mb: 0.5 }}
              >
                {fullName || "Usuario"}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85, mb: 1.5 }}>
                {user?.email}
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                justifyContent={{ xs: "center", sm: "flex-start" }}
                gap={0.75}
              >
                {user?.role && (
                  <Chip
                    icon={
                      <AdminPanelSettingsOutlined
                        sx={{
                          fontSize: "0.85rem !important",
                          color: "inherit !important",
                        }}
                      />
                    }
                    label={user.role}
                    size="small"
                    sx={{
                      bgcolor: "rgba(255,255,255,0.18)",
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: "0.7rem",
                      border: "1px solid rgba(255,255,255,0.25)",
                      "& .MuiChip-icon": { color: "#fff" },
                    }}
                  />
                )}
                {user?.position && (
                  <Chip
                    label={user.position}
                    size="small"
                    sx={{
                      bgcolor: "rgba(255,255,255,0.12)",
                      color: "#fff",
                      fontSize: "0.7rem",
                      border: "1px solid rgba(255,255,255,0.2)",
                    }}
                  />
                )}
              </Stack>
            </Box>
          </Paper>
        </Fade>

        {/* ── GRID DE INFORMACIÓN ── */}
        <Fade in timeout={600}>
          <Stack spacing={2.5}>
            {/* Información personal */}
            <InfoSection title="Información personal">
              <InfoField
                icon={BadgeOutlined}
                label="Nombre completo"
                value={fullName}
              />
              <InfoField
                icon={BadgeOutlined}
                label="DNI / Documento"
                value={user?.dni}
              />
              <InfoField
                icon={EmailOutlined}
                label="Correo electrónico"
                value={user?.email}
              />
              <InfoField
                icon={PhoneOutlined}
                label="Teléfono"
                value={user?.phone}
                editable
                onSave={handleSaveField("phone")}
              />
              <InfoField
                icon={HomeOutlined}
                label="Dirección"
                value={user?.address}
                editable
                onSave={handleSaveField("address")}
              />
            </InfoSection>

            {/* Información laboral */}
            <InfoSection title="Información laboral">
              <InfoField
                icon={WorkOutlineOutlined}
                label="Cargo"
                value={user?.position}
              />
              <InfoField
                icon={AdminPanelSettingsOutlined}
                label="Rol en sistema"
                value={user?.role}
              />
              <InfoField
                icon={GroupsOutlined}
                label="Departamento"
                value={user?.department}
              />
              <InfoField
                icon={ScheduleOutlined}
                label="Horarios"
                value={
                  Array.isArray(user?.schedules)
                    ? user.schedules.map((s) => s.name).join(", ")
                    : user?.schedules
                }
              />
            </InfoSection>

            {/* ── CAMBIAR CONTRASEÑA ── */}
            <Box>
              <Typography
                variant="overline"
                sx={{
                  color: "text.disabled",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  px: 1,
                  display: "block",
                  mb: 0.5,
                }}
              >
                Seguridad
              </Typography>
              <Accordion
                elevation={0}
                variant="outlined"
                sx={{
                  borderRadius: "12px !important",
                  "&::before": { display: "none" },
                  overflow: "hidden",
                }}
                onChange={(_, expanded) => {
                  if (!expanded) handleAccordionClose();
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  sx={{
                    px: 2,
                    py: 0.5,
                    minHeight: 56,
                    "& .MuiAccordionSummary-content": { my: 1.5 },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 2,
                        bgcolor: (t) => alpha(t.palette.warning.main, 0.12),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "warning.dark",
                        flexShrink: 0,
                      }}
                    >
                      <LockResetOutlined fontSize="small" />
                    </Box>
                    <Box>
                      <Typography fontWeight={600} variant="body2">
                        Cambiar contraseña
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Actualiza tu contraseña periódicamente para mayor
                        seguridad
                      </Typography>
                    </Box>
                  </Stack>
                </AccordionSummary>

                <AccordionDetails sx={{ px: 2.5, pb: 2.5 }}>
                  <Divider sx={{ mb: 2.5 }} />
                  <form
                    onSubmit={handleSubmit(verified ? onSubmit : handleReAuth)}
                  >
                    <Stack spacing={2}>
                      {/* Paso 1: verificar identidad */}
                      {!verified && (
                        <>
                          <Typography variant="body2" color="text.secondary">
                            Ingresa tu contraseña actual para continuar.
                          </Typography>
                          <Controller
                            name="currentPassword"
                            defaultValue=""
                            control={control}
                            rules={{ required: "Campo obligatorio" }}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="Contraseña actual"
                                size="small"
                                type={show.current ? "text" : "password"}
                                error={!!errors.currentPassword}
                                helperText={errors.currentPassword?.message}
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    borderRadius: 2,
                                  },
                                }}
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <IconButton
                                        size="small"
                                        onClick={() =>
                                          setShow((s) => ({
                                            ...s,
                                            current: !s.current,
                                          }))
                                        }
                                      >
                                        {show.current ? (
                                          <VisibilityOff fontSize="small" />
                                        ) : (
                                          <Visibility fontSize="small" />
                                        )}
                                      </IconButton>
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            )}
                          />
                        </>
                      )}

                      {/* Paso 2: nueva contraseña */}
                      {verified && (
                        <Fade in>
                          <Stack spacing={2}>
                            <Alert severity="success" sx={{ borderRadius: 2 }}>
                              Identidad verificada. Ahora puedes establecer una
                              nueva contraseña.
                            </Alert>

                            <Controller
                              name="newPassword"
                              control={control}
                              defaultValue=""
                              rules={{
                                required: "Campo obligatorio",
                                minLength: {
                                  value: 8,
                                  message: "Mínimo 8 caracteres",
                                },
                              }}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  label="Nueva contraseña"
                                  size="small"
                                  type={show.new ? "text" : "password"}
                                  error={!!errors.newPassword}
                                  helperText={errors.newPassword?.message}
                                  sx={{
                                    "& .MuiOutlinedInput-root": {
                                      borderRadius: 2,
                                    },
                                  }}
                                  InputProps={{
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        <IconButton
                                          size="small"
                                          onClick={() =>
                                            setShow((s) => ({
                                              ...s,
                                              new: !s.new,
                                            }))
                                          }
                                        >
                                          {show.new ? (
                                            <VisibilityOff fontSize="small" />
                                          ) : (
                                            <Visibility fontSize="small" />
                                          )}
                                        </IconButton>
                                      </InputAdornment>
                                    ),
                                  }}
                                />
                              )}
                            />

                            {/* Indicador de fuerza */}
                            {newPassword && (
                              <Box>
                                <LinearProgress
                                  variant="determinate"
                                  value={(score + 1) * 20}
                                  color={strengthColor[score]}
                                  sx={{ borderRadius: 4, height: 6, mb: 0.5 }}
                                />
                                <Typography
                                  variant="caption"
                                  color={`${strengthColor[score]}.main`}
                                  fontWeight={500}
                                >
                                  Seguridad: {strengthLabel[score]}
                                </Typography>
                              </Box>
                            )}

                            <Controller
                              name="confirmPassword"
                              defaultValue=""
                              control={control}
                              rules={{
                                validate: (v) =>
                                  v === newPassword ||
                                  "Las contraseñas no coinciden",
                              }}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  label="Confirmar nueva contraseña"
                                  size="small"
                                  type={show.confirm ? "text" : "password"}
                                  error={!!errors.confirmPassword}
                                  helperText={errors.confirmPassword?.message}
                                  sx={{
                                    "& .MuiOutlinedInput-root": {
                                      borderRadius: 2,
                                    },
                                  }}
                                  InputProps={{
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        <IconButton
                                          size="small"
                                          onClick={() =>
                                            setShow((s) => ({
                                              ...s,
                                              confirm: !s.confirm,
                                            }))
                                          }
                                        >
                                          {show.confirm ? (
                                            <VisibilityOff fontSize="small" />
                                          ) : (
                                            <Visibility fontSize="small" />
                                          )}
                                        </IconButton>
                                      </InputAdornment>
                                    ),
                                  }}
                                />
                              )}
                            />
                          </Stack>
                        </Fade>
                      )}

                      {/* Alerta inline */}
                      {inlineAlert && (
                        <Alert
                          severity={inlineAlert.type}
                          sx={{ borderRadius: 2 }}
                        >
                          {inlineAlert.msg}
                        </Alert>
                      )}

                      <Button
                        type="submit"
                        variant="contained"
                        disableElevation
                        disabled={
                          loading || (verified && (!isValid || score < 2))
                        }
                        startIcon={
                          loading ? (
                            <CircularProgress size={16} color="inherit" />
                          ) : null
                        }
                        sx={{
                          borderRadius: 2,
                          textTransform: "none",
                          fontWeight: 600,
                        }}
                      >
                        {verified
                          ? "Guardar nueva contraseña"
                          : "Verificar identidad"}
                      </Button>
                    </Stack>
                  </form>
                </AccordionDetails>
              </Accordion>
            </Box>
          </Stack>
        </Fade>
      </Box>

      {/* ── SNACKBAR GLOBAL ── */}
      <Snackbar
        open={!!snackbar}
        autoHideDuration={4000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar(null)}
          severity={snackbar?.type}
          //variant="filled"
          sx={{ borderRadius: 2, minWidth: 260 }}
        >
          {snackbar?.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}

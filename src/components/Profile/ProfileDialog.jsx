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
  TextField,
  Collapse,
  IconButton,
  Stack,
  LinearProgress,
  Snackbar,
  Alert,
  CircularProgress,
  InputAdornment,
  useMediaQuery,
} from "@mui/material";
import {
  Close,
  LockResetOutlined,
  Visibility,
  VisibilityOff,
  PersonOutline,
} from "@mui/icons-material";
import { alpha, useTheme } from "@mui/material/styles";
import { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import zxcvbn from "zxcvbn";
import useAuthStore from "../../store/useAuthStore";
import { changePassword, reAuthenticate } from "../../services/authService";
import { useNavigate } from "react-router-dom";

export default function ProfileDialog({ open, onClose, user }) {
  const theme = useTheme();

  // Detecta si el ancho de pantalla es menor a 'sm' (habitualmente 600px)
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const [showForm, setShowForm] = useState(false);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState(null);

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

  const handleClose = () => {
    onClose();
    setShowForm(false);
    reset({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setVerified(false);
    setSnackbar(null);
  };

  const newPassword = watch("newPassword");
  const score = useMemo(
    () => (newPassword ? zxcvbn(newPassword).score : 0),
    [newPassword]
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
      await reAuthenticate(currentPassword);
      setVerified(true);
    } catch (error) {
      // Verificar si es un error del cliente (4xx)
      if (error.isClientError) {
        setSnackbar({
          type: "error", // Cambiado a warning para errores 4xx
          msg: error.message,
        });
      } else {
        // Error del servidor (5xx) o de red
        setSnackbar({
          type: "error",
          msg: error.message || "Error inesperado al autenticar",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Función para cambiar contraseña
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const response = await changePassword(data);

      // Si el backend indica que debe cerrar sesión
      if (response.forceLogout) {
        logout(
          response.message ||
            "Contraseña actualizada. Inicia sesión nuevamente."
        );
        navigate("/login", { replace: true });
      }
    } catch (error) {
      // Verificar si es un error del cliente (4xx)
      if (error.isClientError) {
        setSnackbar({
          type: "warning", // Advertencia para errores de validación
          msg: error.message,
        });
      } else {
        // Error del servidor (5xx) o de red
        setSnackbar({
          type: "error",
          msg: error.message || "Error crítico al cambiar contraseña",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        fullScreen={isMobile}
        maxWidth="sm"
        fullWidth
        disableScrollLock={true}
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography fontWeight={600}>Perfil</Typography>
          <IconButton onClick={handleClose}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          {/* PERFIL */}
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Avatar sx={{ mx: "auto", mb: 1, bgcolor: "primary.main" }}>
              <PersonOutline />
            </Avatar>
            <Typography
              fontWeight={600}
            >{`${user?.name} ${user?.firstSurname} ${user?.secondSurname}`}</Typography>
            <Typography variant="body2">{user?.email}</Typography>
            <Typography variant="caption">{user?.role}</Typography>
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Button
            fullWidth
            variant="outlined"
            startIcon={<LockResetOutlined />}
            onClick={() => setShowForm((v) => !v)}
            sx={{ textTransform: "none", borderRadius: 2, mb: 2 }}
          >
            Cambiar contraseña
          </Button>
          <Collapse in={showForm}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                //bgcolor: (t) => alpha(t.palette.primary.main, 0.05),
              }}
            >
              <form onSubmit={handleSubmit(verified ? onSubmit : handleReAuth)}>
                <Stack spacing={2}>
                  {/* ACTUAL */}
                  <Controller
                    name="currentPassword"
                    defaultValue={""}
                    control={control}
                    rules={{ required: "Obligatoria" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Contraseña actual"
                        size={isMobile ? "small" : "medium"}
                        type={show.current ? "text" : "password"}
                        error={!!errors.currentPassword}
                        helperText={errors.currentPassword?.message}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() =>
                                  setShow((s) => ({
                                    ...s,
                                    current: !s.current,
                                  }))
                                }
                              >
                                {show.current ? (
                                  <VisibilityOff />
                                ) : (
                                  <Visibility />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />

                  {verified && (
                    <>
                      {/* NUEVA */}
                      <Controller
                        name="newPassword"
                        control={control}
                        defaultValue={""}
                        rules={{
                          required: "Obligatoria",
                          minLength: {
                            value: 8,
                            message: "Mínimo 8 caracteres",
                          },
                        }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Nueva contraseña"
                            size={isMobile ? "small" : "medium"}
                            type={show.new ? "text" : "password"}
                            error={!!errors.newPassword}
                            helperText={errors.newPassword?.message}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() =>
                                      setShow((s) => ({ ...s, new: !s.new }))
                                    }
                                  >
                                    {show.new ? (
                                      <VisibilityOff />
                                    ) : (
                                      <Visibility />
                                    )}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                        )}
                      />

                      {/* FUERZA */}
                      <LinearProgress
                        variant="determinate"
                        value={(score + 1) * 20}
                        color={strengthColor[score]}
                      />
                      <Typography
                        variant="caption"
                        color={`${strengthColor[score]}.main`}
                      >
                        {strengthLabel[score]}
                      </Typography>

                      {/* CONFIRM */}
                      <Controller
                        name="confirmPassword"
                        defaultValue={""}
                        control={control}
                        rules={{
                          validate: (v) => v === newPassword || "No coinciden",
                        }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Confirmar contraseña"
                            size={isMobile ? "small" : "medium"}
                            type={show.confirm ? "text" : "password"}
                            error={!!errors.confirmPassword}
                            helperText={errors.confirmPassword?.message}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() =>
                                      setShow((s) => ({
                                        ...s,
                                        confirm: !s.confirm,
                                      }))
                                    }
                                  >
                                    {show.confirm ? (
                                      <VisibilityOff />
                                    ) : (
                                      <Visibility />
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

                  <Box mb={2}>
                    {!verified && snackbar?.msg && (
                      <Alert severity={snackbar.type}>{snackbar.msg}</Alert>
                    )}
                  </Box>

                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading || (verified && (!isValid || score < 2))}
                    startIcon={loading && <CircularProgress size={16} />}
                  >
                    {verified ? "Guardar cambios" : "Verificar identidad"}
                  </Button>
                </Stack>
              </form>
            </Box>
          </Collapse>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR */}
      {/* <Snackbar
        open={!!snackbar}
        autoHideDuration={4000}
        onClose={() => setSnackbar(null)}
      >
        <Alert severity={snackbar?.type}>{snackbar?.msg}</Alert>
      </Snackbar> */}
    </>
  );
}

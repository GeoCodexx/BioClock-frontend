import React, { useState } from "react";
import {
  Avatar,
  Button,
  TextField,
  Box,
  Typography,
  Container,
  Alert,
  Paper,
  InputAdornment,
  IconButton,
  useTheme,
  alpha,
  Fade,
  CircularProgress,
  Link,
} from "@mui/material";
//import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import SecurityIcon from "@mui/icons-material/Security";
import useAuthStore from "../store/useAuthStore";
import { useLocation } from "react-router-dom";

export default function Login() {
  const location = useLocation();
  const message = location.state?.message;
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      window.location.href = "/";
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Error de autenticación"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.primary.main,
          0.1
        )} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: "-50%",
          right: "-10%",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha(
            theme.palette.primary.main,
            0.08
          )} 0%, transparent 70%)`,
        },
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: "-30%",
          left: "-5%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha(
            theme.palette.secondary.main,
            0.06
          )} 0%, transparent 70%)`,
        },
      }}
    >
      <Container component="main" maxWidth="sm">
        <Fade in timeout={600}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              overflow: "hidden",
              boxShadow: `0 20px 60px ${alpha(
                theme.palette.common.black,
                0.1
              )}`,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              position: "relative",
              zIndex: 1,
              backdropFilter: "blur(10px)",
              backgroundColor: alpha(theme.palette.background.paper, 0.9),
            }}
          >
            {/* Header decorativo */}
            <Box
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                py: 4,
                px: 3,
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: "-50%",
                  left: "-50%",
                  width: "200%",
                  height: "200%",
                  background: `radial-gradient(circle, ${alpha(
                    theme.palette.common.white,
                    0.1
                  )} 0%, transparent 70%)`,
                  animation: "pulse 8s ease-in-out infinite",
                },
                "@keyframes pulse": {
                  "0%, 100%": { transform: "scale(1)" },
                  "50%": { transform: "scale(1.1)" },
                },
              }}
            >
              <Avatar
                sx={{
                  m: "auto",
                  width: 80,
                  height: 80,
                  bgcolor: alpha(theme.palette.common.white, 0.2),
                  border: `4px solid ${alpha(theme.palette.common.white, 0.3)}`,
                  boxShadow: `0 8px 24px ${alpha(
                    theme.palette.common.black,
                    0.2
                  )}`,
                  mb: 2,
                  backdropFilter: "blur(10px)",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <FingerprintIcon
                  sx={{ fontSize: 40, color: theme.palette.common.white }}
                />
              </Avatar>
              <Typography
                variant="h4"
                sx={{
                  color: theme.palette.common.white,
                  fontWeight: 700,
                  mb: 0.5,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                Sistema Biométrico
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: alpha(theme.palette.common.white, 0.9),
                  fontWeight: 400,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                Control de Asistencia por Huella Dactilar
              </Typography>
            </Box>

            {/* Formulario */}
            <Box sx={{ px: 4, py: 5 }}>
              <Typography
                variant="h5"
                sx={{
                  mb: 1,
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  textAlign: "center",
                }}
              >
                Iniciar Sesión
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  mb: 4,
                  color: theme.palette.text.secondary,
                  textAlign: "center",
                }}
              >
                Ingrese sus credenciales para acceder al sistema
              </Typography>
              {message && (
                <Alert
                  severity="info"
                  sx={{
                    mt: 2,
                    //borderRadius: 2,
                    //backgroundColor: alpha(theme.palette.error.main, 0.1),
                    //border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                  }}
                >
                  {message}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Correo electrónico"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlinedIcon
                          sx={{ color: theme.palette.text.secondary }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: theme.palette.primary.main,
                        },
                      },
                      "&.Mui-focused": {
                        boxShadow: `0 0 0 3px ${alpha(
                          theme.palette.primary.main,
                          0.1
                        )}`,
                      },
                      "& input:-webkit-autofill": {
                        WebkitBoxShadow: "0 0 0 1000px transparent inset",
                        WebkitTextFillColor: theme.palette.text.primary,
                        transition: "background-color 9999s ease-in-out 0s",
                      },
                    },
                  }}
                />

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Contraseña"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOpenOutlinedIcon
                          sx={{ color: theme.palette.text.secondary }}
                        />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          edge="end"
                          disabled={loading}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: theme.palette.primary.main,
                        },
                      },
                      "&.Mui-focused": {
                        boxShadow: `0 0 0 3px ${alpha(
                          theme.palette.primary.main,
                          0.1
                        )}`,
                      },
                    },
                  }}
                />

                {error && (
                  <Fade in>
                    <Alert
                      severity="error"
                      sx={{
                        mt: 2,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.error.main, 0.1),
                        border: `1px solid ${alpha(
                          theme.palette.error.main,
                          0.3
                        )}`,
                      }}
                    >
                      {error}
                    </Alert>
                  </Fade>
                )}

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    mt: 3,
                    mb: 2,
                    py: 1.5,
                    borderRadius: 2,
                    fontSize: "1rem",
                    fontWeight: 600,
                    textTransform: "none",
                    //boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: `0 5px 10px ${alpha(
                        theme.palette.primary.main,
                        0.5
                      )}`,
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                    },
                    "&:disabled": {
                      background: theme.palette.action.disabledBackground,
                      boxShadow: "none",
                    },
                  }}
                >
                  {loading ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CircularProgress size={20} color="inherit" />
                      <span>Autenticando...</span>
                    </Box>
                  ) : (
                    "Iniciar Sesión"
                  )}
                </Button>

                <Box sx={{ textAlign: "center", mt: 2 }}>
                  <Link
                    href="#"
                    variant="body2"
                    sx={{
                      color: theme.palette.primary.main,
                      textDecoration: "none",
                      fontWeight: 500,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        textDecoration: "underline",
                        color: theme.palette.primary.dark,
                      },
                    }}
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </Box>
              </Box>
            </Box>

            {/* Footer con información de seguridad */}
            <Box
              sx={{
                py: 2,
                px: 3,
                backgroundColor: alpha(theme.palette.primary.main, 0.03),
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
              }}
            >
              <SecurityIcon
                sx={{ fontSize: 18, color: theme.palette.text.secondary }}
              />
              <Typography variant="caption" color="text.secondary">
                Conexión segura y encriptada
              </Typography>
            </Box>
          </Paper>
        </Fade>

        {/* Copyright */}
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ mt: 4, mb: 2 }}
        >
          © {new Date().getFullYear()} Sistema de Control de Asistencia
        </Typography>
      </Container>
    </Box>
  );
}

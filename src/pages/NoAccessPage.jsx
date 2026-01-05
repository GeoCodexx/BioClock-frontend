import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  LockOutlined,
  HomeOutlined,
  MailOutline,
  ArrowBackOutlined,
} from "@mui/icons-material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { keyframes } from "@mui/system";

const ping = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
`;

export default function NoAccessPage() {
  const navigate = useNavigate();

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={2}
      //   sx={{
      //     background: "linear-gradient(135deg, #e3f2fd, #ffffff, #ede7f6)",
      //   }}
    >
      <Box maxWidth={700} width="100%">
        <Card
          elevation={8}
          sx={{
            borderRadius: 4,
            textAlign: "center",
            p: { xs: 2, md: 4 },
          }}
        >
          <CardContent>
            {/* Icono */}
            <Box display="flex" justifyContent="center" mb={4}>
              <Box position="relative">
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    bgcolor: "error.light",
                    animation: `${ping} 1.5s infinite`,
                  }}
                />
                <Box
                  sx={{
                    position: "relative",
                    bgcolor: "error.main",
                    color: "white",
                    p: 3,
                    borderRadius: "50%",
                  }}
                >
                  <LockOutlined fontSize="large" />
                </Box>
              </Box>
            </Box>

            {/* Texto principal */}
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Acceso Denegado
            </Typography>

            <Typography color="text.secondary" mb={1}>
              No tienes los permisos necesarios para acceder a esta página.
            </Typography>

            <Typography color="text.secondary" mb={4}>
              Si crees que esto es un error, contacta con el administrador del
              sistema.
            </Typography>

            {/* Información */}
            <Box
              textAlign="left"
              //bgcolor="grey.50"
              border="1px solid"
              borderColor="grey.200"
              borderRadius={2}
              p={2}
              mb={4}
            >
              <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                Posibles razones:
              </Typography>

              <List dense disablePadding>
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckCircleOutlineIcon fontSize="small" color="action" />
                  </ListItemIcon>
                  <ListItemText primary="Tu cuenta no tiene los permisos necesarios" />
                </ListItem>

                <ListItem>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckCircleOutlineIcon fontSize="small" color="action" />
                  </ListItemIcon>
                  <ListItemText primary="Tu sesión ha expirado" />
                </ListItem>

                <ListItem>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckCircleOutlineIcon fontSize="small" color="action" />
                  </ListItemIcon>
                  <ListItemText primary="Funcionalidad restringida por rol" />
                </ListItem>

                <ListItem>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckCircleOutlineIcon fontSize="small" color="action" />
                  </ListItemIcon>
                  <ListItemText primary="Requiere un plan o suscripción diferente" />
                </ListItem>
              </List>
            </Box>

            {/* Acciones */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              justifyContent="center"
            >
              {/* <Button
                variant="outlined"
                color="inherit"
                startIcon={<ArrowBackOutlined />}
                onClick={() => navigate(-1)}
              >
                Volver
              </Button> */}

              <Button
                variant="contained"
                startIcon={<HomeOutlined />}
                onClick={() => navigate("/", { replace: true })}
              >
                Ir al Inicio
              </Button>

              <Button
                variant="outlined"
                color="primary"
                startIcon={<MailOutline />}
                onClick={() =>
                  (window.location.href = "mailto:support@tuempresa.com")
                }
              >
                Contactar Soporte
              </Button>
            </Stack>

            <Divider sx={{ my: 4 }} />

            {/* Código */}
            <Typography variant="body2" color="text.disabled">
              Código de error:{" "}
              <Box component="span" fontFamily="monospace" fontWeight="bold">
                403 – FORBIDDEN
              </Box>
            </Typography>
          </CardContent>
        </Card>

        {/* Footer */}
        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          mt={3}
        >
          ¿Necesitas ayuda? Visita nuestro{" "}
          <Box
            component="span"
            sx={{
              color: "primary.main",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Centro de Ayuda
          </Box>
        </Typography>
      </Box>
    </Box>
  );
}

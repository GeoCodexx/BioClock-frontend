// src/components/Logo/LogoUploader.jsx
import { useState } from "react";
import {
  Box, Button, Typography, useTheme, alpha,
} from "@mui/material";
import ImageIcon        from "@mui/icons-material/Image";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

import { useLogoContext }  from "../../contexts/LogoContext";
import LogoUploaderDialog  from "./LogoUploaderDialog";

/**
 * Trigger compacto para abrir el Dialog de gestión del logo.
 * Se embebe dentro del panel de Configuración en ProfileSection.
 * Autocontenido: lee LogoContext, no necesita props.
 */
const LogoUploader = () => {
  const theme = useTheme();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { logoUrl } = useLogoContext();

  return (
    <>
      <Box sx={{ px: 1.5, pb: 1.25 }}>
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

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            px: 1,
            py: 2,
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            bgcolor: theme.palette.background.default
          }}
        >
          {/* Thumbnail del logo actual */}
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.5,
              overflow: "hidden",
              border: `1px solid ${alpha(theme.palette.divider, 0.25)}`,
              bgcolor: theme.palette.background.default,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {logoUrl ? (
              <Box
                component="img"
                src={logoUrl}
                alt="logo actual"
                sx={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            ) : (
              <ImageIcon sx={{ fontSize: 16, color: theme.palette.text.disabled }} />
            )}
          </Box>

          {/* Estado */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                display: "block",
                fontSize: "0.75rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {logoUrl ? "Logo configurado" : "Sin logo"}
            </Typography>
          </Box>

          {/* Abrir dialog */}
          <Button
            size="small"
            variant="outlined"
            startIcon={<EditOutlinedIcon sx={{ fontSize: 13 }} />}
            onClick={() => setDialogOpen(true)}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.72rem",
              py: 0.4,
              px: 1.25,
              borderRadius: 1.5,
              whiteSpace: "nowrap",
              borderColor: alpha(theme.palette.primary.main, 0.35),
              color: theme.palette.primary.main,
              "&:hover": {
                borderColor: theme.palette.primary.main,
                bgcolor: alpha(theme.palette.primary.main, 0.06),
              },
            }}
          >
            Gestionar
          </Button>
        </Box>
      </Box>

      <LogoUploaderDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
};

export default LogoUploader;
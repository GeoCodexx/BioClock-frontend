import { useState } from "react";
import {
  Button,
  CircularProgress,
  Stack,
  Tooltip,
  IconButton,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import {
  exportJustificationsExcel,
  exportJustificationsPDF,
} from "../../services/justificationService";

/**
 * variant:
 *  - "desktop" → botones grandes
 *  - "mobile"  → icon buttons compactos
 */
export default function ExportButtons({
  filters = {},
  isDisabled,
  variant = "desktop",
}) {
  const theme = useTheme();
  const [loadingXlsx, setLoadingXlsx] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);

  const handleExcel = async () => {
    if (isDisabled) return;
    setLoadingXlsx(true);
    try {
      await exportJustificationsExcel(filters);
    } catch (err) {
      console.error("Error al exportar Excel:", err);
    } finally {
      setLoadingXlsx(false);
    }
  };

  const handlePDF = async () => {
    if (isDisabled) return;
    setLoadingPdf(true);
    try {
      await exportJustificationsPDF(filters);
    } catch (err) {
      console.error("Error al exportar PDF:", err);
    } finally {
      setLoadingPdf(false);
    }
  };

  const disabled = isDisabled || loadingXlsx || loadingPdf;

  // ========================
  // 🟢 MOBILE VARIANT
  // ========================
  if (variant === "mobile") {
    return (
      <>
        <Tooltip title="Exportar Excel" arrow>
          <span>
            <IconButton
              onClick={handleExcel}
              disabled={disabled}
              sx={{
                color: theme.palette.success.main,
              }}
            >
              {loadingXlsx ? (
                <CircularProgress size={20} />
              ) : (
                <TableChartOutlinedIcon />
              )}
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Exportar PDF" arrow>
          <span>
            <IconButton
              onClick={handlePDF}
              disabled={disabled}
              sx={{
                color: theme.palette.error.main,
              }}
            >
              {loadingPdf ? (
                <CircularProgress size={20} />
              ) : (
                <PictureAsPdfOutlinedIcon />
              )}
            </IconButton>
          </span>
        </Tooltip>
      </>
    );
  }

  // ========================
  // 🖥 DESKTOP VARIANT
  // ========================
  return (
    <Stack direction="row" spacing={1.5}>
      <Tooltip title="Exportar Excel con los filtros actuales" arrow>
        <span>
          <Button
            variant="outlined"
            color="success"
            onClick={handleExcel}
            disabled={disabled}
            startIcon={
              loadingXlsx ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <TableChartOutlinedIcon fontSize="small" />
              )
            }
            sx={{
              minWidth: 140,
              fontWeight: 600,
              borderWidth: 1.5,
              "&:hover": {
                borderWidth: 1.5,
                bgcolor: theme.palette.success.lighter || theme.palette.success.light + "20",
              },
            }}
          >
            {loadingXlsx ? "Generando…" : "Excel"}
          </Button>
        </span>
      </Tooltip>

      <Tooltip title="Exportar PDF con los filtros actuales" arrow>
        <span>
          <Button
            variant="outlined"
            color="error"
            onClick={handlePDF}
            disabled={disabled}
            startIcon={
              loadingPdf ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <PictureAsPdfOutlinedIcon fontSize="small" />
              )
            }
            sx={{
              minWidth: 140,
              fontWeight: 600,
              borderWidth: 1.5,
              "&:hover": {
                borderWidth: 1.5,
                bgcolor: theme.palette.error.lighter || theme.palette.error.light + "20",
              },
            }}
          >
            {loadingPdf ? "Generando…" : "PDF"}
          </Button>
        </span>
      </Tooltip>
    </Stack>
  );
}

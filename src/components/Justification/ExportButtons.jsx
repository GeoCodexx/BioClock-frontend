import { useState } from "react";
import { Button, ButtonGroup, CircularProgress, Tooltip } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
//import DownloadIcon from "@mui/icons-material/Download";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import { exportJustificationsExcel, exportJustificationsPDF } from "../../services/justificationService";


/**
 * @param {object} filters - filtros activos del listado
 *                           { status, userId, userName, scheduleId, startDate, endDate }
 */
export default function ExportButtons({ filters = {} }) {
  //const theme = useTheme();
  const [loadingXlsx, setLoadingXlsx] = useState(false);
  const [loadingPdf,  setLoadingPdf]  = useState(false);

  const handleExcel = async () => {
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
    setLoadingPdf(true);
    try {
      await exportJustificationsPDF(filters);
    } catch (err) {
      console.error("Error al exportar PDF:", err);
    } finally {
      setLoadingPdf(false);
    }
  };

  return (
    <ButtonGroup variant="outlined" size="small">
      <Tooltip title="Exportar Excel con los filtros actuales">
        <Button
          onClick={handleExcel}
          disabled={loadingXlsx || loadingPdf}
          startIcon={
            loadingXlsx
              ? <CircularProgress size={14} color="inherit" />
              : <TableChartOutlinedIcon fontSize="small" />
          }
          sx={{
            color: "#166534",
            borderColor: alpha("#166534", 0.4),
            "&:hover": {
              borderColor: "#166534",
              bgcolor: alpha("#166534", 0.07),
            },
          }}
        >
          {loadingXlsx ? "Generando…" : "Excel"}
        </Button>
      </Tooltip>

      <Tooltip title="Exportar PDF con los filtros actuales">
        <Button
          onClick={handlePDF}
          disabled={loadingXlsx || loadingPdf}
          startIcon={
            loadingPdf
              ? <CircularProgress size={14} color="inherit" />
              : <PictureAsPdfOutlinedIcon fontSize="small" />
          }
          sx={{
            color: "#991B1B",
            borderColor: alpha("#991B1B", 0.4),
            "&:hover": {
              borderColor: "#991B1B",
              bgcolor: alpha("#991B1B", 0.07),
            },
          }}
        >
          {loadingPdf ? "Generando…" : "PDF"}
        </Button>
      </Tooltip>
    </ButtonGroup>
  );
}

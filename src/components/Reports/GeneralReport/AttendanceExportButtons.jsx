import { useState } from "react";
import {
  Button,
  Stack,
  Tooltip,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
} from "@mui/material";
import {
  Description as DescriptionIcon,
  PictureAsPdf as PictureAsPdfIcon,
  ArrowDropDown as ArrowDropDownIcon,
  FilterList as FilterListIcon,
  SelectAll as SelectAllIcon,
} from "@mui/icons-material";
import { saveAs } from "file-saver";
import { getFileExport } from "../../../services/reportService";
import useSnackbarStore from "../../../store/useSnackbarStore";

/**
 * Componente de botones de exportación para asistencias
 * Compatible con el controlador refactorizado que usa query params
 *
 * @param {Object} props
 * @param {string} props.viewType - 'table' o 'matrix'
 * @param {Object} props.filters - Filtros actuales { search, scheduleId, status }
 * @param {Object} props.dateRange - { startDate, endDate }
 * @param {number} props.currentPage - Página actual (solo para tabla)
 * @param {number} props.totalRecords - Total de registros disponibles
 * @param {string} props.apiEndpoint - Endpoint base (ej: '/api/attendance/records')
 */
export default function AttendanceExportButtons({
  viewType = "table",
  filters = {},
  dateRange = {},
  currentPage = 1,
  totalRecords = 0,
  //apiEndpoint = "/api/attendance/records",
}) {
  const [excelAnchor, setExcelAnchor] = useState(null);
  const [pdfAnchor, setPdfAnchor] = useState(null);
  const [exporting, setExporting] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const {showError } = useSnackbarStore();

  const isDisabled = totalRecords === 0;

  // Manejadores de menú
  const handleExcelClick = (event) => setExcelAnchor(event.currentTarget);
  const handlePdfClick = (event) => setPdfAnchor(event.currentTarget);
  const handleClose = () => {
    setExcelAnchor(null);
    setPdfAnchor(null);
  };

  /**
   * Función para exportar datos
   * Usa los mismos query params que el controlador actual
   * pero agrega: export=true, format, scope
   *
   * @param {string} format - 'excel' o 'pdf'
   * @param {string} scope - 'current' o 'all'
   */
  const handleExport = async (format, scope) => {
    handleClose();
    setExporting(true);

    try {
      // Construir parámetros de consulta
      const params = {
        // Parámetros base (siempre requeridos)
        startDate: dateRange.dateFrom,
        endDate: dateRange.dateTo,

        // Parámetros de vista
        view: viewType, // 'table' o 'matrix'

        // Parámetros de exportación
        export: "true",
        format, // 'excel' o 'pdf'
        scope, // 'current' o 'all'
      };

      // Si es scope "current", agregar filtros y paginación
      if (scope === "current") {
        // Filtros (solo si tienen valor)
        if (filters.search) {
          params.search = filters.search;
        }
        if (filters.scheduleId) {
          params.scheduleId = filters.scheduleId;
        }
        if (filters.status) {
          params.status = filters.status;
        }

        // Paginación (solo para vista tabla)
        if (viewType === "table") {
          params.page = currentPage;
          params.limit = 10; // O el tamaño que uses
        }
      }

      // Realizar petición al backend
      const response = await getFileExport({
        params,
        responseType: "blob",
      });

      // Determinar nombre del archivo
      const extension = format === "excel" ? "xlsx" : "pdf";
      const timestamp = new Date().toISOString().split("T")[0];
      const viewName = viewType === "matrix" ? "Matriz" : "Tabla";
      const scopeName = scope === "current" ? "Vista_Actual" : "Completo";
      const fileName = `Asistencias_${viewName}_${scopeName}_${timestamp}.${extension}`;

      // Descargar archivo
      saveAs(response, fileName);

      console.log(`✅ Exportación exitosa: ${fileName}`);
    } catch (error) {
      console.error(`Error exporting ${format}:`, error);

      // Mostrar mensaje de error específico si está disponible
      let errorMessage = `Error al exportar el archivo ${format.toUpperCase()}. Por favor, intente nuevamente.`;

      if (error.response?.data) {
        // Si el error viene como blob, intentar leerlo
        if (error.response.data instanceof Blob) {
          try {
            const errorText = await error.response.data.text();
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            // Si no se puede parsear, usar mensaje por defecto
          }
        }
      }

      showError(errorMessage);
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
        {/* Botón Excel con menú */}
        <Tooltip
          title={
            isDisabled
              ? "No hay datos para exportar"
              : exporting
                ? "Exportando..."
                : "Exportar a Excel"
          }
          arrow
        >
          <span>
            <Button
              variant="outlined"
              color="success"
              startIcon={
                exporting ? (
                  <CircularProgress size={20} color="success" />
                ) : (
                  <DescriptionIcon />
                )
              }
              endIcon={!exporting && <ArrowDropDownIcon />}
              onClick={handleExcelClick}
              disabled={isDisabled || exporting}
              fullWidth={isMobile}
              sx={{
                minWidth: isMobile ? 125 : 160,
                fontWeight: 600,
                borderWidth: 1.5,
                "&:hover": {
                  borderWidth: 1.5,
                  bgcolor:
                    theme.palette.success.lighter ||
                    theme.palette.success.light + "20",
                },
              }}
            >
              Excel
            </Button>
          </span>
        </Tooltip>

        {/* Botón PDF con menú */}
        <Tooltip
          title={
            isDisabled
              ? "No hay datos para exportar"
              : exporting
                ? "Exportando..."
                : "Exportar a PDF"
          }
          arrow
        >
          <span>
            <Button
              variant="outlined"
              color="error"
              startIcon={
                exporting ? (
                  <CircularProgress size={20} color="error" />
                ) : (
                  <PictureAsPdfIcon />
                )
              }
              endIcon={!exporting && <ArrowDropDownIcon />}
              onClick={handlePdfClick}
              disabled={isDisabled || exporting}
              fullWidth={isMobile}
              sx={{
                minWidth: isMobile ? 125 : 160,
                fontWeight: 600,
                borderWidth: 1.5,
                "&:hover": {
                  borderWidth: 1.5,
                  bgcolor:
                    theme.palette.error.lighter ||
                    theme.palette.error.light + "20",
                },
              }}
            >
              PDF
            </Button>
          </span>
        </Tooltip>
      </Stack>

      {/* Menú Excel */}
      <Menu
        anchorEl={excelAnchor}
        open={Boolean(excelAnchor)}
        onClose={handleClose}
        PaperProps={{
          elevation: 3,
          sx: { minWidth: 240 },
        }}
      >
        <MenuItem
          onClick={() => handleExport("excel", "current")}
          disabled={exporting}
        >
          <ListItemIcon>
            <FilterListIcon fontSize="small" color="success" />
          </ListItemIcon>
          <ListItemText
            primary="Vista Actual"
            secondary="Datos visibles con filtros actuales"
            secondaryTypographyProps={{ variant: "caption" }}
          />
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => handleExport("excel", "all")}
          disabled={exporting}
        >
          <ListItemIcon>
            <SelectAllIcon fontSize="small" color="success" />
          </ListItemIcon>
          <ListItemText
            primary="Exportar Todo"
            secondary={`${totalRecords} registros ordenados por fecha`}
            secondaryTypographyProps={{ variant: "caption" }}
          />
        </MenuItem>
      </Menu>

      {/* Menú PDF */}
      <Menu
        anchorEl={pdfAnchor}
        open={Boolean(pdfAnchor)}
        onClose={handleClose}
        PaperProps={{
          elevation: 3,
          sx: { minWidth: 240 },
        }}
      >
        <MenuItem
          onClick={() => handleExport("pdf", "current")}
          disabled={exporting}
        >
          <ListItemIcon>
            <FilterListIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText
            primary="Vista Actual"
            secondary="Datos con filtros actuales"
            secondaryTypographyProps={{ variant: "caption" }}
          />
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => handleExport("pdf", "all")}
          disabled={exporting}
        >
          <ListItemIcon>
            <SelectAllIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText
            primary="Exportar Todo"
            secondary={`${totalRecords} registros ordenados por fecha`}
            secondaryTypographyProps={{ variant: "caption" }}
          />
        </MenuItem>
      </Menu>
    </>
  );
}

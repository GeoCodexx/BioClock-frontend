import {
  Button,
  Stack,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Tooltip,
} from "@mui/material";
import {
  PictureAsPdf as PictureAsPdfIcon,
  Description as DescriptionIcon,
  FileDownload as FileDownloadIcon,
} from "@mui/icons-material";
import { useState, useMemo } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";
import useSnackbarStore from "../../store/useSnackbarStore";

// ============ UTILIDADES ============
const formatters = {
  fullName: (user) =>
    user
      ? `${user.name} ${user.firstSurname} ${user.secondSurname || ""}`.trim()
      : "—",

  finger: (finger) => {
    const fingerMap = {
      pulgar_derecho: "Pulgar derecho",
      indice_derecho: "Índice derecho",
      medio_derecho: "Medio derecho",
      anular_derecho: "Anular derecho",
      menique_derecho: "Meñique derecho",
      pulgar_izquierdo: "Pulgar izquierdo",
      indice_izquierdo: "Índice izquierdo",
      medio_izquierdo: "Medio izquierdo",
      anular_izquierdo: "Anular izquierdo",
      menique_izquierdo: "Meñique izquierdo",
    };
    return fingerMap[finger] || finger?.replace(/_/g, " ") || "—";
  },

  date: (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  },

  status: (status) => {
    const statusMap = {
      approved: "Aprobado",
      pending: "Pendiente",
      rejected: "Rechazado",
    };
    return statusMap[status] || status || "—";
  },

  statusColor: (status) => {
    const colors = {
      approved: { text: "FF2E7D32", bg: "FFE8F5E9" },
      pending: { text: "FFED6C02", bg: "FFFFF3E0" },
      rejected: { text: "FFD32F2F", bg: "FFFFEBEE" },
    };
    return colors[status] || { text: "FF757575", bg: "FFF5F5F5" };
  },
};

const getFileName = (extension) =>
  `huellas_dactilares_${new Date().toISOString().split("T")[0]}.${extension}`;

// ============ COMPONENTE PRINCIPAL ============
export default function FingerprintExportButtons({ fingerprints = [] }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const { showError } = useSnackbarStore();

  // Validación y transformación de datos
  const isDisabled = useMemo(
    () => !fingerprints || fingerprints.length === 0,
    [fingerprints],
  );

  const formattedData = useMemo(
    () =>
      fingerprints.map((fp) => ({
        index: fp.index || "—",
        dni: fp.userId?.dni || "—",
        usuario: formatters.fullName(fp.userId),
        dedo: formatters.finger(fp.finger),
        dispositivo: fp.deviceId?.name || "—",
        aprobador: fp.approvedBy ? formatters.fullName(fp.approvedBy) : "—",
        fecha: formatters.date(fp.createdAt),
        estado: formatters.status(fp.status),
        estadoRaw: fp.status,
      })),
    [fingerprints],
  );

  const handleClick = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  // ============ EXPORTAR A EXCEL ============
  const handleExportExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Huellas Dactilares");

      // Configurar columnas
      worksheet.columns = [
        { header: "DNI", key: "dni", width: 12 },
        { header: "Usuario", key: "usuario", width: 35 },
        { header: "Dedo", key: "dedo", width: 18 },
        { header: "Dispositivo", key: "dispositivo", width: 25 },
        { header: "Aprobador", key: "aprobador", width: 35 },
        { header: "Fecha", key: "fecha", width: 13 },
        { header: "Estado", key: "estado", width: 12 },
      ];

      // Agregar datos
      formattedData.forEach((row) => worksheet.addRow(row));

      // Estilo de la cabecera
      const headerRow = worksheet.getRow(1);
      headerRow.height = 25;
      headerRow.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1976D2" },
      };
      headerRow.alignment = { vertical: "middle", horizontal: "center" };

      // Aplicar estilos a las filas de datos
      worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell, colNumber) => {
          // Bordes
          cell.border = {
            top: { style: "thin", color: { argb: "FFE0E0E0" } },
            left: { style: "thin", color: { argb: "FFE0E0E0" } },
            bottom: { style: "thin", color: { argb: "FFE0E0E0" } },
            right: { style: "thin", color: { argb: "FFE0E0E0" } },
          };

          if (rowNumber > 1) {
            const dataRow = formattedData[rowNumber - 2];

            cell.alignment = {
              vertical: "middle",
              horizontal:
                colNumber === 1 || colNumber === 6 ? "center" : "left",
              wrapText: true,
            };
            row.height = 22;

            // Color alternado
            if (rowNumber % 2 === 0) {
              cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFF5F5F5" },
              };
            }

            // DNI con estilo especial
            if (colNumber === 1) {
              cell.font = {
                name: "Courier New",
                color: { argb: "FF0D47A1" },
                bold: true,
              };
            }

            // Estado con colores
            if (colNumber === 7 && dataRow) {
              const colors = formatters.statusColor(dataRow.estadoRaw);
              cell.alignment = { vertical: "middle", horizontal: "center" };
              cell.font = { bold: true, color: { argb: colors.text } };
              cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: colors.bg },
              };
            }
          }
        });
      });

      // Información adicional
      const lastRow = worksheet.rowCount + 2;
      worksheet.getCell(`A${lastRow}`).value = "Total de registros:";
      worksheet.getCell(`A${lastRow}`).font = { bold: true };
      worksheet.getCell(`B${lastRow}`).value = fingerprints.length;
      worksheet.getCell(`B${lastRow}`).font = {
        bold: true,
        color: { argb: "FF1976D2" },
      };

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      saveAs(blob, getFileName("xlsx"));
      handleClose();
    } catch (error) {
      console.error("Error al exportar Excel:", error);
      showError("Error al exportar a Excel. Por favor, intente nuevamente.");
    }
  };

  // ============ EXPORTAR A PDF ============
  const handleExportPDF = () => {
    try {
      const doc = new jsPDF({ orientation: "landscape" });
      const pageWidth = doc.internal.pageSize.getWidth();

      // Título
      doc.setFontSize(20);
      doc.setTextColor(25, 118, 210);
      doc.setFont(undefined, "bold");
      doc.text("Registro de Huellas Dactilares", 14, 22);

      // Línea decorativa
      doc.setDrawColor(25, 118, 210);
      doc.setLineWidth(0.5);
      doc.line(14, 25, pageWidth - 14, 25);

      // Información del reporte
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.setFont(undefined, "normal");
      const now = new Date().toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      doc.text(`Fecha de generación: ${now}`, 14, 32);
      doc.text(`Total de registros: ${fingerprints.length}`, 14, 37);

      // Preparar datos
      const tableData = formattedData.map((row) => [
        row.index,
        row.dni,
        row.usuario,
        row.dedo,
        row.dispositivo,
        row.aprobador,
        row.fecha,
        row.estado,
      ]);

      // Tabla
      doc.autoTable({
        startY: 42,
        head: [
          [
            "#",
            "DNI",
            "Usuario",
            "Dedo",
            "Dispositivo",
            "Aprobador",
            "Fecha",
            "Estado",
          ],
        ],
        body: tableData,
        styles: {
          fontSize: 9,
          cellPadding: 3,
          lineColor: [200, 200, 200],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [25, 118, 210],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "center",
          fontSize: 10,
        },
        columnStyles: {
          0: { cellWidth: 12, halign: "center" },
          1: {
            cellWidth: 24,
            halign: "center",
            font: "courier",
            fontStyle: "bold",
          },
          2: { cellWidth: 53 },
          3: { cellWidth: 34 },
          4: { cellWidth: 41 },
          5: { cellWidth: 53 },
          6: { cellWidth: 26, halign: "center" },
          7: { cellWidth: 26, halign: "center", fontStyle: "bold" },
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250],
        },
        didDrawCell: (data) => {
          // DNI con fondo especial
          if (data.column.index === 1 && data.section === "body") {
            doc.setFillColor(227, 242, 253);
            doc.rect(
              data.cell.x,
              data.cell.y,
              data.cell.width,
              data.cell.height,
              "F",
            );
            doc.setTextColor(13, 71, 161);
            doc.setFont("courier", "bold");
            doc.text(
              data.cell.raw,
              data.cell.x + data.cell.width / 2,
              data.cell.y + data.cell.height / 2,
              { align: "center", baseline: "middle" },
            );
          }

          // Estado con colores
          if (data.column.index === 7 && data.section === "body") {
            const status = formattedData[data.row.index]?.estadoRaw;
            const colors = formatters.statusColor(status);

            const bgColors = {
              approved: [232, 245, 233],
              pending: [255, 243, 224],
              rejected: [255, 235, 238],
            };
            const textColors = {
              approved: [46, 125, 50],
              pending: [237, 108, 2],
              rejected: [211, 47, 47],
            };

            const bgColor = bgColors[status] || [245, 245, 245];
            const textColor = textColors[status] || [117, 117, 117];

            doc.setFillColor(...bgColor);
            doc.rect(
              data.cell.x,
              data.cell.y,
              data.cell.width,
              data.cell.height,
              "F",
            );
            doc.setTextColor(...textColor);
            doc.setFont(undefined, "bold");
            doc.text(
              data.cell.raw,
              data.cell.x + data.cell.width / 2,
              data.cell.y + data.cell.height / 2,
              { align: "center", baseline: "middle" },
            );
          }
        },
        margin: { top: 42, left: 14, right: 14 },
      });

      // Footer con número de página
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.setFont(undefined, "normal");

        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.1);
        const footerY = doc.internal.pageSize.getHeight() - 15;
        doc.line(14, footerY, pageWidth - 14, footerY);

        doc.text(
          `Página ${i} de ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" },
        );
      }

      doc.save(getFileName("pdf"));
      handleClose();
    } catch (error) {
      console.error("Error al exportar PDF:", error);
      showError("Error al exportar a PDF. Por favor, intente nuevamente.");
    }
  };

  // ============ RENDERIZADO RESPONSIVE ============
  if (isMobile) {
    return (
      <>
        <Tooltip
          title={isDisabled ? "No hay registros para exportar" : "Exportar"}
        >
          <span>
            <IconButton
              onClick={handleClick}
              disabled={isDisabled}
              sx={{
                bgcolor: theme.palette.background.paper,
                "&:hover": { bgcolor: theme.palette.action.hover },
                "&:disabled": {
                  bgcolor: theme.palette.action.disabledBackground,
                },
              }}
            >
              <FileDownloadIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          slotProps={{
            paper: {
              sx: { mt: 1, minWidth: 200, boxShadow: theme.shadows[4] },
            },
          }}
        >
          <MenuItem onClick={handleExportExcel}>
            <ListItemIcon>
              <DescriptionIcon
                fontSize="small"
                sx={{ color: theme.palette.success.main }}
              />
            </ListItemIcon>
            <ListItemText>Exportar a Excel</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleExportPDF}>
            <ListItemIcon>
              <PictureAsPdfIcon
                fontSize="small"
                sx={{ color: theme.palette.error.main }}
              />
            </ListItemIcon>
            <ListItemText>Exportar a PDF</ListItemText>
          </MenuItem>
        </Menu>
      </>
    );
  }

  if (isTablet) {
    return (
      <Stack direction="row" spacing={1}>
        <Tooltip
          title={isDisabled ? "No hay registros" : "Exportar a Excel"}
          arrow
        >
          <span>
            <IconButton
              onClick={handleExportExcel}
              disabled={isDisabled}
              size="medium"
              sx={{
                bgcolor:
                  theme.palette.success.lighter ||
                  theme.palette.success.light + "20",
                color: theme.palette.success.main,
                border: `1px solid ${theme.palette.success.light}`,
                "&:hover": { bgcolor: theme.palette.success.light + "40" },
                "&:disabled": {
                  bgcolor: theme.palette.action.disabledBackground,
                  color: theme.palette.action.disabled,
                },
              }}
            >
              <DescriptionIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip
          title={isDisabled ? "No hay registros" : "Exportar a PDF"}
          arrow
        >
          <span>
            <IconButton
              onClick={handleExportPDF}
              disabled={isDisabled}
              size="medium"
              sx={{
                bgcolor:
                  theme.palette.error.lighter ||
                  theme.palette.error.light + "20",
                color: theme.palette.error.main,
                border: `1px solid ${theme.palette.error.light}`,
                "&:hover": { bgcolor: theme.palette.error.light + "40" },
                "&:disabled": {
                  bgcolor: theme.palette.action.disabledBackground,
                  color: theme.palette.action.disabled,
                },
              }}
            >
              <PictureAsPdfIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>
    );
  }

  return (
    <Stack direction="row" spacing={1.5}>
      <Tooltip
        title={
          isDisabled
            ? "No hay registros para exportar"
            : "Descargar en formato Excel"
        }
        arrow
      >
        <span>
          <Button
            variant="outlined"
            color="success"
            startIcon={<DescriptionIcon />}
            onClick={handleExportExcel}
            disabled={isDisabled}
            sx={{
              minWidth: 140,
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
      <Tooltip
        title={
          isDisabled
            ? "No hay registros para exportar"
            : "Descargar en formato PDF"
        }
        arrow
      >
        <span>
          <Button
            variant="outlined"
            color="error"
            startIcon={<PictureAsPdfIcon />}
            onClick={handleExportPDF}
            disabled={isDisabled}
            sx={{
              minWidth: 140,
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
  );
}

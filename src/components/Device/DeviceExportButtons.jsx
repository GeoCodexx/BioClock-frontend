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
import { useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";
import useSnackbarStore from "../../store/useSnackbarStore";

export default function DeviceExportButtons({ devices }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const { showError } = useSnackbarStore();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Función para formatear el nombre completo
  const formatFullName = (user) => {
    const parts = [user.name, user.firstSurname, user.secondSurname].filter(
      Boolean,
    );
    return parts.join(" ") || "—";
  };

  // Exportar a Excel
  const handleExportExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Dispositivos");

      // Configurar columnas
      worksheet.columns = [
        { header: "ID", key: "deviceId", width: 20 },
        { header: "Nombre", key: "name", width: 30 },
        { header: "Dirección IP", key: "ipAddress", width: 20 },
        { header: "Dirección MAC", key: "macAddress", width: 20 },
        { header: "Ubicación", key: "location", width: 35 },
        { header: "Registrador", key: "registeredBy", width: 30 },
        { header: "Estado", key: "status", width: 15 },
      ];

      // Agregar datos
      devices.forEach((dev) => {
        worksheet.addRow({
          deviceId: dev.deviceId || "—",
          name: dev.name || "—",
          ipAddress: dev.ipAddress || "—",
          macAddress: dev.macAddress || "—",
          location: dev.location || "Sin ubicación",
          registeredBy: formatFullName(dev.registeredBy),
          status: dev.status === "active" ? "Activo" : "Inactivo",
        });
      });

      // Estilo de la cabecera
      const headerRow = worksheet.getRow(1);
      headerRow.height = 25;
      headerRow.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1976D2" },
      };
      headerRow.alignment = {
        vertical: "middle",
        horizontal: "center",
      };

      // Aplicar estilos a todas las filas de datos
      worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell, colNumber) => {
          // Bordes
          cell.border = {
            top: { style: "thin", color: { argb: "FFE0E0E0" } },
            left: { style: "thin", color: { argb: "FFE0E0E0" } },
            bottom: { style: "thin", color: { argb: "FFE0E0E0" } },
            right: { style: "thin", color: { argb: "FFE0E0E0" } },
          };

          // Estilo para filas de datos
          if (rowNumber > 1) {
            cell.alignment = {
              vertical: "middle",
              horizontal: "left",
              wrapText: true,
            };

            row.height = 20;

            // Color alternado para filas
            if (rowNumber % 2 === 0) {
              cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFF5F5F5" },
              };
            }

            // Columna de Estado con color
            if (colNumber === 3) {
              cell.alignment = { vertical: "middle", horizontal: "center" };
              const status = cell.value;
              if (status === "Activo") {
                cell.font = { bold: true, color: { argb: "FF2E7D32" } };
                cell.fill = {
                  type: "pattern",
                  pattern: "solid",
                  fgColor: { argb: "FFE8F5E9" },
                };
              } else {
                cell.font = { bold: true, color: { argb: "FFD32F2F" } };
                cell.fill = {
                  type: "pattern",
                  pattern: "solid",
                  fgColor: { argb: "FFFFEBEE" },
                };
              }
            }
          }
        });
      });

      // Información adicional al final
      const lastRow = worksheet.rowCount + 2;
      worksheet.getCell(`A${lastRow}`).value = "Total de dispositivos:";
      worksheet.getCell(`A${lastRow}`).font = { bold: true };
      worksheet.getCell(`B${lastRow}`).value = devices.length;
      worksheet.getCell(`B${lastRow}`).font = {
        bold: true,
        color: { argb: "FF1976D2" },
      };

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const fileName = `dispositivos_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      saveAs(blob, fileName);
      handleClose();
    } catch (error) {
      console.error("Error al exportar Excel:", error);
      showError("Error al exportar a Excel. Por favor, intente nuevamente.");
    }
  };

  // Exportar a PDF
  const handleExportPDF = () => {
    try {
      // Crear PDF en orientación HORIZONTAL para más espacio
      const doc = new jsPDF("landscape", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth(); // ~297mm en horizontal
      const margins = 14;
      const availableWidth = pageWidth - margins * 2; // ~269mm disponibles

      // Título
      doc.setFontSize(20);
      doc.setTextColor(25, 118, 210);
      doc.setFont(undefined, "bold");
      doc.text("Listado de Dispositivos", margins, 22);

      // Línea decorativa
      doc.setDrawColor(25, 118, 210);
      doc.setLineWidth(0.5);
      doc.line(margins, 25, pageWidth - margins, 25);

      // Información del reporte
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.setFont(undefined, "normal");
      doc.text(
        `Fecha de generación: ${new Date().toLocaleDateString("es-ES", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}`,
        margins,
        32,
      );
      doc.text(`Total de dispositivos: ${devices.length}`, margins, 37);

      // Preparar datos de la tabla
      const tableData = devices.map((dev) => [
        dev.index || "—",
        dev.deviceId || "—",
        dev.name || "—",
        dev.ipAddress || "—",
        dev.macAddress || "—",
        dev.location || "Sin ubicación",
        formatFullName(dev.registeredBy),
        dev.status === "active" ? "Activo" : "Inactivo",
      ]);

      // Tabla principal con anchos optimizados para A4 horizontal
      doc.autoTable({
        startY: 42,
        head: [
          [
            "#",
            "Device ID",
            "Nombre",
            "Dirección IP",
            "Dirección MAC",
            "Ubicación",
            "Registrador",
            "Estado",
          ],
        ],
        body: tableData,
        styles: {
          fontSize: 8,
          cellPadding: 3,
          lineColor: [200, 200, 200],
          lineWidth: 0.1,
          overflow: "linebreak",
        },
        headStyles: {
          fillColor: [25, 118, 210],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "center",
          valign: "middle",
          fontSize: 9,
        },
        columnStyles: {
          0: { cellWidth: 10, halign: "center" }, // #
          1: { cellWidth: 32, halign: "center", fontSize: 7 }, // Device ID
          2: { cellWidth: 45, fontStyle: "bold" }, // Nombre
          3: { cellWidth: 28, halign: "center", fontSize: 7 }, // IP
          4: { cellWidth: 32, halign: "center", fontSize: 7 }, // MAC
          5: { cellWidth: 52 }, // Ubicación
          6: { cellWidth: 48 }, // Registrador
          7: { cellWidth: 22, halign: "center" }, // Estado
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250],
        },
        didDrawCell: (data) => {
          // Colorear la celda de Estado
          if (data.column.index === 7 && data.section === "body") {
            const status = data.cell.raw;
            if (status === "Activo") {
              doc.setFillColor(232, 245, 233);
              doc.rect(
                data.cell.x,
                data.cell.y,
                data.cell.width,
                data.cell.height,
                "F",
              );
              doc.setTextColor(46, 125, 50);
              doc.setFontSize(8);
              doc.setFont(undefined, "bold");
              doc.text(
                status,
                data.cell.x + data.cell.width / 2,
                data.cell.y + data.cell.height / 2,
                { align: "center", baseline: "middle" },
              );
            } else if (status === "Inactivo") {
              doc.setFillColor(255, 235, 238);
              doc.rect(
                data.cell.x,
                data.cell.y,
                data.cell.width,
                data.cell.height,
                "F",
              );
              doc.setTextColor(211, 47, 47);
              doc.setFontSize(8);
              doc.setFont(undefined, "bold");
              doc.text(
                status,
                data.cell.x + data.cell.width / 2,
                data.cell.y + data.cell.height / 2,
                { align: "center", baseline: "middle" },
              );
            }
          }
        },
        margin: { top: 42, left: margins, right: margins },
      });

      // Footer con número de página
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.setFont(undefined, "normal");

        // Línea superior del footer
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.1);
        doc.line(
          margins,
          doc.internal.pageSize.getHeight() - 15,
          pageWidth - margins,
          doc.internal.pageSize.getHeight() - 15,
        );

        // Número de página
        doc.text(
          `Página ${i} de ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" },
        );
      }

      const fileName = `dispositivos_${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      doc.save(fileName);
      handleClose();
    } catch (error) {
      console.error("Error al exportar PDF:", error);
      showError("Error al exportar a PDF. Por favor, intente nuevamente.");
    }
  };

  // Validar si hay dispositivos disponibles
  const isDisabled = !devices || devices.length === 0;

  // =============== VERSIÓN MOBILE ===============
  if (isMobile) {
    return (
      <>
        <Tooltip
          title={isDisabled ? "No hay dispositivos para exportar" : "Exportar"}
        >
          <span>
            <IconButton
              onClick={handleClick}
              disabled={isDisabled}
              sx={{
                bgcolor: theme.palette.background.paper,
                "&:hover": {
                  bgcolor: theme.palette.action.hover,
                },
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
              sx: {
                mt: 1,
                minWidth: 200,
                boxShadow: theme.shadows[4],
              },
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

  // =============== VERSIÓN TABLET ===============
  if (isTablet) {
    return (
      <Stack direction="row" spacing={1}>
        <Tooltip
          title={isDisabled ? "No hay dispositivos" : "Exportar a Excel"}
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
                "&:hover": {
                  bgcolor: theme.palette.success.light + "40",
                },
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
          title={isDisabled ? "No hay dispositivos" : "Exportar a PDF"}
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
                "&:hover": {
                  bgcolor: theme.palette.error.light + "40",
                },
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

  // =============== VERSIÓN DESKTOP ===============
  return (
    <Stack direction="row" spacing={1.5}>
      <Tooltip
        title={
          isDisabled
            ? "No hay dispositivos para exportar"
            : "Descargar lista en formato Excel"
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
            ? "No hay dispositivos para exportar"
            : "Descargar lista en formato PDF"
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

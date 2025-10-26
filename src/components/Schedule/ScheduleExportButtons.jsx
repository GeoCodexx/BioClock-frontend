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

export default function ScheduleExportButtons({ schedules }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Mapa de traducción de días
  const dayTranslations = {
    monday: "Lun",
    tuesday: "Mar",
    wednesday: "Mié",
    thursday: "Jue",
    friday: "Vie",
    saturday: "Sáb",
    sunday: "Dom",
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Función para formatear días
  const formatDays = (days = []) => {
    if (!days || days.length === 0) return "Sin días";
    return days.map((day) => dayTranslations[day] || day).join(", ");
  };

  // Exportar a Excel
  const handleExportExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Horarios");

      // Configurar columnas
      worksheet.columns = [
        { header: "Nombre", key: "name", width: 30 },
        { header: "Días Laborales", key: "days", width: 30 },
        { header: "Hora de Entrada", key: "startTime", width: 18 },
        { header: "Hora de Salida", key: "endTime", width: 18 },
        { header: "Tolerancia (min)", key: "toleranceMinutes", width: 18 },
        { header: "Estado", key: "status", width: 12 },
      ];

      // Agregar datos
      schedules.forEach((schedule) => {
        worksheet.addRow({
          name: schedule.name || "—",
          days: formatDays(schedule.days),
          startTime: schedule.startTime || "—",
          endTime: schedule.endTime || "—",
          toleranceMinutes: schedule.toleranceMinutes || 0,
          status: schedule.status === "active" ? "Activo" : "Inactivo",
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

            // Columnas de hora centradas
            if (colNumber === 3 || colNumber === 4) {
              cell.alignment = { vertical: "middle", horizontal: "center" };
              cell.font = { bold: true, color: { argb: "FF1565C0" } };
            }

            // Columna de tolerancia centrada
            if (colNumber === 5) {
              cell.alignment = { vertical: "middle", horizontal: "center" };
              cell.font = { color: { argb: "FF757575" } };
            }

            // Columna de Estado con color
            if (colNumber === 6) {
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
      worksheet.getCell(`A${lastRow}`).value = "Total de horarios:";
      worksheet.getCell(`A${lastRow}`).font = { bold: true };
      worksheet.getCell(`B${lastRow}`).value = schedules.length;
      worksheet.getCell(`B${lastRow}`).font = { bold: true, color: { argb: "FF1976D2" } };

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      
      const fileName = `horarios_${new Date().toISOString().split("T")[0]}.xlsx`;
      saveAs(blob, fileName);
      handleClose();
    } catch (error) {
      console.error("Error al exportar Excel:", error);
      alert("Error al exportar a Excel. Por favor, intente nuevamente.");
    }
  };

  // Exportar a PDF
  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Título
      doc.setFontSize(20);
      doc.setTextColor(25, 118, 210);
      doc.setFont(undefined, "bold");
      doc.text("Listado de Horarios", 14, 22);

      // Línea decorativa
      doc.setDrawColor(25, 118, 210);
      doc.setLineWidth(0.5);
      doc.line(14, 25, pageWidth - 14, 25);

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
        14,
        32
      );
      doc.text(`Total de horarios: ${schedules.length}`, 14, 37);

      // Preparar datos de la tabla
      const tableData = schedules.map((schedule) => [
        schedule.name || "—",
        formatDays(schedule.days),
        schedule.startTime || "—",
        schedule.endTime || "—",
        `${schedule.toleranceMinutes || 0} min`,
        schedule.status === "active" ? "Activo" : "Inactivo",
      ]);

      // Tabla principal
      doc.autoTable({
        startY: 42,
        head: [["Nombre", "Días Laborales", "Entrada", "Salida", "Tolerancia", "Estado"]],
        body: tableData,
        styles: {
          fontSize: 8,
          cellPadding: 4,
          lineColor: [200, 200, 200],
          lineWidth: 0.1,
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
          0: { cellWidth: 35, fontStyle: "bold" }, // Nombre
          1: { cellWidth: 45 }, // Días
          2: { cellWidth: 25, halign: "center", fontStyle: "bold", textColor: [21, 101, 192] }, // Entrada
          3: { cellWidth: 25, halign: "center", fontStyle: "bold", textColor: [21, 101, 192] }, // Salida
          4: { cellWidth: 25, halign: "center", textColor: [117, 117, 117] }, // Tolerancia
          5: { cellWidth: 25, halign: "center" }, // Estado
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250],
        },
        didDrawCell: (data) => {
          // Colorear la celda de Estado
          if (data.column.index === 5 && data.section === "body") {
            const status = data.cell.raw;
            if (status === "Activo") {
              doc.setFillColor(232, 245, 233);
              doc.rect(
                data.cell.x,
                data.cell.y,
                data.cell.width,
                data.cell.height,
                "F"
              );
              doc.setTextColor(46, 125, 50);
              doc.setFontSize(8);
              doc.setFont(undefined, "bold");
              doc.text(
                status,
                data.cell.x + data.cell.width / 2,
                data.cell.y + data.cell.height / 2,
                { align: "center", baseline: "middle" }
              );
            } else if (status === "Inactivo") {
              doc.setFillColor(255, 235, 238);
              doc.rect(
                data.cell.x,
                data.cell.y,
                data.cell.width,
                data.cell.height,
                "F"
              );
              doc.setTextColor(211, 47, 47);
              doc.setFontSize(8);
              doc.setFont(undefined, "bold");
              doc.text(
                status,
                data.cell.x + data.cell.width / 2,
                data.cell.y + data.cell.height / 2,
                { align: "center", baseline: "middle" }
              );
            }
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
        
        // Línea superior del footer
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.1);
        doc.line(14, doc.internal.pageSize.getHeight() - 15, pageWidth - 14, doc.internal.pageSize.getHeight() - 15);
        
        // Número de página
        doc.text(
          `Página ${i} de ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
      }

      const fileName = `horarios_${new Date().toISOString().split("T")[0]}.pdf`;
      doc.save(fileName);
      handleClose();
    } catch (error) {
      console.error("Error al exportar PDF:", error);
      alert("Error al exportar a PDF. Por favor, intente nuevamente.");
    }
  };

  // Validar si hay horarios disponibles
  const isDisabled = !schedules || schedules.length === 0;

  // =============== VERSIÓN MOBILE ===============
  if (isMobile) {
    return (
      <>
        <Tooltip title={isDisabled ? "No hay horarios para exportar" : "Exportar"}>
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
              <DescriptionIcon fontSize="small" sx={{ color: theme.palette.success.main }} />
            </ListItemIcon>
            <ListItemText>Exportar a Excel</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleExportPDF}>
            <ListItemIcon>
              <PictureAsPdfIcon fontSize="small" sx={{ color: theme.palette.error.main }} />
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
        <Tooltip title={isDisabled ? "No hay horarios" : "Exportar a Excel"} arrow>
          <span>
            <IconButton
              onClick={handleExportExcel}
              disabled={isDisabled}
              size="medium"
              sx={{
                bgcolor: theme.palette.success.lighter || theme.palette.success.light + "20",
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
        <Tooltip title={isDisabled ? "No hay horarios" : "Exportar a PDF"} arrow>
          <span>
            <IconButton
              onClick={handleExportPDF}
              disabled={isDisabled}
              size="medium"
              sx={{
                bgcolor: theme.palette.error.lighter || theme.palette.error.light + "20",
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
      <Tooltip title={isDisabled ? "No hay horarios para exportar" : "Descargar lista en formato Excel"} arrow>
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
                bgcolor: theme.palette.success.lighter || theme.palette.success.light + "20",
              },
            }}
          >
            Excel
          </Button>
        </span>
      </Tooltip>
      <Tooltip title={isDisabled ? "No hay horarios para exportar" : "Descargar lista en formato PDF"} arrow>
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
                bgcolor: theme.palette.error.lighter || theme.palette.error.light + "20",
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
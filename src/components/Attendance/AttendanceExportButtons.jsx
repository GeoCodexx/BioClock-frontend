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

export default function AttendanceExportButtons({ attendances }) {
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

  // Función para formatear el nombre completo del usuario
  const formatFullName = (userId) => {
    if (!userId) return "—";
    const parts = [
      userId.name,
      userId.firstSurname,
      userId.secondSurname,
    ].filter(Boolean);
    return parts.join(" ") || "—";
  };

  // Función para formatear fecha y hora
  const formatDateTime = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Función para normalizar el tipo
  const formatType = (type) => {
    const types = {
      IN: "Entrada",
      OUT: "Salida",
      BREAK_START: "Inicio Descanso",
      BREAK_END: "Fin Descanso",
    };
    return types[type] || type || "—";
  };

  // Función para normalizar el estado
  const formatStatus = (status) => {
    const statuses = {
      on_time: "A Tiempo",
      late: "Tardanza",
      early: "Temprano",
      absent: "Ausente",
      justified: "Justificado",
      pending: "Pendiente",
    };
    return statuses[status] || status || "—";
  };

  // Exportar a Excel
  const handleExportExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Asistencias");

      // Configurar columnas
      worksheet.columns = [
        { header: "DNI", key: "dni", width: 12 },
        { header: "Usuario", key: "fullName", width: 35 },
        { header: "Dispositivo", key: "device", width: 25 },
        { header: "Fecha y Hora", key: "timestamp", width: 20 },
        { header: "Horario", key: "schedule", width: 25 },
        { header: "Tipo", key: "type", width: 18 },
        { header: "Estado", key: "status", width: 15 },
      ];

      // Agregar datos
      attendances.forEach((attendance) => {
        worksheet.addRow({
          dni: attendance.userId?.dni || "—",
          fullName: formatFullName(attendance.userId),
          device: attendance.deviceId?.name || "—",
          timestamp: formatDateTime(attendance.timestamp),
          schedule: attendance.scheduleId?.name || "Sin horario",
          type: formatType(attendance.type),
          status: formatStatus(attendance.status),
        });
      });

      // Estilo de la cabecera
      const headerRow = worksheet.getRow(1);
      headerRow.height = 25;
      headerRow.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
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

            // Columna DNI centrada y en negrita
            if (colNumber === 1) {
              cell.alignment = { vertical: "middle", horizontal: "center" };
              cell.font = { bold: true, color: { argb: "FF424242" } };
            }

            // Columna Usuario en negrita
            if (colNumber === 2) {
              cell.font = { bold: true };
            }

            // Columna Dispositivo
            if (colNumber === 3) {
              cell.font = { color: { argb: "FF757575" } };
            }

            // Columna Fecha y Hora centrada
            if (colNumber === 4) {
              cell.alignment = { vertical: "middle", horizontal: "center" };
              cell.font = { color: { argb: "FF1565C0" } };
            }

            // Columna Horario
            if (colNumber === 5) {
              cell.font = { color: { argb: "FF757575" } };
            }

            // Columna Tipo centrada con color
            if (colNumber === 6) {
              cell.alignment = { vertical: "middle", horizontal: "center" };
              const type = cell.value;
              if (type === "Entrada") {
                cell.font = { bold: true, color: { argb: "FF1976D2" } };
                cell.fill = {
                  type: "pattern",
                  pattern: "solid",
                  fgColor: { argb: "FFE3F2FD" },
                };
              } else if (type === "Salida") {
                cell.font = { bold: true, color: { argb: "FFF57C00" } };
                cell.fill = {
                  type: "pattern",
                  pattern: "solid",
                  fgColor: { argb: "FFFFF3E0" },
                };
              } else {
                cell.font = { color: { argb: "FF757575" } };
              }
            }

            // Columna Estado con color
            if (colNumber === 7) {
              cell.alignment = { vertical: "middle", horizontal: "center" };
              const status = cell.value;
              if (status === "A Tiempo") {
                cell.font = { bold: true, color: { argb: "FF2E7D32" } };
                cell.fill = {
                  type: "pattern",
                  pattern: "solid",
                  fgColor: { argb: "FFE8F5E9" },
                };
              } else if (status === "Tardanza") {
                cell.font = { bold: true, color: { argb: "FFD32F2F" } };
                cell.fill = {
                  type: "pattern",
                  pattern: "solid",
                  fgColor: { argb: "FFFFEBEE" },
                };
              } else if (status === "Temprano") {
                cell.font = { bold: true, color: { argb: "FF1976D2" } };
                cell.fill = {
                  type: "pattern",
                  pattern: "solid",
                  fgColor: { argb: "FFE3F2FD" },
                };
              } else if (status === "Justificado") {
                cell.font = { bold: true, color: { argb: "FF7B1FA2" } };
                cell.fill = {
                  type: "pattern",
                  pattern: "solid",
                  fgColor: { argb: "FFF3E5F5" },
                };
              } else {
                cell.font = { bold: true, color: { argb: "FFED6C02" } };
                cell.fill = {
                  type: "pattern",
                  pattern: "solid",
                  fgColor: { argb: "FFFFF3E0" },
                };
              }
            }
          }
        });
      });

      // Información adicional al final
      const lastRow = worksheet.rowCount + 2;
      worksheet.getCell(`A${lastRow}`).value = "Total de asistencias:";
      worksheet.getCell(`A${lastRow}`).font = { bold: true };
      worksheet.getCell(`B${lastRow}`).value = attendances.length;
      worksheet.getCell(`B${lastRow}`).font = {
        bold: true,
        color: { argb: "FF1976D2" },
      };

      // Estadísticas por tipo
      const entriesCount = attendances.filter((a) => a.type === "IN").length;
      const exitsCount = attendances.filter((a) => a.type === "OUT").length;

      worksheet.getCell(`A${lastRow + 1}`).value = "Total entradas:";
      worksheet.getCell(`A${lastRow + 1}`).font = { bold: true };
      worksheet.getCell(`B${lastRow + 1}`).value = entriesCount;
      worksheet.getCell(`B${lastRow + 1}`).font = {
        color: { argb: "FF1976D2" },
      };

      worksheet.getCell(`A${lastRow + 2}`).value = "Total salidas:";
      worksheet.getCell(`A${lastRow + 2}`).font = { bold: true };
      worksheet.getCell(`B${lastRow + 2}`).value = exitsCount;
      worksheet.getCell(`B${lastRow + 2}`).font = {
        color: { argb: "FFF57C00" },
      };

      // Estadísticas por estado
      const onTimeCount = attendances.filter(
        (a) => a.status === "on_time",
      ).length;
      const lateCount = attendances.filter((a) => a.status === "late").length;

      worksheet.getCell(`A${lastRow + 4}`).value = "A tiempo:";
      worksheet.getCell(`A${lastRow + 4}`).font = { bold: true };
      worksheet.getCell(`B${lastRow + 4}`).value = onTimeCount;
      worksheet.getCell(`B${lastRow + 4}`).font = {
        color: { argb: "FF2E7D32" },
      };

      worksheet.getCell(`A${lastRow + 5}`).value = "Tardanzas:";
      worksheet.getCell(`A${lastRow + 5}`).font = { bold: true };
      worksheet.getCell(`B${lastRow + 5}`).value = lateCount;
      worksheet.getCell(`B${lastRow + 5}`).font = {
        color: { argb: "FFD32F2F" },
      };

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const fileName = `asistencias_${new Date().toISOString().split("T")[0]}.xlsx`;
      saveAs(blob, fileName);
      handleClose();
    } catch (error) {
      console.error("Error al exportar Excel:", error);
      //alert("Error al exportar a Excel. Por favor, intente nuevamente.");
      showError("Error al exportar a Excel. Por favor, intente nuevamente.")
    }
  };

  // Exportar a PDF
  const handleExportPDF = () => {
    try {
      const doc = new jsPDF("landscape");
      const pageWidth = doc.internal.pageSize.getWidth();

      // Título
      doc.setFontSize(20);
      doc.setTextColor(25, 118, 210);
      doc.setFont(undefined, "bold");
      doc.text("Registro de Asistencias", 14, 22);

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
        32,
      );

      const entriesCount = attendances.filter((a) => a.type === "IN").length;
      const exitsCount = attendances.filter((a) => a.type === "OUT").length;
      const onTimeCount = attendances.filter(
        (a) => a.status === "on_time",
      ).length;
      const lateCount = attendances.filter((a) => a.status === "late").length;

      doc.text(
        `Total: ${attendances.length} | Entradas: ${entriesCount} | Salidas: ${exitsCount} | A tiempo: ${onTimeCount} | Tardanzas: ${lateCount}`,
        14,
        37,
      );

      // Preparar datos de la tabla
      const tableData = attendances.map((attendance) => [
        attendance.userId?.dni || "—",
        formatFullName(attendance.userId),
        attendance.deviceId?.name || "—",
        formatDateTime(attendance.timestamp),
        attendance.scheduleId?.name || "Sin horario",
        formatType(attendance.type),
        formatStatus(attendance.status),
      ]);

      // Tabla principal
      doc.autoTable({
        startY: 42,
        head: [
          [
            "DNI",
            "Usuario",
            "Dispositivo",
            "Fecha y Hora",
            "Horario",
            "Tipo",
            "Estado",
          ],
        ],
        body: tableData,
        styles: {
          fontSize: 8,
          cellPadding: 3,
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
          0: {
            cellWidth: 20,
            halign: "center",
            fontStyle: "bold",
            textColor: [66, 66, 66],
          }, // DNI
          1: { cellWidth: 45, fontStyle: "bold" }, // Usuario
          2: { cellWidth: 35, textColor: [117, 117, 117], fontSize: 7 }, // Dispositivo
          3: { cellWidth: 35, halign: "center", textColor: [21, 101, 192] }, // Fecha y Hora
          4: { cellWidth: 35, textColor: [117, 117, 117] }, // Horario
          5: { cellWidth: 25, halign: "center" }, // Tipo
          6: { cellWidth: 25, halign: "center" }, // Estado
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250],
        },
        didDrawCell: (data) => {
          // Colorear la celda de Tipo
          if (data.column.index === 5 && data.section === "body") {
            const type = data.cell.raw;
            if (type === "Entrada") {
              doc.setFillColor(227, 242, 253);
              doc.rect(
                data.cell.x,
                data.cell.y,
                data.cell.width,
                data.cell.height,
                "F",
              );
              doc.setTextColor(25, 118, 210);
              doc.setFontSize(8);
              doc.setFont(undefined, "bold");
              doc.text(
                type,
                data.cell.x + data.cell.width / 2,
                data.cell.y + data.cell.height / 2,
                { align: "center", baseline: "middle" },
              );
            } else if (type === "Salida") {
              doc.setFillColor(255, 243, 224);
              doc.rect(
                data.cell.x,
                data.cell.y,
                data.cell.width,
                data.cell.height,
                "F",
              );
              doc.setTextColor(245, 124, 0);
              doc.setFontSize(8);
              doc.setFont(undefined, "bold");
              doc.text(
                type,
                data.cell.x + data.cell.width / 2,
                data.cell.y + data.cell.height / 2,
                { align: "center", baseline: "middle" },
              );
            }
          }

          // Colorear la celda de Estado
          if (data.column.index === 6 && data.section === "body") {
            const status = data.cell.raw;
            if (status === "A Tiempo") {
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
            } else if (status === "Tardanza") {
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
            } else if (status === "Temprano") {
              doc.setFillColor(227, 242, 253);
              doc.rect(
                data.cell.x,
                data.cell.y,
                data.cell.width,
                data.cell.height,
                "F",
              );
              doc.setTextColor(25, 118, 210);
              doc.setFontSize(8);
              doc.setFont(undefined, "bold");
              doc.text(
                status,
                data.cell.x + data.cell.width / 2,
                data.cell.y + data.cell.height / 2,
                { align: "center", baseline: "middle" },
              );
            } else if (status === "Justificado") {
              doc.setFillColor(243, 229, 245);
              doc.rect(
                data.cell.x,
                data.cell.y,
                data.cell.width,
                data.cell.height,
                "F",
              );
              doc.setTextColor(123, 31, 162);
              doc.setFontSize(8);
              doc.setFont(undefined, "bold");
              doc.text(
                status,
                data.cell.x + data.cell.width / 2,
                data.cell.y + data.cell.height / 2,
                { align: "center", baseline: "middle" },
              );
            } else {
              doc.setFillColor(255, 243, 224);
              doc.rect(
                data.cell.x,
                data.cell.y,
                data.cell.width,
                data.cell.height,
                "F",
              );
              doc.setTextColor(237, 108, 2);
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
        doc.line(
          14,
          doc.internal.pageSize.getHeight() - 15,
          pageWidth - 14,
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

      const fileName = `asistencias_${new Date().toISOString().split("T")[0]}.pdf`;
      doc.save(fileName);
      handleClose();
    } catch (error) {
      console.error("Error al exportar PDF:", error);
      showError("Error al exportar a PDF. Por favor, intente nuevamente.");
    }
  };

  // Validar si hay asistencias disponibles
  const isDisabled = !attendances || attendances.length === 0;

  // =============== VERSIÓN MOBILE ===============
  if (isMobile) {
    return (
      <>
        <Tooltip
          title={isDisabled ? "No hay asistencias para exportar" : "Exportar"}
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
          title={isDisabled ? "No hay asistencias" : "Exportar a Excel"}
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
          title={isDisabled ? "No hay asistencias" : "Exportar a PDF"}
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
            ? "No hay asistencias para exportar"
            : "Descargar registro en formato Excel"
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
            ? "No hay asistencias para exportar"
            : "Descargar registro en formato PDF"
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

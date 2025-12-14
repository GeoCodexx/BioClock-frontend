import {
  Button,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  //Download as DownloadIcon,
  Description as DescriptionIcon,
  FileDownload as FileDownloadIcon,
  PictureAsPdf as PictureAsPdfIcon,
} from "@mui/icons-material";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useState } from "react";

// Configuración de mapeo de estados
const STATUS_LABELS = {
  on_time: "A tiempo",
  late: "Tardanza",
  early: "Entrada temprana",
  early_exit: "Salida temprana",
  incomplete: "Incompleto",
  absent: "Ausente",
  justified: "Justificado",
};

export default function GeneralReportExportButtons({ records, date }) {
  const [exporting, setExporting] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  //const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  //const [anchorEl, setAnchorEl] = useState(null);
  //const open = Boolean(anchorEl);

  /* const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };*/

  // Exportar a Excel
  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Reporte Diario");

      // Configurar columnas
      worksheet.columns = [
        { header: "DNI", key: "dni", width: 12 },
        { header: "Colaborador", key: "user", width: 30 },
        { header: "Turno", key: "schedule", width: 20 },
        { header: "Hora Entrada", key: "checkIn", width: 15 },
        { header: "Estado Entrada", key: "checkInStatus", width: 15 },
        { header: "Hora Salida", key: "checkOut", width: 15 },
        { header: "Estado Salida", key: "checkOutStatus", width: 15 },
        { header: "Horas Trabajadas", key: "hoursWorked", width: 18 },
        { header: "Estado del Turno", key: "shiftStatus", width: 25 },
        { header: "Dispositivo Entrada", key: "deviceIn", width: 20 },
        { header: "Dispositivo Salida", key: "deviceOut", width: 20 },
        { header: "Justificación", key: "justification", width: 30 },
        { header: "Aprobado Por", key: "approvedBy", width: 25 },
      ];

      // Estilo del encabezado
      worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      worksheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1976D2" },
      };
      worksheet.getRow(1).alignment = {
        vertical: "middle",
        horizontal: "center",
      };

      // Agregar datos
      records.forEach((record) => {
        const row = worksheet.addRow({
          dni: record.user?.dni || "—",
          user: record.user
            ? `${record.user.name || ""} ${record.user.firstSurname || ""} ${
                record.user.secondSurname || ""
              }`.trim()
            : "—",
          schedule: record.schedule?.name || "Sin turno",
          checkIn: record.checkIn?.timestamp
            ? format(new Date(record.checkIn.timestamp), "HH:mm:ss", {
                locale: es,
              })
            : "—",
          checkInStatus: record.checkIn?.status
            ? record.checkIn.status === "on_time"
              ? "A tiempo"
              : record.checkIn.status === "late"
              ? "Tarde"
              : record.checkIn.status === "early"
              ? "Entrada temprana"
              : record.checkIn.status === "justified"
              ? "Justificado"
              : "—"
            : "—",
          checkOut: record.checkOut?.timestamp
            ? format(new Date(record.checkOut.timestamp), "HH:mm:ss", {
                locale: es,
              })
            : "—",
          checkOutStatus: record.checkOut?.status
            ? record.checkOut.status === "on_time"
              ? "A tiempo"
              : record.checkOut.status === "late"
              ? "Tarde"
              : record.checkOut.status === "early_exit"
              ? "Salida temprana"
              : record.checkOut.status === "justified"
              ? "Justificado"
              : "—"
            : "—",
          hoursWorked: record.hoursWorked || "—",
          shiftStatus: STATUS_LABELS[record.shiftStatus] || "—",
          deviceIn: record.checkIn?.device?.name || "—",
          deviceOut: record.checkOut?.device?.name || "—",
          justification: record.justification || "—",
          approvedBy: record.approvedBy
            ? `${record.approvedBy.name || ""} ${
                record.approvedBy.firstSurname || ""
              } ${record.approvedBy.secondSurname || ""}`.trim()
            : "—",
        });

        // Aplicar color según el estado del turno
        const statusColors = {
          on_time: "FF4CAF50",
          late: "FFFFC107",
          early:"FF673A87",
          early_exit: "FFFFC107",
          incomplete: "FFF44336",
          absent: "FFF44336",
          justified: "FF2196F3",
        };

        if (statusColors[record.shiftStatus]) {
          row.getCell("shiftStatus").fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: statusColors[record.shiftStatus] },
          };
          row.getCell("shiftStatus").font = { color: { argb: "FFFFFFFF" } };
        }
      });

      // Ajustar altura de filas
      worksheet.eachRow((row) => {
        row.height = 20;
      });

      // Agregar bordes a todas las celdas
      worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      });

      // Generar archivo
      const buffer = await workbook.xlsx.writeBuffer();
      const fileName = `Reporte_Diario_${
        date || format(new Date(), "yyyy-MM-dd")
      }.xlsx`;
      saveAs(new Blob([buffer]), fileName);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
    } finally {
      setExporting(false);
    }
  };

  // Exportar a PDF
  // const handleExportPDF = () => {
  //   setExporting(true);
  //   try {
  //     const doc = new jsPDF("landscape", "mm", "a4");

  //     // Después de crear el doc
  //     /*const imgData = "data:image/png;base64,..."; // Tu logo en base64
  //   doc.addImage(imgData, "PNG", 250, 10, 30, 15);*/

  //     // Título
  //     doc.setFontSize(18);
  //     doc.setTextColor(25, 118, 210);
  //     doc.text("Reporte Diario de Asistencias", 14, 15);

  //     // Fecha
  //     doc.setFontSize(11);
  //     doc.setTextColor(100);
  //     doc.text(
  //       `Fecha: ${
  //         date
  //           ? format(new Date(date), "d 'de' MMMM 'de' yyyy", { locale: es })
  //           : "—"
  //       }`,
  //       14,
  //       22
  //     );
  //     doc.text(`Total de registros: ${records.length}`, 14, 28);

  //     // Tabla
  //     doc.autoTable({
  //       startY: 35,
  //       head: [
  //         [
  //           "DNI",
  //           "Colaborador",
  //           "Turno",
  //           "Entrada",
  //           "Salida",
  //           "Horas",
  //           "Estado",
  //         ],
  //       ],
  //       body: records.map((record) => [
  //         record.user?.dni || "—",
  //         record.user
  //           ? `${record.user.name || ""} ${
  //               record.user.firstSurname || ""
  //             }`.trim()
  //           : "—",
  //         record.schedule?.name || "Sin turno",
  //         record.checkIn?.timestamp
  //           ? format(new Date(record.checkIn.timestamp), "HH:mm", {
  //               locale: es,
  //             })
  //           : "—",
  //         record.checkOut?.timestamp
  //           ? format(new Date(record.checkOut.timestamp), "HH:mm", {
  //               locale: es,
  //             })
  //           : "—",
  //         record.hoursWorked || "—",
  //         STATUS_LABELS[record.shiftStatus] || "—",
  //       ]),
  //       styles: {
  //         fontSize: 9,
  //         cellPadding: 3,
  //       },
  //       headStyles: {
  //         fillColor: [25, 118, 210],
  //         textColor: [255, 255, 255],
  //         fontStyle: "bold",
  //         halign: "center",
  //       },
  //       bodyStyles: {
  //         textColor: [50, 50, 50],
  //       },
  //       alternateRowStyles: {
  //         fillColor: [245, 245, 245],
  //       },
  //       columnStyles: {
  //         0: { cellWidth: 25 }, // DNI
  //         1: { cellWidth: 50 }, // Colaborador
  //         2: { cellWidth: 40 }, // Turno
  //         3: { cellWidth: 25 }, // Entrada
  //         4: { cellWidth: 25 }, // Salida
  //         5: { cellWidth: 25 }, // Horas
  //         6: { cellWidth: 45 }, // Estado
  //       },
  //       didParseCell: function (data) {
  //         // Colorear celdas de estado
  //         if (data.column.index === 6 && data.section === "body") {
  //           const record = records[data.row.index];
  //           const statusColors = {
  //             complete: [76, 175, 80],
  //             late: [255, 193, 7],
  //             early_leave: [255, 193, 7],
  //             late_and_early_leave: [255, 87, 34],
  //             incomplete_no_entry: [244, 67, 54],
  //             incomplete_no_exit: [244, 67, 54],
  //             absent: [244, 67, 54],
  //             justified: [33, 150, 243],
  //           };

  //           if (statusColors[record.shiftStatus]) {
  //             data.cell.styles.fillColor = statusColors[record.shiftStatus];
  //             data.cell.styles.textColor = [255, 255, 255];
  //             data.cell.styles.fontStyle = "bold";
  //           }
  //         }
  //       },
  //       margin: { top: 35 },
  //     });

  //     // Pie de página
  //     const pageCount = doc.internal.getNumberOfPages();
  //     for (let i = 1; i <= pageCount; i++) {
  //       doc.setPage(i);
  //       doc.setFontSize(8);
  //       doc.setTextColor(150);
  //       doc.text(
  //         `Página ${i} de ${pageCount}`,
  //         doc.internal.pageSize.width / 2,
  //         doc.internal.pageSize.height - 10,
  //         { align: "center" }
  //       );
  //       doc.text(
  //         `Generado el ${format(new Date(), "dd/MM/yyyy HH:mm")}`,
  //         14,
  //         doc.internal.pageSize.height - 10
  //       );
  //     }

  //     // Guardar PDF
  //     const fileName = `Reporte_Diario_${
  //       date || format(new Date(), "yyyy-MM-dd")
  //     }.pdf`;
  //     doc.save(fileName);
  //   } catch (error) {
  //     console.error("Error exporting to PDF:", error);
  //   } finally {
  //     setExporting(false);
  //   }
  // };
  const handleExportPDF = () => {
    setExporting(true);
    try {
      const doc = new jsPDF("landscape", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      const margins = 14;

      // Logo (descomentar cuando tengas la imagen)
      // const imgData = "data:image/png;base64,...";
      // doc.addImage(imgData, "PNG", pageWidth - 44, 10, 30, 15);

      // Título
      doc.setFontSize(20);
      doc.setTextColor(25, 118, 210);
      doc.setFont(undefined, "bold");
      doc.text("Reporte Diario de Asistencias", margins, 20);

      // Línea decorativa
      doc.setDrawColor(25, 118, 210);
      doc.setLineWidth(0.5);
      doc.line(margins, 23, pageWidth - margins, 23);

      // Información del reporte
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.setFont(undefined, "normal");
      doc.text(
        `Fecha: ${
          date
            ? format(new Date(date), "d 'de' MMMM 'de' yyyy", { locale: es })
            : "—"
        }`,
        margins,
        30
      );
      doc.text(`Total de registros: ${records.length}`, margins, 36);

      // Preparar datos de la tabla con numeración consecutiva
      const tableData = records.map((record, index) => [
        index + 1, // Columna #
        record.user?.dni || "—",
        record.user
          ? `${record.user.name || ""} ${record.user.firstSurname || ""}`.trim()
          : "—",
        record.schedule?.name || "Sin turno",
        record.checkIn?.timestamp
          ? format(new Date(record.checkIn.timestamp), "HH:mm", { locale: es })
          : "—",
        record.checkOut?.timestamp
          ? format(new Date(record.checkOut.timestamp), "HH:mm", { locale: es })
          : "—",
        record.hoursWorked || "—",
        STATUS_LABELS[record.shiftStatus] || "—",
      ]);

      // Tabla principal con anchos optimizados (Total: 269mm)
      doc.autoTable({
        startY: 42,
        head: [
          [
            "#",
            "DNI",
            "Colaborador",
            "Turno",
            "Entrada",
            "Salida",
            "Horas",
            "Estado",
          ],
        ],
        body: tableData,
        styles: {
          fontSize: 8,
          cellPadding: 3,
          lineColor: [220, 220, 220],
          lineWidth: 0.1,
          textColor: [50, 50, 50],
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
          0: { cellWidth: 12, halign: "center", fontStyle: "bold" }, // #
          1: { cellWidth: 24, halign: "center" }, // DNI
          2: { cellWidth: 60, fontStyle: "bold" }, // Colaborador
          3: { cellWidth: 45 }, // Turno
          4: { cellWidth: 22, halign: "center" }, // Entrada
          5: { cellWidth: 22, halign: "center" }, // Salida
          6: { cellWidth: 20, halign: "center" }, // Horas
          7: { cellWidth: 64, halign: "center" }, // Estado
        },
        alternateRowStyles: {
          fillColor: [248, 249, 250], // Tono suave gris claro
        },
        didParseCell: function (data) {
          // Aplicar color suave de fondo a todas las filas
          /*if (data.section === "body" && data.row.index % 2 !== 0) {
            data.cell.styles.fillColor = [240, 245, 248]; // Tono suave azul claro
          }*/

          // Colorear celdas de estado (columna 7)
          if (data.column.index === 7 && data.section === "body") {
            const record = records[data.row.index];
            const statusColors = {
              on_time: [232, 245, 233], // Verde suave
              late: [255, 249, 196], // Amarillo suave
              early: [114, 73, 150], // Morado suave
              early_exit: [255, 243, 224], // Naranja suave
              incomplete: [255, 235, 230], // Naranja rojizo suave
              absent: [255, 235, 238], // Rojo suave
              justified: [227, 242, 253], // Azul suave
            };

            const statusTextColors = {
              complete: [46, 125, 50],
              late: [245, 124, 0],
              early: [81, 45, 168],
              early_exit: [239, 108, 0],
              incomplete: [211, 47, 47],
              absent: [198, 40, 40],
              justified: [25, 118, 210],
            };

            if (statusColors[record.shiftStatus]) {
              data.cell.styles.fillColor = statusColors[record.shiftStatus];
              data.cell.styles.textColor = statusTextColors[record.shiftStatus];
              data.cell.styles.fontStyle = "bold";
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
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.1);
        doc.line(
          margins,
          doc.internal.pageSize.getHeight() - 18,
          pageWidth - margins,
          doc.internal.pageSize.getHeight() - 18
        );

        // Número de página centrado
        doc.text(
          `Página ${i} de ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 12,
          { align: "center" }
        );

        // Fecha de generación a la izquierda
        doc.text(
          `Generado el ${format(new Date(), "dd/MM/yyyy HH:mm")}`,
          margins,
          doc.internal.pageSize.getHeight() - 12
        );
      }

      // Guardar PDF
      const fileName = `Reporte_Diario_${
        date
          ? format(new Date(date), "yyyy-MM-dd")
          : format(new Date(), "yyyy-MM-dd")
      }.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      alert("Error al exportar PDF. Por favor, intente nuevamente.");
    } finally {
      setExporting(false);
    }
  };

  // Validar si hay asistencias disponibles
  const isDisabled = !records || records.length === 0;

  return (
    <Stack direction="row" spacing={1.5}>
      <Tooltip
        title={
          isDisabled
            ? "No hay asistencias para exportar"
            : "Descargar reporte en formato Excel"
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
              minWidth: isMobile ? 125 : 140,
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
            : "Descargar reporte en formato PDF"
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

  // return (
  //   <Stack direction="row" spacing={2}>
  //     <Button
  //       variant="outlined"
  //       startIcon={<DownloadIcon />}
  //       onClick={handleExportExcel}
  //       disabled={!records || records.length === 0}
  //     >
  //       {exporting ? "Exportando..." : "Exportar Excel"}
  //     </Button>
  //     <Button
  //       variant="outlined"
  //       color="error"
  //       startIcon={<PictureAsPdfIcon />}
  //       onClick={handleExportPDF}
  //       disabled={!records || records.length === 0}
  //     >
  //       {exporting ? "Exportando..." : "Exportar PDF"}
  //     </Button>
  //   </Stack>
  // );
}

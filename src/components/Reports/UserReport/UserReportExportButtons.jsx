import { Button, Stack } from "@mui/material";
import {
  Download as DownloadIcon,
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
  complete: "Completo",
  late: "Tardanza",
  early_leave: "Salida temprana",
  late_and_early_leave: "Tardanza y salida temprana",
  incomplete_no_entry: "Sin entrada",
  incomplete_no_exit: "Sin salida",
  absent: "Ausente",
  justified: "Justificado",
};

export default function UserReportExportButtons({ records, dateRange }) {
  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);

  // Exportar a Excel
  const handleExportExcel = async () => {
    setExportingExcel(true);
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Reporte por Usuario");

      // Configurar columnas
      worksheet.columns = [
        { header: "Fecha", key: "date", width: 12 },
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
      worksheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };

      // Agregar datos
      records.forEach((record) => {
        const row = worksheet.addRow({
          date: record.date 
            ? format(new Date(record.date), "dd/MM/yyyy", { locale: es })
            : "—",
          dni: record.user?.dni || "—",
          user: record.user
            ? `${record.user.name || ""} ${record.user.firstSurname || ""} ${
                record.user.secondSurname || ""
              }`.trim()
            : "—",
          schedule: record.schedule?.name || "Sin turno",
          checkIn: record.checkIn?.timestamp
            ? format(new Date(record.checkIn.timestamp), "HH:mm:ss", { locale: es })
            : "—",
          checkInStatus: record.checkIn?.status
            ? record.checkIn.status === "on_time"
              ? "A tiempo"
              : record.checkIn.status === "late"
              ? "Tarde"
              : record.checkIn.status === "justified"
              ? "Justificado"
              : "—"
            : "—",
          checkOut: record.checkOut?.timestamp
            ? format(new Date(record.checkOut.timestamp), "HH:mm:ss", { locale: es })
            : "—",
          checkOutStatus: record.checkOut?.status
            ? record.checkOut.status === "on_time"
              ? "A tiempo"
              : record.checkOut.status === "early_leave"
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
          complete: "FF4CAF50",
          late: "FFFFC107",
          early_leave: "FFFFC107",
          late_and_early_leave: "FFFF5722",
          incomplete_no_entry: "FFF44336",
          incomplete_no_exit: "FFF44336",
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
      const fileName = `Reporte_Usuario_${dateRange?.startDate || 'inicio'}_${dateRange?.endDate || 'fin'}.xlsx`;
      saveAs(new Blob([buffer]), fileName);
    } finally {
      setExportingExcel(false);
    }
  };

  // Exportar a PDF
  const handleExportPDF = () => {
    setExportingPDF(true);
    try {
      const doc = new jsPDF("landscape", "mm", "a4");

      // Título
      doc.setFontSize(18);
      doc.setTextColor(25, 118, 210);
      doc.text("Reporte de Asistencias por Usuario", 14, 15);

      // Rango de fechas
      doc.setFontSize(11);
      doc.setTextColor(100);
      if (dateRange?.startDate && dateRange?.endDate) {
        doc.text(
          `Período: ${format(new Date(dateRange.startDate), "dd/MM/yyyy")} - ${format(new Date(dateRange.endDate), "dd/MM/yyyy")}`,
          14,
          22
        );
      }
      doc.text(`Total de registros: ${records.length}`, 14, 28);

      // Tabla
      doc.autoTable({
        startY: 35,
        head: [
          [
            "Fecha",
            "DNI",
            "Colaborador",
            "Turno",
            "Entrada",
            "Salida",
            "Horas",
            "Estado",
          ],
        ],
        body: records.map((record) => [
          record.date 
            ? format(new Date(record.date), "dd/MM/yy", { locale: es })
            : "—",
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
        ]),
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [25, 118, 210],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "center",
        },
        bodyStyles: {
          textColor: [50, 50, 50],
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        columnStyles: {
          0: { cellWidth: 22 }, // Fecha
          1: { cellWidth: 22 }, // DNI
          2: { cellWidth: 45 }, // Colaborador
          3: { cellWidth: 35 }, // Turno
          4: { cellWidth: 20 }, // Entrada
          5: { cellWidth: 20 }, // Salida
          6: { cellWidth: 20 }, // Horas
          7: { cellWidth: 40 }, // Estado
        },
        didParseCell: function (data) {
          // Colorear celdas de estado
          if (data.column.index === 7 && data.section === "body") {
            const record = records[data.row.index];
            const statusColors = {
              complete: [76, 175, 80],
              late: [255, 193, 7],
              early_leave: [255, 193, 7],
              late_and_early_leave: [255, 87, 34],
              incomplete_no_entry: [244, 67, 54],
              incomplete_no_exit: [244, 67, 54],
              absent: [244, 67, 54],
              justified: [33, 150, 243],
            };

            if (statusColors[record.shiftStatus]) {
              data.cell.styles.fillColor = statusColors[record.shiftStatus];
              data.cell.styles.textColor = [255, 255, 255];
              data.cell.styles.fontStyle = "bold";
            }
          }
        },
        margin: { top: 35 },
      });

      // Pie de página
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Página ${i} de ${pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: "center" }
        );
        doc.text(
          `Generado el ${format(new Date(), "dd/MM/yyyy HH:mm")}`,
          14,
          doc.internal.pageSize.height - 10
        );
      }

      // Guardar PDF
      const fileName = `Reporte_Usuario_${dateRange?.startDate || 'inicio'}_${dateRange?.endDate || 'fin'}.pdf`;
      doc.save(fileName);
    } finally {
      setExportingPDF(false);
    }
  };

  return (
    <Stack direction="row" spacing={1}>
      <Button
        variant="outlined"
        size="small"
        startIcon={<DownloadIcon />}
        onClick={handleExportExcel}
        disabled={!records || records.length === 0 || exportingExcel}
      >
        {exportingExcel ? "Exportando..." : "Exportar Excel"}
      </Button>
      <Button
        variant="outlined"
        size="small"
        color="error"
        startIcon={<PictureAsPdfIcon />}
        onClick={handleExportPDF}
        disabled={!records || records.length === 0 || exportingPDF}
      >
        {exportingPDF ? "Exportando..." : "Exportar PDF"}
      </Button>
    </Stack>
  );
}
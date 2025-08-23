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

export default function AttendanceExportButtons({ attendances }) {
  // Exportar a Excel
  const handleExportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Asistencias");
    worksheet.columns = [
      { header: "Colaborador", key: "user", width: 20 },
      { header: "Dispositivo", key: "device", width: 20 },
      { header: "Fecha", key: "timestamp", width: 20 },
      { header: "Tipo", key: "type", width: 30 },
      { header: "Estado", key: "status", width: 20 },
      { header: "Horario", key: "schedule", width: 20 },
      { header: "Método", key: "verificationMethod", width: 15 },
      { header: "Justificación", key: "justification", width: 20 },
      { header: "Aprobador", key: "approvedBy", width: 20 },
      { header: "Notas", key: "notes", width: 15 },
    ];
    attendances.forEach((attendance) => {
      worksheet.addRow({
        user: `${attendance?.userId?.name || "—"} ${
          attendance?.userId?.firstSurname || "—"
        } ${attendance?.userId?.secondSurname || "—"}`,
        device: attendance?.deviceId?.name || "—",
        timestamp: format(
          new Date(attendance.timestamp),
          "dd/mm/yyyy HH:mm:ss"
        ),
        type:
          attendance?.type === "IN"
            ? "Entrada"
            : attendance?.type === "OUT"
            ? "Salida"
            : "—",
        status:
          attendance?.status === "on_time"
            ? "A tiempo"
            : attendance?.status === "late"
            ? "Tarde"
            : attendance?.status === "early_leave"
            ? "Salida temprana"
            : attendance?.status === "absent"
            ? "Ausente"
            : attendance?.status === "justified"
            ? "Jusiificado"
            : "—",
        schedule: attendance.scheduleId?.name || "—",
        verificationMethod:
          attendance?.verificationMethod === "fingerprint"
            ? "Huella dactilar"
            : "—",
        justification: attendance?.justification || "—",
        approvedBy: `${attendance?.approvedBy?.name || "—"} ${
          attendance?.approvedBy?.firstSurname || "—"
        } ${attendance?.approvedBy?.secondSurname || "—"}`,
        notes: attendance?.notes || "—",
      });
    });
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "Asistencias.xlsx");
  };

  // Exportar a PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Asistencias", 14, 16);

    doc.autoTable({
      startY: 22,
      head: [
        [
          "Colaborador",
          "Dispositivo",
          "Fecha",
          "Tipo",
          "Estado",
          "Horario",
          "Método",
          "Justificación",
          "Aprobador",
          "Notas",
        ],
      ],
      body: attendances.map((attendance) => [
        `${attendance?.userId?.name || "—"} ${
          attendance?.userId?.firstSurname || "—"
        } ${attendance?.userId?.secondSurname || "—"}`,
        attendance?.deviceId?.name || "—",
        format(new Date(attendance.timestamp), "dd/mm/yyyy HH:mm:ss"),
        attendance?.type === "IN"
          ? "Entrada"
          : attendance?.type === "OUT"
          ? "Salida"
          : "—",
        attendance?.status === "on_time"
          ? "A tiempo"
          : attendance?.status === "late"
          ? "Tarde"
          : attendance?.status === "early_leave"
          ? "Salida temprana"
          : attendance?.status === "absent"
          ? "Ausente"
          : attendance?.status === "justified"
          ? "Jusiificado"
          : "—",
        attendance?.scheduleId?.name || "—",
        attendance?.verificationMethod === "fingerprint"
          ? "Huella dactilar"
          : "—",
        attendance?.justification || "—",
        `${attendance?.approvedBy?.name || "—"} ${
          attendance?.approvedBy?.firstSurname || "—"
        } ${attendance?.approvedBy?.secondSurname || "—"}`,
        attendance?.notes || "—",
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [22, 160, 133] },
    });
    doc.save("Asitencias.pdf");
  };

  return (
    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
      <Button
        variant="outlined"
        startIcon={<DownloadIcon />}
        onClick={handleExportExcel}
      >
        Exportar Excel
      </Button>
      <Button
        variant="outlined"
        color="error"
        startIcon={<PictureAsPdfIcon />}
        onClick={handleExportPDF}
      >
        Exportar PDF
      </Button>
    </Stack>
  );
}

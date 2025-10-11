import { Button, Stack } from "@mui/material";
import {
  Download as DownloadIcon,
  PictureAsPdf as PictureAsPdfIcon,
} from "@mui/icons-material";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function ScheduleExportButtons({ schedules }) {
  // Exportar a Excel
  const handleExportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Schedules");
    worksheet.columns = [
      { header: "Nombre", key: "name", width: 30 },
      { header: "Días", key: "days", width: 30 },
      { header: "Hora de inicio", key: "startTime", width: 30 },
      { header: "Hora de fin", key: "endTime", width: 30 },
      { header: "Tolerancia (minutos)", key: "toleranceMinutes", width: 30 },
    ];
    schedules.forEach((schedule) => {
      worksheet.addRow({
        name: schedule.name,
        days: schedule.days.join(", "),
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        toleranceMinutes: schedule.toleranceMinutes,
      });
    });
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "schedules.xlsx");
  };

  // Exportar a PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Schedules", 14, 16);

    doc.autoTable({
      startY: 22,
      head: [
        [
          "Nombre",
          "Días",
          "Hora de inicio",
          "Hora de fin",
          "Tolerancia (minutos)",
        ],
      ],
      body: schedules.map((schedule) => [
        schedule.name,
        schedule.days.join(", "),
        schedule.startTime,
        schedule.endTime,
        schedule.toleranceMinutes,
      ]),
    });

    doc.save("schedules.pdf");
  };

  return (
    <Stack direction="row" spacing={1}>
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
